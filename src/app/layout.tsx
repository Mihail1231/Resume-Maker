import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'RoleFit Resume Tailor — Tailor Your Student Resume to Any Internship JD',
  description:
    'Free, 100% client-side student resume tailor and ATS builder. Paste any internship job description, see your live RoleFit Match Score, insert XYZ impact bullets in 1 click, and export a crisp selectable-text A4 PDF.',
  keywords: [
    'RoleFit Resume Tailor',
    'student resume tailor',
    'internship resume builder',
    'ATS keyword matcher',
    'XYZ impact bullets',
    'ATS-friendly PDF export',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-surface text-text-primary antialiased">{children}</body>
    </html>
  );
}
