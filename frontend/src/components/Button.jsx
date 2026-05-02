import React from 'react';
import Loader from './Loader';

const Button = ({ children, onClick, type = 'button', variant = 'primary', isLoading = false, disabled = false, className = '', ...props }) => {
  const baseClasses = 'px-4 py-2.5 font-medium rounded-lg transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-4 relative overflow-hidden';
  
  const variants = {
    primary: `bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md hover:shadow-lg hover:from-indigo-500 hover:to-indigo-600 focus:ring-indigo-500/30 ${disabled || isLoading ? 'opacity-70 cursor-not-allowed from-indigo-400 to-indigo-500 shadow-none' : 'active:scale-[0.98]'}`,
    secondary: `bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200 ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`,
    danger: `bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md hover:shadow-lg hover:from-red-500 hover:to-red-600 focus:ring-red-500/30 ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader size="sm" color={variant === 'secondary' ? 'text-indigo-600' : 'text-white'} />
          <span className="opacity-90">Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
