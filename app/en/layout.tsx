import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PetroShift | Grip on every shift',
  description: 'Shift planning, leave, overtime and qualifications in one overview. PetroShift brings order to shift planning for industrial teams.',
  openGraph: { title: 'PetroShift | Grip on every shift', description: 'The right people. The right skills. Every shift, again.', type: 'website', locale: 'en_US' },
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
