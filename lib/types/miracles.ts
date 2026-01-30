// Miracle category type
export type MiracleCategory = 'Nature' | 'Healing' | 'Resurrection' | 'Demons';

// Gospel reference interface
export interface GospelReference {
  gospel: 'Matthew' | 'Mark' | 'Luke' | 'John';
  reference: string;
  verse?: string;
}

// Miracle interface
export interface Miracle {
  id: string;
  category: MiracleCategory;
  name: string;
  description: string;
  significance: string;
  tags: string[];
  gospelReferences: GospelReference[];
}
