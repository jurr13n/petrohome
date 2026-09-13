import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacyverklaring | PetroShift',
  description: 'Hoe PetroShift omgaat met gegevens uit het aanvraagformulier.',
};

function Logo({ small = false }: { small?: boolean }) { return <span className={`logo supplied-logo ${small ? 'small' : ''}`}><img src="/petroshift-logo.png" alt="PetroShift" width="440" height="378" /></span>; }

export default function Privacy() {
  return <>
    <a className="skip-link" href="#main">Direct naar inhoud</a>
    <header className="header"><div className="nav-wrap"><a href="/" aria-label="PetroShift homepage"><Logo/></a><nav className="legal-nav" aria-label="Hoofdnavigatie"><a href="/">← Terug naar de website</a><a href="/en/privacy" className="lang-switch">EN</a></nav></div></header>
    <main id="main"><section className="legal"><div className="container">
      <h1>Privacyverklaring</h1>
      <p className="updated">Laatst gewijzigd: 12 september 2026</p>

      <h2>Wie we zijn</h2>
      <p>Deze privacyverklaring gaat over petroshift.nl. Vragen over deze verklaring of over je gegevens kun je stellen via <a href="mailto:info@petroshift.nl">info@petroshift.nl</a> of <a href="tel:+31617109586">06 17 10 95 86</a>.</p>

      <h2>Welke gegevens we verzamelen</h2>
      <p>Alleen wat je zelf invult in het aanvraagformulier op deze site: naam, eventueel bedrijfsnaam, e-mailadres, eventueel telefoonnummer, en je bericht. Er zijn geen gebruikersaccounts op deze website en we verzamelen verder geen gegevens.</p>

      <h2>Waarvoor we ze gebruiken</h2>
      <p>Uitsluitend om te reageren op jouw aanvraag — niet voor marketing, nieuwsbrieven of andere doeleinden.</p>

      <h2>Hoe we ze verwerken</h2>
      <p>Het formulier stuurt je gegevens rechtstreeks als e-mail naar info@petroshift.nl, via de e-mailinfrastructuur van Resend. Er is geen database: je gegevens worden nergens apart op deze website opgeslagen, alleen als e-mail ontvangen zoals elke andere e-mail die we krijgen.</p>

      <h2>Delen met derden</h2>
      <p>Alleen Resend verwerkt je gegevens, uitsluitend als technische partij om de e-mail te laten aankomen. We verkopen of delen je gegevens niet met anderen.</p>

      <h2>Bewaartermijn</h2>
      <p>Je aanvraag blijft in onze reguliere e-mailinbox staan zolang dat nodig is om je verzoek af te handelen en eventuele navolgende communicatie, volgens ons normale mailbeheer.</p>

      <h2>Jouw rechten</h2>
      <ul>
        <li>Inzage in de gegevens die we van je hebben</li>
        <li>Correctie van onjuiste gegevens</li>
        <li>Verwijdering van je gegevens</li>
      </ul>
      <p>Neem hiervoor contact op via <a href="mailto:info@petroshift.nl">info@petroshift.nl</a>. Je hebt ook het recht om een klacht in te dienen bij de <a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">Autoriteit Persoonsgegevens</a>.</p>

      <h2>Cookies en bezoekersstatistieken</h2>
      <p>Deze website plaatst geen cookies en volgt je niet individueel. We gebruiken Vercel Web Analytics en Vercel Speed Insights om alleen geanonimiseerde, geaggregeerde bezoekersaantallen en laadprestaties te zien (bijvoorbeeld hoeveel mensen een pagina bezoeken en hoe snel de pagina laadt) — zonder cookies, zonder IP-adressen op te slaan en zonder je op andere websites te volgen.</p>

      <h2>Wijzigingen</h2>
      <p>We kunnen deze verklaring aanpassen als onze werkwijze verandert. De datum bovenaan deze pagina geeft aan wanneer dat voor het laatst is gebeurd.</p>
    </div></section></main>
    <footer><div className="container legal-footer"><a href="/">← Terug naar de website</a><a href="mailto:info@petroshift.nl">info@petroshift.nl</a><span>© {new Date().getFullYear()} PetroShift</span></div></footer>
  </>;
}
