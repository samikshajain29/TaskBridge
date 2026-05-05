import Loader from './Loader';

const Button = ({ children, onClick, type = 'button', variant = 'primary', isLoading = false, disabled = false, className = '', ...props }) => {
  const baseClasses = 'px-6 py-2.5 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-4 relative overflow-hidden active:scale-95';
  
  const variants = {
    primary: `bg-primary-600 text-white shadow-lg shadow-primary-200/50 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-300/50 focus:ring-primary-500/30 ${disabled || isLoading ? 'opacity-70 cursor-not-allowed bg-primary-400 shadow-none' : ''}`,
    secondary: `bg-white text-zinc-700 border border-zinc-200 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 focus:ring-zinc-100 ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : ''}`,
    danger: `bg-rose-600 text-white shadow-lg shadow-rose-200/50 hover:bg-rose-700 hover:shadow-xl hover:shadow-rose-300/50 focus:ring-rose-500/30 ${disabled || isLoading ? 'opacity-70 cursor-not-allowed bg-rose-400 shadow-none' : ''}`,
    ghost: `bg-transparent text-zinc-600 hover:bg-zinc-100 focus:ring-zinc-100 ${disabled || isLoading ? 'opacity-50' : ''}`,
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
          <Loader size="sm" color={variant === 'secondary' || variant === 'ghost' ? 'text-primary-600' : 'text-white'} />
          <span className="opacity-90">Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
