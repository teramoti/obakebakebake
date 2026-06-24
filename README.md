# ピカッと！おばけミラー

鏡をクリックで回転させ、ライトの光を同じ色のゴールへつなぐ交代制パズルミニゲームです。
1〜4人、3ラウンド固定、最後に順位が出ます。

## 起動

```bash
npm install
npm run dev
```

## 検証

```bash
npm run test:quality
npm run lint
npm run build
```

## 構成

```text
src/main.tsx
src/app/App.tsx
src/app/screens/StartScreen/StartScreen.tsx
src/app/screens/GameScreen/GameScreen.tsx
src/app/screens/ResultScreen/ResultScreen.tsx
src/game/GameManager.ts
src/game/scenes/MirrorPartyScene.js
src/game/systems/
```

React側は画面遷移とResult表示、Phaser側はゲーム本体を担当します。
GameManager.ts が React と Phaser の境界になり、ゲーム終了時の結果を React 側へ返します。

## ゲーム仕様

- 操作は鏡クリック回転のみ
- EASY / NORMAL / HARD の3モード
- 全モード3ラウンド固定
- EASY: 1色ライト
- NORMAL: 複数色ライト + 色ゴール + 固定ミラー
- HARD: 複数色ライト + 色ゴール + 固定ミラー + 分岐候補
- ライトは同じ色のゴールに入ると達成
- 全ライト達成でCLEAR
- Player交代は画面上ポップアップ + 自動カウントダウン
- Resultは順位、点数、クリア数、ボーナスを表示

## UI修正方針

- 盤面にHUDを重ねない
- 時間・回数・FEVERは右側HUDで分離
- ステージ名はプレイ中に出さない
- 小ボーナスは右側へまとめる
- Resultは中央寄せ
- P1/P2/P3/P4 表示が画面端にはみ出さない
- 遊び方は3ページ式で、光の動きを見せる

## ZIP方針

提出ZIPには以下を含めません。

```text
node_modules/
dist/
public/
*.svg
```

素材は `resources/` に入れています。

## 追加最終調整

- 盤面セルを難易度別に再調整しました。
  - EASY: 8x8 / cell 76
  - NORMAL: 9x8 / cell 70
  - HARD: 9x9 / cell 66
- 右側HUDの位置と幅を再調整し、時間・回数・FEVER・色達成を同じパネル内で重なりにくくしました。
- 小ボーナスチップの幅を広げ、右側の空白を使う構成にしました。
- 光線が盤面外へ大きくはみ出して見える問題を抑えるため、描画時の線端を盤面内へクランプしました。
- quality-checkにHUD位置と光線クランプのチェックを追加しました。

## 面白さ・フィードバック調整
- 色ちがいゴール、あと何色、壁停止、ループ、分岐成功を短いリアクションで表示します。
- CLEAR時に条件が良い場合はナイスCLEARとして小さな追加点を付けます。
- 操作は鏡クリック回転のみのまま、盤面側の判断と見せ場を増やしています。

## 面白さ追加調整

- `RoundRuleDirector.js` を追加し、3ラウンドごとに狙いを変えました。
  - ROUND 1: 色ちがいなしでCLEAR
  - ROUND 2: MOVEを2回以上残してCLEAR
  - ROUND 3: HARDは分岐、EASY/NORMALはミスなしCLEAR
- `TurnFeedbackDirector.js` を追加し、クリック後のリアクションとポップ表示をSceneから分離しました。
- Resultに勝因表示を追加しました。
- クリアルートリプレイに移動する光の粒を追加し、CLEAR後にルートが見えやすくなるようにしました。


## 最新修正: Result勝因表示
- React側ResultScreenに勝因バッジを追加しました。
- Resultで各プレイヤーのROUND別点数を表示するようにしました。
- Phaser終了後のReact Result画面で bgm-result / ranking / award 音を再生する処理を追加しました。
- test:quality / lint / build が通ることを確認しています。
