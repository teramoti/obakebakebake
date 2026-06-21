import { BOARD } from '../data/gameConfig.js';

export const PANEL = 0x10152d;
export const MUTED = '#9eb4dd';
export const GOLD = '#ffe66d';
export const PINK = '#ff75d8';
export const CYAN = '#6ee7ff';

export const ICON_KEYS = [
  'flashlight', 'target-door', 'crystal', 'ghost', 'portal', 'wall',
  'mirror-slash', 'mirror-backslash', 'beam-spark', 'perfect-star',
  'stage-card', 'hint-ring', 'round-ticket', 'timer-bell', 'warning-ghost', 'mission-flag',
  'ui-spotlight', 'award-crown',
];

export function compactDifficultyLabel(difficulty) {
  return difficulty?.label ?? 'NORMAL';
}

export function cellCenter(cell) {
  return {
    x: BOARD.x + cell.x * BOARD.cell + BOARD.cell / 2,
    y: BOARD.y + cell.y * BOARD.cell + BOARD.cell / 2,
  };
}

export function rectCell(cell) {
  return {
    x: BOARD.x + cell.x * BOARD.cell,
    y: BOARD.y + cell.y * BOARD.cell,
  };
}

export function formatScore(score) {
  return `${Math.round(score)}`;
}

export function shortText(text, max = 12) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function compactMission(mission) {
  const map = new Map([
    ['水晶を2個以上取ってクリア', '水晶2つ'],
    ['少ない回転でクリア', '少ない回転'],
    ['おばけに当てずにクリア', 'おばけ回避'],
    ['ポータルを使ってクリア', 'ワープ'],
    ['パーフェクトを狙え', 'PERFECT'],
    ['フィーバー中にクリア', 'FEVER'],
  ]);
  return map.get(mission) ?? shortText(String(mission).replace('してクリア', '').replace('クリア', ''), 10);
}
