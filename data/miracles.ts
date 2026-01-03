// /data/miracles.ts

export type MiracleCategory = 'Nature' | 'Healing' | 'Resurrection' | 'Casting out demons';

export interface GospelReference {
  gospel: 'Matthew' | 'Mark' | 'Luke' | 'John';
  reference: string; // e.g., "8:23"
  verse?: string; // Optional: the actual verse text
}

export interface Miracle {
  id: string;
  category: MiracleCategory;
  name: string;
  description: string;
  gospelReferences: GospelReference[];
  significance: string;
  tags: string[];
}

// Initial data - Nature miracles
export const miracles: Miracle[] = [
  {
    id: 'calming-of-the-storm',
    category: 'Nature',
    name: 'Calming of the Storm',
    description: 'Jesus and his disciples were crossing the Sea of Galilee when a violent storm arose. While the disciples feared for their lives, Jesus was asleep. They woke him, and he rebuked the wind and waves, commanding them to be still. Immediately, the storm ceased, demonstrating Jesus\' authority over nature itself.',
    gospelReferences: [
      {
        gospel: 'Matthew',
        reference: '8:23-27',
        verse: 'He replied, "You of little faith, why are you so afraid?" Then he got up and rebuked the winds and the waves, and it was completely calm.'
      },
      {
        gospel: 'Mark',
        reference: '4:35-41',
        verse: 'He got up, rebuked the wind and said to the waves, "Quiet! Be still!" Then the wind died down and it was completely calm.'
      },
      {
        gospel: 'Luke',
        reference: '8:22-25',
        verse: 'He got up and rebuked the wind and the raging waters; the storm subsided, and all was calm.'
      }
    ],
    significance: 'This miracle reveals Jesus\' divine authority over creation. In the Old Testament, only God has power over the seas and storms (Psalm 107:29, Job 38:8-11). By calming the storm with a word, Jesus demonstrates that he possesses the same divine authority, revealing his identity as God incarnate.',
    tags: ['Divine Authority', 'Nature Miracle', 'Faith']
  },
  {
    id: 'walking-on-water',
    category: 'Nature',
    name: 'Walking on Water',
    description: 'After feeding the five thousand, Jesus sent his disciples ahead by boat while he went to pray. During the night, he walked across the water to meet them. When Peter saw Jesus, he asked to walk on water too, and did so until he became afraid and began to sink. Jesus rescued him and calmed the wind.',
    gospelReferences: [
      {
        gospel: 'Matthew',
        reference: '14:22-33',
        verse: 'Shortly before dawn Jesus went out to them, walking on the lake.'
      },
      {
        gospel: 'Mark',
        reference: '6:45-52',
        verse: 'Shortly before dawn he went out to them, walking on the lake.'
      },
      {
        gospel: 'John',
        reference: '6:16-21',
        verse: 'They saw Jesus approaching the boat, walking on the water; and they were frightened.'
      }
    ],
    significance: 'Walking on water demonstrates Jesus\' mastery over the physical laws of nature. In Job 9:8, it says God "alone stretches out the heavens and treads on the waves of the sea." Jesus\' ability to walk on water is a clear sign of his divine nature.',
    tags: ['Divine Authority', 'Nature Miracle', 'Faith', 'Peter']
  },
  {
    id: 'feeding-five-thousand',
    category: 'Nature',
    name: 'Feeding the Five Thousand',
    description: 'When a large crowd followed Jesus to a remote area, he felt compassion for them. With only five loaves of bread and two fish, Jesus blessed the food, broke it, and gave it to his disciples to distribute. Miraculously, all five thousand men (plus women and children) were fed, with twelve baskets of leftovers remaining.',
    gospelReferences: [
      {
        gospel: 'Matthew',
        reference: '14:13-21',
        verse: 'Taking the five loaves and the two fish and looking up to heaven, he gave thanks and broke the loaves.'
      },
      {
        gospel: 'Mark',
        reference: '6:30-44',
        verse: 'Taking the five loaves and the two fish and looking up to heaven, he gave thanks and broke the loaves.'
      },
      {
        gospel: 'Luke',
        reference: '9:10-17',
        verse: 'Taking the five loaves and the two fish and looking up to heaven, he gave thanks and broke them.'
      },
      {
        gospel: 'John',
        reference: '6:1-15',
        verse: 'Jesus then took the loaves, gave thanks, and distributed to those who were seated as much as they wanted.'
      }
    ],
    significance: 'This miracle, recorded in all four Gospels, demonstrates Jesus\' creative power and compassion. The multiplication of loaves echoes God\'s provision of manna in the wilderness (Exodus 16), positioning Jesus as the new Moses and the true bread from heaven.',
    tags: ['Divine Authority', 'Nature Miracle', 'Compassion', 'Provision']
  },
  {
    id: 'turning-water-into-wine',
    category: 'Nature',
    name: 'Turning Water into Wine',
    description: 'At a wedding in Cana, the wine ran out. Jesus\' mother told him about the problem, and Jesus instructed servants to fill six stone water jars with water. When they drew from the jars, the water had become wine—and not just any wine, but the finest wine of the celebration.',
    gospelReferences: [
      {
        gospel: 'John',
        reference: '2:1-11',
        verse: 'Jesus said to the servants, "Fill the jars with water"; so they filled them to the brim. Then he told them, "Now draw some out and take it to the master of the banquet." They did so, and the master of the banquet tasted the water that had been turned into wine.'
      }
    ],
    significance: 'This was Jesus\' first public miracle, revealing his glory and leading his disciples to believe in him. The transformation of water into wine demonstrates Jesus\' power over the material world and his ability to bring joy and abundance, foreshadowing the new covenant.',
    tags: ['Divine Authority', 'Nature Miracle', 'First Miracle', 'Glory']
  }
];
