import { BackHome } from "@/components/site/back-home";
import { Reveal } from "@/components/site/reveal";
import ScrambledText from "@/components/ScrambledText";

type PageIntroProps = {
  prompt: string;
  title: string;
  lead: string;
};

/** Shared page chrome for the deeper material that no longer belongs on home. */
export async function PageIntro({ prompt, title, lead }: PageIntroProps) {
  return (
    <div className="shell pt-16 sm:pt-24">
      <BackHome />
      <Reveal>
        <p className="prompt mt-8">{prompt}</p>
        <h1 className="mt-5 max-w-3xl font-display text-section leading-[1.06] tracking-tight text-balance text-ink">
          <ScrambledText>{title}</ScrambledText>
        </h1>
        <p className="prose-body mt-5 max-w-2xl">{lead}</p>
      </Reveal>
    </div>
  );
}
