import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/apiClient';
import { Terminal, Shield, ChevronRight, Lock, User, Mail, Building, Globe, Factory, Key, CheckSquare, Square, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const GlitchText = ({ text, className = '' }: { text: string; className?: string }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10 inline-block">{text}</span>
    </span>
  );
};

export const Auth = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'register' | 'transition' | 'granted'>('login');
  
  // Transition states
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Auth logic states
  const [registeredCredentials, setRegisteredCredentials] = useState(() => {
    try {
      const saved = localStorage.getItem('last_ceo_credentials');
      return saved ? JSON.parse(saved) : { identifier: '', password: '', name: '' };
    } catch {
      return { identifier: '', password: '', name: '' };
    }
  });
  const [loginError, setLoginError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('reg_name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('reg_email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('reg_password') as HTMLInputElement).value;
    const company = "";
    const country = "";
    const industry = "";
    
    const creds = { identifier: email, password, name };
    setRegisteredCredentials(creds);
    localStorage.setItem('last_ceo_credentials', JSON.stringify(creds));
    
    // Log to backend CSV
    api.logAuth({ action: "Register", name, email, company, country, industry }).catch(console.error);

    setView('transition');
    setProgress(0);
    setLogs([]);
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const identifier = (form.elements.namedItem('login_identifier') as HTMLInputElement).value;
    const password = (form.elements.namedItem('login_password') as HTMLInputElement).value;
    
    setLoginError('');
    setSuccessMsg('');

    if (registeredCredentials.identifier) {
      if ((identifier === registeredCredentials.identifier || identifier === registeredCredentials.name) && password === registeredCredentials.password) {
        
        // Log to backend CSV
        api.logAuth({ action: "Login", name: registeredCredentials.name, email: registeredCredentials.identifier }).catch(console.error);

        setView('granted');
      } else {
        setLoginError('Invalid credentials. Access Denied.');
      }
    } else {
      setLoginError('No executive profile found. Please create one first.');
    }
  };

  useEffect(() => {
    if (view === 'transition') {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 15) + 5;
        if (currentProgress > 100) currentProgress = 100;
        setProgress(currentProgress);

        if (currentProgress >= 25 && !logs.includes('Identity Verified')) {
          setLogs(prev => [...prev, 'Identity Verified']);
        }
        if (currentProgress >= 60 && !logs.includes('Company Profile Created')) {
          setLogs(prev => [...prev, 'Company Profile Created']);
        }
        if (currentProgress >= 90 && !logs.includes('AI Models Initialized')) {
          setLogs(prev => [...prev, 'AI Models Initialized']);
        }

        if (currentProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setView('login');
            setSuccessMsg('Executive Profile created. Please sign in to authenticate.');
          }, 1500);
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [view, logs]);

  const renderProgressBar = () => {
    const totalBlocks = 20;
    const filledBlocks = Math.floor((progress / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
  };

  const loginInputClass = "w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600 [&:-webkit-autofill]:bg-slate-900/50 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgba(15,23,42,1)] [&:-webkit-autofill]:[-webkit-text-fill-color:#fff]";
  const regInputClass = "w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 [&:-webkit-autofill]:bg-slate-900/50 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgba(15,23,42,1)] [&:-webkit-autofill]:[-webkit-text-fill-color:#fff]";
  const selectClass = "w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-all appearance-none [&:-webkit-autofill]:bg-slate-900/50 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgba(15,23,42,1)] [&:-webkit-autofill]:[-webkit-text-fill-color:#fff]";
  const optionClass = "bg-slate-900 text-slate-300";

  return (
    <div className="min-h-screen bg-[#040610] text-slate-100 font-space relative flex items-center justify-center overflow-hidden scanlines">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-10 filter saturate-150" style={{ backgroundImage: "url('/cyberpunk_city.png')" }} />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#040610] via-[#040610]/80 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* 
        Width changes: 
        max-w-md -> max-w-lg for login 
      */}
      <div className="relative z-10 w-full max-w-lg mx-auto p-6">
        
        {/* LOGIN VIEW */}
        {view === 'login' && (
          <div className="bg-slate-950/80 backdrop-blur-xl border border-cyan-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-orbitron font-black text-cyan-400 tracking-widest uppercase mb-2 animate-[pulse_4s_ease-in-out_infinite] drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]">
                THE LAST CEO
              </h1>
              <div className="inline-block px-3 py-1 bg-rose-500/10 border border-rose-500/50 rounded text-rose-400 text-[10px] font-mono tracking-widest uppercase mb-4 animate-pulse">
                ACCESS RESTRICTED
              </div>
              <p className="text-slate-400 text-sm tracking-wide">Boardroom Authorization Required</p>
            </div>

            {successMsg && (
              <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-xs text-center rounded-lg tracking-widest uppercase">
                {successMsg}
              </div>
            )}

            {loginError && (
              <div className="mb-6 px-4 py-3 bg-rose-500/10 border border-rose-500/50 text-rose-400 text-xs text-center rounded-lg tracking-widest uppercase animate-pulse">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <input 
                  type="text" 
                  name="login_identifier"
                  required
                  className={loginInputClass}
                  placeholder="Email or Username"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <input 
                  type={showLoginPassword ? "text" : "password"} 
                  name="login_password"
                  required
                  className={loginInputClass}
                  placeholder="Password"
                />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300">
                  {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition-colors">
                  <input type="checkbox" className="form-checkbox rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900" />
                  Remember Me
                </label>
                <a href="#" className="hover:text-cyan-400 transition-colors">Forgot Password?</a>
              </div>

              <button type="submit" className="w-full py-3 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 font-bold tracking-[0.2em] uppercase rounded-xl hover:bg-cyan-500 hover:text-slate-950 transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                ENTER BOARDROOM
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="my-8 flex items-center gap-4 text-slate-600 text-[10px] font-mono uppercase tracking-widest">
              <div className="flex-1 h-px bg-slate-800" />
              <span>OR</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            <button 
              onClick={() => {
                setLoginError('');
                setSuccessMsg('');
                setView('register');
              }}
              className="w-full py-3 bg-transparent border border-slate-700 text-slate-300 font-bold tracking-[0.1em] uppercase rounded-xl hover:border-slate-500 hover:bg-slate-800/50 transition-all"
            >
              Create Executive Account
            </button>

            <div className="mt-8 text-center text-[10px] font-mono text-slate-500 tracking-widest uppercase flex flex-col gap-1">
              <span>XGBoost Ready • AI Models Loaded</span>
              <span className="text-emerald-500/50">Secure FastAPI Authentication</span>
            </div>
          </div>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
          <div className="bg-slate-950/80 backdrop-blur-xl border border-indigo-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(99,102,241,0.15)] animate-in fade-in slide-in-from-bottom-8 duration-500 w-full max-w-xl mx-auto relative md:max-w-2xl">
            <div className="border-b border-slate-800 pb-6 mb-6">
              <h2 className="text-2xl font-orbitron font-black text-indigo-400 tracking-widest uppercase mb-2">Create CEO Profile</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Welcome, Future CEO.<br />
                <span className="text-slate-500">Register your executive credentials to gain access to the AI Strategy Boardroom.</span>
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <input name="reg_name" required type="text" className={regInputClass} placeholder="Executive Name" />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <input name="reg_email" required type="email" className={regInputClass} placeholder="Corporate Email" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="w-4 h-4 text-slate-500" />
                  </div>
                  <input name="reg_password" required type={showPassword ? "text" : "password"} className={regInputClass} placeholder="Password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>
                  <input name="reg_confirm_password" required type={showConfirmPassword ? "text" : "password"} className={regInputClass} placeholder="Confirm Password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                  <input required type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="form-checkbox rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900" />
                  I agree to the Terms & Conditions
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                  <input type="checkbox" className="form-checkbox rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900" />
                  Keep me signed in
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button type="submit" disabled={!termsAccepted} className={`w-full py-3 ${termsAccepted ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500 hover:text-slate-950 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'} border font-bold tracking-[0.2em] uppercase rounded-xl transition-all flex items-center justify-center gap-2 group`}>
                  CREATE EXECUTIVE ACCOUNT
                  <ChevronRight className={`w-4 h-4 ${termsAccepted ? 'group-hover:translate-x-1' : ''} transition-transform`} />
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <span className="text-xs text-slate-500">Already have executive credentials? </span>
              <button onClick={() => setView('login')} className="text-xs text-indigo-400 font-bold hover:text-indigo-300 tracking-wider uppercase ml-1">
                SIGN IN
              </button>
            </div>
            
            <div className="mt-6 text-center text-[9px] font-mono text-slate-600 tracking-widest uppercase flex justify-center gap-2">
              <span>Secure Authentication</span> • <span className="text-emerald-500/40">FastAPI</span> • <span className="text-cyan-500/40">JWT Protected</span>
            </div>
          </div>
        )}

        {/* TRANSITION VIEW */}
        {view === 'transition' && (
          <div className="w-full max-w-lg mx-auto bg-slate-950/90 border border-cyan-500/30 p-8 md:p-12 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] font-mono animate-in zoom-in duration-300">
            <h2 className="text-cyan-400 text-lg mb-6 flex items-center gap-2 animate-pulse">
              <Terminal className="w-5 h-5" />
              Initializing Executive Profile...
            </h2>
            
            <div className="text-cyan-500 mb-8 text-xl md:text-2xl tracking-widest font-bold">
              {renderProgressBar()} <span className="text-white ml-2">{progress}%</span>
            </div>

            <div className="space-y-4 mb-8 min-h-[120px]">
              {logs.map((log, i) => (
                <div key={i} className="flex items-center gap-3 text-emerald-400 animate-in fade-in slide-in-from-left-4">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm tracking-widest uppercase">{log}</span>
                </div>
              ))}
            </div>

            <div className="text-slate-500 text-xs tracking-[0.2em] uppercase animate-pulse">
              Preparing Boardroom Access...
            </div>
          </div>
        )}

        {/* GRANTED VIEW */}
        {view === 'granted' && (
          <div className="text-center animate-in zoom-in-95 duration-1000">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-2 border-emerald-500 bg-emerald-500/10 shadow-[0_0_60px_rgba(16,185,129,0.4)] mb-8">
              <Shield className="w-12 h-12 text-emerald-400" />
            </div>
            
            <h1 className="text-5xl font-orbitron font-black text-emerald-400 tracking-widest uppercase mb-8 text-glow-emerald">
              ACCESS GRANTED
            </h1>

            <div className="space-y-2 text-slate-300 font-space tracking-wider mb-12 text-lg">
              <p>Welcome, CEO.</p>
              <p className="text-slate-500">The Board of Directors is waiting<br/>for your arrival on the 100th Floor.</p>
            </div>

            <button 
              onClick={() => navigate('/enter')}
              className="px-12 py-4 bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-black tracking-[0.3em] uppercase rounded-xl hover:bg-emerald-500 hover:text-slate-950 transition-all flex items-center justify-center gap-3 mx-auto group shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]"
            >
              ENTER BOARDROOM
              <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
