import React, { useState } from 'react';
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="w-full max-w-md p-8 mx-4 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
            <Layout className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-500">Please enter your details to sign in.</p>
        </div>
        
        {apiError && (
          <div className="p-4 mb-6 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {apiError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            placeholder="Enter your email"
            error={errors.email}
          />
          
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

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-700">
                Remember me
              </label>
            </div>
           
          </div>
          
          <Button type="submit" className="w-full mt-6" isLoading={loading}>
            Sign in
          </Button>
        </form>
        
        <p className="mt-8 text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
