import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLE_DASHBOARD_MAP } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, LogIn, AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'CEO / Government', email: 'ceo@mahaswayam.gov.in', password: 'Ceo@123', role: 'ceo' },
  { label: 'AI Insights', email: 'ai@mahaswayam.gov.in', password: 'Ai@123', role: 'ai_insights' },
  { label: 'Government Officer', email: 'officer@mahaswayam.gov.in', password: 'Officer@123', role: 'gov_officer' },
  { label: 'PMO', email: 'pmo@mahaswayam.gov.in', password: 'Pmo@123', role: 'pmo' },
  { label: 'Institute', email: 'institute@mahaswayam.gov.in', password: 'Institute@123', role: 'institute' },
  { label: 'Employer', email: 'employer@mahaswayam.gov.in', password: 'Employer@123', role: 'employer' },
  { label: 'Helpdesk', email: 'helpdesk@mahaswayam.gov.in', password: 'Helpdesk@123', role: 'helpdesk' },
  { label: 'Student', email: 'student@mahaswayam.gov.in', password: 'Student@123', role: 'student' },
  { label: 'BI / Analytics', email: 'bi@mahaswayam.gov.in', password: 'Bi@123', role: 'bi_analytics' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    const target = ROLE_DASHBOARD_MAP[user.role] || '/dashboard/ceo';
    navigate(target, { replace: true });
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      const target = ROLE_DASHBOARD_MAP[data.role] || '/dashboard/ceo';
      navigate(target, { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (val) => {
    const account = DEMO_ACCOUNTS.find(a => a.role === val);
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
      setError('');
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative items-center justify-center p-12">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1750969185331-e03829f72c7d?crop=entropy&cs=srgb&fm=jpg)', backgroundSize: 'cover'}} />
        <div className="relative text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="font-heading font-bold text-2xl">M</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl">MahaSwayam</h2>
              <p className="text-xs text-blue-200">Government of Maharashtra</p>
            </div>
          </div>
          <h1 className="font-heading text-4xl font-bold mb-4 tracking-tight">Welcome to the Integrated Employment Portal</h1>
          <p className="text-blue-200 leading-relaxed">Access 9 strategic dashboards with 400+ KPIs covering employment outcomes, AI insights, scheme performance, and more.</p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {['1.24 Cr Candidates', '38.5L Placements', '4,280 Institutes', '36 Districts'].map((s, i) => (
              <div key={i} className="bg-white/10 rounded-lg px-4 py-3 border border-white/10">
                <p className="text-sm font-medium text-white">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-700 mb-6 transition-colors"
            data-testid="back-to-home-btn"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-2xl text-slate-900">Sign In</CardTitle>
              <CardDescription className="text-slate-500">Enter your credentials to access the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg" data-testid="login-error">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@mahaswayam.gov.in"
                    className="mt-1"
                    required
                    data-testid="login-email-input"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-1"
                    required
                    data-testid="login-password-input"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium h-11"
                  disabled={loading}
                  data-testid="login-submit-btn"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" /> Sign In
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Quick Access - Demo Accounts</p>
                <Select onValueChange={fillDemo} data-testid="demo-account-select">
                  <SelectTrigger className="w-full" data-testid="demo-account-trigger">
                    <SelectValue placeholder="Select a demo account..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_ACCOUNTS.map((a) => (
                      <SelectItem key={a.role} value={a.role} data-testid={`demo-${a.role}`}>
                        {a.label} - {a.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400 mt-2">Select a role to auto-fill credentials</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
