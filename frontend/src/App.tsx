import { useState, useEffect } from 'react';
import { fetchHealth, HealthResponse } from './api/client';
import { 
  Server, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Cpu 
} from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to reach backend service');
      }
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                ShopSphere
              </span>
              <span className="ml-2 text-xs font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                AI Powered
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Java 27 / Spring Boot 3.4 / React / PG 18
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Milestone 1: Scaffold & Architecture Verification</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Next-Generation <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300">
              E-Commerce Platform
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Built with Spring Boot 3.4 (Java 21 LTS release target on JDK 27), local PostgreSQL 18, React, TypeScript, and modern Tailwind CSS.
          </p>
        </div>

        {/* Live Connectivity Card */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-slate-700 text-indigo-400">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Full-Stack System Health</h2>
                <p className="text-xs text-slate-400">Live heartbeat check between React and Spring Boot</p>
              </div>
            </div>
            <button
              onClick={checkStatus}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-medium text-white transition-all shadow-md shadow-indigo-600/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Testing...' : 'Check Status'}</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Backend Node Status */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-start space-x-3">
              <div className="mt-0.5">
                {health?.status === 'UP' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Backend API</div>
                <div className="text-sm font-semibold text-white">
                  {health ? `${health.appName} (${health.status})` : error ? 'Offline / Unreachable' : 'Connecting...'}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {health ? `Version: ${health.version}` : 'Port: 8080'}
                </div>
              </div>
            </div>

            {/* Database Node Status */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-start space-x-3">
              <div className="mt-0.5">
                <Database className={`w-5 h-5 ${health?.details?.database === 'CONNECTED' ? 'text-emerald-400' : 'text-slate-500'}`} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">PostgreSQL 18 DB</div>
                <div className="text-sm font-semibold text-white">
                  {health?.details?.database === 'CONNECTED'
                    ? 'Connected (Hikari Pool)'
                    : health?.details?.database === 'DISCONNECTED'
                    ? 'Disconnected'
                    : 'Pending Setup'}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {health?.details?.dbProductName 
                    ? `${health.details.dbProductName} ${health.details.dbProductVersion || ''}`
                    : 'Host: localhost:5432'}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <span className="font-semibold">Backend Unreachable:</span> {error}. Ensure Spring Boot is running on port 8080 (`mvn spring-boot:run`).
            </div>
          )}

          {health?.timestamp && (
            <div className="mt-4 text-right text-[11px] font-mono text-slate-500">
              Last probe: {new Date(health.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Engineering Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-4">
          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Java 27 & Spring Boot 3.4</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configured with standard Java 21 LTS release bytecode to guarantee flawless Hibernate and Byte Buddy runtime support.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Security-First Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modular monolith foundation ready for BCrypt hashing, stateless JWT authentication, and role-based route guardrails.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 mb-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">AI Search & RAG Ready</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed for seamless integration with semantic product search and an intelligent shopping assistant in Phase 6.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        ShopSphere &copy; {new Date().getFullYear()} &mdash; Portfolio-Quality Engineering Project
      </footer>
    </div>
  );
}
