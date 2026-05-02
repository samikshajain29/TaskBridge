import React, { useState } from 'react';
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
    <div className="flex items-center justify-center min-h-screen py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="w-full max-w-md p-8 mx-4 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
            <Layout className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Create an account</h2>
          <p className="mt-2 text-sm text-gray-500">Start managing your tasks today.</p>
        </div>
        
        {apiError && (
          <div className="p-4 mb-6 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
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
            placeholder="John Doe"
            error={errors.name}
          />

          <Input
            label="Email"
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={errors.email}
          />
          
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
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.confirmPassword}
          />
          
          <Button type="submit" className="w-full mt-6" isLoading={loading} disabled={!isFormValid}>
            Create account
          </Button>
        </form>
        
        <p className="mt-8 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
