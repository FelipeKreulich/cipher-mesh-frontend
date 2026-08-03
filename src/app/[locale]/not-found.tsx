import { useTranslations } from "next-intl";

import { GitHubIcon } from "@/components/site/icons";
import { StatusPage } from "@/components/site/status-page";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <StatusPage
      prompt={t("prompt")}
      code={t("code")}
      output={t("output")}
      title={t("title")}
      body={t("body")}
    >
      <Button asChild size="lg" className="h-10 px-4">
        <Link href="/">{t("home")}</Link>
      </Button>
      <Button asChild variant="outline" size="lg" className="h-10 px-4">
        <a href={site.repo} target="_blank" rel="noreferrer noopener">
          <GitHubIcon className="size-4" />
          {t("repo")}
        </a>
      </Button>
    </StatusPage>
  );
}
