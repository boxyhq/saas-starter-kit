interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
}

interface Props {
  testimonials?: Testimonial[];
  headline?: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote: 'This platform cut our MDR submission time in half. The transmittal workflow alone saved us dozens of hours per project.',
    author: 'Sarah J.',
    role: 'Document Controller',
    company: 'Apex Engineering',
  },
  {
    quote: 'The email inbox routing is brilliant — attachments go straight into the right MDR section without any manual intervention.',
    author: 'Marcus T.',
    role: 'Project Manager',
    company: 'Pacific Infrastructure',
  },
  {
    quote: 'Branded PDF compilations, automated cover sheets, and a full audit trail. Everything our QA team needs in one place.',
    author: 'Priya N.',
    role: 'QA Lead',
    company: 'Meridian Consulting',
  },
];

const TestimonialsSection: React.FC<Props> = ({
  testimonials = DEFAULT_TESTIMONIALS,
  headline = 'Trusted by document control teams worldwide',
}) => (
  <section className="py-20 px-6 bg-base-200">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">{headline}</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <div key={i} className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <p className="text-base-content/80 italic mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3 mt-auto">
                {t.avatar ? (
                  <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {t.author[0]}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">{t.author}</p>
                  {(t.role || t.company) && (
                    <p className="text-xs text-base-content/50">
                      {[t.role, t.company].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
