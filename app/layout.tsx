import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'PetroShift | Grip op elke ploegendienst',
  description: 'Shift planning, verlof, overwerk en kwalificaties in één overzicht. PetroShift brengt rust in de planning van industriële teams.',
  icons: { icon: '/petroshift-logo.png' },
  openGraph: { title: 'PetroShift | Grip op elke ploegendienst', description: 'De juiste mensen. De juiste skills. Elke shift opnieuw.', type: 'website', locale: 'nl_NL' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nl"><body>{children}</body></html>;
}
