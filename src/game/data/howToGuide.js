/**
 * タイトル画面とゲーム中ヘルプで使う遊び方データです。
 * 画面側はこのデータを読むだけにして、説明文と表示順の変更を一か所で管理します。
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
    title: 'ギミック',
    badge: 'GIMMICK',
    lead: '出てくるものを押すと、役割の説明が切り替わります。',
    callout: '操作するのは回転鏡だけ。ほかはルートを変える条件です。',
    cards: [
      ['mirror-slash', '回転鏡', 'クリックで回る'],
      ['mirror-backslash', '固定鏡', '回らない'],
      ['wall', '壁', '光が止まる'],
      ['portal', 'ワープ', '別マスへ移動'],
      ['beam-spark', '分岐', '光が分かれる'],
      ['ghost', 'おばけ', '当てずに避ける'],
    ],
    interactions: [
      {
        icon: 'mirror-slash',
        title: '回転鏡',
        role: '操作できる',
        action: 'クリックで回転',
        result: '唯一操作できるマスです。光の曲がる向きを変えます。',
        tip: '迷ったら、まず鏡を1つ回して光の道を見ます。',
      },
      {
        icon: 'mirror-backslash',
        title: '固定鏡',
        role: '見るだけ',
        action: 'クリック不可',
        result: '向きが固定された鏡です。必ずその向きで光を曲げます。',
        tip: '邪魔ではなく、正解ルートの手がかりとして見ます。',
      },
      {
        icon: 'wall',
        title: '壁',
        role: '障害物',
        action: '光を止める',
        result: '光が当たるとそこで止まります。ゴールには届きません。',
        tip: '壁に当たるルートは外れです。別の鏡で迂回します。',
      },
      {
        icon: 'portal',
        title: 'ワープ',
        role: '移動先を見る',
        action: '光が移動',
        result: '入った光が、別のワープ地点から出ます。',
        tip: '入口だけでなく、出口側の向きも見て考えます。',
      },
      {
        icon: 'beam-spark',
        title: '分岐',
        role: '複数ゴール用',
        action: '光が分かれる',
        result: '1本の光が複数方向へ分かれます。複数ゴールを狙いやすくなります。',
        tip: 'HARDでは分岐を使うと得点につながります。',
      },
      {
        icon: 'ghost',
        title: 'おばけ',
        role: '避ける対象',
        action: '当てない',
        result: '光が当たると減点になります。避けてクリアすると加点対象です。',
        tip: 'ゴールだけでなく、危ないマスを避けるルートも見ます。',
      },
    ],
  },
  {
    number: 3,
    title: 'スコア',
    badge: 'SCORE',
    lead: '現在点と最大目安を見ながら、FINISHで確定します。',
    callout: 'ゴール後も即終了しません。狙いを確認してFINISHします。',
    cards: [
      ['perfect-star', 'CLEAR', '+2'],
      ['crystal', '水晶', '+1'],
      ['beam-spark', '分岐', '+1'],
      ['ghost', 'おばけ', '避けると+1'],
    ],
  },
];
