import { chatEnabled } from '../../../lib/chat/store';
import { json } from '../../../lib/chat/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// De widget toont zichzelf pas als de chat (opslag) echt is ingericht.
export async function GET() {
  return json({ enabled: chatEnabled() });
}
