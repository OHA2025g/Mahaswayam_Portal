from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, Request, HTTPException, Response, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import math
from pathlib import Path
from urllib.parse import urlparse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import secrets
from bson import ObjectId

ROOT_DIR = Path(__file__).parent

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get("JWT_SECRET", secrets.token_hex(32))
JWT_ALGORITHM = "HS256"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def _parse_csv_urls(value: str) -> List[str]:
    if not value or not value.strip():
        return []
    return [p.strip() for p in value.split(",") if p.strip()]


def _normalize_origin(origin: str) -> str:
    """Browser Origin header is scheme+host+port only, never a trailing slash or path."""
    o = origin.strip().rstrip("/")
    if not o:
        return o
    parsed = urlparse(o)
    if parsed.scheme and parsed.netloc:
        return f"{parsed.scheme}://{parsed.netloc}"
    return o


def _cors_allow_origins() -> List[str]:
    """Build allowed browser origins for credentialed API calls."""
    origins: List[str] = []
    for o in _parse_csv_urls(os.environ.get("FRONTEND_URL", "")):
        n = _normalize_origin(o)
        if n and n not in origins:
            origins.append(n)
    for o in _parse_csv_urls(os.environ.get("CORS_ALLOWED_ORIGINS", "")):
        n = _normalize_origin(o)
        if n and n not in origins:
            origins.append(n)
    if not origins:
        origins.append("http://localhost:3000")
    for d in ("http://localhost:3000", "http://localhost:4520"):
        if d not in origins:
            origins.append(d)
    return origins


# ── Auth helpers ──────────────────────────────────────────────
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=24), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: Optional[str] = "student"

def safe_user(user: dict) -> dict:
    uid = user.get("_id", "")
    return {
        "id": str(uid) if isinstance(uid, ObjectId) else uid,
        "email": user.get("email", ""),
        "name": user.get("name", ""),
        "role": user.get("role", ""),
    }

# ── Auth endpoints ────────────────────────────────────────────
@api_router.post("/auth/login")
async def login(req: LoginRequest, response: Response):
    email = req.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {**safe_user(user), "access_token": access_token}

