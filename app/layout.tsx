import type { Metadata } from 'next';
import './globals.css';
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
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nl"><body>{children}<script defer src="/_vercel/insights/script.js" /></body></html>;
}
