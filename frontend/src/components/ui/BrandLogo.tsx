import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top Cornice Header */}
      <rect x="14" y="10" width="72" height="5" rx="1.5" fill="#E5C690" />
      <rect x="20" y="17" width="60" height="4" rx="1" fill="#E5C690" />

      {/* Outer Pillar Columns */}
      <rect x="22" y="23" width="6" height="74" rx="1" fill="#E5C690" />
      <rect x="72" y="23" width="6" height="74" rx="1" fill="#E5C690" />

      {/* Stylized Architectural MC Monogram */}
      <path
        d="M28 27 L50 60 L72 27"
        stroke="#E5C690"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M66 64 C60 54, 44 55, 42 72 C40 88, 60 93, 70 85"
        stroke="#E5C690"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Base Pedestals */}
      <rect x="20" y="99" width="60" height="4" rx="1" fill="#E5C690" />
      <rect x="14" y="105" width="72" height="5" rx="1.5" fill="#E5C690" />
    </svg>
  );
};
