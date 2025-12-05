// /data/sources.ts

export type EvidenceCategory = 'Roman' | 'Jewish' | 'Christian';

export interface EvidenceLink {
  label: string;
  url: string;
  type: 'manuscript' | 'translation' | 'article' | 'reference';
}

export interface ManuscriptWitness {
  library: string;
  shelfmark: string;
  date: string;
  digitizedUrl: string;
  notes?: string;
}

export interface EvidenceSource {
  id: string;
  category: EvidenceCategory;
  author: string;
  authorLifespan?: string;
  authorDescription: string;
  work: string;
  workDescription: string;
  section?: string;
  date: string;
  language: string;
  quoteOriginal: string;
  quoteEnglish: string;
  passageSummary: string;
  evidenceType: string; // e.g. "Non-Christian", "Hostile", etc.
  tags: string[];
  links: EvidenceLink[];
  manuscripts: ManuscriptWitness[];
}

// Your first real data object: Tacitus – Annals 15.44
export const sources: EvidenceSource[] = [
  {
    id: 'tacitus-annals-15-44',
    category: 'Roman',
    author: 'Publius Cornelius Tacitus',
    authorLifespan: 'c. AD 56 – c. 120',
    authorDescription:
      'Tacitus was a Roman senator, provincial governor, and historian of the early 2nd century AD. He is widely regarded as one of Rome’s most careful and critical historians.',
    work: 'Annals',
    workDescription:
      'The Annals is Tacitus’ history of the Roman Empire from the reign of Tiberius to Nero, focusing on political power, corruption, and the character of emperors.',
    section: '15.44',
    date: 'c. AD 116',
    language: 'Latin',
    quoteOriginal:
      'Auctor nominis eius Christus Tiberio imperitante per procuratorem Pontium Pilatum supplicio adfectus erat…',
    quoteEnglish:
      'Christus, the founder of the name, had undergone the death penalty in the reign of Tiberius, by sentence of the procurator Pontius Pilatus…',
    passageSummary:
      'While explaining how Nero blamed Christians for the Great Fire of Rome (AD 64), Tacitus briefly identifies Christus as the founder of the movement, executed under Pontius Pilate during the reign of Tiberius. This is one of the clearest non-Christian confirmations of Jesus’ historical execution.',
    evidenceType: 'Roman – Non-Christian',
    tags: ['Mentions Jesus', 'Crucifixion', 'Persecution'],
    links: [
      {
        label: 'Latin text (reference)',
        url: 'https://penelope.uchicago.edu/thayer/e/roman/texts/tacitus/annals/15b*.html',
        type: 'reference',
      },
      {
        label: 'English translation (public domain)',
        url: 'https://penelope.uchicago.edu/thayer/e/roman/texts/tacitus/annals/15b*.html',
        type: 'translation',
      },
    ],
    manuscripts: [
      {
        library: 'Biblioteca Medicea Laurenziana, Florence',
        shelfmark: 'Pluteus 68.2 (Mediceus II)',
        date: '11th century',
        digitizedUrl: 'https://commons.wikimedia.org/wiki/File:MII.png',
        notes:
          'Primary medieval manuscript preserving Annals 11–16, including the passage mentioning Christus in 15.44.',
      },
    ],
  },
  {
  id: 'suetonius-claudius-25-4',
  category: 'Roman',
  author: 'Gaius Suetonius Tranquillus',
  authorLifespan: 'c. AD 70 – c. 130',
  authorDescription:
    'Suetonius was a Roman scholar and imperial secretary under Emperor Hadrian. His biographies of the Caesars are key historical sources for the early Empire.',
  work: 'Lives of the Caesars',
  workDescription:
    'A set of imperial biographies covering Julius Caesar through Domitian. Suetonius focuses on character, administration, scandals, and notable events.',
  section: 'Claudius 25.4',
  date: 'c. AD 120',
  language: 'Latin',
  quoteOriginal:
    'Iudaeos impulsore Chresto assidue tumultuantis Roma expulit.',
  quoteEnglish:
    'He expelled the Jews from Rome, since they were continually causing disturbances at the instigation of Chrestus.',
  passageSummary:
    'Suetonius records that Emperor Claudius expelled Jews from Rome due to disturbances “at the instigation of Chrestus.” Many scholars view this as evidence of early conflicts over the preaching of Christ within the Jewish community in Rome.',
  evidenceType: 'Roman – Non-Christian',
  tags: ['Mentions Jesus', 'Early Christian movement', 'Claudius Edict'],
  links: [
    {
      label: 'Latin text (reference)',
      url: 'https://www.thelatinlibrary.com/suetonius/suet.claudius.html',
      type: 'reference',
    },
    {
      label: 'English translation (LCL)',
      url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Claudius*.html',
      type: 'translation',
    },
    {
      label: 'Article: Claudius expels the Jews (Acts 18:2 context)',
      url: 'https://www.biblicalarchaeology.org/daily/people-cultures-in-the-bible/people-in-the-bible/why-were-jews-expelled-from-rome/',
      type: 'article',
    }
  ],
  manuscripts: [
    {
      library: 'Biblioteca Apostolica Vaticana',
      shelfmark: 'Vat. lat. 1902',
      date: '9th century',
      digitizedUrl: 'https://digi.vatlib.it/view/MSS_Vat.lat.1902',
      notes:
        'One of the earliest complete witnesses of Suetonius’ *Lives of the Caesars*. Claudius 25.4 is preserved here.',
    }
  ]
},

];
