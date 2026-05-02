import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, type = 'text', id, value, onChange, placeholder, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col mb-4">
      {label && (
        <label htmlFor={id} className="mb-1.5 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 text-gray-800 bg-white border rounded-lg focus:outline-none focus:ring-4 transition-all duration-200 ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-400'
          } ${isPassword ? 'pr-12' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            tabIndex="-1"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <span className="mt-1.5 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{error}</span>}
    </div>
  );
};

export default Input;
