/**
 * Shared short copy for React title help and Phaser in-game help.
 * Pages describe fair bonus gates, ghost-avoid bonus, and click-only play.
 */
export const HOW_TO_STEPS = [
  { icon: 'flashlight', title: 'ゴール', text: '出口へ。' },
  { icon: 'mirror-slash', title: '回す', text: '鏡だけ。' },
  { icon: 'crystal', title: '+1', text: '水晶。' },
  { icon: 'ghost', title: '-1', text: 'おばけ。' },
  { icon: 'timer-bell', title: 'TIME', text: '時間。' },
];

export const SCORE_GUIDE = [
  ['CLEAR', '+2'],
  ['MISSION', '+2'],
  ['色ライト', '+1'],
  ['水晶', '+1'],
  ['分岐', '+1'],
  ['回避', '+1'],
];

// 1 / 2 / 3 page style manual. Icons are PNG keys under resources/icons.
export const HOW_TO_PAGES = [
  {
    number: 1,
    title: 'ゴール',
    badge: 'GOAL',
    lead: '色の光を同じ色の出口へつなぎます。',
    callout: '全部の色が届くと CLEAR +2',
    cards: [
      ['flashlight', 'ライト', '色つき光'],
      ['mirror-slash', '鏡', '光を曲げる'],
      ['target-door', '出口', '同じ色へ'],
    ],
  },
  {
    number: 2,
    title: 'クリック',
    badge: 'CLICK',
    lead: '操作は鏡クリックだけです。',
    callout: '1クリックで鏡が回転。MOVEを1使います。',
    cards: [
      ['mirror-slash', '回転', '道が変わる'],
      ['timer-bell', 'MOVE', '回数制限'],
      ['hint-ring', 'HINT', '終盤だけ'],
    ],
  },
  {
    number: 3,
    title: 'スコア',
    badge: 'SCORE',
    lead: '小さい点を集めます。',
    callout: 'CLEARとMISSIONは大きめ。色・水晶・分岐で少し足します。',
    cards: [
      ['perfect-star', '+2', 'CLEAR'],
      ['flashlight', '+1', '色ライト'],
      ['beam-spark', '+1', '分岐'],
    ],
  },
];
