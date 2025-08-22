import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | '8xl' | '9xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'responsive';
  as?: keyof JSX.IntrinsicElements;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = '7xl',
  padding = 'responsive',
  as: Component = 'div',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    '8xl': 'max-w-8xl',
    '9xl': 'max-w-9xl',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-6',
    responsive: 'container-safe py-responsive',
  };

  return (
    <Component
      className={`mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </Component>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'responsive';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  cols = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = 'responsive',
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    responsive: 'gap-3 xs:gap-4 sm:gap-6',
  };

  // Build grid column classes
  const gridCols = [];
  if (cols.default) gridCols.push(`grid-cols-${cols.default}`);
  if (cols.xs) gridCols.push(`xs:grid-cols-${cols.xs}`);
  if (cols.sm) gridCols.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) gridCols.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) gridCols.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) gridCols.push(`xl:grid-cols-${cols.xl}`);
  if (cols['2xl']) gridCols.push(`2xl:grid-cols-${cols['2xl']}`);

  return (
    <div className={`grid ${gridCols.join(' ')} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'responsive';
  shadow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  padding = 'responsive',
  shadow = true,
  hover = true,
  onClick,
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    responsive: 'p-4 sm:p-6',
  };

  const baseClasses = 'bg-white rounded-lg border border-gray-200';
  const shadowClasses = shadow ? 'shadow-sm' : '';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow' : '';
  const clickableClasses = onClick ? 'cursor-pointer touch-manipulation' : '';

  return (
    <div
      className={`${baseClasses} ${shadowClasses} ${hoverClasses} ${clickableClasses} ${paddingClasses[padding]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface ResponsiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs sm:text-sm',
    md: 'px-3 sm:px-4 py-2 text-sm sm:text-base',
    lg: 'px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg',
  };

  const baseClasses = 'btn-touch rounded-lg transition-colors touch-manipulation flex items-center justify-center';
  const widthClasses = fullWidth ? 'w-full' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

interface ResponsiveInputProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
}

export const ResponsiveInput: React.FC<ResponsiveInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  required = false,
  autoFocus = false,
}) => {
  const baseClasses = 'w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base';
  const disabledClasses = disabled ? 'bg-gray-50 cursor-not-allowed' : '';

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      autoFocus={autoFocus}
      className={`${baseClasses} ${disabledClasses} ${className}`}
    />
  );
};