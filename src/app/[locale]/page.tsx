import { setRequestLocale } from "next-intl/server";

import { Community } from "@/components/sections/community";
import { Controls } from "@/components/sections/controls";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { Limits } from "@/components/sections/limits";
import { OpenSource } from "@/components/sections/open-source";
import { Plugins } from "@/components/sections/plugins";
import { Proof } from "@/components/sections/proof";
import { Replay } from "@/components/sections/replay";
import { Security } from "@/components/sections/security";
import { Start } from "@/components/sections/start";
import { Support } from "@/components/sections/support";
import { Verify } from "@/components/sections/verify";
import { Versus } from "@/components/sections/versus";

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
      {/* Numbers, then the thing actually running — a visitor should see it
          work before reading a word about how it works. Then the two halves of
          the claim: the relay cannot read you, and you can tell who is on the
          other end. The limits and the Signal question close that argument
          honestly, and only then is it fair to ask anyone to install it. */}
      <Replay />
      <Features />
      <Security />
      <Verify />
      <Limits />
      <Versus />
      <Start />
      <Community />
      <Controls />
      <Plugins />
      <OpenSource />
      <Support />
    </>
  );
}
