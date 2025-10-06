import React, { ReactNode } from "react";
import { X } from "lucide-react";

// Mobile-optimized modal component
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "full";
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "sm:max-w-sm";
      case "md":
        return "sm:max-w-md";
      case "lg":
        return "sm:max-w-lg";
      case "full":
        return "sm:max-w-full sm:h-full";
      default:
        return "sm:max-w-md";
    }
  };

  return (
    <div className="modal-overlay-mobile">
      <div className={`modal-content-mobile ${getSizeClasses()}`}>
        {title && (
          <div className="flex items-center justify-between p-responsive border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-responsive-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="btn-touch p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-responsive">{children}</div>
      </div>
    </div>
  );
};

// Mobile-optimized form input
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  error,
  icon: Icon,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-responsive-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <input
          className={`input-mobile ${Icon ? "pl-10" : ""} ${
            error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-responsive-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

// Mobile-optimized textarea
interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const MobileTextarea: React.FC<MobileTextareaProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-responsive-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`textarea-mobile ${
          error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-responsive-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

// Mobile-optimized select
interface MobileSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const MobileSelect: React.FC<MobileSelectProps> = ({
  label,
  error,
  options,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-responsive-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <select
        className={`select-mobile ${
          error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-responsive-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

// Mobile-optimized button
interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
      case "secondary":
        return "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500";
      case "outline":
        return "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800";
      case "ghost":
        return "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800";
      default:
        return "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2 text-responsive-sm";
      case "md":
        return "px-4 py-2 text-responsive-base";
      case "lg":
        return "px-6 py-3 text-responsive-lg";
      default:
        return "px-4 py-2 text-responsive-base";
    }
  };

  return (
    <button
      className={`btn-touch inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {Icon && !loading && <Icon className="w-4 h-4 mr-2 flex-shrink-0" />}
      {children}
    </button>
  );
};

// Mobile-optimized card
interface MobileCardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  clickable?: boolean;
  onClick?: () => void;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = "",
  padding = "md",
  clickable = false,
  onClick,
}) => {
  const getPaddingClasses = () => {
    switch (padding) {
      case "sm":
        return "p-responsive-sm";
      case "md":
        return "p-responsive";
      case "lg":
        return "p-responsive px-responsive py-responsive";
      default:
        return "p-responsive";
    }
  };

  const Component = clickable ? "button" : "div";

  return (
    <Component
      className={`${
        clickable ? "btn-touch text-left w-full" : ""
      } card-responsive ${getPaddingClasses()} ${
        clickable ? "hover:shadow-lg cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

// Mobile-optimized tabs
interface MobileTabsProps {
  tabs: { id: string; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const MobileTabs: React.FC<MobileTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="tabs-mobile">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`tab-mobile ${activeTab === tab.id ? "active" : ""}`}
          >
            <div className="flex items-center justify-center gap-2">
              {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
              <span className="truncate">{tab.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Mobile-optimized loading spinner
interface MobileSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const MobileSpinner: React.FC<MobileSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "md":
        return "w-6 h-6";
      case "lg":
        return "w-8 h-8";
      default:
        return "w-6 h-6";
    }
  };

  return (
    <div
      className={`${getSizeClasses()} border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
};
