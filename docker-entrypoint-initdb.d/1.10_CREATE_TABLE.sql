-- Table: pa11y

-- DROP TABLE pa11y;

CREATE TABLE pa11y
(
  id serial NOT NULL,
  reverse_dns text,
  crawled timestamp with time zone,
  original_url text,
  code character varying,
  context text,
  message text,
  selector text,
  origin character varying,
  level level,
  loaded timestamp with time zone DEFAULT now(),
  CONSTRAINT pa11y_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);

-- Index: pa11y_code_idx

-- DROP INDEX pa11y_code_idx;

CREATE INDEX pa11y_code_idx
  ON pa11y
  USING btree
  (code COLLATE pg_catalog."default");

-- Index: pa11y_origin_idx

-- DROP INDEX pa11y_origin_idx;

CREATE INDEX pa11y_origin_idx
  ON pa11y
  USING btree
  (origin COLLATE pg_catalog."default");

-- Index: pa11y_level_idx

-- DROP INDEX pa11y_level_idx;

CREATE INDEX pa11y_level_idx
  ON pa11y
  USING btree
  (level);

-- Index: pa11y_reverse_dns_idx

-- DROP INDEX pa11y_reverse_dns_idx;

CREATE INDEX pa11y_reverse_dns_idx
  ON pa11y
  USING btree
  (reverse_dns COLLATE pg_catalog."default");
