import React from 'react';

export default function VerifiedBadge({ className = 'h-4 w-4' }) {
  return (
    <img
      className={className}
      src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg"
      alt="Verified badge"
      loading="lazy"
    />
  );
}


