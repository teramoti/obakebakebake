# ピカッと！おばけミラー

Vite + React + TypeScript + Phaser 4 で作成した、1〜4人交代制のパズル系ミニゲームです。

## ゲーム内容

鏡をクリックで回転させ、ライトの光を同じ色のゴールへつなぎます。  
NORMAL / HARD では複数ライトと色ゴールが出ます。HARD では分岐や固定ミラーも使います。

## 基本仕様

- プレイ人数: 1〜4人
- 難易度: EASY / NORMAL / HARD
- ラウンド数: 3R固定
- 操作: 鏡クリックで回転のみ
- 結果: GameManager.ts 経由で React ResultScreen へ返却
- スコア: 小さい整数点
- 素材: resources/ 配下のPNG / WAV

## 画面構成

```text
src/
  main.tsx
  app/
    App.tsx
    screens/
      StartScreen/
      GameScreen/
      ResultScreen/
    types/game.ts
  game/
    GameManager.ts
    scenes/MirrorPartyScene.js
    systems/
```

## 実装済み要素

- 色ライト / 色ゴール
- 複数ライト同時クリア
- 固定ミラー
- 分岐候補
- 壁 / ワープ / おばけ
- HINT表示
- FINISH手動終了
- 自動交代カウントダウン
- ROUND別の狙い
- CLEAR後のルートリプレイ
- Resultの勝因表示 / ROUND別点数 / 表彰エリア
- タイトルのアトラクトデモ
- 遊び方2ページ目のギミック別説明切替

## 提出ZIPに含めないもの

```text
node_modules/
dist/
public/
*.svg
```

## 実行方法

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

現在の提出ZIPでは、上記3つが通る状態です。
