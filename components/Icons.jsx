/**
 * Reusable SVG Icon Components
 */

const React = window.React;

export const Search = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    className={className}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

export const Plus = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const Film = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    className={className}
  >
    <rect x="2" y="7" width="20" height="15" rx="2.18" ry="2.18"></rect>
    <line x1="7" y1="2" x2="7" y2="22"></line>
    <line x1="17" y1="2" x2="17" y2="22"></line>
    <line x1="2" y1="12" x2="22" y2="12"></line>
  </svg>
);

export const Tv = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    className={className}
  >
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
    <polyline points="17 2 12 7 7 2"></polyline>
  </svg>
);

export const Book = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    className={className}
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

export const ThreeDots = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 16 16"
    className={className}
  >
    <circle cx="8" cy="2" r="1.5" />
    <circle cx="8" cy="8" r="1.5" />
    <circle cx="8" cy="14" r="1.5" />
  </svg>
);

export const Close = ({ size = 24, className = '' }) => (
  <span className={className}>✕</span>
);
