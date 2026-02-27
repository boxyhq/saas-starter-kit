-- Add full-text search support to HelpArticle
-- The searchVector is auto-generated from title + excerpt + content (JSON text extraction)

ALTER TABLE "HelpArticle"
  ADD COLUMN IF NOT EXISTS "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' ||
      coalesce(excerpt, '') || ' ' ||
      coalesce(("content"->>'html')::text, '') || ' ' ||
      coalesce(("content"->>'body')::text, '') || ' ' ||
      coalesce(("content"->>'text')::text, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS "HelpArticle_searchVector_idx"
  ON "HelpArticle" USING GIN ("searchVector");
