import { ownerPage } from '../lib/ownerPage';
import { GESPREKSMAP_HTML } from './html';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Berichten en demo-script voor de salesgesprekken: intern, dus achter de inbox-sessie.
export function GET(req: Request) {
  return ownerPage(req, GESPREKSMAP_HTML, 'Gespreksmap');
}
