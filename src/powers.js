export const POWERS = [
  {
    id: 'glass_eye',
    description: 'At the start of the bridge stage, you privately learn the safe side (L or R) of all 8 rows.',
    blurb: 'Someone can see through glass.'
  },
  {
    id: 'wedge',
    description: 'In the crusher room, you can jam the lever open once: every other contestant walks out. But you are caught in the jaws like a lever holder and survive the squeeze only about half the time. Risky.',
    blurb: 'Someone can jam a lever.'
  },
  {
    id: 'map',
    description: 'At game start, you learn the rules text of all five stages in advance. Everyone else only learns a stage\'s rules when it begins.',
    blurb: 'Someone knows what lies ahead.'
  },
  {
    id: 'feather',
    description: 'The first time you would be eliminated by any means, you survive instead, with 1 footing left on the ledge. Passive, once.',
    blurb: 'Someone survives one deadly fall.'
  },
  {
    id: 'swap',
    description: 'On the disc, you can swap your tile with a named agent\'s tile, before the doors open. Once.',
    blurb: 'Someone can trade places.'
  },
  {
    id: 'anchor',
    description: 'You start the ledge with +1 footing and cannot be pushed onto the crusher lever. Passive.',
    blurb: 'Someone is hard to move.'
  },
  {
    id: 'forger',
    description: 'Once per game, your response may carry a forge object: a public or whispered message delivered as if sent by another named agent.',
    blurb: 'Someone can fake a message.'
  },
  {
    id: 'nothing',
    description: 'You have no power.',
    blurb: 'Someone has nothing at all.'
  }
];

export const POWER_IDS = POWERS.map((p) => p.id);

const BY_ID = new Map(POWERS.map((p) => [p.id, p]));

export function powerById(id) {
  const power = BY_ID.get(id);
  if (!power) throw new Error(`Unknown power: ${id}`);
  return power;
}
