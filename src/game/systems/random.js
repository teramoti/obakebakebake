/**
 * 再現性のある乱数を提供するユーティリティです。
 * プレイヤー順やステージREMIXが毎回変わりつつ、検証では同じ結果を再現できるようにします。
 */
export function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandom(items, count) {
  return shuffle(items).slice(0, count);
}
