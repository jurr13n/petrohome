import { ownerPage } from '../lib/ownerPage';
import { LOGBOEK_HTML } from './html';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Pagina én gegevens staan achter de inbox-sessie: zonder login geen bedrijfsnamen of gesprekken.
export function GET(req: Request) {
  return ownerPage(req, LOGBOEK_HTML, 'Logboek');
}
