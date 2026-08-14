import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

/** The locale-aware link avoids sending a Portuguese visitor back to /en. */
export async function BackHome() {
  const t = await getTranslations("nav");

  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-sm border border-line px-3 py-2 font-mono text-xs text-faint transition-colors hover:border-signal-soft hover:text-ink focus-visible:outline-none"
    >
      <span aria-hidden="true">←</span>
      {t("backToHome")}
    </Link>
  );
}
