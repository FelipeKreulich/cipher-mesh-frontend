import en from "@/../messages/en.json";
import pt from "@/../messages/pt.json";
import { ogContentType, ogSize, openGraphCard } from "@/lib/open-graph";
import { routing } from "@/i18n/routing";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "CipherMesh security";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function SecurityOpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = locale === "pt" ? pt.pages.security : en.pages.security;
  return openGraphCard({
    title: copy.title,
    lead: copy.lead,
    command: "$ ciphermesh --security",
  });
}
