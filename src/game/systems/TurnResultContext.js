/**
 * 1ターン終了時の判定結果をスコア計算向けに整えるクラスです。
 * 光線結果、ボーナス、失敗要因をまとめ、ScoreLedgerへ渡しやすくします。
 */
export default class TurnResultContext {
  static create(result) {
    return {
      scoreResult: result,
      snapshot: {
        cells: result.cells.map((cell) => ({ x: cell.x, y: cell.y, color: cell.color })),
        lines: result.lines.map((line) => ({ from: { ...line.from }, to: { ...line.to }, color: line.color })),
      },
    };
  }
}
