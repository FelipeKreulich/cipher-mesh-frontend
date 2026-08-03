"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { StatusPage } from "@/components/site/status-page";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    // No analytics on this site, so the console is where a report comes from.
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      prompt={t("prompt")}
      code={t("code")}
      output={error.digest ? `${t("output")} (${error.digest})` : t("output")}
      title={t("title")}
      body={t("body")}
    >
      <Button size="lg" className="h-10 px-4" onClick={reset}>
        {t("retry")}
      </Button>
      <Button asChild variant="outline" size="lg" className="h-10 px-4">
        <Link href="/">{t("home")}</Link>
      </Button>
      <Button asChild variant="ghost" size="lg" className="h-10 px-4">
        <a href={site.issues} target="_blank" rel="noreferrer noopener">
          {t("issue")}
        </a>
      </Button>
    </StatusPage>
  );
}
