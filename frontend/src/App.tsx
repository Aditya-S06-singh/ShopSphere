import { useState, useEffect } from 'react';
import { fetchHealth, HealthResponse } from './api/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { 
  Server, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Cpu,
  LogIn,
  UserPlus,
  LogOut,
  User as UserIcon,
  Shield,
  KeyRound,
  Check
} from 'lucide-react';

function DashboardContent() {
  const { user, token, isAuthenticated, logout } = useAuth();

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const checkStatus = async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setHealthError(err.message);
      } else {
        setHealthError('Failed to reach backend service');
      }
      setHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
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

          {/* User / Auth Controls in Header */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
                    {user.firstName.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-white leading-tight">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      {user.role === 'ROLE_ADMIN' ? (
                        <span className="text-purple-400 font-semibold flex items-center">
                          <Shield className="w-3 h-3 mr-0.5" /> ADMIN
                        </span>
                      ) : (
                        <span className="text-sky-400 flex items-center">
                          <UserIcon className="w-3 h-3 mr-0.5" /> CUSTOMER
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openAuth('login')}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors shadow-md shadow-indigo-600/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Milestone 2 Active: Security, BCrypt & JWT Role Authorization</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Enterprise E-Commerce <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300">
              Secured with Spring Security 6 & JWT
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Stateless role-based access control, BCrypt password hashing, and live token verification with PostgreSQL 18.
          </p>
        </div>

        {/* Milestone 2 Security Showcase Card */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Authentication & Identity Status</h2>
                <p className="text-xs text-slate-400">Stateless JWT tokens with role-based claims</p>
              </div>
            </div>

            {isAuthenticated ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Authenticated</span>
              </span>
            ) : (
              <button
                onClick={() => openAuth('login')}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-all shadow-md shadow-indigo-600/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Test Login</span>
              </button>
            )}
          </div>

          <div className="mt-6">
            {isAuthenticated && user ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">User Email</div>
                    <div className="text-sm font-semibold text-white mt-1 truncate">{user.email}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Assigned Role</div>
                    <div className="text-sm font-semibold text-white mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                        user.role === 'ROLE_ADMIN' 
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">User ID</div>
                    <div className="text-sm font-semibold text-white mt-1 font-mono">#{user.id}</div>
                  </div>
                </div>

                {token && (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Active JWT Access Token (Authorization: Bearer)</span>
                      <span className="text-emerald-400 text-[10px] font-mono">HMAC-SHA256 Signed</span>
                    </div>
                    <div className="text-xs font-mono text-slate-300 bg-slate-950 p-2.5 rounded-lg break-all border border-slate-800">
                      {token}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-700/50 text-center space-y-3">
                <p className="text-sm text-slate-300">
                  You are currently browsing as a <strong className="text-white">Guest</strong>.
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click below to test login with pre-seeded demo accounts or register a brand-new user with real BCrypt hashing into PostgreSQL 18.
                </p>
                <div className="flex justify-center space-x-3 pt-2">
                  <button
                    onClick={() => openAuth('login')}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
                  >
                    Open Sign In Dialog
                  </button>
                  <button
                    onClick={() => openAuth('register')}
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition-colors"
                  >
                    Register New Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Milestone 1 System Health Card */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-slate-700 text-indigo-400">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Full-Stack Infrastructure</h2>
                <p className="text-xs text-slate-400">Live heartbeat check between React and Spring Boot</p>
              </div>
            </div>
            <button
              onClick={checkStatus}
              disabled={loadingHealth}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-xs font-medium text-white transition-all border border-slate-600"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
              <span>{loadingHealth ? 'Checking...' : 'Refresh'}</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  {health ? `${health.appName} (${health.status})` : healthError ? 'Offline / Unreachable' : 'Connecting...'}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {health ? `Version: ${health.version}` : 'Port: 8080'}
                </div>
              </div>
            </div>

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

          {healthError && (
            <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <span className="font-semibold">Backend Unreachable:</span> {healthError}. Ensure Spring Boot is running on port 8080.
            </div>
          )}
        </div>

        {/* Engineering Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-4">
          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Spring Security 6</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stateless session architecture with custom DaoAuthenticationProvider and BCrypt password encryption.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Role-Based Guardrails</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforced separation between <span className="text-sky-300 font-mono">ROLE_CUSTOMER</span> and <span className="text-purple-300 font-mono">ROLE_ADMIN</span> across controllers.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 mb-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Milestone 3 Ready</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Product catalog, category hierarchies, and admin inventory controls will link directly to these role boundaries.
            </p>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        ShopSphere &copy; {new Date().getFullYear()} &mdash; Portfolio-Quality Engineering Project
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
