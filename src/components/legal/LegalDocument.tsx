import type { LegalDoc } from '@/data/legal'

/** Plain, readable layout for privacy and terms. Shows the draft warning until the text is final. */
export function LegalDocument({ doc, eyebrow }: { doc: LegalDoc; eyebrow: string }) {
  return (
    <main className="min-h-screen bg-white pb-24 pt-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-deep">
          <span aria-hidden className="h-px w-8 bg-brand-gold-deep" />
          {eyebrow}
        </p>
        <h1 className="mb-3 text-4xl uppercase text-brand-navy sm:text-5xl">{doc.title}</h1>
        <p className="mb-8 text-sm text-brand-navy/50">{doc.updated}</p>
        <p className="mb-12 rounded-2xl border border-brand-line bg-brand-cream p-5 text-sm leading-relaxed text-brand-navy/70">{doc.draft}</p>

        <div className="space-y-10">
          {doc.sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="mb-3 text-2xl uppercase text-brand-navy">
                {i + 1}. {s.title}
              </h2>
              <div className="space-y-3 text-base leading-relaxed text-brand-navy/75">
                {s.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
