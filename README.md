# PetroShift — landingpage

Een complete Nederlandse B2B-landingspagina voor industriële ploegendiensten, gebouwd met Next.js, React en TypeScript. De pagina's zijn statisch; het aanvraagformulier gebruikt één serverless functie (`app/api/aanvraag/route.ts`) om de aanvraag via Resend te versturen. Er is geen database nodig.

## Snel starten

Vereist: Node.js 20.9 of hoger en npm of pnpm.

```sh
npm install
npm run dev
```

Open het adres dat in de terminal verschijnt (standaard http://localhost:3000).

Voor een reproduceerbare installatie met het meegeleverde lockbestand:

```sh
npx pnpm@10.17.1 install --frozen-lockfile
npx pnpm@10.17.1 dev
```

## Publiceren op Vercel

1. Pak de zip uit en zet de inhoud van de map `petroshift` in een eigen GitHub-repository.
2. Kies **Add New → Project** in Vercel en importeer die repository.
3. Framework: **Next.js**. De hoofdmap is de map met `package.json`.
4. Laat het standaard buildcommando staan: `pnpm build` (of `npm run build`). Laat Vercel de output directory bepalen.
5. Voeg de onderstaande omgevingsvariabelen toe als je de persoonlijke demo-CTA wilt activeren.
6. Klik **Deploy**. Koppel daarna eventueel je eigen domein via de projectinstellingen.

Er is in deze oplevering geen Vercel-project aangemaakt en geen domein aangepast.

## App, demo en contact

De website is direct gekoppeld aan de aangeleverde adressen:

- App: https://app.petroshift.nl (Open de app in navigatie en footer).
- Demo: https://demo.petroshift.nl (demo-knoppen en footer).
- E-mail: info@petroshift.nl (klikbare e-maillink in de footer).

Er zijn geen omgevingsvariabelen nodig om deze links te activeren. Je kunt de demo-URL en het contactadres later overschrijven met `NEXT_PUBLIC_DEMO_URL` en `NEXT_PUBLIC_CONTACT_EMAIL`. Kopieer `.env.example` naar `.env.local` voor lokaal gebruik of stel de waarden in op Vercel. Na een wijziging moet je opnieuw bouwen. Deze waarden zijn openbaar; gebruik hier geen geheimen.

### Aanvraagformulier laten versturen

Het formulier onderaan de pagina post naar `/api/aanvraag`, dat de aanvraag via [Resend](https://resend.com) e-mailt naar `info@petroshift.nl`. Zonder de onderstaande server-only variabele (geen `NEXT_PUBLIC_`-prefix, dus niet openbaar) toont het formulier een duidelijke foutmelding in plaats van de aanvraag stil te laten verdwijnen:

- `RESEND_API_KEY` — verplicht. Gratis account op resend.com, API key aanmaken, toevoegen bij Vercel → Project → Settings → Environment Variables (Production én Preview).
- `CONTACT_EMAIL` — optioneel, standaard `info@petroshift.nl`.
- `RESEND_FROM` — optioneel, standaard `PetroShift <onboarding@resend.dev>` (werkt direct, zonder domeinverificatie). Voor een eigen afzenderadres (bv. `aanvraag@petroshift.nl`) moet het domein `petroshift.nl` eerst geverifieerd worden bij Resend (DNS-records); zet daarna deze variabele.

Na het toevoegen van een omgevingsvariabele in Vercel is een nieuwe deploy nodig voordat hij actief is.

## Wat zit erin?

- Hero met de ongewijzigde, aangeleverde roosterscreenshot. Klikken opent de afbeelding op volledig formaat.
- Probleem/oplossing, zes features, doelgroep, integratie/security, demo-CTA en FAQ.
- Werkende mobiele navigatie en drie illustratieve detailweergaven.
- Uitklapbare FAQ, toetsenbordfocus, skiplink en respect voor reduced motion.
- Responsive desktop-, tablet- en mobiele lay-out. De appscreenshot schaalt op mobiel mee en kan op volledig formaat worden geopend.
- Nederlandse metadata, Open Graph-tekst en het aangeleverde PetroShift-logo als favicon.
- Geen tracking, cookies, database, verzendservice of authenticatie toegevoegd.

## Inhoud en productclaims

Deze eerste versie gebruikt uitsluitend de aangeleverde productcontext. De hero gebruikt de door de gebruiker aangeleverde echte appscreenshot, inclusief de zichtbare namen en gegevens. De overige detailmockups bevatten fictieve voorbeelden.

Workday staat expliciet vermeld als mogelijke integratie, niet als beschikbare of gecertificeerde koppeling. Er zijn geen klantlogo’s, testimonials, prestatieclaims of securitycertificeringen verzonnen. Functionaliteit, rolverdeling, securityafspraken, definitieve merkidentiteit en commerciële teksten moeten voor een publieke productlancering worden afgestemd op het echte product.

De landingspagina verwijst naar de bestaande app en demo op hun eigen subdomeinen. De authenticatie van de app blijft onderdeel van de bestaande applicatie.

## Aanpassen

- `app/page.tsx`: inhoud, secties, mockups, FAQ en CTA-logica.
- `app/globals.css`: kleuren, typografie en responsive lay-out. De belangrijkste kleuren staan bovenaan in `:root`.
- `app/layout.tsx`: titel, beschrijving, taal en metadata.
- `public/petroshift-logo.png`: het originele, aangeleverde PetroShift-logo. Het beeld wordt ongewijzigd gebruikt; de witte buitenmarges worden alleen in de websiteweergave verborgen.
- `next.config.ts`: statische export.

De lettertypen DM Sans en Manrope worden via Fontsource lokaal met de website gebundeld; de browser hoeft geen Google Fonts te laden. De fontlicenties worden meegeleverd in de betreffende Fontsource-pakketten (SIL Open Font License). Iconen komen uit lucide-react (ISC-licentie).

## Productiebouw

```sh
npm run build
npm run typecheck
```

De statische website komt in `out/`. Gebruik bij een statische export een statische webserver om de productie-uitvoer te bekijken, bijvoorbeeld:

```sh
npx serve out
```

`next start` is niet bedoeld voor een statische export. Voor lokaal ontwikkelen gebruik je `npm run dev`.

## Bestandsstructuur

```text
petroshift/
  app/
    globals.css
    layout.tsx
    page.tsx
  public/
    petroshift-logo.png
  .env.example
  .gitignore
  next.config.ts
  package.json
  pnpm-lock.yaml
  tsconfig.json
  README.md
```

De download bevat de broncode en het lockbestand. `node_modules`, `.next` en lokale instellingen worden niet meegeleverd.

