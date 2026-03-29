// Evidence category type (for historical sources)
export type EvidenceCategory = 'Roman' | 'Jewish' | 'Christian';

// Miracle category type (for Gospel accounts/miracles)
export type MiracleCategoryType = 'Nature' | 'Healing' | 'Resurrection' | 'Demons';

// Combined category type (Evidence table Category column can hold either)
export type CategoryType = EvidenceCategory | MiracleCategoryType;

// Evidence link interface
export interface EvidenceLink {
  label: string;
  url: string;
  type: 'manuscript' | 'translation' | 'article' | 'reference' | 'image';
}

// Manuscript witness interface
export interface ManuscriptWitness {
  library: string;
  shelfmark: string;
  date: string;
  digitizedUrl: string;
  imageUrl?: string;
  highlightImageUrl?: string;
  folioGuide?: string;
  notes?: string;
}

// Evidence source interface
export interface EvidenceSource {
  id: string;
  category: CategoryType;
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
  evidenceType: string;
  tags: string[];
  links: EvidenceLink[];
  manuscripts: ManuscriptWitness[];
}