@api_router.post("/auth/register")
async def register(req: RegisterRequest, response: Response):
    email = req.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {
        "email": email,
        "password_hash": hash_password(req.password),
        "name": req.name,
        "role": req.role,
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {**safe_user(user_doc), "access_token": access_token}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return safe_user(user)

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access_token = create_access_token(str(user["_id"]), user["email"])
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
        return {"access_token": access_token}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@api_router.get("/health")
async def health():
    return {"status": "ok"}

# ── Data generation helpers ───────────────────────────────────
MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
DISTRICTS = ['Mumbai','Pune','Nagpur','Thane','Nashik','Aurangabad','Solapur','Kolhapur','Sangli','Satara','Ratnagiri','Amravati']
SCHEMES = ['PMKVY','DDU-GKY','NULM','NSDC','Kaushalya','MahaRojgar','State Skills','MGNF']
SKILLS = ['Data Analytics','Digital Marketing','Web Dev','Nursing','Electrician','CNC Op','Tally','AutoCAD','Welding','Plumbing']
SECTORS = ['IT/ITES','Manufacturing','Healthcare','Agriculture','Construction','Retail','Banking','Hospitality']

def _seed(s):
    return random.Random(s)

def _r(rng, lo, hi):
    return round(rng.uniform(lo, hi))

def _ts(rng, base, var, n=12):
    return [{"name": MONTHS[i], "value": _r(rng, base-var/2, base+var/2) + i*_r(rng,5,20)} for i in range(n)]

def _bar(rng, labels, lo, hi):
    return [{"name": l, "value": _r(rng, lo, hi)} for l in labels]

def _grp(rng, labels, keys, lo, hi):
    out = []
    for l in labels:
        d = {"name": l}
        for k in keys:
            d[k] = _r(rng, lo, hi)
        out.append(d)
    return out

def _pie(rng, labels):
    raw = [_r(rng,10,100) for _ in labels]
    t = sum(raw)
    return [{"name": l, "value": round(raw[i]/t*100)} for i,l in enumerate(labels)]

def _funnel(rng, stages):
    v = _r(rng,80000,120000)
    out = []
    for s in stages:
        out.append({"name": s, "value": v})
        v = round(v * rng.uniform(0.6,0.85))
    return out

def _heatmap(rng, rows, cols):
    return [[_r(rng,5,100) for _ in cols] for _ in rows]

def _sankey(rng):
    reg=_r(rng,110000,130000); enr=round(reg*0.72); trn=round(enr*0.76)
    cert=round(trn*0.77); plc=round(cert*0.65); srch=cert-plc
    return {
        "nodes":[
            {"id":"registered","name":"Registered","value":reg,"col":0},
            {"id":"enrolled","name":"Enrolled","value":enr,"col":1},
            {"id":"drop1","name":"Drop (Reg)","value":reg-enr,"col":1},
            {"id":"trained","name":"Trained","value":trn,"col":2},
            {"id":"drop2","name":"Drop (Enrl)","value":enr-trn,"col":2},
            {"id":"certified","name":"Certified","value":cert,"col":3},
            {"id":"drop3","name":"Drop (Train)","value":trn-cert,"col":3},
            {"id":"placed","name":"Placed","value":plc,"col":4},
            {"id":"searching","name":"Searching","value":srch,"col":4},
        ],
        "links":[
            {"source":"registered","target":"enrolled","value":enr},
            {"source":"registered","target":"drop1","value":reg-enr},
            {"source":"enrolled","target":"trained","value":trn},
            {"source":"enrolled","target":"drop2","value":enr-trn},
            {"source":"trained","target":"certified","value":cert},
            {"source":"trained","target":"drop3","value":trn-cert},
            {"source":"certified","target":"placed","value":plc},
            {"source":"certified","target":"searching","value":srch},
        ]
    }

# ── Dashboard data builders ───────────────────────────────────
def build_ceo(seed):
    rng=_seed(seed); sk=_sankey(rng)
    return [
      {"id":"employment","label":"Employment Outcomes",
       "metrics":[{"label":"Total Registered Candidates","value":"1,24,56,890","trend":12.5},{"label":"Total Active Candidates","value":"8,32,450","trend":5.2},{"label":"Total Placed Candidates","value":"38,54,200","trend":8.7},{"label":"Placement Rate","value":"62","suffix":"%","trend":3.1},{"label":"Monthly Placements","value":"45,230","trend":6.4},{"label":"YoY Placement Growth","value":"18.5","suffix":"%","trend":2.3},{"label":"Avg Salary Offered","value":"18,500","trend":7.2},{"label":"Median Salary","value":"15,200","trend":5.8},{"label":"High-paying Jobs (>5L)","value":"14.2","suffix":"%","trend":4.1},{"label":"Women Placement","value":"42.3","suffix":"%","trend":6.8}],
       "charts":[{"type":"bar","title":"Monthly Placements Trend","data":_ts(rng,4500,1500),"color":"#2563EB"},{"type":"line","title":"YoY Placement Growth","data":_ts(rng,18,8),"color":"#10B981"},{"type":"pie","title":"Salary Distribution","data":_pie(rng,['<2L','2-5L','5-10L','>10L'])}]},
      {"id":"skills","label":"Skill Ecosystem",
       "metrics":[{"label":"Total Trainings Completed","value":"8,45,320","trend":15.3},{"label":"Certification Rate","value":"78.5","suffix":"%","trend":4.2},{"label":"Skill Gap Index","value":"0.34","trend":-5.1},{"label":"Demand vs Supply Ratio","value":"1.42","trend":-2.3},{"label":"Emerging Skills Adoption","value":"23.5","suffix":"%","trend":12.1},{"label":"Digital Skill Penetration","value":"45.8","suffix":"%","trend":8.7}],
       "charts":[{"type":"horizontal","title":"Top 10 Skills Demand Index","data":_bar(rng,SKILLS,40,95),"color":"#6366F1","span":2},{"type":"bar","title":"Skill Training by Sector","data":_bar(rng,['IT','Mfg','Health','Agri','Const','Retail'],200,800),"color":"#2563EB"}]},
      {"id":"schemes","label":"Scheme Performance",
       "metrics":[{"label":"Scheme Enrollment Rate","value":"82.3","suffix":"%","trend":3.5},{"label":"Scheme Completion Rate","value":"68.7","suffix":"%","trend":4.2},{"label":"Scheme ROI","value":"245","suffix":"%","trend":12.1},{"label":"Cost per Placement","value":"12,450","trend":-8.3},{"label":"Budget Utilization","value":"87.2","suffix":"%","trend":5.1},{"label":"Scheme Dropout Rate","value":"14.8","suffix":"%","trend":-3.2},{"label":"Beneficiary Satisfaction","value":"4.2/5","trend":2.1}],
       "charts":[{"type":"grouped","title":"Scheme Performance Comparison","data":_grp(rng,SCHEMES[:6],['Enrolled','Completed','Placed'],100,800),"keys":['Enrolled','Completed','Placed'],"span":2},{"type":"gauge","title":"Budget Utilization","value":87,"gaugeLabel":"Utilized","color":"#10B981"}]},
      {"id":"geography","label":"Geography",
       "metrics":[{"label":"District Performance Index","value":"72.5","suffix":"/100","trend":3.8},{"label":"Top Performing Districts","value":"12","trend":2},{"label":"Bottom Performing Districts","value":"5","trend":-1},{"label":"Rural vs Urban Ratio","value":"0.78","trend":4.5},{"label":"Aspirational District Coverage","value":"85.3","suffix":"%","trend":7.2}],
       "charts":[{"type":"bar","title":"District Performance Index","data":_bar(rng,DISTRICTS,40,95),"color":"#2563EB","span":2},{"type":"pie","title":"Rural vs Urban Distribution","data":_pie(rng,['Rural','Semi-Urban','Urban'])},{"type":"heatmap","title":"District Performance Heatmap (Monthly)","data":_heatmap(rng,DISTRICTS[:8],MONTHS),"rowLabels":DISTRICTS[:8],"colLabels":MONTHS,"span":3,"height":350}]},
      {"id":"inclusion","label":"Inclusion",
       "metrics":[{"label":"Women Participation","value":"42.3","suffix":"%","trend":6.8},{"label":"SC/ST Participation","value":"28.5","suffix":"%","trend":4.2},{"label":"Divyang Participation","value":"3.2","suffix":"%","trend":8.5},{"label":"Minority Participation","value":"18.7","suffix":"%","trend":3.1},{"label":"First-time Job Seekers","value":"65.4","suffix":"%","trend":2.3}],
       "charts":[{"type":"pie","title":"Category-wise Participation","data":_pie(rng,['General','OBC','SC','ST','Minority'])},{"type":"grouped","title":"Inclusion Trends (Monthly)","data":_grp(rng,['Q1','Q2','Q3','Q4'],['Women','SC/ST','Minority'],15,45),"keys":['Women','SC/ST','Minority']}]},
      {"id":"economic","label":"Economic Impact",
       "metrics":[{"label":"Household Income Increase","value":"34.5","suffix":"%","trend":5.2},{"label":"Employment Elasticity Index","value":"0.72","trend":3.1},{"label":"Informal to Formal Transition","value":"28.3","suffix":"%","trend":7.8},{"label":"Migration Reduction","value":"15.2","suffix":"%","trend":4.5}],
       "charts":[{"type":"area","title":"Income Growth Trend","data":_ts(rng,25,10),"color":"#10B981","span":2},{"type":"bar","title":"Employment Funnel","data":_funnel(rng,['Registered','Enrolled','Trained','Certified','Placed']),"color":"#2563EB"},{"type":"sankey","title":"Candidate Flow (Sankey)","nodes":sk["nodes"],"links":sk["links"],"span":3,"height":380}]},
      {"id":"efficiency","label":"Efficiency",
       "metrics":[{"label":"Time to Placement (days)","value":"45","trend":-8.3},{"label":"Cost Efficiency Index","value":"0.82","trend":5.1},{"label":"Vacancy Fulfillment Rate","value":"73.5","suffix":"%","trend":4.2},{"label":"Employer Satisfaction","value":"4.1/5","trend":2.8}],
       "charts":[{"type":"line","title":"Time to Placement Trend","data":_ts(rng,50,15),"color":"#F59E0B"},{"type":"gauge","title":"Cost Efficiency","value":82,"gaugeLabel":"Efficiency","color":"#2563EB"}]},
      {"id":"risk","label":"Risk & Alerts",
       "metrics":[{"label":"Skill Mismatch Index","value":"0.28","trend":-4.2}],
       "alerts":[{"label":"High Dropout Districts","value":"7 Districts","severity":"danger"},{"label":"Low Placement Alerts","value":"12 Active","severity":"warning"},{"label":"Budget Overrun Alerts","value":"3 Schemes","severity":"danger"}],
       "charts":[{"type":"bar","title":"Dropout Rate by District","data":_bar(rng,DISTRICTS[:8],5,25),"color":"#EF4444","span":2}]},
      {"id":"digital","label":"Digital Adoption",
       "metrics":[{"label":"Platform Usage Rate","value":"78.5","suffix":"%","trend":12.3},{"label":"Mobile Usage","value":"64.2","suffix":"%","trend":8.7},{"label":"Daily Active Users","value":"2,34,500","trend":15.2},{"label":"AI Recommendation Usage","value":"45.8","suffix":"%","trend":22.1}],
       "charts":[{"type":"area","title":"Platform Usage Trend","data":_ts(rng,65,20),"color":"#6366F1"},{"type":"pie","title":"Device Distribution","data":_pie(rng,['Mobile','Desktop','Tablet'])}]},
    ]

def build_ai(seed):
    rng=_seed(seed)
    return [
      {"id":"predictions","label":"Predictions","metrics":[{"label":"Predicted Placement Probability","value":"74.2","suffix":"%","trend":3.5},{"label":"Dropout Prediction Score","value":"0.82","trend":4.1},{"label":"Candidate Success Score","value":"68.5","suffix":"/100","trend":2.8},{"label":"Job Match Score","value":"0.76","trend":5.2},{"label":"Salary Prediction Index","value":"0.89","trend":1.8}],"charts":[{"type":"area","title":"Placement Probability Trend","data":_ts(rng,72,10),"color":"#2563EB","span":2},{"type":"gauge","title":"Overall AI Accuracy","value":89,"gaugeLabel":"Accuracy","color":"#10B981"}]},
      {"id":"risk-intel","label":"Risk Intelligence","metrics":[{"label":"High-risk Candidates","value":"12.5","suffix":"%","trend":-2.3},{"label":"High-risk Institutes","value":"23","trend":-4},{"label":"Scheme Failure Probability","value":"8.2","suffix":"%","trend":-1.5},{"label":"Skill Obsolescence Index","value":"0.34","trend":-3.2}],"alerts":[{"label":"Dropout Risk Districts","value":"8 High Risk","severity":"danger"}],"charts":[{"type":"bar","title":"Risk Score by District","data":_bar(rng,DISTRICTS[:8],10,80),"color":"#EF4444","span":2}]},
      {"id":"recommendations","label":"Recommendations","metrics":[{"label":"Job Recommendation Accuracy","value":"84.5","suffix":"%","trend":3.2},{"label":"Skill Recommendation Effectiveness","value":"78.3","suffix":"%","trend":4.8},{"label":"Course Recommendation Conversion","value":"42.1","suffix":"%","trend":6.5},{"label":"Personalized Learning Uptake","value":"56.8","suffix":"%","trend":8.2}],"charts":[{"type":"line","title":"Recommendation Accuracy Over Time","data":_ts(rng,80,10),"color":"#6366F1"},{"type":"pie","title":"Recommendation Types","data":_pie(rng,['Jobs','Skills','Courses','Mentors'])}]},
      {"id":"anomaly","label":"Anomaly Detection","metrics":[{"label":"Fraudulent Activity Alerts","value":"12","trend":-15},{"label":"Fake Job Posting Detection","value":"34","trend":-8}],"alerts":[{"label":"Placement Anomalies","value":"5 Detected","severity":"warning"},{"label":"Enrollment Spikes","value":"3 Districts","severity":"info"}],"charts":[{"type":"area","title":"Anomaly Detection Trend","data":_ts(rng,15,8),"color":"#EC4899","span":2}]},
      {"id":"forecast","label":"Workforce Forecast","metrics":[{"label":"Talent Shortage Index","value":"0.42","trend":-3.5}],"charts":[{"type":"grouped","title":"Future Skill Demand Forecast","data":_grp(rng,SKILLS[:8],['Current','Predicted'],20,90),"keys":['Current','Predicted'],"span":2},{"type":"bar","title":"Sector-wise Job Growth Prediction","data":_bar(rng,SECTORS,5,25),"color":"#0EA5E9"},{"type":"line","title":"Industry Hiring Forecast","data":_ts(rng,5000,2000),"color":"#10B981","span":2}]},
      {"id":"policy-sim","label":"Policy Simulation","metrics":[{"label":"Impact Simulation Score","value":"78.5","suffix":"/100","trend":4.2},{"label":"Scheme Optimization Score","value":"82.3","suffix":"/100","trend":3.8},{"label":"Budget Reallocation Efficiency","value":"71.2","suffix":"%","trend":5.1},{"label":"Scenario Success Probability","value":"68.4","suffix":"%","trend":2.7}],"charts":[{"type":"grouped","title":"Policy Impact Simulation","data":_grp(rng,['Scenario A','Scenario B','Scenario C','Scenario D'],['Impact','Cost','Time'],30,90),"keys":['Impact','Cost','Time']},{"type":"gauge","title":"Optimization Score","value":82,"gaugeLabel":"Optimized","color":"#6366F1"}]},
      {"id":"model-perf","label":"AI Model Performance","metrics":[{"label":"Model Accuracy","value":"89.2","suffix":"%","trend":1.5},{"label":"Precision / Recall","value":"0.87 / 0.91","trend":2.1},{"label":"Drift Detection Score","value":"0.12","trend":-3.4},{"label":"Model Retraining Freq","value":"14 days","trend":0}],"charts":[{"type":"multiline","title":"Model Performance Over Time","data":_grp(rng,MONTHS,['Accuracy','Precision','Recall'],75,95),"keys":['Accuracy','Precision','Recall'],"span":2}]},
      {"id":"behavior","label":"Behavioral Insights","metrics":[{"label":"Candidate Engagement Score","value":"72.4","suffix":"/100","trend":5.3},{"label":"Learning Behavior Index","value":"0.68","trend":4.1},{"label":"Application Abandonment Rate","value":"23.5","suffix":"%","trend":-3.2}],"charts":[{"type":"bar","title":"Drop-off Point Analysis","data":_bar(rng,['Registration','Profile','Skills','Application','Interview','Offer'],10,45),"color":"#F59E0B"},{"type":"area","title":"Engagement Score Trend","data":_ts(rng,70,15),"color":"#EC4899"}]},
      {"id":"automation","label":"Automation","metrics":[{"label":"AI-driven Placements","value":"34.5","suffix":"%","trend":12.3},{"label":"Auto-matching Efficiency","value":"78.2","suffix":"%","trend":5.8},{"label":"Chatbot Resolution Rate","value":"68.4","suffix":"%","trend":8.2},{"label":"Automated Ticket Handling","value":"52.3","suffix":"%","trend":10.5}],"charts":[{"type":"line","title":"Automation Growth","data":_ts(rng,40,15),"color":"#2563EB"},{"type":"pie","title":"Resolution Methods","data":_pie(rng,['AI Auto','Chatbot','Manual','Hybrid'])}]},
      {"id":"governance","label":"AI Governance","metrics":[{"label":"Bias Detection Score","value":"0.08","trend":-5.2},{"label":"Fairness Index","value":"0.92","trend":2.1},{"label":"Explainability Score","value":"0.85","trend":3.4},{"label":"Compliance Score","value":"94.5","suffix":"%","trend":1.8},{"label":"Data Quality Score","value":"91.2","suffix":"%","trend":2.5},{"label":"AI Usage Adoption Rate","value":"67.8","suffix":"%","trend":15.3},{"label":"Decision Support Usage","value":"58.4","suffix":"%","trend":8.7}],"charts":[{"type":"bar","title":"Governance Metrics","data":_bar(rng,['Bias','Fairness','Explain.','Compliance','Quality'],70,98),"color":"#8B5CF6","span":2}]},
    ]

def build_officer(seed):
    rng=_seed(seed)
    return [
      {"id":"scheme-exec","label":"Scheme Execution","metrics":[{"label":"Active Schemes Count","value":"42","trend":5},{"label":"Scheme Progress","value":"72.5","suffix":"%","trend":4.2},{"label":"Enrollment vs Target","value":"85.3","suffix":"%","trend":3.1},{"label":"Completion Rate","value":"68.7","suffix":"%","trend":2.8},{"label":"Dropout Rate","value":"14.2","suffix":"%","trend":-3.5}],"charts":[{"type":"grouped","title":"Scheme Enrollment vs Target","data":_grp(rng,SCHEMES[:6],['Target','Enrolled','Completed'],200,1000),"keys":['Target','Enrolled','Completed'],"span":2},{"type":"gauge","title":"Overall Progress","value":73,"gaugeLabel":"Progress","color":"#2563EB"}]},
      {"id":"district","label":"District Monitoring","metrics":[{"label":"District Rank","value":"#3/36","trend":2},{"label":"Block Performance Index","value":"68.4","suffix":"/100","trend":3.5},{"label":"Underperforming Blocks","value":"8","trend":-2},{"label":"Coverage Ratio","value":"82.5","suffix":"%","trend":4.1}],"charts":[{"type":"bar","title":"District Rankings","data":_bar(rng,DISTRICTS,40,95),"color":"#2563EB","span":2},{"type":"pie","title":"Performance Distribution","data":_pie(rng,['Excellent','Good','Average','Below Avg','Poor'])}]},
      {"id":"financial","label":"Financial","metrics":[{"label":"Budget Allocated","value":"245 Cr","trend":8.5},{"label":"Budget Utilized","value":"198 Cr","trend":12.3},{"label":"Fund Release Delay","value":"12 days","trend":-15},{"label":"Cost per Candidate","value":"8,450","trend":-5.2}],"charts":[{"type":"grouped","title":"Budget Allocation vs Utilization","data":_grp(rng,['Q1','Q2','Q3','Q4'],['Allocated','Utilized'],30,80),"keys":['Allocated','Utilized'],"span":2},{"type":"gauge","title":"Budget Utilization","value":81,"gaugeLabel":"Utilized","color":"#10B981"}]},
      {"id":"approvals","label":"Approvals & Placement","metrics":[{"label":"Pending Approvals","value":"34","trend":-8},{"label":"Avg Approval Time","value":"4.2 days","trend":-12},{"label":"SLA Compliance","value":"88.5","suffix":"%","trend":3.2},{"label":"Job Openings","value":"12,450","trend":5.8},{"label":"Placement Pipeline","value":"8,230","trend":7.2},{"label":"Offer Acceptance Rate","value":"72.3","suffix":"%","trend":2.1}],"charts":[{"type":"line","title":"Approval Time Trend","data":_ts(rng,5,2),"color":"#F59E0B"},{"type":"bar","title":"Placement Pipeline by Sector","data":_bar(rng,SECTORS[:6],200,2000),"color":"#2563EB"}]},
      {"id":"institutes","label":"Institute Monitoring","metrics":[{"label":"Active Institutes","value":"1,245","trend":4.2},{"label":"Institute Performance Score","value":"74.5","suffix":"/100","trend":3.1},{"label":"Low-performing Institutes","value":"45","trend":-8}],"charts":[{"type":"bar","title":"Institute Performance Distribution","data":_bar(rng,['A+ Grade','A Grade','B Grade','C Grade','D Grade'],50,400),"color":"#6366F1"},{"type":"horizontal","title":"Top Institutes by Placement","data":_bar(rng,['ITI Mumbai','MSSDS Pune','KV Nagpur','ITI Thane','DVET Nash.','MSSDS Aur.'],60,98),"color":"#10B981"}]},
      {"id":"alerts-ops","label":"Alerts & Field Ops","alerts":[{"label":"Dropout Alerts","value":"12 Active","severity":"danger"},{"label":"Low Enrollment Alerts","value":"8 Districts","severity":"warning"},{"label":"Budget Risk Alerts","value":"3 Schemes","severity":"danger"}],"metrics":[{"label":"Field Visits Completed","value":"234","trend":15},{"label":"Inspection Score","value":"78.5","suffix":"/100","trend":4.2},{"label":"Compliance Score","value":"85.3","suffix":"%","trend":2.8}],"charts":[{"type":"bar","title":"Field Visit Schedule","data":_bar(rng,['Jan','Feb','Mar','Apr','May','Jun'],15,45),"color":"#0EA5E9"}]},
      {"id":"grievances","label":"Grievances & Data","metrics":[{"label":"Complaints Received","value":"456","trend":-5},{"label":"Resolution Rate","value":"82.3","suffix":"%","trend":4.5},{"label":"Escalation Rate","value":"12.5","suffix":"%","trend":-3.2},{"label":"Missing Data","value":"2.3","suffix":"%","trend":-8},{"label":"Data Validation Errors","value":"145","trend":-12}],"charts":[{"type":"pie","title":"Grievance Categories","data":_pie(rng,['Technical','Scheme','Payment','Certificate','Other'])},{"type":"line","title":"Resolution Trend","data":_ts(rng,80,10),"color":"#10B981"}]},
      {"id":"efficiency-adopt","label":"Efficiency & Adoption","metrics":[{"label":"Case Processing Time","value":"3.5 days","trend":-10},{"label":"Resource Utilization","value":"78.2","suffix":"%","trend":5.1},{"label":"System Usage","value":"85.3","suffix":"%","trend":8.2},{"label":"Officer Login Rate","value":"92.1","suffix":"%","trend":3.5},{"label":"Report Submission Rate","value":"88.4","suffix":"%","trend":4.2},{"label":"Timeliness Score","value":"82.5","suffix":"%","trend":2.8},{"label":"Inclusion Coverage","value":"78.3","suffix":"%","trend":5.5},{"label":"Gender Ratio","value":"1:0.85","trend":4.2},{"label":"Daily Activity Score","value":"74.5","suffix":"/100","trend":3.1},{"label":"Intervention Effectiveness","value":"68.4","suffix":"%","trend":6.2},{"label":"Action Closure Rate","value":"82.1","suffix":"%","trend":4.8},{"label":"Risk Resolution Rate","value":"75.3","suffix":"%","trend":5.5}],"charts":[{"type":"area","title":"System Adoption Trend","data":_ts(rng,80,15),"color":"#6366F1","span":2}]},
    ]

def build_pmo(seed):
    rng=_seed(seed)
    return [
      {"id":"programs","label":"Program Tracking","metrics":[{"label":"Total Programs","value":"52","trend":8},{"label":"Active Programs","value":"38","trend":5},{"label":"Completion %","value":"68.5","suffix":"%","trend":4.2},{"label":"Delay Index","value":"0.23","trend":-5.1}],"charts":[{"type":"grouped","title":"Program Status Distribution","data":_grp(rng,['Kaushalya','MahaRojgar','MSInS','DVET','MSBSVET','SEEID'],['Active','Completed','Delayed'],5,15),"keys":['Active','Completed','Delayed'],"span":2},{"type":"gauge","title":"Overall Completion","value":69,"gaugeLabel":"Complete","color":"#2563EB"}]},
      {"id":"milestones","label":"Milestones","metrics":[{"label":"Milestone Completion","value":"78.2","suffix":"%","trend":5.3},{"label":"Missed Milestones","value":"14","trend":-3},{"label":"On-time Delivery","value":"72.5","suffix":"%","trend":4.1}],"progress":[{"label":"Phase 1: Infrastructure","value":95},{"label":"Phase 2: Development","value":78},{"label":"Phase 3: Testing","value":55},{"label":"Phase 4: Deployment","value":32}],"charts":[{"type":"line","title":"Milestone Completion Timeline","data":_ts(rng,75,15),"color":"#10B981","span":2}]},
      {"id":"resources","label":"Resources","metrics":[{"label":"Resource Allocation","value":"342","trend":5},{"label":"Utilization Rate","value":"82.3","suffix":"%","trend":3.8},{"label":"Overutilization","value":"12.5","suffix":"%","trend":-2.1}],"charts":[{"type":"pie","title":"Resource Distribution","data":_pie(rng,['Development','QA','Design','Management','Support'])},{"type":"bar","title":"Resource Utilization by Team","data":_bar(rng,['Dev Team A','Dev Team B','QA','DevOps','Design','PM'],50,100),"color":"#6366F1"}]},
      {"id":"budget","label":"Budget & Finance","metrics":[{"label":"Budget Burn Rate","value":"67.2","suffix":"%","trend":3.5},{"label":"Cost Variance","value":"-4.5","suffix":"%","trend":-2.1},{"label":"Forecast Accuracy","value":"88.3","suffix":"%","trend":1.8}],"charts":[{"type":"area","title":"Budget Burn Rate Trend","data":_ts(rng,60,20),"color":"#F59E0B","span":2},{"type":"gauge","title":"Budget Health","value":85,"gaugeLabel":"On Track","color":"#10B981"}]},
      {"id":"risks","label":"Risks & Dependencies","metrics":[{"label":"Risk Count","value":"28","trend":-5},{"label":"High-risk Programs","value":"5","trend":-2},{"label":"Mitigation Effectiveness","value":"78.5","suffix":"%","trend":4.2},{"label":"Blocked Tasks","value":"12","trend":-3},{"label":"Dependency Risk Score","value":"0.35","trend":-4.8}],"alerts":[{"label":"Critical Risks","value":"3 Active","severity":"danger"},{"label":"Blocked Dependencies","value":"5 Tasks","severity":"warning"}],"charts":[{"type":"bar","title":"Risk Distribution by Category","data":_bar(rng,['Technical','Resource','Budget','Timeline','External','Integration'],2,8),"color":"#EF4444"}]},
      {"id":"vendor","label":"Vendor & Reporting","metrics":[{"label":"Vendor SLA Score","value":"82.5","suffix":"%","trend":3.2},{"label":"Delivery Compliance","value":"88.4","suffix":"%","trend":2.8},{"label":"Weekly Reports Submitted","value":"45/52","trend":5},{"label":"Dashboard Accuracy","value":"94.2","suffix":"%","trend":1.5}],"charts":[{"type":"grouped","title":"Vendor Performance","data":_grp(rng,['Vendor A','Vendor B','Vendor C','Vendor D'],['Quality','Timeliness','Cost'],60,95),"keys":['Quality','Timeliness','Cost']},{"type":"line","title":"Report Submission Trend","data":_ts(rng,42,8),"color":"#0EA5E9"}]},
      {"id":"governance-eff","label":"Governance & Efficiency","metrics":[{"label":"Audit Compliance","value":"92.5","suffix":"%","trend":2.1},{"label":"Documentation Score","value":"85.3","suffix":"%","trend":3.5},{"label":"Cycle Time","value":"18 days","trend":-8},{"label":"Lead Time","value":"25 days","trend":-5},{"label":"Change Requests","value":"28","trend":-3},{"label":"Approval Time","value":"3.2 days","trend":-12},{"label":"Stakeholder Updates","value":"48/52","trend":4},{"label":"Escalations","value":"8","trend":-5}],"charts":[{"type":"area","title":"Cycle Time Trend","data":_ts(rng,20,8),"color":"#8B5CF6"},{"type":"pie","title":"Change Request Types","data":_pie(rng,['Scope','Timeline','Resource','Technical','Budget'])}]},
      {"id":"tech-misc","label":"Tech & Misc","metrics":[{"label":"System Uptime","value":"99.7","suffix":"%","trend":0.2},{"label":"Integration Success Rate","value":"94.5","suffix":"%","trend":1.8},{"label":"Productivity Index","value":"82.5","suffix":"/100","trend":4.2},{"label":"Quality Index","value":"88.3","suffix":"/100","trend":2.5},{"label":"Execution Score","value":"76.4","suffix":"/100","trend":3.8},{"label":"Sprint Velocity","value":"42","trend":5},{"label":"Defect Density","value":"0.12","trend":-8},{"label":"Test Coverage","value":"78.5","suffix":"%","trend":4.2}],"charts":[{"type":"line","title":"System Uptime History","data":_ts(rng,99,1),"color":"#10B981"},{"type":"bar","title":"Sprint Performance","data":_bar(rng,['S1','S2','S3','S4','S5','S6','S7','S8'],30,55),"color":"#2563EB"}]},
    ]

def build_institute(seed):
    rng=_seed(seed)
    return [
      {"id":"enrollment","label":"Enrollment & Batches","metrics":[{"label":"Enrollment Rate","value":"85.3","suffix":"%","trend":4.2},{"label":"Batch Utilization","value":"78.5","suffix":"%","trend":3.1},{"label":"Course Fill Rate","value":"82.1","suffix":"%","trend":5.5},{"label":"Repeat Enrollment","value":"12.3","suffix":"%","trend":2.8},{"label":"Completion Rate","value":"72.5","suffix":"%","trend":3.8},{"label":"Dropout Rate","value":"14.2","suffix":"%","trend":-4.5}],"charts":[{"type":"grouped","title":"Batch-wise Enrollment","data":_grp(rng,['Batch A','Batch B','Batch C','Batch D','Batch E'],['Capacity','Enrolled','Completed'],20,60),"keys":['Capacity','Enrolled','Completed'],"span":2},{"type":"pie","title":"Enrollment by Course Type","data":_pie(rng,['Technical','Non-Tech','Soft Skills','Digital','Vocational'])}]},
      {"id":"performance","label":"Performance","metrics":[{"label":"Trainer Performance","value":"82.5","suffix":"/100","trend":3.2},{"label":"Attendance","value":"78.3","suffix":"%","trend":2.1},{"label":"Certification Rate","value":"68.5","suffix":"%","trend":4.8},{"label":"Course Effectiveness","value":"74.2","suffix":"/100","trend":3.5},{"label":"Student Feedback","value":"4.2/5","trend":1.8},{"label":"Trainer-to-Student Ratio","value":"1:18","trend":0}],"charts":[{"type":"bar","title":"Trainer Performance Scores","data":_bar(rng,['Trainer A','Trainer B','Trainer C','Trainer D','Trainer E','Trainer F'],60,95),"color":"#6366F1"},{"type":"line","title":"Attendance Trend","data":_ts(rng,78,10),"color":"#10B981"}]},
      {"id":"placements","label":"Placements","metrics":[{"label":"Placement Rate","value":"62.5","suffix":"%","trend":5.2},{"label":"Avg Salary Offered","value":"18,500","trend":7.8},{"label":"Internship Conversion","value":"42.3","suffix":"%","trend":6.5},{"label":"Placement Time","value":"45 days","trend":-8.2},{"label":"Placement Quality Score","value":"74.5","suffix":"/100","trend":3.8},{"label":"Certification Success","value":"82.3","suffix":"%","trend":2.5}],"charts":[{"type":"area","title":"Monthly Placements","data":_ts(rng,45,15),"color":"#2563EB","span":2},{"type":"pie","title":"Placement by Sector","data":_pie(rng,['IT','Manufacturing','Healthcare','Retail','Banking'])}]},
      {"id":"infra","label":"Infrastructure","metrics":[{"label":"Infrastructure Utilization","value":"72.5","suffix":"%","trend":3.2},{"label":"Digital Adoption","value":"68.4","suffix":"%","trend":12.5},{"label":"Industry Tie-ups","value":"28","trend":5},{"label":"Skill Coverage Index","value":"0.78","trend":4.2}],"progress":[{"label":"Lab Utilization","value":82},{"label":"Library Usage","value":65},{"label":"Workshop Usage","value":78},{"label":"Digital Lab","value":72}],"charts":[{"type":"bar","title":"Infrastructure Usage by Facility","data":_bar(rng,['Computer Lab','Workshop','Library','Auditorium','Sports','Canteen'],40,90),"color":"#0EA5E9"}]},
      {"id":"revenue","label":"Revenue & Costs","metrics":[{"label":"Revenue per Batch","value":"4.5L","trend":8.2},{"label":"Cost per Student","value":"12,450","trend":-3.5},{"label":"Local Employment Rate","value":"58.3","suffix":"%","trend":4.2}],"charts":[{"type":"grouped","title":"Revenue vs Cost per Batch","data":_grp(rng,['Batch 1','Batch 2','Batch 3','Batch 4','Batch 5'],['Revenue','Cost'],2,8),"keys":['Revenue','Cost']},{"type":"line","title":"Revenue Trend","data":_ts(rng,4,2),"color":"#10B981"}]},
      {"id":"alumni","label":"Alumni & Outcomes","metrics":[{"label":"Alumni Success Rate","value":"72.5","suffix":"%","trend":4.5},{"label":"Higher Education Rate","value":"18.3","suffix":"%","trend":3.2},{"label":"Entrepreneurship Rate","value":"5.2","suffix":"%","trend":8.5},{"label":"Avg 1-Year Retention","value":"78.5","suffix":"%","trend":2.1},{"label":"Salary Growth (1yr)","value":"22.3","suffix":"%","trend":5.8},{"label":"Industry Feedback Score","value":"4.1/5","trend":1.5},{"label":"Employer Return Rate","value":"65.3","suffix":"%","trend":4.2},{"label":"On-the-Job Training","value":"42.5","suffix":"%","trend":6.8},{"label":"Apprenticeship Conv.","value":"38.2","suffix":"%","trend":5.5},{"label":"Self-Employment Rate","value":"8.5","suffix":"%","trend":12.3}],"charts":[{"type":"bar","title":"Alumni Career Outcomes","data":_bar(rng,['Employed','Higher Ed','Self-Emp','Freelance','Searching'],5,45),"color":"#8B5CF6","span":2}]},
    ]

def build_employer(seed):
    rng=_seed(seed)
    return [
      {"id":"postings","label":"Job Postings","metrics":[{"label":"Jobs Posted","value":"3,245","trend":12.5},{"label":"Active Jobs","value":"1,890","trend":8.3},{"label":"Applications Received","value":"45,670","trend":15.2},{"label":"Avg Applications/Job","value":"24.2","trend":5.8}],"charts":[{"type":"bar","title":"Jobs Posted by Sector","data":_bar(rng,SECTORS,100,600),"color":"#2563EB","span":2},{"type":"area","title":"Job Posting Trend","data":_ts(rng,250,100),"color":"#10B981"}]},
      {"id":"pipeline","label":"Hiring Pipeline","metrics":[{"label":"Shortlisting Rate","value":"32.5","suffix":"%","trend":4.2},{"label":"Interview Rate","value":"68.3","suffix":"%","trend":3.1},{"label":"Offer Rate","value":"42.5","suffix":"%","trend":5.8},{"label":"Hiring Rate","value":"35.2","suffix":"%","trend":4.5},{"label":"Time to Hire","value":"28 days","trend":-8.3},{"label":"Cost per Hire","value":"5,450","trend":-5.2}],"charts":[{"type":"bar","title":"Hiring Funnel","data":[{"name":"Applied","value":4567},{"name":"Shortlisted","value":1484},{"name":"Interviewed","value":1014},{"name":"Offered","value":431},{"name":"Hired","value":352}],"color":"#6366F1","span":2},{"type":"line","title":"Time to Hire Trend","data":_ts(rng,30,10),"color":"#F59E0B"}]},
      {"id":"quality","label":"Quality & Satisfaction","metrics":[{"label":"Offer Acceptance","value":"78.5","suffix":"%","trend":3.2},{"label":"Skill Match Score","value":"0.82","trend":4.5},{"label":"Candidate Quality Score","value":"74.2","suffix":"/100","trend":2.8},{"label":"Employer Satisfaction","value":"4.2/5","trend":1.5},{"label":"Retention Rate","value":"82.3","suffix":"%","trend":2.1},{"label":"Attrition Rate","value":"12.5","suffix":"%","trend":-3.8}],"charts":[{"type":"gauge","title":"Overall Satisfaction","value":84,"gaugeLabel":"Satisfaction","color":"#10B981"},{"type":"pie","title":"Attrition Reasons","data":_pie(rng,['Better Offer','Relocation','Work Culture','Growth','Personal'])}]},
      {"id":"diversity","label":"Diversity & Campus","metrics":[{"label":"Diversity Hiring","value":"34.5","suffix":"%","trend":8.2},{"label":"Freshers Hiring","value":"45.2","suffix":"%","trend":5.5},{"label":"Campus Hiring","value":"28.3","suffix":"%","trend":6.8},{"label":"Women Hiring","value":"38.5","suffix":"%","trend":7.2},{"label":"Repeat Hiring Rate","value":"42.5","suffix":"%","trend":3.8}],"charts":[{"type":"grouped","title":"Diversity Hiring by Category","data":_grp(rng,['Q1','Q2','Q3','Q4'],['Women','SC/ST','Freshers','Campus'],10,50),"keys":['Women','SC/ST','Freshers','Campus'],"span":2},{"type":"pie","title":"Hiring Source","data":_pie(rng,['Campus','Portal','Referral','Agency','Walk-in'])}]},
      {"id":"ai-tech","label":"AI & Tech","metrics":[{"label":"AI Matching Usage","value":"56.8","suffix":"%","trend":15.3},{"label":"AI Match Accuracy","value":"82.3","suffix":"%","trend":4.2},{"label":"Auto-screening Rate","value":"45.2","suffix":"%","trend":12.5},{"label":"Digital Interview Rate","value":"38.5","suffix":"%","trend":18.2},{"label":"Hiring Funnel Conversion","value":"7.7","suffix":"%","trend":2.1},{"label":"Candidate Pipeline Health","value":"0.85","trend":3.5},{"label":"Job Description Quality","value":"78.3","suffix":"/100","trend":4.8},{"label":"Response Time to Apps","value":"2.3 days","trend":-15},{"label":"Employer Brand Score","value":"72.5","suffix":"/100","trend":5.2},{"label":"Talent Pool Size","value":"12,450","trend":8.5}],"charts":[{"type":"line","title":"AI Adoption Growth","data":_ts(rng,45,15),"color":"#6366F1"},{"type":"bar","title":"Tech Feature Usage","data":_bar(rng,['AI Match','Auto-Screen','Video Int.','Analytics','Chatbot'],20,60),"color":"#2563EB"}]},
    ]

def build_helpdesk(seed):
    rng=_seed(seed)
    return [
      {"id":"overview","label":"Tickets Overview","metrics":[{"label":"Tickets Raised","value":"12,450","trend":5.2},{"label":"Tickets Resolved","value":"10,890","trend":8.5},{"label":"Pending Tickets","value":"1,560","trend":-12},{"label":"Aging Tickets (>7d)","value":"234","trend":-8},{"label":"Today's Tickets","value":"145","trend":3.2},{"label":"Repeat Issues","value":"8.5","suffix":"%","trend":-4.2}],"charts":[{"type":"bar","title":"Tickets by Category","data":_bar(rng,['Technical','Account','Payment','Certificate','Scheme','Other'],200,2500),"color":"#2563EB","span":2},{"type":"pie","title":"Ticket Status","data":_pie(rng,['Open','In Progress','Resolved','Closed','Escalated'])}]},
      {"id":"sla","label":"SLA & Performance","metrics":[{"label":"SLA Compliance","value":"88.5","suffix":"%","trend":3.2},{"label":"Avg Resolution Time","value":"4.2 hrs","trend":-12},{"label":"First Response Time","value":"15 min","trend":-18},{"label":"Escalation Rate","value":"8.5","suffix":"%","trend":-4.2},{"label":"Resolution Accuracy","value":"92.3","suffix":"%","trend":2.5},{"label":"First Contact Resolution","value":"68.4","suffix":"%","trend":5.8}],"charts":[{"type":"line","title":"SLA Compliance Trend","data":_ts(rng,86,8),"color":"#10B981","span":2},{"type":"gauge","title":"SLA Health","value":89,"gaugeLabel":"Compliance","color":"#2563EB"}]},
      {"id":"agents","label":"Agent Productivity","metrics":[{"label":"Agent Productivity","value":"24.5","suffix":"tickets/day","trend":5.2},{"label":"Active Agents","value":"45","trend":3},{"label":"Avg Handling Time","value":"12 min","trend":-8.5},{"label":"Agent Utilization","value":"78.5","suffix":"%","trend":2.8},{"label":"Quality Score","value":"85.3","suffix":"/100","trend":3.2},{"label":"Training Hours","value":"8 hrs/mo","trend":5}],"charts":[{"type":"bar","title":"Agent Performance","data":_bar(rng,['Agent A','Agent B','Agent C','Agent D','Agent E','Agent F','Agent G','Agent H'],15,35),"color":"#6366F1"},{"type":"area","title":"Tickets Handled per Day","data":_ts(rng,120,40),"color":"#0EA5E9"}]},
      {"id":"satisfaction","label":"Customer Satisfaction","metrics":[{"label":"CSAT Score","value":"4.2/5","trend":2.5},{"label":"NPS Score","value":"+42","trend":5.8},{"label":"Satisfaction Rate","value":"85.3","suffix":"%","trend":3.2},{"label":"Feedback Response Rate","value":"42.5","suffix":"%","trend":8.5},{"label":"Complaint Rate","value":"3.2","suffix":"%","trend":-4.2},{"label":"Resolution Satisfaction","value":"88.5","suffix":"%","trend":2.1}],"charts":[{"type":"line","title":"CSAT Trend","data":_ts(rng,82,8),"color":"#10B981"},{"type":"pie","title":"Satisfaction Distribution","data":_pie(rng,['Very Satisfied','Satisfied','Neutral','Dissatisfied','Very Dissatisfied'])},{"type":"gauge","title":"NPS Score","value":72,"gaugeLabel":"NPS","color":"#6366F1"}]},
      {"id":"automation","label":"Automation & Bot","metrics":[{"label":"Bot Resolution","value":"42.5","suffix":"%","trend":12.5},{"label":"Manual Resolution","value":"57.5","suffix":"%","trend":-5.2},{"label":"Chatbot Accuracy","value":"78.5","suffix":"%","trend":4.2},{"label":"Auto-routing Accuracy","value":"85.3","suffix":"%","trend":3.8},{"label":"Self-service Usage","value":"35.2","suffix":"%","trend":15},{"label":"Knowledge Base Hits","value":"8,450/day","trend":8.5}],"charts":[{"type":"grouped","title":"Resolution by Channel","data":_grp(rng,MONTHS[:6],['Bot','Manual','Self-Service'],100,500),"keys":['Bot','Manual','Self-Service'],"span":2},{"type":"line","title":"Bot Resolution Growth","data":_ts(rng,35,10),"color":"#EC4899"}]},
      {"id":"load","label":"Load & Operations","metrics":[{"label":"Peak Load Handling","value":"95.2","suffix":"%","trend":2.1},{"label":"Queue Wait Time","value":"3.5 min","trend":-12},{"label":"After Hours Coverage","value":"68.5","suffix":"%","trend":5.2},{"label":"Ticket Backlog","value":"342","trend":-8},{"label":"Priority P1 Open","value":"5","trend":-3},{"label":"Priority P2 Open","value":"28","trend":-5},{"label":"Avg Reopen Rate","value":"4.2","suffix":"%","trend":-2.8},{"label":"Knowledge Gap Score","value":"0.18","trend":-5.2},{"label":"Shift Coverage","value":"92.5","suffix":"%","trend":1.5}],"charts":[{"type":"area","title":"Hourly Ticket Volume","data":_bar(rng,['6AM','8AM','10AM','12PM','2PM','4PM','6PM','8PM','10PM'],10,80),"color":"#F59E0B","span":2},{"type":"pie","title":"Channel Distribution","data":_pie(rng,['Phone','Email','Chat','Portal','WhatsApp'])}]},
    ]

def build_student(seed):
    rng=_seed(seed)
    return [
      {"id":"profile","label":"Profile & Skills","metrics":[{"label":"Profile Completion","value":"85","suffix":"%","trend":5.2},{"label":"Skills Added","value":"12","trend":3},{"label":"Resume Score","value":"72","suffix":"/100","trend":8.5},{"label":"Portfolio Score","value":"68","suffix":"/100","trend":4.2},{"label":"Skill Gap Score","value":"0.32","trend":-5.8},{"label":"AI Match Score","value":"78","suffix":"/100","trend":4.5}],"progress":[{"label":"Personal Info","value":100},{"label":"Education","value":90},{"label":"Skills","value":75},{"label":"Experience","value":60}],"charts":[{"type":"horizontal","title":"Skill Proficiency","data":_bar(rng,SKILLS[:8],30,95),"color":"#2563EB"},{"type":"pie","title":"Skill Category Distribution","data":_pie(rng,['Technical','Soft Skills','Domain','Tools','Language'])}]},
      {"id":"learning","label":"Learning","metrics":[{"label":"Courses Enrolled","value":"8","trend":2},{"label":"Courses Completed","value":"5","trend":1},{"label":"Certifications Earned","value":"3","trend":1},{"label":"Learning Hours","value":"124","suffix":"hrs","trend":15},{"label":"Attendance","value":"82.5","suffix":"%","trend":3.2},{"label":"Assignment Score","value":"78","suffix":"/100","trend":5.8}],"progress":[{"label":"Web Development","value":85},{"label":"Data Analytics","value":60},{"label":"Digital Marketing","value":40},{"label":"Communication Skills","value":90}],"charts":[{"type":"area","title":"Weekly Learning Hours","data":_bar(rng,['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12'],2,12),"color":"#6366F1"},{"type":"bar","title":"Course Progress","data":_bar(rng,['Web Dev','Analytics','Dig. Mkt','Comm.','English'],30,90),"color":"#10B981"}]},
      {"id":"job-search","label":"Job Search","metrics":[{"label":"Job Applications","value":"24","trend":5},{"label":"Interview Calls","value":"8","trend":3},{"label":"Offers Received","value":"2","trend":1},{"label":"Placement Status","value":"Interviewing","trend":None},{"label":"Salary Offered","value":"18,500","trend":7.2},{"label":"Application Success Rate","value":"33.3","suffix":"%","trend":4.5}],"charts":[{"type":"bar","title":"Application Status","data":[{"name":"Applied","value":24},{"name":"Shortlisted","value":12},{"name":"Interviewed","value":8},{"name":"Offered","value":2},{"name":"Rejected","value":4}],"color":"#2563EB"},{"type":"pie","title":"Applications by Sector","data":_pie(rng,['IT','Finance','Healthcare','Retail','Manufacturing'])}]},
      {"id":"performance","label":"Performance","metrics":[{"label":"Engagement Score","value":"72","suffix":"/100","trend":5.2},{"label":"Daily Activity","value":"85","suffix":"min","trend":8},{"label":"Consistency Score","value":"78","suffix":"%","trend":4.5},{"label":"Peer Ranking","value":"#45/320","trend":12},{"label":"Mentor Sessions","value":"6","trend":2},{"label":"Mock Interview Score","value":"74","suffix":"/100","trend":8.5}],"charts":[{"type":"line","title":"Engagement Score Trend","data":_ts(rng,70,12),"color":"#EC4899","span":2},{"type":"gauge","title":"Overall Rating","value":72,"gaugeLabel":"Score","color":"#2563EB"}]},
      {"id":"activity","label":"Activity & Goals","metrics":[{"label":"Login Streak","value":"14 days","trend":None},{"label":"Tasks Completed","value":"32/40","trend":5},{"label":"Forum Posts","value":"8","trend":3},{"label":"Event Participation","value":"4","trend":2},{"label":"Referrals Made","value":"3","trend":1},{"label":"Badge Earned","value":"5","trend":2},{"label":"Career Goal Progress","value":"65","suffix":"%","trend":8},{"label":"Counselor Sessions","value":"2","trend":1}],"progress":[{"label":"Complete Profile","value":85},{"label":"Earn 5 Certificates","value":60},{"label":"Apply to 30 Jobs","value":80},{"label":"Attend 5 Events","value":80}],"charts":[{"type":"area","title":"Daily Activity Minutes","data":_bar(rng,['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],30,120),"color":"#F59E0B"}]},
    ]

def build_bi(seed):
    rng=_seed(seed); sk=_sankey(rng)
    return [
      {"id":"trends","label":"Trend Analysis","metrics":[{"label":"Placement Trend","value":"Upward","trend":12.5},{"label":"Enrollment Trend","value":"Stable","trend":2.1},{"label":"Dropout Trend","value":"Declining","trend":-5.8},{"label":"Salary Trend","value":"Growing","trend":7.2}],"charts":[{"type":"multiline","title":"Multi-Metric Trend Analysis","data":_grp(rng,MONTHS,['Placements','Enrollments','Dropouts'],20,80),"keys":['Placements','Enrollments','Dropouts'],"span":2},{"type":"area","title":"Salary Growth Trend","data":_ts(rng,15000,3000),"color":"#10B981"}]},
      {"id":"cohort","label":"Cohort Analysis","metrics":[{"label":"Best Performing Batch","value":"Batch 2024-Q3","trend":None},{"label":"Avg Batch Placement","value":"65.2","suffix":"%","trend":4.2},{"label":"Top Course Success Rate","value":"82.5","suffix":"%","trend":3.8}],"charts":[{"type":"grouped","title":"Batch-wise Placement Rate","data":_grp(rng,['B-2023Q1','B-2023Q2','B-2023Q3','B-2023Q4','B-2024Q1','B-2024Q2'],['Enrolled','Trained','Placed'],30,90),"keys":['Enrolled','Trained','Placed'],"span":2},{"type":"bar","title":"Course-wise Success Rate","data":_bar(rng,['Web Dev','Data Sci','Nursing','Electrician','Tally','AutoCAD','Marketing'],40,85),"color":"#6366F1"},{"type":"bar","title":"District-wise Analysis","data":_bar(rng,DISTRICTS,35,85),"color":"#2563EB","span":2}]},
      {"id":"segmentation","label":"Segmentation","metrics":[{"label":"Gender Gap Index","value":"0.18","trend":-4.5},{"label":"Age Group Diversity","value":"0.72","trend":2.1},{"label":"Skill Diversity Score","value":"0.85","trend":3.8}],"charts":[{"type":"grouped","title":"Gender-wise KPIs","data":_grp(rng,['Enrolled','Trained','Certified','Placed','Retained'],['Male','Female','Other'],20,80),"keys":['Male','Female','Other']},{"type":"pie","title":"Age Distribution","data":_pie(rng,['18-21','22-25','26-30','31-35','35+'])},{"type":"horizontal","title":"Skill-wise Placement Rate","data":_bar(rng,SKILLS[:8],40,85),"color":"#EC4899"}]},
      {"id":"funnel","label":"Funnel Analysis","metrics":[{"label":"Overall Conversion","value":"8.2","suffix":"%","trend":1.5},{"label":"Biggest Drop-off","value":"Training Stage","trend":None}],"charts":[{"type":"bar","title":"Registration to Placement Funnel","data":[{"name":"Registered","value":124568},{"name":"Enrolled","value":89234},{"name":"Training","value":67890},{"name":"Certified","value":52345},{"name":"Applied","value":38456},{"name":"Interviewed","value":24567},{"name":"Placed","value":18234}],"color":"#2563EB","span":2},{"type":"bar","title":"Drop-off Analysis","data":[{"name":"Reg-Enroll","value":28},{"name":"Enroll-Train","value":24},{"name":"Train-Cert","value":23},{"name":"Cert-Apply","value":27},{"name":"Apply-Int","value":36},{"name":"Int-Place","value":26}],"color":"#EF4444"}]},
      {"id":"efficiency","label":"Efficiency & ROI","metrics":[{"label":"Cost vs Outcome Ratio","value":"0.72","trend":5.2},{"label":"ROI per Scheme","value":"245","suffix":"%","trend":8.5},{"label":"Cost Efficiency Score","value":"78.5","suffix":"/100","trend":3.8}],"charts":[{"type":"grouped","title":"ROI per Scheme","data":_grp(rng,SCHEMES[:6],['Cost (Cr)','Returns (Cr)'],5,50),"keys":['Cost (Cr)','Returns (Cr)'],"span":2},{"type":"gauge","title":"Overall Efficiency","value":79,"gaugeLabel":"Efficiency","color":"#10B981"}]},
      {"id":"advanced","label":"Advanced Analytics","metrics":[{"label":"Correlation Index","value":"0.82","trend":2.1},{"label":"Causal Impact Score","value":"0.68","trend":4.5},{"label":"Predictive Accuracy","value":"87.5","suffix":"%","trend":1.8}],"charts":[{"type":"multiline","title":"Multi-variable Correlation","data":_grp(rng,MONTHS,['Training','Placement','Salary','Satisfaction'],30,90),"keys":['Training','Placement','Salary','Satisfaction'],"span":2},{"type":"pie","title":"Impact Factor Distribution","data":_pie(rng,['Skills','Experience','Location','Education','Network'])}]},
      {"id":"visualization","label":"Visual Insights","metrics":[{"label":"Data Coverage","value":"94.5","suffix":"%","trend":1.2},{"label":"Report Generation","value":"1,245","trend":5},{"label":"Dashboard Views","value":"34,560","trend":12}],"charts":[{"type":"heatmap","title":"District x Sector Performance Heatmap","data":_heatmap(rng,DISTRICTS[:8],SECTORS),"rowLabels":DISTRICTS[:8],"colLabels":SECTORS,"span":3,"height":350},{"type":"sankey","title":"Candidate Journey Flow (Sankey)","nodes":sk["nodes"],"links":sk["links"],"span":3,"height":380},{"type":"grouped","title":"District Comparison","data":_grp(rng,DISTRICTS[:6],['Enrollment','Training','Placement'],20,80),"keys":['Enrollment','Training','Placement'],"span":2},{"type":"pie","title":"Data Source Distribution","data":_pie(rng,['MahaRojgar','Kaushalya','DVET','MSInS','External'])}]},
      {"id":"derived","label":"Derived Metrics","metrics":[{"label":"Composite Success Index","value":"74.5","suffix":"/100","trend":3.8},{"label":"State Readiness Score","value":"72.3","suffix":"/100","trend":5.2},{"label":"Policy Impact Score","value":"68.4","suffix":"/100","trend":4.5},{"label":"Digital Maturity Index","value":"0.72","trend":8.2},{"label":"Ecosystem Health Score","value":"78.5","suffix":"/100","trend":2.8},{"label":"Stakeholder Trust Index","value":"0.85","trend":1.5},{"label":"Innovation Score","value":"65.2","suffix":"/100","trend":12},{"label":"Sustainability Index","value":"0.78","trend":3.5},{"label":"Inclusivity Quotient","value":"0.82","trend":4.8},{"label":"Growth Potential Score","value":"72.5","suffix":"/100","trend":6.2},{"label":"Quality of Life Impact","value":"0.68","trend":3.2},{"label":"Economic Multiplier","value":"2.45","trend":5.5},{"label":"Social Impact Score","value":"74.2","suffix":"/100","trend":4.2}],"charts":[{"type":"bar","title":"Composite Index Components","data":_bar(rng,['Success','Readiness','Policy','Digital','Ecosystem','Innovation'],55,85),"color":"#6366F1","span":2}]},
    ]

BUILDERS = {"ceo":build_ceo,"ai":build_ai,"officer":build_officer,"pmo":build_pmo,"institute":build_institute,"employer":build_employer,"helpdesk":build_helpdesk,"student":build_student,"bi":build_bi}
DASHBOARD_META = {
    "ceo":{"title":"CEO / Government Dashboard","subtitle":"Outcome + Policy + Impact","level":"Level 1 - Strategic"},
    "ai":{"title":"AI Insight Dashboard","subtitle":"Predictive + Prescriptive Intelligence","level":"Level 1 - Strategic"},
    "officer":{"title":"Government Officer Dashboard","subtitle":"Scheme Execution, District Monitoring & Field Ops","level":"Level 2 - Operational"},
    "pmo":{"title":"PMO Dashboard","subtitle":"Program Tracking, Milestones, Budgets & Risks","level":"Level 2 - Operational"},
    "institute":{"title":"Institute Dashboard","subtitle":"Enrollment, Training, Placements & Infrastructure","level":"Level 3 - Execution"},
    "employer":{"title":"Employer Dashboard","subtitle":"Hiring Pipeline, Job Postings & Talent Matching","level":"Level 3 - Execution"},
    "helpdesk":{"title":"Helpdesk Dashboard","subtitle":"Ticket Management, SLA Compliance & Satisfaction","level":"Level 3 - Execution"},
    "student":{"title":"Student Dashboard","subtitle":"Profile, Skills, Learning Progress & Job Search","level":"Level 4 - End User"},
    "bi":{"title":"BI / Analytics Dashboard","subtitle":"Trends, Cohorts, Funnels & Advanced Analytics","level":"Level 5 - Analytical"},
}

# ── Dashboard data endpoint ───────────────────────────────────
@api_router.get("/dashboard/{dashboard_type}")
async def get_dashboard_data(dashboard_type: str, date_from: Optional[str] = None, date_to: Optional[str] = None):
    if dashboard_type not in BUILDERS:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    seed_str = f"{dashboard_type}_{date_from}_{date_to}"
    seed = hash(seed_str) % (2**31)
    tabs = BUILDERS[dashboard_type](seed)
    meta = DASHBOARD_META[dashboard_type]
    return {"title": meta["title"], "subtitle": meta["subtitle"], "level": meta["level"], "tabs": tabs}

# ── Global search endpoint ────────────────────────────────────
@api_router.get("/search")
async def global_search(q: str = Query("", min_length=1)):
    query = q.lower().strip()
    results = []
    for dkey, builder in BUILDERS.items():
        meta = DASHBOARD_META[dkey]
        tabs = builder(42)
        for tab in tabs:
            for m in tab.get("metrics", []):
                if query in m["label"].lower() or query in str(m.get("value","")).lower():
                    results.append({"dashboard": dkey, "dashboard_title": meta["title"], "tab": tab["id"], "tab_label": tab["label"], "type": "metric", "label": m["label"], "value": m.get("value",""), "suffix": m.get("suffix","")})
            for a in tab.get("alerts", []):
                if query in a["label"].lower() or query in str(a.get("value","")).lower():
                    results.append({"dashboard": dkey, "dashboard_title": meta["title"], "tab": tab["id"], "tab_label": tab["label"], "type": "alert", "label": a["label"], "value": a.get("value","")})
            if query in tab["label"].lower():
                results.append({"dashboard": dkey, "dashboard_title": meta["title"], "tab": tab["id"], "tab_label": tab["label"], "type": "tab", "label": tab["label"], "value": ""})
        if query in meta["title"].lower():
            results.append({"dashboard": dkey, "dashboard_title": meta["title"], "tab": "", "tab_label": "", "type": "dashboard", "label": meta["title"], "value": ""})
    return results[:50]

# ── Seeding & startup ─────────────────────────────────────────
DEMO_USERS = [
    {"email": "admin@mahaswayam.gov.in", "name": "Admin User", "role": "admin", "password": "Admin@123"},
    {"email": "ceo@mahaswayam.gov.in", "name": "Rajesh Sharma", "role": "ceo", "password": "Ceo@123"},
    {"email": "ai@mahaswayam.gov.in", "name": "Dr. Priya Patel", "role": "ai_insights", "password": "Ai@123"},
    {"email": "officer@mahaswayam.gov.in", "name": "Sunil Deshmukh", "role": "gov_officer", "password": "Officer@123"},
    {"email": "pmo@mahaswayam.gov.in", "name": "Anita Kulkarni", "role": "pmo", "password": "Pmo@123"},
    {"email": "institute@mahaswayam.gov.in", "name": "Prof. Mehta", "role": "institute", "password": "Institute@123"},
    {"email": "employer@mahaswayam.gov.in", "name": "Vikram Singh", "role": "employer", "password": "Employer@123"},
    {"email": "helpdesk@mahaswayam.gov.in", "name": "Neha Joshi", "role": "helpdesk", "password": "Helpdesk@123"},
    {"email": "student@mahaswayam.gov.in", "name": "Amit Kumar", "role": "student", "password": "Student@123"},
    {"email": "bi@mahaswayam.gov.in", "name": "Deepak Rao", "role": "bi_analytics", "password": "Bi@123"},
]

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    for u in DEMO_USERS:
        existing = await db.users.find_one({"email": u["email"]})
        if not existing:
            await db.users.insert_one({
                "email": u["email"],
                "password_hash": hash_password(u["password"]),
                "name": u["name"],
                "role": u["role"],
                "created_at": datetime.now(timezone.utc)
            })
    memory_dir = (ROOT_DIR.parent / "memory")
    memory_dir.mkdir(parents=True, exist_ok=True)
    with open(memory_dir / "test_credentials.md", "w") as f:
        f.write("# MahaSwayam Test Credentials\n\n")
        for u in DEMO_USERS:
            f.write(f"- **{u['role']}**: {u['email']} / {u['password']}\n")
        f.write("\n## Auth Endpoints\n- POST /api/auth/login\n- POST /api/auth/register\n- GET /api/auth/me\n- POST /api/auth/logout\n- POST /api/auth/refresh\n- GET /api/health\n")
        f.write("\n## Dashboard Endpoints\n- GET /api/dashboard/{type} (ceo,ai,officer,pmo,institute,employer,helpdesk,student,bi)\n- GET /api/search?q={query}\n")
    logger.info("Demo users seeded successfully")

app.include_router(api_router)

_cors_regex = os.environ.get("CORS_ORIGIN_REGEX", "").strip() or None
_cors_kwargs = {
    "allow_origins": _cors_allow_origins(),
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}
if _cors_regex:
    _cors_kwargs["allow_origin_regex"] = _cors_regex

app.add_middleware(CORSMiddleware, **_cors_kwargs)

@app.on_event("shutdown")
async def shutdown():
    client.close()
