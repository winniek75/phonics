/**
 * Google Text-to-Speech用のユーティリティ
 * 英単語の音声を自動生成
 */

export interface TTSOptions {
  lang?: string;
  slow?: boolean;
  encoding?: 'MP3' | 'OGG_OPUS' | 'LINEAR16' | 'MULAW';
}

/**
 * Google TTSのURLを生成
 */
export function getGoogleTTSUrl(
  text: string,
  options: TTSOptions = {}
): string {
  const {
    lang = 'en-US',
    slow = false,
    encoding = 'MP3'
  } = options;

  // URLエンコードしたテキスト
  const encodedText = encodeURIComponent(text);

  // Google Translate TTSエンドポイント（無料版）
  const baseUrl = 'https://translate.google.com/translate_tts';

  // パラメータの構築
  const params = new URLSearchParams({
    ie: 'UTF-8',
    q: text,
    tl: lang,
    client: 'tw-ob',
    ttsspeed: slow ? '0.5' : '1'
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Web Speech API（ブラウザネイティブ）を使用した音声合成
 * Google TTSが使えない場合のフォールバック
 */
export function speakText(
  text: string,
  options: {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Web Speech API is not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // オプションの設定
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);

    // 実行前に既存の音声をクリア
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * テキストが英単語かどうかを判定
 */
export function isWord(text: string): boolean {
  // 英単語のパターン（スペースなし、数字なし、基本的なアルファベットのみ）
  return /^[a-zA-Z]+$/.test(text);
}

/**
 * 音素のテキストを音声用に変換
 * 例: "oo_short" -> "oo", "ai" -> "ai"
 */
export function formatPhonemeForTTS(phoneme: string): string {
  return phoneme
    .replace(/_short|_long/g, '')
    .replace(/[^a-zA-Z]/g, '');
}