import type { Metadata, Viewport } from 'next';
import './globals.css';
import ChatWidget from './components/ChatWidget';
export const metadata: Metadata = {
  metadataBase: new URL('https://www.petroshift.nl'),
  title: 'PetroShift | Grip op elke ploegendienst',
  description: 'Shift planning, verlof, overwerk en kwalificaties in één overzicht. PetroShift brengt rust in de planning van industriële teams.',
  alternates: { languages: { nl: '/', en: '/en' } },
  openGraph: {
    title: 'PetroShift | Grip op elke ploegendienst',
    description: 'De juiste mensen. De juiste skills. Elke shift opnieuw.',
    type: 'website',
    locale: 'nl_NL',
    images: [{ url: '/petroshift-rooster.png', width: 1655, height: 1275, alt: 'PetroShift-rooster: maandmatrix met medewerkers, diensten, verlof en bezetting.' }],
  },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f7f9fc' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nl"><body>{children}<ChatWidget /><script defer src="/_vercel/insights/script.js" /><script defer src="/_vercel/speed-insights/script.js" /></body></html>;
}
