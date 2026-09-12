import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | PetroShift',
  description: 'How PetroShift handles data submitted through the contact form.',
};

function Logo({ small = false }: { small?: boolean }) { return <span className={`logo supplied-logo ${small ? 'small' : ''}`}><img src="/petroshift-logo.png" alt="PetroShift" width="1448" height="1086" /></span>; }

export default function Privacy() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="header"><div className="nav-wrap"><a href="/en" aria-label="PetroShift homepage"><Logo/></a><nav className="legal-nav" aria-label="Main navigation"><a href="/en">← Back to the website</a><a href="/privacy" className="lang-switch">NL</a></nav></div></header>
    <main id="main"><section className="legal"><div className="container">
      <h1>Privacy Policy</h1>
      <p className="updated">Last updated: September 12, 2026</p>

      <h2>Who we are</h2>
      <p>This privacy policy covers petroshift.nl. Questions about this policy or your data can be sent to <a href="mailto:info@petroshift.nl">info@petroshift.nl</a> or <a href="tel:+31617109586">+31 6 17 10 95 86</a>.</p>

      <h2>What data we collect</h2>
      <p>Only what you enter yourself in the contact form on this site: name, optionally a company name, email address, optionally a phone number, and your message. There are no user accounts on this website, and we don’t collect any other data.</p>

      <h2>What we use it for</h2>
      <p>Solely to respond to your request — not for marketing, newsletters or any other purpose.</p>

      <h2>How we process it</h2>
      <p>The form sends your data directly as an email to info@petroshift.nl, via Resend’s email infrastructure. There is no database: your data isn’t stored separately anywhere on this website, it’s simply received as an email like any other email we get.</p>

      <h2>Sharing with third parties</h2>
      <p>Only Resend processes your data, purely as a technical party to deliver the email. We don’t sell or share your data with anyone else.</p>

      <h2>Retention</h2>
      <p>Your request stays in our regular email inbox for as long as needed to handle your request and any follow-up communication, following our normal email management.</p>

      <h2>Your rights</h2>
      <ul>
        <li>Access to the data we hold about you</li>
        <li>Correction of inaccurate data</li>
        <li>Deletion of your data</li>
      </ul>
      <p>Contact us at <a href="mailto:info@petroshift.nl">info@petroshift.nl</a> for any of these. You also have the right to file a complaint with the Dutch Data Protection Authority (<a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">Autoriteit Persoonsgegevens</a>).</p>

      <h2>Cookies and visitor statistics</h2>
      <p>This website doesn’t place cookies and doesn’t track you individually. We use Vercel Web Analytics to see only anonymized, aggregated visitor counts (for example how many people visit a page) — without cookies, without storing IP addresses, and without tracking you across other websites.</p>

      <h2>Changes</h2>
      <p>We may update this policy if our practices change. The date at the top of this page shows when it was last updated.</p>
    </div></section></main>
    <footer><div className="container legal-footer"><a href="/en">← Back to the website</a><a href="mailto:info@petroshift.nl">info@petroshift.nl</a><span>© {new Date().getFullYear()} PetroShift</span></div></footer>
  </>;
}
