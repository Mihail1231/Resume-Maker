import React from 'react';

interface StaticLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

/**
 * Clean static-export anchor link avoiding Next.js 16 RSC `.txt` prefetch 404s
 * when serving static `out/` directories on Netlify, Vercel, or local static servers.
 */
export default function StaticLink({ href, children, ...rest }: StaticLinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
