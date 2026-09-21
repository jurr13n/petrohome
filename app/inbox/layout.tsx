import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Inbox | PetroShift',
  robots: { index: false, follow: false },
  manifest: '/inbox.webmanifest',
  icons: { icon: '/inbox-icon-192.png', apple: '/inbox-icon-180.png' },
  appleWebApp: { capable: true, title: 'Inbox', statusBarStyle: 'default' },
  other: { 'apple-mobile-web-app-capable': 'yes' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0f3752' };

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return children;
}
