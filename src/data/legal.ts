/**
 * Privacy policy and terms. DRAFT: written to match what the site actually
 * does (quote requests, no accounts, no online payment, no passports collected,
 * only technical cookies, Google Maps loaded on click). Every [bracketed] item
 * is a decision or fact the cooperative must supply, and a lawyer should review
 * the whole text before launch (GDPR applies because the site targets people in
 * the EU; an EU representative under Art. 27 GDPR may be required).
 */
import type { Locale } from '@/i18n/locales'
import { SITE_CONFIG } from '@/lib/constants'

export interface LegalSection {
  title: string
  paragraphs: string[]
}
export interface LegalDoc {
  title: string
  updated: string
  draft: string
  sections: LegalSection[]
}

/** Privacy policy and terms, with the company's current contact details filled in. */
export function legalDocs(site: { email: string; address: string }) {
const who = `${SITE_CONFIG.legalName}, ${site.address}, ${site.email}`

const PRIVACY: Record<Locale, LegalDoc> = {
  it: {
    title: 'Informativa sulla privacy',
    updated: 'Ultimo aggiornamento: [data]',
    draft: 'Bozza: questo testo deve essere verificato da un legale e completato dalla cooperativa prima della pubblicazione. Le voci tra [parentesi quadre] sono da compilare.',
    sections: [
      {
        title: 'Titolare del trattamento',
        paragraphs: [
          `Titolare del trattamento è ${who}. Numero di registrazione: [numero]. Referente per la privacy: [nome e e-mail].`,
          'Il sito si rivolge anche a persone nell’Unione Europea, quindi si applica il Regolamento (UE) 2016/679 (GDPR). Rappresentante nell’UE, se richiesto: [nome e indirizzo].',
        ],
      },
      {
        title: 'Quali dati raccogliamo',
        paragraphs: [
          'Quando invii una richiesta di preventivo o di posto su una partenza di gruppo: nome, e-mail, telefono e paese (facoltativi), date e numero di viaggiatori, budget, interessi, preferenze di alloggio e il tuo messaggio.',
          'Non esistono account utente, non raccogliamo dati di pagamento e non raccogliamo passaporti o documenti tramite il sito. Eventuali dati dei viaggiatori necessari per il viaggio (per esempio per i permessi) ti vengono chiesti solo dopo la conferma, per e-mail o in un altro modo sicuro che ti comunicheremo.',
          'I server registrano dati tecnici (per esempio indirizzo IP e pagina richiesta) per sicurezza e per prevenire abusi.',
        ],
      },
      {
        title: 'Perché li usiamo e su quale base',
        paragraphs: [
          'Per rispondere alla tua richiesta e preparare l’offerta: esecuzione di misure precontrattuali richieste da te (art. 6.1.b GDPR).',
          'Per sicurezza del sito e prevenzione dello spam: legittimo interesse (art. 6.1.f).',
          'Per pubblicare una tua recensione: solo con il tuo consenso (art. 6.1.a), che puoi revocare in ogni momento.',
          'Per gli obblighi contabili e fiscali dopo un viaggio confermato: obbligo di legge (art. 6.1.c).',
        ],
      },
      {
        title: 'Con chi li condividiamo',
        paragraphs: [
          'Con i fornitori tecnici che ci permettono di gestire il sito: database (Supabase), invio e-mail (Resend) e hosting ([fornitore]). Agiscono come responsabili del trattamento.',
          'Dopo la conferma di un viaggio, con i partner locali (guide, autisti, campi, alloggi) solo i dati necessari per organizzarlo.',
          'Non vendiamo i tuoi dati e non li usiamo per pubblicità di terzi.',
        ],
      },
      {
        title: 'Trasferimenti fuori dall’UE',
        paragraphs: [
          'Il titolare ha sede in Mongolia e i fornitori possono trattare dati fuori dall’UE. Per questi trasferimenti usiamo le garanzie previste dal GDPR, come le clausole contrattuali standard: [da verificare con il legale].',
        ],
      },
      {
        title: 'Per quanto tempo li conserviamo',
        paragraphs: [
          'Le richieste che non portano a un viaggio vengono cancellate dopo [24] mesi dall’ultimo contatto.',
          'I dati dei viaggi confermati sono conservati per il tempo richiesto dagli obblighi di legge ([10] anni per la contabilità), poi cancellati.',
          'Le recensioni restano pubblicate finché non chiedi di rimuoverle.',
        ],
      },
      {
        title: 'I tuoi diritti',
        paragraphs: [
          `Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità dei tuoi dati e opporti al trattamento, scrivendo a ${site.email}. Rispondiamo entro un mese.`,
          'Hai anche il diritto di presentare reclamo all’autorità di controllo, in Italia il Garante per la protezione dei dati personali (www.garanteprivacy.it).',
        ],
      },
      {
        title: 'Cookie e contenuti di terze parti',
        paragraphs: [
          'Il sito usa solo cookie tecnici, per esempio per ricordare la lingua scelta. Non usiamo cookie di analisi o di pubblicità.',
          'Le mappe di Google non vengono caricate finché non premi il pulsante per mostrarle. Quando le carichi, Google può impostare propri cookie e ricevere il tuo indirizzo IP, secondo la sua informativa.',
        ],
      },
      {
        title: 'Modifiche',
        paragraphs: ['Possiamo aggiornare questa informativa. La versione in vigore è sempre quella pubblicata su questa pagina, con la data di aggiornamento.'],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: [date]',
    draft: 'Draft: this text must be reviewed by a lawyer and completed by the cooperative before publication. Items in [square brackets] are still to be filled in.',
    sections: [
      {
        title: 'Data controller',
        paragraphs: [
          `The data controller is ${who}. Registration number: [number]. Privacy contact: [name and e-mail].`,
          'The site is also aimed at people in the European Union, so the General Data Protection Regulation (GDPR, Regulation (EU) 2016/679) applies. EU representative, if required: [name and address].',
        ],
      },
      {
        title: 'What data we collect',
        paragraphs: [
          'When you send a quote request or ask for a spot on a group departure: your name, e-mail, phone and country (optional), dates and number of travellers, budget, interests, accommodation preferences and your message.',
          'There are no user accounts, we do not collect payment details, and we do not collect passports or documents through the site. Any traveller details needed for the trip (for example for permits) are only asked for after confirmation, by e-mail or another secure way we will tell you about.',
          'Our servers log technical data (for example IP address and requested page) for security and to prevent abuse.',
        ],
      },
      {
        title: 'Why we use it and on what basis',
        paragraphs: [
          'To answer your request and prepare an offer: steps taken at your request before a contract (Art. 6(1)(b) GDPR).',
          'For site security and to prevent spam: legitimate interest (Art. 6(1)(f)).',
          'To publish a review of yours: only with your consent (Art. 6(1)(a)), which you can withdraw at any time.',
          'For accounting and tax duties after a confirmed trip: legal obligation (Art. 6(1)(c)).',
        ],
      },
      {
        title: 'Who we share it with',
        paragraphs: [
          'Technical providers that let us run the site: database (Supabase), e-mail delivery (Resend) and hosting ([provider]). They act as processors.',
          'After a trip is confirmed, local partners (guides, drivers, camps, accommodation) receive only the data needed to organise it.',
          'We do not sell your data and do not use it for third-party advertising.',
        ],
      },
      {
        title: 'Transfers outside the EU',
        paragraphs: [
          'The controller is based in Mongolia and providers may process data outside the EU. For these transfers we rely on the safeguards in the GDPR, such as standard contractual clauses: [to be verified with the lawyer].',
        ],
      },
      {
        title: 'How long we keep it',
        paragraphs: [
          'Requests that do not lead to a trip are deleted [24] months after the last contact.',
          'Data of confirmed trips is kept for as long as the law requires ([10] years for accounting), then deleted.',
          'Reviews stay published until you ask us to remove them.',
        ],
      },
      {
        title: 'Your rights',
        paragraphs: [
          `You can ask for access, correction, deletion, restriction and portability of your data and object to its processing by writing to ${site.email}. We reply within one month.`,
          'You also have the right to complain to a supervisory authority; in Italy this is the Garante per la protezione dei dati personali (www.garanteprivacy.it).',
        ],
      },
      {
        title: 'Cookies and third-party content',
        paragraphs: [
          'The site only uses technical cookies, for example to remember your language. We do not use analytics or advertising cookies.',
          'Google Maps is not loaded until you press the button to show it. When you load it, Google may set its own cookies and receive your IP address, under its own policy.',
        ],
      },
      {
        title: 'Changes',
        paragraphs: ['We may update this policy. The version in force is always the one published on this page, with its update date.'],
      },
    ],
  },
}

const TERMS: Record<Locale, LegalDoc> = {
  it: {
    title: 'Termini e condizioni',
    updated: 'Ultimo aggiornamento: [data]',
    draft: 'Bozza: questi termini devono essere verificati da un legale (in particolare le norme italiane sui pacchetti turistici, D.Lgs. 79/2011) e completati dalla cooperativa. Le percentuali e i termini tra [parentesi quadre] sono da decidere.',
    sections: [
      {
        title: 'Chi siamo e a chi si applicano',
        paragraphs: [`Questi termini regolano i viaggi proposti da ${who} tramite questo sito. Non si prenota online: ogni viaggio nasce da una richiesta e da un’offerta scritta.`],
      },
      {
        title: 'Richiesta e offerta',
        paragraphs: [
          'Invii una richiesta di preventivo o di posto su una partenza di gruppo. Ti rispondiamo con un itinerario e un’offerta scritta, valida [14] giorni, con prezzo, servizi inclusi ed esclusi, date e condizioni.',
          'Gli importi mostrati sul sito sono indicativi. Fa fede l’offerta scritta.',
        ],
      },
      {
        title: 'Conferma e pagamento',
        paragraphs: [
          'Il viaggio è confermato quando accetti l’offerta per iscritto e riceviamo l’acconto di [30]% del prezzo. Il saldo è dovuto [30] giorni prima della partenza.',
          'Il pagamento avviene con bonifico bancario: i dati del conto ti vengono inviati per e-mail dopo che accetti l’offerta. Non c’è pagamento online sul sito.',
        ],
      },
      {
        title: 'Partenze di gruppo',
        paragraphs: [
          'Una partenza di gruppo è garantita al raggiungimento del numero minimo di partecipanti indicato. Fino ad allora il posto richiesto non è confermato.',
          'Se il minimo non viene raggiunto, possiamo annullare la partenza fino a [20] giorni prima, rimborsando integralmente quanto versato o proponendoti un’altra data.',
        ],
      },
      {
        title: 'Annullamento da parte del viaggiatore',
        paragraphs: [
          'Puoi annullare per iscritto in qualsiasi momento. Si applicano queste penali sul prezzo totale: più di [60] giorni prima: [10]%; da [60] a [30] giorni: [30]%; da [29] a [15] giorni: [60]%; meno di [15] giorni o mancata presentazione: [100]%.',
          'Ti consigliamo un’assicurazione che copra l’annullamento. Se la legge ti riconosce diritti ulteriori come consumatore, restano validi.',
        ],
      },
      {
        title: 'Modifiche e cause di forza maggiore',
        paragraphs: [
          'Meteo, condizioni delle strade e dei fiumi, festività e altri imprevisti possono richiedere modifiche all’itinerario. Faremo il possibile per offrire un’alternativa equivalente.',
          'In caso di forza maggiore che renda impossibile il viaggio, ti proporremo una nuova data o un rimborso delle somme non già spese per tuo conto: [da definire].',
        ],
      },
      {
        title: 'Documenti, salute e assicurazione',
        paragraphs: [
          'Sei responsabile della validità del passaporto, del visto se richiesto e delle vaccinazioni consigliate. Trovi indicazioni nella pagina Info utili, ma le regole cambiano: verificale prima di partire.',
          'Un’assicurazione di viaggio con assistenza medica e rientro sanitario è fortemente raccomandata.',
        ],
      },
      {
        title: 'Rischi e responsabilità',
        paragraphs: [
          'I viaggi si svolgono anche in zone remote, con strade sterrate, attività all’aperto e a cavallo. Segui sempre le indicazioni della guida e comunica problemi di salute o limitazioni prima della partenza.',
          'La nostra responsabilità è quella prevista dalla legge applicabile al contratto di viaggio: [da verificare con il legale].',
        ],
      },
      {
        title: 'Reclami',
        paragraphs: [`Se qualcosa non va durante il viaggio, dillo subito alla guida per poter rimediare. Eventuali reclami scritti vanno inviati a ${site.email} entro [30] giorni dal rientro.`],
      },
      {
        title: 'Legge applicabile e foro',
        paragraphs: ['Legge applicabile e foro competente: [da definire con il legale]. Restano ferme le norme inderogabili a tutela del consumatore del paese in cui risiedi.'],
      },
    ],
  },
  en: {
    title: 'Terms and Conditions',
    updated: 'Last updated: [date]',
    draft: 'Draft: these terms must be reviewed by a lawyer (in particular the Italian package-travel rules, Legislative Decree 79/2011) and completed by the cooperative. Percentages and deadlines in [square brackets] are still to be decided.',
    sections: [
      {
        title: 'Who we are and scope',
        paragraphs: [`These terms govern the trips offered by ${who} through this website. You do not book online: every trip starts with a request and a written offer.`],
      },
      {
        title: 'Request and offer',
        paragraphs: [
          'You send a quote request or ask for a spot on a group departure. We reply with an itinerary and a written offer, valid for [14] days, stating the price, what is included and excluded, the dates and the conditions.',
          'Amounts shown on the website are indicative. The written offer prevails.',
        ],
      },
      {
        title: 'Confirmation and payment',
        paragraphs: [
          'The trip is confirmed when you accept the offer in writing and we receive a deposit of [30]% of the price. The balance is due [30] days before departure.',
          'Payment is by bank transfer: we e-mail the account details after you accept the offer. There is no online payment on the website.',
        ],
      },
      {
        title: 'Group departures',
        paragraphs: [
          'A group departure is guaranteed once the stated minimum number of participants is reached. Until then, a requested spot is not confirmed.',
          'If the minimum is not reached we may cancel the departure up to [20] days before, fully refunding what you paid or offering another date.',
        ],
      },
      {
        title: 'Cancellation by the traveller',
        paragraphs: [
          'You can cancel in writing at any time. These charges apply to the total price: more than [60] days before departure: [10]%; [60] to [30] days: [30]%; [29] to [15] days: [60]%; fewer than [15] days or no-show: [100]%.',
          'We recommend insurance that covers cancellation. Any further consumer rights you have under the law remain valid.',
        ],
      },
      {
        title: 'Changes and force majeure',
        paragraphs: [
          'Weather, road and river conditions, public holidays and other events may require changes to the itinerary. We will do our best to offer an equivalent alternative.',
          'If force majeure makes the trip impossible, we will offer a new date or a refund of sums not already spent on your behalf: [to be defined].',
        ],
      },
      {
        title: 'Documents, health and insurance',
        paragraphs: [
          'You are responsible for a valid passport, a visa if required and any recommended vaccinations. The Travel info page has guidance, but rules change: check them before you leave.',
          'Travel insurance with medical assistance and repatriation is strongly recommended.',
        ],
      },
      {
        title: 'Risks and liability',
        paragraphs: [
          'Trips take place in remote areas too, with unpaved roads, outdoor activities and horse riding. Always follow your guide’s instructions and tell us about health problems or limitations before departure.',
          'Our liability is as set out by the law applicable to the travel contract: [to be verified with the lawyer].',
        ],
      },
      {
        title: 'Complaints',
        paragraphs: [`If something goes wrong during the trip, tell your guide straight away so it can be put right. Written complaints should be sent to ${site.email} within [30] days of your return.`],
      },
      {
        title: 'Governing law and jurisdiction',
        paragraphs: ['Governing law and competent court: [to be defined with the lawyer]. Mandatory consumer-protection rules of the country where you live remain unaffected.'],
      },
    ],
  },
}

return { PRIVACY, TERMS }
}
