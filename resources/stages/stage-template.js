// v9 stage template.
// Add this object to src/game/data/stages.js, then run npm run test:quality.
// Required rule: initial mirrors must NOT clear immediately, and solutionType must clear.

export const stageTemplate = {
  id: 'new-stage-id',
  name: '新ステージ名',
  mission: 'ミッション説明',
  missionType: 'crystals', // crystals / portal / noGhost / lowRotate / speed / perfect
  par: 4,
  emitter: { x: 0, y: 3, dir: 'right' },
  goal: { x: 7, y: 3 },
  mirrors: [
    { x: 2, y: 3, type: '/', solutionType: '\\' },
    { x: 4, y: 5, type: '\\', solutionType: '/' },
  ],
  crystals: [
    { x: 3, y: 5 },
  ],
  ghosts: [
    { x: 5, y: 3 },
  ],
  walls: [
    { x: 1, y: 1 },
  ],
  portals: [],
};
