// /data/sources.ts

export type EvidenceCategory = 'Roman' | 'Jewish' | 'Christian';

export interface EvidenceLink {
  label: string;
  url: string;
  type: 'manuscript' | 'translation' | 'article' | 'reference' | 'image';
}

export interface ManuscriptWitness {
  library: string;
  shelfmark: string;
  date: string;
  digitizedUrl: string;
  imageUrl?: string;
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
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/MII.png',
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
  tags: ['Mentions Jesus', 'Persecution'],
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
{
  id: 'josephus-antiquities-18-3-3',
  category: 'Jewish',
  author: 'Flavius Josephus',
  authorLifespan: 'c. AD 37 – c. 100',
  authorDescription:
    'Flavius Josephus was a Jewish historian and former priest who wrote extensively on Jewish history under Roman patronage. His works are key sources for 1st-century Judaism and Roman Palestine.',
  work: 'Antiquities of the Jews',
  workDescription:
    'Antiquities of the Jews is a comprehensive history of the Jewish people from creation to the outbreak of the Jewish War, written for a Greco-Roman audience.',
  section: '18.3.3',
  date: 'c. AD 93–94',
  language: 'Greek',
  quoteOriginal: `
Γίνεται δὲ κατὰ τοῦτον τὸν χρόνον Ἰησοῦς, σοφὸς ἀνήρ,
εἴγε ἄνδρα αὐτὸν λέγειν χρή·
ἦν γὰρ παραδόξων ἔργων ποιητής,
διδάσκαλος ἀνθρώπων τῶν ἡδονῇ τἀληθῆ δεχομένων,
καὶ πολλοὺς μὲν Ἰουδαίους, πολλοὺς δὲ καὶ τοῦ Ἑλληνικοῦ ἐπηγάγετο·
ὁ Χριστὸς οὗτος ἦν.
καὶ αὐτὸν ἐπὶ τῇ καταγγελίᾳ τῶν πρώτων ἀνδρῶν παρ’ ἡμῖν
σταυρῷ ἐπιτετιμηκότος Πιλάτου,
οὐκ ἐπαύσαντο οἱ τὸ πρῶτον ἀγαπήσαντες·
ἐφάνη γὰρ αὐτοῖς τρίτην ἔχων ἡμέραν πάλιν ζῶν,
τῶν θείων προφητῶν ταῦτά τε καὶ ἄλλα μύρια περὶ αὐτοῦ θαυμάσια εἰρηκότων·
εἰς ἔτι τε νῦν τῶν Χριστιανῶν οὐκ ἐπέλειπε τὸ φῦλον, ἀπὸ τούτου ὠνομασμένον.
`,
  quoteEnglish:
    'Now there was about this time Jesus, a wise man, if it be lawful to call him a man; for he was a doer of wonderful works, a teacher of such men as receive the truth with pleasure. He drew over to him both many of the Jews and many of the Gentiles. He was [the] Christ. And when Pilate, at the suggestion of the principal men amongst us, had condemned him to the cross, those that loved him at the first did not forsake him; for he appeared to them alive again the third day; as the divine prophets had foretold these and ten thousand other wonderful things concerning him. And the tribe of Christians, so named from him, are not extinct at this day.',
  passageSummary:
    'Josephus briefly describes Jesus as a wise teacher and miracle worker who attracted both Jews and Gentiles, was crucified under Pontius Pilate, and whose followers continued after his death. While parts of the passage show signs of later Christian interpolation, most scholars agree that Josephus originally mentioned Jesus and his execution.',
  evidenceType: 'Jewish – Partially Interpolated',
  tags: [
    'Mentions Jesus',
    'Crucifixion',
    'Resurrection'
  ],
  links: [
    {
      label: 'Greek text (reference)',
      url: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0146%3Abook%3D18%3Asection%3D63',
      type: 'reference',
    },
    {
      label: 'English translation (Whiston)',
      url: 'https://www.gutenberg.org/files/2848/2848-h/2848-h.htm#link182HCH0003',
      type: 'translation',
    },
    {
      label: 'Scholarly discussion of interpolation',
      url: 'https://www.biblicalarchaeology.org/daily/biblical-topics/new-testament/josephus-on-jesus/',
      type: 'article',
    },
      {
        label: 'Manuscript evidence image',
        url: 'https://library.biblicalarchaeology.org/sites/default/files/bsba410105000l.jpg',
        type: 'image',
      },
  ],
  manuscripts: [
    {
      library: 'Bibliothèque nationale de France',
      shelfmark: 'Greek MS (medieval witnesses)',
      date: '10th–11th century',
        digitizedUrl: 'https://library.biblicalarchaeology.org/images/bsba410105000ljpg/',
        imageUrl: 'https://library.biblicalarchaeology.org/sites/default/files/bsba410105000l.jpg',
      notes:
        'Medieval Greek manuscript witness of Josephus’ Antiquities preserving Book 18, including the Testimonium Flavianum.',
    },
  ],
},


];
