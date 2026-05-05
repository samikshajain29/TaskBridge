import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Layout } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-zinc-50 font-sans">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-100/50 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary-200/40 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-md px-6 py-12 mx-4">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="group relative flex items-center justify-center w-16 h-16 mb-6 transition-all duration-500 transform hover:scale-110">
            <div className="absolute inset-0 bg-primary-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform opacity-20 blur-xl"></div>
            <div className="relative flex items-center justify-center w-full h-full text-white bg-primary-600 rounded-2xl shadow-2xl shadow-primary-200 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
               <Layout className="w-8 h-8 relative z-10" />
            </div>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display">TaskBridge</h2>
          <p className="mt-3 text-base text-zinc-500">Simplify your workflow, bridge your tasks.</p>
        </div>

        {/* Login Card */}
        <div className="glass p-8 md:p-10 rounded-3xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)] animate-in fade-in zoom-in-95 duration-700">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-zinc-800">Welcome back</h3>
            <p className="text-sm text-zinc-500 mt-1">Please enter your credentials to continue.</p>
          </div>
          
          {apiError && (
            <div className="p-4 mb-8 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <div className="p-1 bg-rose-100 rounded-lg">
                <svg className="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              {apiError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              placeholder="name@example.com"
              error={errors.email}
            />
            
            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                placeholder="••••••••"
                error={errors.password}
              />
              <div className="flex justify-end">
                <button type="button" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  Forgot password?
                </button>
              </div>
            </div>

            <div className="flex items-center px-1">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded-md transition-all duration-200 flex items-center justify-center ${rememberMe ? 'bg-primary-600 border-primary-600' : 'border-zinc-300 bg-white group-hover:border-primary-400'}`}>
                    {rememberMe && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm font-medium text-zinc-600 select-none">Remember me</span>
              </label>
            </div>
            
            <Button type="submit" className="w-full h-12 text-base shadow-primary-200" isLoading={loading}>
              Sign In
            </Button>
          </form>
          
          <div className="mt-10 pt-8 border-t border-zinc-100">
            <p className="text-sm text-center text-zinc-500">
              New to TaskBridge?{' '}
              <Link to="/signup" className="font-bold text-primary-600 hover:text-primary-700 transition-colors underline-offset-4 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <p className="mt-12 text-center text-xs text-zinc-400 uppercase tracking-widest font-semibold">
          &copy; 2026 TaskBridge Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
