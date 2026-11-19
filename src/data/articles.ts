/**
 * Culture and history articles, condensed from the cooperative's own pages on
 * the old site (sainsanaa.net: "La storia" and "Tradizioni e religione").
 * The full original articles are much longer: the cooperative can paste them
 * in here, or we can move articles to a database table so the team can edit
 * them in the admin panel. English is my translation of the condensed text.
 */
import type { Locale } from '@/i18n/locales'

export interface Article {
  slug: string
  /** Unsplash image id, used as the card and hero image. */
  image: string
  text: Record<Locale, { title: string; summary: string; body: string[] }>
}

const img = (id: string) => `https://images.unsplash.com/${id}?w=1600&q=80&auto=format&fit=crop`

export const ARTICLES: Article[] = [
  {
    slug: 'history',
    image: img('photo-1630326867210-bf4b2cdd2019'),
    text: {
      it: {
        title: 'Storia della Mongolia in breve',
        summary: 'Dalle tribù nomadi all’impero di Gengis Khan, dalla conversione al buddismo alla dominazione manciù.',
        body: [
          'Le origini della civiltà in Mongolia risalgono alla preistoria: la zona era già abitata nel neolitico e, secondo le fonti, tra il 770 e il 476 a.C. più di dieci tribù nomadi si contendevano le steppe.',
          'Nel 1206, durante un grande kuriltai, il concilio dei capi tribù, Temujin ottenne il titolo di Khagan, «khan dei khan», e da allora fu chiamato Gengis Khan, il «Sovrano Universale». L’impero mongolo (1206–1368) è stato uno dei più vasti della storia: al suo apice coprì oltre 24 milioni di km², dall’Asia orientale all’Europa centrale, con circa 100 milioni di abitanti. Dopo la morte di Gengis Khan si divise in quattro parti: la dinastia Yuan, l’Ilkhanato di Persia, il Khanato Chagatai e il Khanato dell’Orda d’Oro.',
          'Mentre i discendenti di Gengis Khan si contendevano il potere, la restaurazione dei Mongoli orientali avvenne grazie a una donna eccezionale, Mandukhai Khatun, che mise sul trono il giovane Batumöngke, il futuro Dayan Khan, e assunse la reggenza. Più tardi Altan Khan, nipote di Dayan Khan, favorì la conversione dei Mongoli al buddismo tibetano.',
          'Nel 1644 i Manciù rovesciarono i Ming e fondarono la dinastia Qing: i Mongoli meridionali furono annessi alla Cina, e i Khalkha si sottomisero ai Manciù. La storia completa, dall’età preistorica alla Mongolia moderna, è raccontata nelle pagine «La storia» del sito originale della cooperativa.',
        ],
      },
      en: {
        title: 'A short history of Mongolia',
        summary: 'From nomadic tribes to Genghis Khan’s empire, from the conversion to Buddhism to Manchu rule.',
        body: [
          'The origins of civilisation in Mongolia go back to prehistory: the area was already inhabited in the Neolithic and, according to the sources, between 770 and 476 BC more than ten nomadic tribes were competing for the steppes.',
          'In 1206, at a great kurultai, the council of tribal chiefs, Temujin received the title Khagan, “khan of khans”, and from then on was called Genghis Khan, the “Universal Ruler”. The Mongol empire (1206–1368) was one of the largest in history: at its height it covered over 24 million km², from East Asia to Central Europe, with about 100 million people. After Genghis Khan’s death it split into four parts: the Yuan dynasty, the Ilkhanate of Persia, the Chagatai Khanate and the Golden Horde.',
          'While Genghis Khan’s descendants fought over power, the restoration of the Eastern Mongols was the work of an exceptional woman, Mandukhai Khatun, who put the young Batumöngke, the future Dayan Khan, on the throne and became regent. Later Altan Khan, Dayan Khan’s grandson, encouraged the Mongols’ conversion to Tibetan Buddhism.',
          'In 1644 the Manchus overthrew the Ming and founded the Qing dynasty: the Southern Mongols were annexed to China, and the Khalkha submitted to the Manchus. The full history, from prehistory to modern Mongolia, is told in the “La storia” pages of the cooperative’s original site.',
        ],
      },
    },
  },
  {
    slug: 'ger',
    image: img('photo-1773379418260-c34d07daf797'),
    text: {
      it: {
        title: 'La gher',
        summary: 'La casa tradizionale dei nomadi: come è fatta, come si smonta e come è organizzato lo spazio interno.',
        body: [
          'La gher è l’abitazione tradizionale mongola, oggi affiancata nelle città e nei piccoli centri da edifici di modello sovietico. Può essere smontata in breve tempo e caricata sui carri quando si cambiano i pascoli: un compito che tradizionalmente spettava alle donne.',
          'Si riconosce facilmente una gher stabile da una dei campi stagionali dalla piattaforma su cui poggia e dalla base, che nelle abitazioni fisse può essere cementata.',
          'L’ossatura è un intreccio di tralicci di legno, i khana, di misure standard, affiancati a formare un recinto circolare. La porta di legno decorato, la khalga, è sempre rivolta a sud. Al centro due pali portanti, i baghana, sorreggono la cupola del tetto, il toono, a cui poggiano i pali che formano il tetto vero e proprio. Il tutto è rivestito di feltro.',
          'Anche l’interno segue un ordine preciso: la stufa al centro, il letto coniugale e l’angolo delle donne, il lato degli uomini con le selle, l’angolo per gli ospiti di riguardo e il piccolo altare sopra la cassapanca dei beni preziosi. Nei nostri viaggi si dorme in campi di gher o come ospiti di famiglie nomadi.',
        ],
      },
      en: {
        title: 'The ger',
        summary: 'The nomads’ traditional home: how it is built, how it is taken down and how its space is organised.',
        body: [
          'The ger is the traditional Mongolian dwelling, now found alongside Soviet-style buildings in towns and provincial centres. It can be taken down in a short time and loaded onto carts when the herders change pastures, a job that traditionally fell to the women.',
          'A permanent ger is easy to tell from one in a seasonal camp by the platform it stands on and by its base, which in fixed homes may be cemented.',
          'The frame is a weave of wooden lattices, the khana, of standard sizes, set side by side to form a circular wall. The decorated wooden door, the khalga, always faces south. In the middle two supporting posts, the baghana, hold up the roof dome, the toono, on which the roof poles rest. Everything is covered in felt.',
          'The inside follows a precise order too: the stove in the middle, the marital bed and the women’s corner, the men’s side with the saddles, the place for honoured guests and the small altar above the chest of precious things. On our trips you sleep in ger camps or as a guest of nomadic families.',
        ],
      },
    },
  },
  {
    slug: 'food',
    image: img('photo-1630326867210-bf4b2cdd2019'),
    text: {
      it: {
        title: 'La cucina mongola',
        summary: 'Alimenti grigi e alimenti bianchi: il cibo come codice sociale nella cultura nomade.',
        body: [
          'In Mongolia il cibo è molto più che nutrimento: è un codice sociale simbolico. I Mongoli traggono il loro sostentamento quasi interamente dai cinque animali che allevano: cavallo, montone, capra, cammello e bovini. Frutta e verdura sono quasi inesistenti. Gli alimenti si dividono in due grandi categorie: quelli grigi, le carni, consumate soprattutto d’inverno, e quelli bianchi, i derivati del latte, centrali nei mesi estivi.',
          'Le carni sono quasi sempre bollite. Con farina e acqua si preparano tagliatelle per le zuppe, i buuz, grossi ravioli cotti a vapore, e i khuushuur, panzerotti fritti in grasso animale: cibo di festa, come il montone bollito servito ancora attaccato all’osso, dove i pezzi vengono offerti secondo l’importanza dell’ospite.',
          'Il latte non si beve mai puro, ma si trasforma in formaggi, burro e yogurt. La bevanda per eccellenza è l’airak, latte di giumenta fermentato (il kumis), con una gradazione di 3–5 gradi, preparato per la prima volta dopo l’inverno, a giugno, con una festa. Lo yogurt, il tè con latte e l’airak sono le tre bevande bianche consacrate alle divinità. L’alimento bianco più onorifico da offrire a un ospite è l’oerem, la pelle del latte ripiegata come una piccola omelette.',
        ],
      },
      en: {
        title: 'Mongolian food',
        summary: 'Grey foods and white foods: food as a social code in nomadic culture.',
        body: [
          'In Mongolia food is much more than nourishment: it is a symbolic social code. Mongols get their sustenance almost entirely from the five animals they raise: horse, sheep, goat, camel and cattle. Fruit and vegetables are almost absent. Foods fall into two broad categories: grey foods, the meats, eaten mainly in winter, and white foods, the dairy products, central in the summer months.',
          'Meat is almost always boiled. From flour and water come noodles for soups, buuz, large steamed dumplings, and khuushuur, pastries fried in animal fat: festive food, like boiled mutton served on the bone, where the pieces are offered according to the guest’s importance.',
          'Milk is never drunk plain, but turned into cheeses, butter and yoghurt. The drink par excellence is airak, fermented mare’s milk (koumiss) of 3–5% alcohol, made for the first time after winter, in June, with a festival. Yoghurt, milk tea and airak are the three white drinks consecrated to the deities. The most honorific white food to offer a guest is oerem, the skin of the milk folded like a small omelette.',
        ],
      },
    },
  },
  {
    slug: 'religion',
    image: img('photo-1630326867210-bf4b2cdd2019'),
    text: {
      it: {
        title: 'Religione in Mongolia: cielo, fuoco e buddismo',
        summary: 'Il cielo eterno, i cumuli di pietre, il culto del fuoco e il buddismo tibetano.',
        body: [
          'La religione ancestrale mongola riconosce un essere supremo, khökh mönkh Tengri, l’eterno cielo azzurro, padre di altri tengri, spiriti che governano il mondo. Anche gli spiriti degli antenati erano venerati, in particolare quello di Gengis Khan.',
          'Ancora oggi, nonostante la religione ufficiale sia il buddismo tibetano, le antiche credenze sopravvivono e si intrecciano con la «fede gialla». Lo si vede negli ovoo, cumuli di pietre posti nei luoghi di passaggio, a cui ogni passante aggiunge un sasso o un piccolo dono, e nel culto del fuoco, uno dei concetti religiosi più antichi, oggi diventato regola sociale e superstizione anche per chi non pratica alcuna religione.',
          'Lo sciamanesimo, che può apparire in contesti diversissimi, si è adattato perfettamente a queste credenze e resiste soprattutto nelle zone settentrionali del paese.',
          'Il buddismo tibetano è la tradizione religiosa più diffusa. Nel XVI secolo Altan Khan favorì la conversione dei Mongoli. Negli anni Trenta molti monasteri furono distrutti e molti monaci perseguitati; dopo il 1990 la pratica religiosa è tornata libera e molti monasteri sono stati ricostruiti. Nei templi si entra in silenzio, con abiti sobri, si cammina in senso orario e si chiede il permesso prima di fotografare.',
        ],
      },
      en: {
        title: 'Religion in Mongolia: sky, fire and Buddhism',
        summary: 'The eternal sky, stone cairns, fire worship and Tibetan Buddhism.',
        body: [
          'The ancestral Mongol religion recognises a supreme being, Khökh Möngke Tengri, the eternal blue sky, father of other tengri, spirits that govern the world. The spirits of ancestors were also venerated, especially that of Genghis Khan.',
          'Today, although the official religion is Tibetan Buddhism, the old beliefs survive and intertwine with the “yellow faith”. You see it in the ovoo, stone cairns set at places of passage, to which every passer-by adds a stone or a small gift, and in the cult of fire, one of the oldest religious concepts, now a social rule and superstition even for those who follow no religion.',
          'Shamanism, which can appear in very different settings, adapted perfectly to these beliefs and survives especially in the northern parts of the country.',
          'Tibetan Buddhism is the most widespread religious tradition. In the 16th century Altan Khan encouraged the Mongols’ conversion. In the 1930s many monasteries were destroyed and many monks persecuted; after 1990 religious practice became free again and many monasteries have been rebuilt. In temples, enter quietly, dress modestly, walk clockwise and ask permission before taking photos.',
        ],
      },
    },
  },
]

export const getArticle = (slug: string) => ARTICLES.find((a) => a.slug === slug)
