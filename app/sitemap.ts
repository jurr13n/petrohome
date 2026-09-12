import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.petroshift.nl';
  const lastModified = new Date();
  return [
    { url: base, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/en`, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/en/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
