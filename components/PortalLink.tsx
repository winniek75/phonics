// ポータル（学習ホーム）へもどる控えめなリンク。同一タブで遷移する。
export const PORTAL_URL = "https://wise-english-portal.vercel.app";

export default function PortalLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={PORTAL_URL}
      className={`inline-block text-sm font-bold text-gray-500 underline underline-offset-4 hover:text-gray-700 ${className}`}
    >
      🏠 学習ホームにもどる
    </a>
  );
}
