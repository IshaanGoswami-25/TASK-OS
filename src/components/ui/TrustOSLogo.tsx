import React from 'react';

interface TrustOSLogoProps {
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export const TrustOSLogoIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg 
    viewBox="0 0 100 120" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* Outer Shield Outline */}
    <path 
      d="M50 6 L90 22 V58 C90 83 73 104 50 114 C27 104 10 83 10 58 V22 L50 6 Z" 
      stroke="#10B981" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
    {/* Inner Shield Detail */}
    <path 
      d="M50 16 L82 30 V56 C82 76 68 93 50 102 C32 93 18 76 18 56 V30 L50 16 Z" 
      stroke="#10B981" 
      strokeWidth="2.5" 
      strokeOpacity="0.4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
    {/* AI Head Contour */}
    <path 
      d="M54 36 C43 36 35 44 35 55 C35 62 38 67 43 70 V80 H60 V74 C65 71 68 65 68 58 C68 46 61 36 54 36 Z" 
      stroke="#10B981" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
    {/* AI Eye / Target Sensor */}
    <circle cx="50" cy="50" r="4.5" fill="#10B981" />
    <circle cx="50" cy="50" r="8" stroke="#10B981" strokeWidth="2" fill="none" />
    {/* Circuit Connections */}
    <path d="M35 50 H24" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
    <path d="M42 40 L33 31" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
    <path d="M43 70 L35 76" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
    <path d="M60 74 L67 80" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
    <circle cx="23" cy="50" r="2.5" fill="#10B981" />
    <circle cx="32" cy="30" r="2.5" fill="#10B981" />
    <circle cx="34" cy="77" r="2.5" fill="#10B981" />
    <circle cx="68" cy="81" r="2.5" fill="#10B981" />
  </svg>
);

export const TrustOSLogo: React.FC<TrustOSLogoProps> = ({
  iconClassName = "w-9 h-10",
  textClassName = "text-2xl font-black text-white font-sans tracking-wide",
  showText = true,
}) => {
  return (
    <div className="flex items-center space-x-3 select-none">
      <TrustOSLogoIcon className={`${iconClassName} shrink-0`} />
      {showText && (
        <span className={textClassName}>
          TRUSTOS
        </span>
      )}
    </div>
  );
};
