import { setRequestLocale } from "next-intl/server";

import { Hero } from "@/components/sections/hero";
import { Proof } from "@/components/sections/proof";
import { Replay } from "@/components/sections/replay";
import { Security } from "@/components/sections/security";
import { Setup } from "@/components/sections/setup";
import { Start } from "@/components/sections/start";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <div className="shell">
        <div className="hairline" />
      </div>
      <Proof />
      <Setup />
      <Replay />
      <Security />
      <Start />
    </>
  );
}
