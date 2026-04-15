import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  BarChart3, Brain, Shield, ClipboardList, GraduationCap,
  Building2, Headphones, Users, PieChart, ArrowRight,
  TrendingUp, Target, MapPin, ChevronRight
} from 'lucide-react';

const DASHBOARDS = [
  { title: 'CEO / Government', desc: 'Outcome, Policy & Impact metrics across Maharashtra', icon: BarChart3, color: 'bg-blue-600', path: '/dashboard/ceo', kpis: 50, level: 'Strategic' },
  { title: 'AI Insights', desc: 'Predictive & Prescriptive Intelligence powered by AI', icon: Brain, color: 'bg-indigo-600', path: '/dashboard/ai', kpis: 45, level: 'Strategic' },
  { title: 'Government Officer', desc: 'Scheme execution, district monitoring & field ops', icon: Shield, color: 'bg-emerald-600', path: '/dashboard/officer', kpis: 45, level: 'Operational' },
  { title: 'PMO', desc: 'Program tracking, milestones, budgets & risks', icon: ClipboardList, color: 'bg-amber-600', path: '/dashboard/pmo', kpis: 40, level: 'Operational' },
  { title: 'Institute', desc: 'Enrollment, training, placements & infrastructure', icon: GraduationCap, color: 'bg-cyan-600', path: '/dashboard/institute', kpis: 40, level: 'Execution' },
  { title: 'Employer', desc: 'Hiring pipeline, job postings & talent matching', icon: Building2, color: 'bg-violet-600', path: '/dashboard/employer', kpis: 40, level: 'Execution' },
  { title: 'Helpdesk', desc: 'Ticket management, SLA compliance & satisfaction', icon: Headphones, color: 'bg-rose-600', path: '/dashboard/helpdesk', kpis: 40, level: 'Execution' },
  { title: 'Student', desc: 'Profile, skills, learning progress & job search', icon: Users, color: 'bg-teal-600', path: '/dashboard/student', kpis: 40, level: 'End User' },
  { title: 'BI / Analytics', desc: 'Trends, cohorts, funnels & advanced analytics', icon: PieChart, color: 'bg-orange-600', path: '/dashboard/bi', kpis: 50, level: 'Analytical' },
];

const STATS = [
  { label: 'Registered Candidates', value: '1.24 Cr', icon: Users },
  { label: 'Successful Placements', value: '38.5 L', icon: Target },
  { label: 'Training Institutes', value: '4,280', icon: GraduationCap },
  { label: 'Partner Employers', value: '12,650', icon: Building2 },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50" data-testid="landing-page">
      {/* Navbar */}
      <nav className="glass-bar sticky top-0 z-50 border-b border-slate-200" data-testid="landing-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-slate-900 text-lg leading-tight">MahaSwayam</h1>
              <p className="text-xs text-slate-500 leading-none">Government of Maharashtra</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#dashboards" className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors">Dashboards</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors">About</a>
            <a href="#stats" className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors">Impact</a>
          </div>
          <Button
            data-testid="nav-login-btn"
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            className="bg-blue-700 hover:bg-blue-800 text-white font-medium"
          >
            {user ? 'Go to Dashboard' : 'Login'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url(https://images.pexels.com/photos/4067525/pexels-photo-4067525.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)', backgroundSize: 'cover', backgroundPosition: 'center'}} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6">
              <MapPin className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-xs font-medium text-blue-200 tracking-wide uppercase">Maharashtra State Portal</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 tracking-tight">
              MahaSwayam<br />
              <span className="text-blue-300">Integrated Employment</span> Portal
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
              Unified platform for Skills, Employment, Entrepreneurship & Innovation. Powering data-driven decisions across 9 strategic dashboards with 400+ KPIs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                data-testid="hero-explore-btn"
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                size="lg"
                className="bg-white text-blue-800 hover:bg-blue-50 font-semibold px-8 h-12 text-base"
              >
                Explore Dashboards
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                data-testid="hero-learn-btn"
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 font-medium px-8 h-12 text-base"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative shapes */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-40 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl" />
      </section>

      {/* Stats */}
      <section id="stats" className="relative -mt-12 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="stats-section">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className={`bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-fade-in animate-fade-in-delay-${i}`}>
              <s.icon className="w-8 h-8 text-blue-600 mb-3" />
              <p className="stat-value text-3xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="about-section">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">About the Initiative</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900 mb-4 tracking-tight">
              Transforming Maharashtra's Skill & Employment Ecosystem
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mb-4">
              MahaSwayam is the unified digital platform for the Skills, Employment, Entrepreneurship and Innovation Department (SEEID) of Maharashtra. It consolidates multiple portals including Kaushalya, MahaRojgar, MSInS, DVET, and MSBSVET into a single integrated ecosystem.
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              The platform leverages AI-driven analytics, real-time monitoring, and comprehensive dashboards to enable data-driven policy making, efficient scheme execution, and improved outcomes for millions of citizens across Maharashtra.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1623868677243-fc9f09f14511?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwyfHxtdW1iYWklMjBza3lsaW5lJTIwc2t5bGluZSUyMHNreWxpbmV8ZW58MHx8fHwxNzc2MDYxODc3fDA&ixlib=rb-4.1.0&q=85"
              alt="Mumbai Cityscape"
              className="rounded-xl shadow-lg w-full h-72 object-cover"
            />
            <div className="absolute -bottom-4 -left-4 bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg">
              <p className="font-heading font-bold text-2xl">36+</p>
              <p className="text-xs text-blue-200">Districts Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboards Grid */}
      <section id="dashboards" className="bg-white border-y border-slate-200 py-16" data-testid="dashboards-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">Command Center</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              9 Strategic Dashboards, 400+ KPIs
            </h2>
            <p className="text-base text-slate-500 mt-3 max-w-lg mx-auto">
              Comprehensive monitoring across strategic, operational, execution, and analytical levels.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DASHBOARDS.map((d, i) => (
              <div
                key={i}
                className="group border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => navigate(user ? d.path : '/login')}
                data-testid={`dashboard-card-${d.title.toLowerCase().replace(/[\s\/]/g, '-')}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-lg ${d.color} flex items-center justify-center`}>
                    <d.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">{d.level}</span>
                </div>
                <h3 className="font-heading font-semibold text-slate-900 text-lg mb-1 group-hover:text-blue-700 transition-colors">{d.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{d.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-600">{d.kpis} KPIs</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="cta-section">
        <div className="hero-gradient rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1750969185331-e03829f72c7d?crop=entropy&cs=srgb&fm=jpg)', backgroundSize: 'cover'}} />
          <div className="relative">
            <TrendingUp className="w-10 h-10 text-blue-300 mx-auto mb-4" />
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">Ready to Explore the Data?</h2>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">Access real-time insights across all dashboards with role-based authentication.</p>
            <Button
              data-testid="cta-get-started-btn"
              onClick={() => navigate('/login')}
              size="lg"
              className="bg-white text-blue-800 hover:bg-blue-50 font-semibold px-8"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800" data-testid="landing-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-700 flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">M</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">MahaSwayam Portal</p>
                <p className="text-xs text-slate-500">Government of Maharashtra - SEEID</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">&copy; 2026 Skills, Employment, Entrepreneurship & Innovation Department. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
