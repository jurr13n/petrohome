import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacyverklaring | PetroShift',
  description: 'Hoe PetroShift omgaat met gegevens uit het aanvraagformulier.',
};

function HeaderLogo() { return <img src="/petroshift-logo-header.png" alt="PetroShift" className="header-logo" width="532" height="200" />; }

export default function Privacy() {
  return <>
    <a className="skip-link" href="#main">Direct naar inhoud</a>
    <header className="header"><div className="nav-wrap"><a href="/" aria-label="PetroShift homepage"><HeaderLogo/></a><nav className="legal-nav" aria-label="Hoofdnavigatie"><a href="/">← Terug naar de website</a><a href="/en/privacy" className="lang-switch">EN</a></nav></div></header>
    <main id="main"><section className="legal"><div className="container">
      <h1>Privacyverklaring</h1>
      <p className="updated">Laatst gewijzigd: 21 september 2026</p>

      <h2>Wie we zijn</h2>
      <p>Deze privacyverklaring gaat over petroshift.nl. Vragen over deze verklaring of over je gegevens kun je stellen via <a href="mailto:info@petroshift.nl">info@petroshift.nl</a> of <a href="tel:+31617109586">06 17 10 95 86</a>.</p>

      <h2>Welke gegevens we verzamelen</h2>
      <p>Alleen wat je zelf invult: in het aanvraagformulier naam, eventueel bedrijfsnaam, e-mailadres, eventueel telefoonnummer en je bericht, en in de chat je naam, e-mailadres en de berichten die je stuurt. Er zijn geen gebruikersaccounts voor bezoekers en we verzamelen verder geen gegevens.</p>

      <h2>Waarvoor we ze gebruiken</h2>
      <p>Uitsluitend om te reageren op jouw aanvraag of chatbericht — niet voor marketing, nieuwsbrieven of andere doeleinden.</p>

      <h2>Hoe we ze verwerken</h2>
      <p>Het aanvraagformulier stuurt je gegevens rechtstreeks als e-mail naar info@petroshift.nl, via de e-mailinfrastructuur van Resend. De chat bewaart je naam, e-mailadres en berichten in een database bij Upstash, zodat we kunnen antwoorden en jij het gesprek kunt hervatten. Op je eigen apparaat bewaart de chat een gespreks-id en een geheime sleutel in de lokale opslag van je browser, alleen om je gesprek terug te vinden. Bij een nieuw chatbericht krijgt PetroShift een pushmelding op de eigen telefoon; die loopt versleuteld via de pushdienst van de browser van de ontvanger.</p>

      <h2>Delen met derden</h2>
      <p>Resend (e-mail), Upstash (opslag van chatgesprekken) en Vercel (hosting van deze website) verwerken je gegevens, uitsluitend als technische partij. We verkopen of delen je gegevens niet met anderen.</p>

      <h2>Bewaartermijn</h2>
      <p>Je aanvraag blijft in onze reguliere e-mailinbox staan zolang dat nodig is om je verzoek af te handelen en eventuele navolgende communicatie, volgens ons normale mailbeheer. Chatgesprekken worden uiterlijk 90 dagen na het laatste bericht automatisch verwijderd. Wil je je chat eerder laten verwijderen, mail dan naar info@petroshift.nl.</p>

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
