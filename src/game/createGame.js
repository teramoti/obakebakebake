/**
 * 旧形式のcreateGame呼び出しに対応する互換エクスポートです。
 * 新しい実装ではGameManager.tsを直接使いますが、既存呼び出しがある場合に破綻しないよう残しています。
 */
export { startGame as createGame, destroyGame } from './GameManager.js';
