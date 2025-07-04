
import React from 'react';

interface XtentLogoProps {
  size?: 'sm' | 'base' | 'md' | 'lg';
  showTagline?: boolean;
  variant?: 'light' | 'dark';
  collapsed?: boolean;
}

const XtentLogo = ({
  size = 'md',
  showTagline = false,
  variant = 'light',
  collapsed = false
}: XtentLogoProps) => {
  const logoSizeClasses = {
    sm: 'w-8 h-8',
    base: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    base: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const taglineSizeClasses = {
    sm: 'text-xs',
    base: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center gap-3">
      {/* Original XTENT Logo */}
      <div className={`${logoSizeClasses[size]} relative flex items-center justify-center`}>
        <img 
          src="/lovable-uploads/574b04b0-120b-4baa-ac90-dfc969fa35dd.png" 
          alt="XTENT Logo" 
          className={`${logoSizeClasses[size]} object-contain drop-shadow-lg`} 
        />
      </div>
      
      {/* Brand Text - Hide when collapsed */}
      {!collapsed && (
        <div className="flex flex-col">
          <div className={`${textSizeClasses[size]} font-black tracking-tight`}>
            <span className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 bg-clip-text text-transparent">
              X
            </span>
            <span className="font-bold">
              TENT
            </span>
          </div>
          {showTagline && (
            <div className={`${taglineSizeClasses[size]} font-bold tracking-wider ${
              variant === 'light' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              THE BEST OF RENTAL LIVING
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default XtentLogo;
