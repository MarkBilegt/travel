import Image from 'next/image'
import { parseBody, type Block, type Inline } from '@/lib/articles'
import { ConsentVideo } from './ConsentVideo'

function renderInline(nodes: Inline[]): React.ReactNode[] {
  return nodes.map((n, i) => {
    switch (n.t) {
      case 'text':
        return n.v
      case 'bold':
        return <strong key={i}>{renderInline(n.v)}</strong>
      case 'italic':
        return <em key={i}>{renderInline(n.v)}</em>
      case 'link': {
        const external = /^https?:/i.test(n.href)
        return (
          <a key={i} href={n.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="font-semibold text-brand-gold-deep underline underline-offset-2 hover:text-brand-navy">
            {renderInline(n.v)}
          </a>
        )
      }
    }
  })
}

function renderBlock(b: Block, i: number) {
  switch (b.t) {
    case 'heading': {
      const cls = b.level === 2 ? 'mt-12 mb-4 text-3xl uppercase text-brand-navy' : b.level === 3 ? 'mt-10 mb-3 text-2xl uppercase text-brand-navy' : 'mt-8 mb-2 text-xl font-semibold text-brand-navy'
      const Tag = b.level === 2 ? 'h2' : b.level === 3 ? 'h3' : 'h4'
      return (
        <Tag key={i} className={cls}>
          {renderInline(b.v)}
        </Tag>
      )
    }
    case 'p':
      return <p key={i}>{renderInline(b.v)}</p>
    case 'list': {
      const Tag = b.ordered ? 'ol' : 'ul'
      return (
        <Tag key={i} className={b.ordered ? 'list-decimal space-y-1.5 pl-6' : 'list-disc space-y-1.5 pl-6'}>
          {b.items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </Tag>
      )
    }
    case 'quote':
      return (
        <blockquote key={i} className="border-l-4 border-brand-gold pl-5 italic text-brand-navy/70">
          {renderInline(b.v)}
        </blockquote>
      )
    case 'image':
      return (
        <figure key={i} className="my-8 overflow-hidden rounded-2xl">
          {/* Photos come from the media library or the old site: sizes are unknown, so the browser scales them */}
          <Image src={b.src} alt={b.alt} width={1600} height={1067} sizes="(min-width: 768px) 768px, 100vw" unoptimized className="h-auto w-full" />
          {b.alt && <figcaption className="mt-2 px-1 text-xs text-brand-navy/55">{b.alt}</figcaption>}
        </figure>
      )
    case 'video':
      return <ConsentVideo key={i} src={b.src} />
  }
}

/** Renders an article body (see lib/articles.ts for the format). Output is React elements only, never raw HTML. */
export function ArticleBody({ body }: { body: string }) {
  return <div className="space-y-5 text-lg leading-relaxed text-brand-navy/80">{parseBody(body).map(renderBlock)}</div>
}
