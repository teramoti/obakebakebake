/**
 * TurnResultContext keeps score input explicit for each finished turn.
 *
 * v11 keeps extra click actions removed because they were unclear in play.
 * The score now uses the beam result directly: crystals are automatic bonus
 * points, and ghosts are automatic penalties.
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
