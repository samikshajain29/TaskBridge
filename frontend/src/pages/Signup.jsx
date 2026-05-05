import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { Layout } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: null }));
  };

  const isFormValid = formData.name.trim() && 
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && 
                      formData.password.length >= 6 && 
                      formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/auth/signup', { 
        name: formData.name, 
        email: formData.email, 
        password: formData.password 
      });
      // Automatically login after successful signup
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.errors) {
        setApiError(err.response.data.errors[0].msg);
      } else {
        setApiError(err.response?.data?.message || 'Failed to sign up');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen py-12 overflow-hidden bg-zinc-50 font-sans">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary-100/50 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-200/40 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-md px-6 py-8 mx-4">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="group relative flex items-center justify-center w-14 h-14 mb-4 transition-all duration-500 transform hover:scale-110">
            <div className="absolute inset-0 bg-primary-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform opacity-20 blur-xl"></div>
            <div className="relative flex items-center justify-center w-full h-full text-white bg-primary-600 rounded-2xl shadow-2xl shadow-primary-200 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
               <Layout className="w-7 h-7 relative z-10" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 font-display">Join TaskBridge</h2>
          <p className="mt-2 text-sm text-zinc-500">Bridge the gap between your ideas and execution.</p>
        </div>

        {/* Signup Card */}
        <div className="glass p-8 rounded-3xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)] animate-in fade-in zoom-in-95 duration-700">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-zinc-800">Create account</h3>
            <p className="text-xs text-zinc-500 mt-1">Fill in your details to get started.</p>
          </div>
          
          {apiError && (
            <div className="p-4 mb-6 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <div className="p-1 bg-rose-100 rounded-lg">
                <svg className="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              {apiError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              error={errors.name}
            />

            <Input
              label="Email Address"
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              error={errors.email}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
              />

              <Input
                label="Confirm"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.confirmPassword}
              />
            </div>
            
            <div className="pt-4">
              <Button type="submit" className="w-full h-12 text-base shadow-primary-200" isLoading={loading} disabled={!isFormValid}>
                Get Started
              </Button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 transition-colors underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <p className="mt-8 text-center text-xs text-zinc-400 uppercase tracking-widest font-semibold">
          Secure & Reliable Task Management
        </p>
      </div>
    </div>
  );
};

export default Signup;
