import { redirect } from "next/navigation";

/** Keep the earlier camelCase path working while URLs shown by the site use slugs. */
export default async function LegacyGettingStartedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/getting-started`);
}
