# ピカッと！おばけミラー

Vite + React + Phaser + TypeScript/JavaScript 混在構成の交代制パズルミニゲームです。

## 実装済み

- `src/app/App.tsx` で Start / Game / Result を管理
- `src/app/screens/StartScreen/StartScreen.tsx`
- `src/app/screens/GameScreen/GameScreen.tsx`
- `src/app/screens/ResultScreen/ResultScreen.tsx`
- `src/game/GameManager.ts` で Phaser 起動と Result 返却
- 操作は鏡クリック回転のみ
- 3R固定
- 難易度は EASY / NORMAL / HARD
- 難易度ごとの盤面サイズ
  - EASY: 8×8
  - NORMAL: 9×8
  - HARD: 9×9
- 色ライト / 色ゴール
- NORMAL 以上で複数ライト
- HARD で分岐ギミック候補
- クリアルートのリプレイ演出
- 小さい整数スコア
- BGM / SE
- PNG素材のみ

## 実行

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

## ZIP方針

提出ZIPには以下を含めません。

- `node_modules/`
- `dist/`
- `public/`
- `.svg`

素材は `resources/` に入れています。

## 完成版追加調整

今回の完成版では、以下を追加しています。

- Player交代をゲーム画面上のポップアップ + 自動カウントダウンに変更
- タイトル画面のアトラクトデモを、小さい盤面が動く見本に変更
- 遊び方は動画風の光ルート見本を維持
- NORMAL/HARDで複数色ライト・色ゴールを使用
- NORMAL/HARDに固定ミラーを追加
  - 固定ミラーは解法向きに固定されるため、理不尽な障害ではなく読み取り用の盤面ヒントとして扱う
- HARDでは分岐候補を維持
- クリア時は光ルートリプレイを表示
- 操作は鏡クリック回転のみ

- Turn intro safe-area fix: player labels no longer tween to the top edge; HOW TO score page is compressed to avoid clipping.

## 配置バランス修正

- NORMAL/HARDの追加ライトを左端開始に整理
- 複数ライト同士の開始位置・ゴール位置の重なりを検証
- 追加ライト用の鏡ルートを生成し、解法では全ライトが同色ゴールへ届くように修正
- 初期状態で即CLEARにならないことを強化チェックに追加
- 追加ライト・追加ゴールが盤面外に出ないことをチェック

## ソースコメント整備
- `src/` と `scripts/` の主要ソースにファイル責務コメントを追加しました。
- `GameManager.ts`、`MirrorPartyScene.js`、Renderer / Manager / Director 系に処理意図コメントを追加しました。
- `npm run test:quality` で `commentedSourceFiles` を出力し、ソース冒頭コメントの存在を確認します。


[コメント見直し]
- 先輩向けの文言を削除し、ファイル責務・連携先・ゲーム内での意図が分かるコメントへ整理しました。
- 自動品質チェックで「先輩」などの相手依存コメントが残らないことを確認します。


## UI安全領域修正
- Game画面の時間・回数・FEVER表示を右側HUDへ分離し、重なりにくい配置へ修正。
- React Result画面の `.result-shell` に `display: flex` を追加し、中央寄せ指定が効くよう修正。
- `scripts/quality-check.js` にHUD分離とResult中央寄せの再発防止チェックを追加。
