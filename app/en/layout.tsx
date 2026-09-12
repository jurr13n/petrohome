import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PetroShift | Grip on every shift',
  description: 'Shift planning, leave, overtime and qualifications in one overview. PetroShift brings order to shift planning for industrial teams.',
  alternates: { languages: { nl: '/', en: '/en' } },
  openGraph: {
    title: 'PetroShift | Grip on every shift',
    description: 'The right people. The right skills. Every shift, again.',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/petroshift-rooster.png', width: 1655, height: 1275, alt: 'PetroShift roster: monthly matrix with employees, shifts, leave and staffing.' }],
  },
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
