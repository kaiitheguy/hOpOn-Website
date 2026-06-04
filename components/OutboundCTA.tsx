import React from 'react';
import { Link } from 'react-router-dom';

interface OutboundCTAProps {
  href?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const baseClass =
  'inline-flex min-h-12 items-center justify-center border-2 border-black px-6 py-3 font-display text-sm font-bold uppercase tracking-wider transition-colors';

const variantClass = {
  primary: 'bg-hopon-black text-white hover:bg-hopon-red',
  secondary: 'bg-white text-hopon-black hover:bg-hopon-grey',
};

export const OutboundCTA: React.FC<OutboundCTAProps> = ({
  href,
  children,
  variant = 'primary',
  className = '',
}) => {
  const classes = `${baseClass} ${variantClass[variant]} ${className}`;
  if (!href || href === '#') {
    return (
      <button type="button" className={classes}>
        {children}
      </button>
    );
  }

  const isInternal = href.startsWith('/');

  if (isInternal) {
    return (
      <Link to={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={classes}>
      {children}
    </a>
  );
};
