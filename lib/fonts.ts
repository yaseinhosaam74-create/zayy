import { Cairo, Barlow_Condensed } from 'next/font/google';

export const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-cairo',
  display: 'swap',
});

export const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-barlow',
  display: 'swap',
});