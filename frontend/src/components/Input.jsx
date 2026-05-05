import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, type = 'text', id, value, onChange, placeholder, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col mb-4">
      {label && (
        <label htmlFor={id} className="mb-2 text-sm font-semibold text-zinc-700 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          type={inputType}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 text-zinc-800 bg-white border rounded-xl outline-none transition-all duration-300 ${
            error 
              ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
              : 'border-zinc-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 group-hover:border-zinc-300'
          } ${isPassword ? 'pr-12' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400 hover:text-primary-600 transition-colors focus:outline-none"
            tabIndex="-1"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <span className="mt-2 text-xs font-semibold text-rose-500 ml-1 animate-in fade-in slide-in-from-top-1">{error}</span>}
    </div>
  );
};

export default Input;
