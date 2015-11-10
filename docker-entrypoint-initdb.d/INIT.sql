--create types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'level') THEN
        CREATE TYPE level AS ENUM
           ('notice',
            'warning',
            'error');
    END IF;
END$$;


-- Table: pa11y

-- DROP TABLE pa11y;

CREATE TABLE IF NOT EXISTS pa11y
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
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1
    FROM   pg_class
    JOIN   pg_namespace
    ON pg_namespace.oid = pg_class.relnamespace
    WHERE  pg_class.relname = 'pa11y_code_idx'
    AND    pg_namespace.nspname = 'public'
    ) THEN
    CREATE INDEX pa11y_code_idx
      ON pa11y
      USING btree
      (code COLLATE pg_catalog."default");
END IF;
END$$;

-- Index: pa11y_origin_idx

-- DROP INDEX pa11y_origin_idx;
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1
    FROM   pg_class
    JOIN   pg_namespace
    ON pg_namespace.oid = pg_class.relnamespace
    WHERE  pg_class.relname = 'pa11y_origin_idx'
    AND    pg_namespace.nspname = 'public'
    ) THEN
    CREATE INDEX pa11y_origin_idx
      ON pa11y
      USING btree
      (origin COLLATE pg_catalog."default");
END IF;
END$$;

-- Index: pa11y_level_idx

-- DROP INDEX pa11y_level_idx;
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1
    FROM   pg_class
    JOIN   pg_namespace
    ON pg_namespace.oid = pg_class.relnamespace
    WHERE  pg_class.relname = 'pa11y_level_idx'
    AND    pg_namespace.nspname = 'public'
    ) THEN
    CREATE INDEX pa11y_level_idx
      ON pa11y
      USING btree
      (level);
END IF;
END$$;

-- Index: pa11y_reverse_dns_idx

-- DROP INDEX pa11y_reverse_dns_idx;
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1
    FROM   pg_class
    JOIN   pg_namespace
    ON pg_namespace.oid = pg_class.relnamespace
    WHERE  pg_class.relname = 'pa11y_reverse_dns_idx'
    AND    pg_namespace.nspname = 'public'
    ) THEN
    CREATE INDEX pa11y_reverse_dns_idx
      ON pa11y
      USING btree
      (reverse_dns COLLATE pg_catalog."default");
END IF;
END$$;
