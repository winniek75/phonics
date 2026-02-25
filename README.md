# 🌸 Jolly Phonics Learning App

子ども向けフォニックス学習Webアプリ（4〜7歳対象）

## 機能概要

### Phase 1 ✅ ホーム・コアデータ
- **花園UI** (`/`) — 7グループ×6音素の花びらナビゲーション
- **42音素データ** — 全音素の完全なデータセット
- **72 Tricky Words** — グループ別段階導入
- **Zustand + localStorage** — 進捗の永続化
- **useAudio フック** — 音声ファイル未存在時のサイレントフォールバック

### Phase 2 ✅ コア学習体験
- **音素レッスン** (`/phoneme/[id]`) — 音声・書き順・例文・ストーリー・アクション
- **SVG書き順アニメーション** — 26文字+ダイグラフのストローク描画
- **進捗画面** (`/progress`) — プロフィール編集・グループ別進捗・スコア一覧

### Phase 3 ✅ ゲーム
- **🎵 Blending** — 音素を聞いて単語を合成（10問/セッション）
- **🧩 Segmenting** — 単語を音素に分解（タップ入力）
- **🌟 Tricky Words** — フラッシュカード式の不規則語認識
- **🔤 Letter Match** — 音声と文字の対応付け

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# Vercelデプロイ
npx vercel --prod
```

## 音声ファイルの追加

```
public/
└── audio/
    ├── phonemes/    ← s.mp3, a.mp3, ai.mp3, oo_short.mp3, oo_long.mp3...
    ├── words/       ← sun.mp3, sat.mp3, sock.mp3...
    └── tricky/      ← the.mp3, said.mp3, was.mp3...
```

音声ファイルが存在しない場合でもアプリは正常動作します（コンソールに警告のみ）。

## 技術スタック

| 技術 | 用途 |
|------|------|
| Next.js 14 (App Router) | フレームワーク |
| Tailwind CSS | スタイリング |
| Framer Motion | アニメーション |
| Zustand | 状態管理 |
| localStorage | 進捗永続化 |

## 著作権について

Jolly Phonicsのキャラクター・音声・イラストは著作権保護のため、
本アプリは完全にオリジナルコンテンツで実装されています。
フォニックスの教育メソッド自体はオープンドメインです。
