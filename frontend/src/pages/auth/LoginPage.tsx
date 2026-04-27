import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Package, BarChart2, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { label: 'CEO', email: 'ceo@notium.com', password: 'Notium2024!', role: 'Business Decision Maker' },
  { label: 'Finance', email: 'finance@notium.com', password: 'Notium2024!', role: 'Finance Team' },
  { label: 'PM', email: 'pm@notium.com', password: 'Notium2024!', role: 'Product Manager' },
];

const STATS = [
  { icon: Package, label: '8 products tracked' },
  { icon: BarChart2, label: '36 months of data' },
  { icon: Users, label: '3 user roles' },
];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch {
      setError(true);
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError(false);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-10 w-[40%] relative overflow-hidden"
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}
      >
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '10%', left: '-20%', width: 400, height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,200,150,0.15) 0%, transparent 70%)',
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            style={{
              position: 'absolute', bottom: '10%', right: '-10%', width: 350, height: 350,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Logo & tagline */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="var(--brand-primary)" fillOpacity="0.2" />
              <path d="M7 7h3.5L14 18l3.5-11H21" stroke="var(--brand-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="14" cy="21" r="1.5" fill="var(--brand-primary)" />
            </svg>
            <div>
              <p className="text-xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Notium
              </p>
              <p className="text-xs font-mono" style={{ color: 'var(--brand-primary)', letterSpacing: '0.15em' }}>
                PROFITABILITY INTELLIGENCE
              </p>
            </div>
          </div>

          <h1 className="text-4xl mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            From data blindness<br />to profit clarity.
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            AI-powered profitability intelligence for modern finance teams.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 space-y-3">
          {STATS.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-dim)' }}>
                <Icon size={16} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Welcome back
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
              Sign in to your Notium PIP account
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="relative">
                <label
                  className="absolute left-3 transition-all duration-200 pointer-events-none"
                  style={{
                    top: emailFocus || email ? '8px' : '50%',
                    transform: emailFocus || email ? 'translateY(0) scale(0.8)' : 'translateY(-50%)',
                    transformOrigin: 'left',
                    color: emailFocus ? 'var(--brand-primary)' : 'var(--text-muted)',
                    fontSize: 14,
                    zIndex: 1,
                  }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  required
                  className="w-full pt-6 pb-2 px-3 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: `1px solid ${error ? 'var(--danger)' : emailFocus ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                    color: 'var(--text-primary)',
                    boxShadow: emailFocus ? '0 0 0 2px rgba(0,200,150,0.15)' : 'none',
                  }}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label
                  className="absolute left-3 transition-all duration-200 pointer-events-none"
                  style={{
                    top: pwFocus || password ? '8px' : '50%',
                    transform: pwFocus || password ? 'translateY(0) scale(0.8)' : 'translateY(-50%)',
                    transformOrigin: 'left',
                    color: pwFocus ? 'var(--brand-primary)' : 'var(--text-muted)',
                    fontSize: 14,
                    zIndex: 1,
                  }}
                >
                  Password
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPwFocus(true)}
                  onBlur={() => setPwFocus(false)}
                  required
                  className="w-full pt-6 pb-2 px-3 pr-10 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: `1px solid ${error ? 'var(--danger)' : pwFocus ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                    color: 'var(--text-primary)',
                    boxShadow: pwFocus ? '0 0 0 2px rgba(0,200,150,0.15)' : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: [0, -4, 4, -4, 4, 0] }}
                  transition={{ duration: 0.4 }}
                  className="text-sm"
                  style={{ color: 'var(--danger)' }}
                >
                  Invalid email or password. Please try again.
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                className="w-full py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 glow-brand"
                style={{
                  background: 'var(--brand-primary)',
                  color: '#000',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn size={16} />
                )}
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6">
              <p className="text-xs mb-3 font-mono" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                DEMO ACCOUNTS
              </p>
              <div className="flex gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.label}
                    onClick={() => fillDemo(acc)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--brand-primary)';
                      e.currentTarget.style.color = 'var(--brand-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <div className="font-semibold">{acc.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontSize: 9 }}>
                      {acc.role}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
