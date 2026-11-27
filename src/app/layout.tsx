import type { Metadata } from 'next';
import {
  Inter,
  Outfit,
  Plus_Jakarta_Sans,
  Lora,
  Playfair_Display,
  Merriweather,
  Roboto_Mono,
} from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  style: ['normal'],
  variable: '--font-outfit',
  display: 'swap',
  preload: false,
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
  preload: false,
});

const lora = Lora({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
  preload: false,
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-playfair-display',
  display: 'swap',
  preload: false,
});

const merriweather = Merriweather({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-merriweather',
  display: 'swap',
  preload: false,
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-roboto-mono',
  display: 'swap',
  preload: false,
});

const fontVariables = [
  inter.variable,
  outfit.variable,
  plusJakartaSans.variable,
  lora.variable,
  playfairDisplay.variable,
  merriweather.variable,
  robotoMono.variable,
].join(' ');

export const metadata: Metadata = {
  title: 'RoleFit Resume Tailor — Tailor Your Resume to Any Job Description',
  description:
    'Free, 100% client-side student resume tailor and ATS builder. Paste any job description, see your live RoleFit Match Score, insert XYZ impact bullets in 1 click, and export a crisp selectable-text A4 PDF.',
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
    <html lang="en" className={fontVariables}>
      <body className="bg-surface text-text-primary antialiased">{children}</body>
    </html>
  );
}
