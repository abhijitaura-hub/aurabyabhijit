import SEO from "../components/SEO";
import { SectionHead, Reveal } from "../components/Motion";

const CONTENT = {
  privacy: {
    title: "Privacy Policy",
    path: "/privacy",
    intro: "This policy explains what information AURA by Abhijit collects and how it is used.",
    sections: [
      {
        h: "What we collect",
        p: "If you use the contact form, we collect your name, email address, optional organization, topic and message — solely to respond to your enquiry. No account is created and no newsletter is subscribed to without explicit consent.",
      },
      {
        h: "Analytics",
        p: "Privacy-respecting analytics may be enabled to understand aggregate reading patterns (pages viewed, approximate engagement). No advertising trackers are used.",
      },
      {
        h: "Data retention & your rights",
        p: "Contact messages are retained only as long as needed to handle the conversation. You may request deletion of your data at any time via the contact form.",
      },
      {
        h: "Review notice",
        p: "This policy is an editable placeholder prepared for launch review. It must receive final legal review before the public launch of aurabyabhijit.com.",
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    path: "/terms",
    intro: "These terms govern the use of the AURA by Abhijit website and its content.",
    sections: [
      {
        h: "Content",
        p: "Articles and frameworks published here reflect professional opinion and experience. They are educational perspectives, not professional advice for your specific situation.",
      },
      {
        h: "Intellectual property",
        p: "The AURA frameworks — including the Six Dimensions of Technology Leadership and the AURA Decision Framework — are the intellectual property of Abhijit Debnath. Sharing with attribution is welcome; reproduction without attribution is not.",
      },
      {
        h: "No warranties",
        p: "Content is provided as-is. Decisions about your technology strategy should consider your own context, constraints and professional advice.",
      },
      {
        h: "Review notice",
        p: "These terms are an editable placeholder prepared for launch review. They must receive final legal review before the public launch of aurabyabhijit.com.",
      },
    ],
  },
};

export default function Legal({ kind }) {
  const c = CONTENT[kind];
  return (
    <>
      <SEO title={c.title} description={c.intro} path={c.path} />
      <section className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:pt-44" data-testid={`legal-${kind}`}>
        <SectionHead index="L" overline="Legal" title={c.title} lede={c.intro} />
        <div className="mt-14 space-y-10">
          {c.sections.map((s) => (
            <Reveal key={s.h}>
              <h2 className="font-display text-xl font-semibold text-white">{s.h}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 md:text-base">{s.p}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
