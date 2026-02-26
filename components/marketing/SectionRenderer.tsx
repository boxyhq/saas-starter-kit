import RichTextRenderer from './RichTextRenderer';
import type { JSONContent } from '@tiptap/react';

interface PageSection {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
}

interface Props {
  sections: PageSection[];
}

// ─── Individual section renderers ──────────────────────────────────────────

const HeroSection: React.FC<{ content: Record<string, unknown> }> = ({ content }) => (
  <section
    className="py-20 px-6 text-center"
    style={{ backgroundImage: content.bgImage ? `url(${content.bgImage})` : undefined }}
  >
    <div className="max-w-3xl mx-auto">
      {content.headline && (
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{content.headline as string}</h1>
      )}
      {content.subtext && (
        <p className="text-lg text-base-content/70 mb-8">{content.subtext as string}</p>
      )}
      <div className="flex flex-wrap gap-4 justify-center">
        {content.cta1Label && (
          <a href={(content.cta1Url as string) ?? '#'} className="btn btn-primary btn-lg">
            {content.cta1Label as string}
          </a>
        )}
        {content.cta2Label && (
          <a href={(content.cta2Url as string) ?? '#'} className="btn btn-outline btn-lg">
            {content.cta2Label as string}
          </a>
        )}
      </div>
    </div>
  </section>
);

const FeaturesSection: React.FC<{ content: Record<string, unknown> }> = ({ content }) => {
  const cards = (content.cards as Array<{ icon: string; title: string; description: string }>) ?? [];
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-base">{card.title}</h3>
              <p className="text-sm text-base-content/70">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const CtaSection: React.FC<{ content: Record<string, unknown> }> = ({ content }) => (
  <section
    className="py-16 px-6 text-center text-white"
    style={{ backgroundColor: (content.bgColor as string) ?? '#1a56db' }}
  >
    <div className="max-w-2xl mx-auto">
      {content.headline && <h2 className="text-3xl font-bold mb-4">{content.headline as string}</h2>}
      {content.subtext && <p className="text-lg opacity-90 mb-8">{content.subtext as string}</p>}
      {content.buttonLabel && (
        <a href={(content.buttonUrl as string) ?? '#'} className="btn btn-white btn-lg">
          {content.buttonLabel as string}
        </a>
      )}
    </div>
  </section>
);

const FaqSection: React.FC<{ content: Record<string, unknown> }> = ({ content }) => {
  const items = (content.items as Array<{ question: string; answer: string }>) ?? [];
  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {items.map((item, i) => (
          <div key={i} className="collapse collapse-arrow border border-base-300 rounded-lg">
            <input type="radio" name="faq" />
            <div className="collapse-title font-medium">{item.question}</div>
            <div className="collapse-content"><p className="text-base-content/70">{item.answer}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── Main renderer ──────────────────────────────────────────────────────────

const SectionRenderer: React.FC<Props> = ({ sections }) => (
  <div>
    {sections.map((section) => {
      switch (section.type) {
        case 'richtext':
          return (
            <section key={section.id} className="py-12 px-6 max-w-4xl mx-auto">
              <RichTextRenderer content={(section.content.doc as JSONContent) ?? section.content as any} />
            </section>
          );
        case 'hero':
          return <HeroSection key={section.id} content={section.content} />;
        case 'features_grid':
          return <FeaturesSection key={section.id} content={section.content} />;
        case 'cta':
          return <CtaSection key={section.id} content={section.content} />;
        case 'faq':
          return <FaqSection key={section.id} content={section.content} />;
        default:
          return null;
      }
    })}
  </div>
);

export default SectionRenderer;
