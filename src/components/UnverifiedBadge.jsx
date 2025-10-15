import React from 'react';

export default function UnverifiedBadge({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Unverified"
    >
      <circle cx="12" cy="12" r="10" fill="#EF4444" />
      <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}


