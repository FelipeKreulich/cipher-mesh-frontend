import { setRequestLocale } from "next-intl/server";

import { Community } from "@/components/sections/community";
import { Controls } from "@/components/sections/controls";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { OpenSource } from "@/components/sections/open-source";
import { Plugins } from "@/components/sections/plugins";
import { Proof } from "@/components/sections/proof";
import { Security } from "@/components/sections/security";
import { Start } from "@/components/sections/start";
import { Support } from "@/components/sections/support";
import { Verify } from "@/components/sections/verify";

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
      {/* Claim, then the two halves of the claim: the relay cannot read you,
          and you can tell who is on the other end. Then how to start, who is
          already there, and only after that the deeper controls. */}
      <Features />
      <Security />
      <Verify />
      <Start />
      <Community />
      <Controls />
      <Plugins />
      <OpenSource />
      <Support />
    </>
  );
}
