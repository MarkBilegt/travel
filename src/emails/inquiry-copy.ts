/** Copy for the quote-request / sign-up e-mails (traveller: it + en, owner: Mongolian). */

import type { EmailLocale } from './copy'

export interface InquiryReceivedCopy {
  subject: (kind: 'quote' | 'signup', brand: string) => string
  preview: (kind: 'quote' | 'signup') => string
  heading: (kind: 'quote' | 'signup') => string
  greeting: (name: string) => string
  intro: (kind: 'quote' | 'signup', tour: string | null) => string
  summaryTitle: string
  tour: string
  departure: string
  dates: string
  flexible: string
  travelers: string
  travelersValue: (adults: number, children: number) => string
  budget: string
  budgetValue: (perDay: string) => string
  nextTitle: string
  nextSteps: (kind: 'quote' | 'signup') => string
  questions: string
  ignore: string
}

export const inquiryReceivedCopy: Record<EmailLocale, InquiryReceivedCopy> = {
  it: {
    subject: (kind, brand) => (kind === 'signup' ? `Richiesta di posto ricevuta | ${brand}` : `Richiesta di preventivo ricevuta | ${brand}`),
    preview: (kind) => (kind === 'signup' ? 'Abbiamo ricevuto la tua richiesta di partecipazione' : 'Abbiamo ricevuto la tua richiesta di preventivo'),
    heading: (kind) => (kind === 'signup' ? 'Abbiamo ricevuto la tua richiesta di posto' : 'Abbiamo ricevuto la tua richiesta'),
    greeting: (name) => `Gentile ${name},`,
    intro: (kind, tour) =>
      kind === 'signup'
        ? `Grazie! Abbiamo ricevuto la tua richiesta di partecipare alla partenza di gruppo${tour ? ` «${tour}»` : ''}. Il tuo posto non è ancora confermato: ti scriveremo presto.`
        : `Grazie! Abbiamo ricevuto la tua richiesta di preventivo${tour ? ` per «${tour}»` : ''}.`,
    summaryTitle: 'Riepilogo della richiesta',
    tour: 'Viaggio',
    departure: 'Partenza',
    dates: 'Date',
    flexible: 'Date flessibili',
    travelers: 'Viaggiatori',
    travelersValue: (a, c) => `${a} adult${a === 1 ? 'o' : 'i'}${c > 0 ? `, ${c} bambin${c === 1 ? 'o' : 'i'}` : ''}`,
    budget: 'Budget al giorno',
    budgetValue: (p) => `${p} a persona`,
    nextTitle: 'Cosa succede ora',
    nextSteps: (kind) =>
      kind === 'signup'
        ? 'Verifichiamo la disponibilità e ti rispondiamo entro 1–2 giorni lavorativi con la conferma e i passi successivi. Non devi pagare nulla adesso.'
        : 'Il nostro team prepara un itinerario e un’offerta scritta e ti risponde entro 1–2 giorni lavorativi. Non devi pagare nulla adesso.',
    questions: 'Vuoi aggiungere qualcosa? Rispondi a questa e-mail o contattaci:',
    ignore: 'Se non hai inviato tu questa richiesta, puoi ignorare questa e-mail.',
  },
  en: {
    subject: (kind, brand) => (kind === 'signup' ? `Spot request received | ${brand}` : `Quote request received | ${brand}`),
    preview: (kind) => (kind === 'signup' ? 'We have received your request to join' : 'We have received your quote request'),
    heading: (kind) => (kind === 'signup' ? 'We received your spot request' : 'We received your request'),
    greeting: (name) => `Hello ${name},`,
    intro: (kind, tour) =>
      kind === 'signup'
        ? `Thank you! We have received your request to join the group departure${tour ? ` “${tour}”` : ''}. Your spot is not confirmed yet: we will write to you soon.`
        : `Thank you! We have received your quote request${tour ? ` for “${tour}”` : ''}.`,
    summaryTitle: 'Your request',
    tour: 'Tour',
    departure: 'Departure',
    dates: 'Dates',
    flexible: 'Flexible dates',
    travelers: 'Travellers',
    travelersValue: (a, c) => `${a} adult${a === 1 ? '' : 's'}${c > 0 ? `, ${c} child${c === 1 ? '' : 'ren'}` : ''}`,
    budget: 'Budget per day',
    budgetValue: (p) => `${p} per person`,
    nextTitle: 'What happens next',
    nextSteps: (kind) =>
      kind === 'signup'
        ? 'We check availability and reply within 1–2 working days with your confirmation and the next steps. You do not need to pay anything now.'
        : 'Our team prepares an itinerary and a written offer and replies within 1–2 working days. You do not need to pay anything now.',
    questions: 'Want to add something? Reply to this e-mail or contact us:',
    ignore: 'If you did not send this request, you can ignore this e-mail.',
  },
}

/** Owner alert (team-facing, Mongolian). */
export const inquiryNoticeCopy = {
  subject: (kind: 'quote' | 'signup', name: string) => (kind === 'signup' ? `Бүлгийн аялалд бүртгүүлэх хүсэлт - ${name}` : `Үнийн санал хүсэлт - ${name}`),
  preview: (name: string) => `${name} шинэ хүсэлт илгээлээ`,
  heading: (kind: 'quote' | 'signup') => (kind === 'signup' ? 'Бүлгийн аялалд бүртгүүлэх хүсэлт' : 'Шинэ үнийн санал хүсэлт'),
  body: 'Энэ имэйлд хариу бичвэл шууд аялагч руу очно (Reply-To).',
  name: 'Нэр',
  email: 'Имэйл',
  phone: 'Утас',
  country: 'Улс',
  language: 'Хэл',
  tour: 'Аялал',
  departure: 'Бүлгийн аялалын огноо',
  dates: 'Хүссэн огноо',
  flexible: 'Огноо уян хатан',
  travelers: 'Аялагчид',
  travelersValue: (a: number, c: number) => `${a} том хүн${c > 0 ? `, ${c} хүүхэд` : ''}`,
  budget: 'Хоногийн төсөв',
  interests: 'Сонирхол',
  accommodation: 'Байрлах хэлбэр',
  message: 'Мессеж',
  button: 'Админ самбар нээх',
} as const
