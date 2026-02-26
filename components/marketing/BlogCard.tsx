import Link from 'next/link';

interface Props {
  slug: string;
  title: string;
  seoDesc?: string | null;
  publishedAt?: string | null;
}

const BlogCard: React.FC<Props> = ({ slug, title, seoDesc, publishedAt }) => (
  <Link href={`/${slug}`} className="block group">
    <article className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow h-full">
      <div className="card-body">
        <h2 className="card-title text-lg group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h2>
        {seoDesc && (
          <p className="text-sm text-base-content/60 line-clamp-3">{seoDesc}</p>
        )}
        {publishedAt && (
          <p className="text-xs text-base-content/40 mt-auto pt-4">
            {new Date(publishedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        )}
      </div>
    </article>
  </Link>
);

export default BlogCard;
