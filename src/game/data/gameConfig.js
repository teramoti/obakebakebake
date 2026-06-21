/**
 * ゲーム全体の固定設定を集約するファイルです。
 * キャンバスサイズ、難易度、ラウンド数、盤面サイズ、プレイヤー色などをここで管理します。
 */
export const PLAYER_COLORS = ['#6ee7ff', '#ff75d8', '#ffe66d', '#7dff96'];
export const PLAYER_NAMES = ['P1', 'P2', 'P3', 'P4'];
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const BOARD = {
  x: 60,
  y: 110,
  cell: 72,
  cols: 8,
  rows: 8,
};

// 難易度ごとに表示盤面サイズを切り替えます。
// BOARDは参照共有されるため、描画・入力処理が常に現在の盤面サイズを読めます。
export const BOARD_LAYOUTS = {
  easy: { x: 66, y: 100, cell: 72, cols: 8, rows: 8, label: '8×8' },
  normal: { x: 42, y: 102, cell: 68, cols: 9, rows: 8, label: '9×8' },
  hard: { x: 44, y: 78, cell: 62, cols: 9, rows: 9, label: '9×9' },
};

export function getBoardLayout(difficultyId = 'normal') {
  return { ...(BOARD_LAYOUTS[difficultyId] ?? BOARD_LAYOUTS.normal) };
}

export function applyBoardLayout(difficultyId = 'normal') {
  Object.assign(BOARD, getBoardLayout(difficultyId));
  return BOARD;
}

export const DIFFICULTY_SETTINGS = {
  easy: {
    id: 'easy',
    label: 'EASY',
    name: 'かんたん',
    roundCount: 3,
    boardLabel: '8×8',
    description: '3ラウンド固定。8×8で1色ライトを読みます。',
    stageIds: [
      'moon-hall', 'crystal-bend', 'lamp-lane', 'star-corridor', 'soft-zigzag', 'safe-balcony',
      'perfect-orbit', 'glass-garden',
    ],
  },
  normal: {
    id: 'normal',
    label: 'NORMAL',
    name: 'ノーマル',
    roundCount: 3,
    boardLabel: '9×8',
    description: '3ラウンド固定。9×8で2本の色ライトを同時につなぎます。',
    stageIds: [
      'moon-hall', 'ghost-line', 'crystal-bend', 'portal-foyer', 'perfect-orbit', 'lamp-lane',
      'star-corridor', 'clock-tower', 'glass-garden', 'phantom-cross', 'ruby-stairs', 'silver-loop',
      'quiet-gallery', 'comet-room',
    ],
  },
  hard: {
    id: 'hard',
    label: 'HARD',
    name: 'ハード',
    roundCount: 3,
    boardLabel: '9×9',
    description: '3ラウンド固定。9×9で複数色・分岐ギミックを混ぜます。',
    stageIds: [
      'portal-foyer', 'ghost-line', 'double-portal', 'perfect-orbit', 'crystal-bend', 'clock-tower',
      'phantom-cross', 'ruby-stairs', 'silver-loop', 'comet-room', 'midnight-arc', 'thunder-hall',
      'crown-prism', 'neon-stair', 'spiral-stage', 'last-bell',
    ],
  },
};

export const TIME_OPTIONS = [30, 45, 60];

export const ROUND_EVENTS = [
  {
    id: 'crystalRush',
    label: 'CRYSTAL RUSH',
    shortLabel: '水晶ラッシュ',
    description: '水晶点がアップします。寄り道が強いラウンドです。',
    color: '#83fffd',
  },
  {
    id: 'speedBonus',
    label: 'SPEED STAR',
    shortLabel: '速攻スター',
    description: '残り時間ボーナスがアップします。早解きが強いラウンドです。',
    color: '#ffe66d',
  },
  {
    id: 'cleanBonus',
    label: 'NO GHOST NIGHT',
    shortLabel: 'おばけ回避',
    description: 'おばけを避けると追加点。安全ルートが強いラウンドです。',
    color: '#ff75d8',
  },
  {
    id: 'perfectShow',
    label: 'PERFECT SHOW',
    shortLabel: '完全反射',
    description: 'パーフェクト点がアップします。少ない回転が強いラウンドです。',
    color: '#7dff96',
  },
  {
    id: 'comebackLight',
    label: 'COMEBACK LIGHT',
    shortLabel: '逆転ライト',
    description: '下位プレイヤーに小さな逆転補正が入ります。最後まで勝負できます。',
    color: '#caa8ff',
  },
  {
    id: 'feverFinale',
    label: 'FEVER FINALE',
    shortLabel: '終盤フィーバー',
    description: '終盤クリアのボーナスがアップします。粘る判断も強くなります。',
    color: '#ffb86b',
  },
];
