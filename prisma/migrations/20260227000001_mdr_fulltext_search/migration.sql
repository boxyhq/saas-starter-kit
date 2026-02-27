-- MdrDocument full-text search vector
ALTER TABLE "MdrDocument" ADD COLUMN IF NOT EXISTS "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce("title", '') || ' ' ||
      coalesce("documentNumber", '') || ' ' ||
      coalesce("discipline", '') || ' ' ||
      coalesce("filename", '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS "MdrDocument_searchVector_idx"
  ON "MdrDocument" USING GIN("searchVector");
