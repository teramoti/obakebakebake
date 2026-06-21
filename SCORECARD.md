# SCORECARD

自己評価用です。外部賞の公式評価ではありません。

## 確認済み

- npm run test:quality OK
- npm run lint OK
- npm run build OK
- publicなし
- distなし
- node_modulesなし
- svgなし
- PNG素材のみ
- App / Screen / GameManager.ts 構造
- Resultは GameManager.ts 経由でReact側へ返却

## 今回入れたパズル強化

- 色ライト
- 色ゴール
- 複数ライト同時クリア
- 分岐ギミック候補
- クリアルートのリプレイ演出

## 現時点の厳しめ評価

- 構成: 8/10
- UI: 7/10
- 操作理解: 8/10
- パズル性: 7/10
- 観戦性: 6/10
- テンポ: 6/10
- 演出・音: 7/10
- 保守性: 8/10

総合目安: 74/100

## 未確認

- 4人×全難易度の手動通しプレイ
- 全画面サイズ目視確認
- 外部本体側との実連携
- CESA等の外部公式評価

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

## ソースコメント
- 主要ソースへファイル責務コメントを追加。
- GameManager / Scene / Renderer / Manager / Director 系へ処理意図コメントを追加。
- 自動チェックで commentedSourceFiles を出力。


[コメント見直し]
- 先輩向けの文言を削除し、ファイル責務・連携先・ゲーム内での意図が分かるコメントへ整理しました。
- 自動品質チェックで「先輩」などの相手依存コメントが残らないことを確認します。


## UI安全領域修正
- Game画面の時間・回数・FEVER表示を右側HUDへ分離し、重なりにくい配置へ修正。
- React Result画面の `.result-shell` に `display: flex` を追加し、中央寄せ指定が効くよう修正。
- `scripts/quality-check.js` にHUD分離とResult中央寄せの再発防止チェックを追加。
