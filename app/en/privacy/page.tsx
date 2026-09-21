import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | PetroShift',
  description: 'How PetroShift handles data submitted through the contact form.',
};

function HeaderLogo() { return <img src="/petroshift-logo-header.png" alt="PetroShift" className="header-logo" width="532" height="200" />; }

export default function Privacy() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="header"><div className="nav-wrap"><a href="/en" aria-label="PetroShift homepage"><HeaderLogo/></a><nav className="legal-nav" aria-label="Main navigation"><a href="/en">← Back to the website</a><a href="/privacy" className="lang-switch">NL</a></nav></div></header>
    <main id="main"><section className="legal"><div className="container">
      <h1>Privacy Policy</h1>
      <p className="updated">Last updated: September 21, 2026</p>

      <h2>Who we are</h2>
      <p>This privacy policy covers petroshift.nl. Questions about this policy or your data can be sent to <a href="mailto:info@petroshift.nl">info@petroshift.nl</a> or <a href="tel:+31617109586">+31 6 17 10 95 86</a>.</p>

      <h2>What data we collect</h2>
      <p>Only what you enter yourself: in the contact form your name, optionally a company name, email address, optionally a phone number and your message, and in the chat your name, email address and the messages you send. There are no visitor accounts and we don’t collect any other data.</p>

      <h2>What we use it for</h2>
      <p>Solely to respond to your request or chat message — not for marketing, newsletters or any other purpose.</p>

      <h2>How we process it</h2>
      <p>The contact form sends your data directly as an email to info@petroshift.nl, via Resend’s email infrastructure. The chat stores your name, email address and messages in a database at Upstash, so we can reply and you can pick the conversation back up. On your own device the chat keeps a conversation ID and a secret key in your browser’s local storage, only to find your conversation again. When a new chat message arrives, PetroShift receives a push notification on its own phone; it travels encrypted through the push service of the recipient’s browser.</p>

      <h2>Sharing with third parties</h2>
      <p>Resend (email), Upstash (storage of chat conversations) and Vercel (hosting of this website) process your data, purely as technical parties. We don’t sell or share your data with anyone else.</p>

      <h2>Retention</h2>
      <p>Your request stays in our regular email inbox for as long as needed to handle your request and any follow-up communication, following our normal email management. Chat conversations are automatically deleted no later than 90 days after the last message. If you want your chat deleted sooner, email info@petroshift.nl.</p>

      <h2>Your rights</h2>
      <ul>
        <li>Access to the data we hold about you</li>
        <li>Correction of inaccurate data</li>
        <li>Deletion of your data</li>
      </ul>
      <p>Contact us at <a href="mailto:info@petroshift.nl">info@petroshift.nl</a> for any of these. You also have the right to file a complaint with the Dutch Data Protection Authority (<a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">Autoriteit Persoonsgegevens</a>).</p>

      <h2>Cookies and visitor statistics</h2>
      <p>This website doesn’t place cookies and doesn’t track you individually. We use Vercel Web Analytics and Vercel Speed Insights to see only anonymized, aggregated visitor counts and page-load performance (for example how many people visit a page and how fast it loads) — without cookies, without storing IP addresses, and without tracking you across other websites.</p>

      <h2>Changes</h2>
      <p>We may update this policy if our practices change. The date at the top of this page shows when it was last updated.</p>
    </div></section></main>
    <footer><div className="container legal-footer"><a href="/en">← Back to the website</a><a href="mailto:info@petroshift.nl">info@petroshift.nl</a><span>© {new Date().getFullYear()} PetroShift</span></div></footer>
  </>;
}
