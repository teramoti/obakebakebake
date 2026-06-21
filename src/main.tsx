/**
 * Reactアプリのエントリポイントです。
 * index.htmlのrootへAppを描画し、画面遷移はsrc/app/App.tsxへ委譲します。
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './main.css'

// Viteのindex.htmlから呼ばれるReact起動処理です。
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
