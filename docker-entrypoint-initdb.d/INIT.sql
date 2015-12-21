--create types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'level') THEN
        CREATE TYPE level AS ENUM
           ('notice',
            'warning',
            'error');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'library') THEN
        CREATE TYPE library AS ENUM
            ('axe',
             'htmlcs',
             'a11y-dev-tools');
    END IF;
END$$;


-- Table: a11y

-- DROP TABLE a11y;

CREATE TABLE IF NOT EXISTS a11y
(
  id serial NOT NULL,
  reverse_dns text NOT NULL,
  crawled timestamp with time zone,
  original_url text NOT NULL,
  code character varying NOT NULL,
  context text,
  message text,
  selector text,
  origin_project character varying NOT NULL,
  origin_library library NOT NULL,
  level level NOT NULL,
  standard text,
  loaded timestamp with time zone DEFAULT now(),
  CONSTRAINT a11y_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);

-- Index: a11y_code_idx

-- DROP INDEX a11y_code_idx;
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1
    FROM   pg_class
    JOIN   pg_namespace
    ON pg_namespace.oid = pg_class.relnamespace
    WHERE  pg_class.relname = 'a11y_code_idx'
    AND    pg_namespace.nspname = 'public'
    ) THEN
    CREATE INDEX a11y_code_idx
      ON a11y
      USING btree
      (code COLLATE pg_catalog."default");
END IF;
END$$;

-- Index: a11y_origin_project_idx

-- DROP INDEX a11y_origin_project_idx;
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1
    FROM   pg_class
    JOIN   pg_namespace
    ON pg_namespace.oid = pg_class.relnamespace
    WHERE  pg_class.relname = 'a11y_origin_project_idx'
    AND    pg_namespace.nspname = 'public'
    ) THEN
    CREATE INDEX a11y_origin_project_idx
      ON a11y
      USING btree
      (origin_project COLLATE pg_catalog."default");
END IF;
END$$;

-- Index: a11y_level_idx

-- DROP INDEX a11y_level_idx;
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1
    FROM   pg_class
    JOIN   pg_namespace
    ON pg_namespace.oid = pg_class.relnamespace
    WHERE  pg_class.relname = 'a11y_level_idx'
    AND    pg_namespace.nspname = 'public'
    ) THEN
    CREATE INDEX a11y_level_idx
      ON a11y
      USING btree
      (level);
END IF;
END$$;

-- DROP INDEX a11y_standard_idx;
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1
    FROM   pg_class
    JOIN   pg_namespace
    ON pg_namespace.oid = pg_class.relnamespace
    WHERE  pg_class.relname = 'a11y_standard_idx'
    AND    pg_namespace.nspname = 'public'
    ) THEN
    CREATE INDEX a11y_standard_idx
      ON a11y
      USING btree
      (standard COLLATE pg_catalog."default");
END IF;
END$$;

-- DROP INDEX a11y_origin_library_idx;
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1
    FROM   pg_class
    JOIN   pg_namespace
    ON pg_namespace.oid = pg_class.relnamespace
    WHERE  pg_class.relname = 'a11y_origin_library_idx'
    AND    pg_namespace.nspname = 'public'
    ) THEN
    CREATE INDEX a11y_origin_library_idx
      ON a11y
      USING btree
      (origin_library);
END IF;
END$$;

-- Index: a11y_reverse_dns_idx

-- DROP INDEX a11y_reverse_dns_idx;
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1
    FROM   pg_class
    JOIN   pg_namespace
    ON pg_namespace.oid = pg_class.relnamespace
    WHERE  pg_class.relname = 'a11y_reverse_dns_idx'
    AND    pg_namespace.nspname = 'public'
    ) THEN
    CREATE INDEX a11y_reverse_dns_idx
      ON a11y
      USING btree
      (reverse_dns COLLATE pg_catalog."default");
END IF;
END$$;

-- DROP INDEX a11y_crawled_idx;
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1
    FROM   pg_class
    JOIN   pg_namespace
    ON pg_namespace.oid = pg_class.relnamespace
    WHERE  pg_class.relname = 'a11y_crawled_idx'
    AND    pg_namespace.nspname = 'public'
    ) THEN
    CREATE INDEX a11y_crawled_idx
      ON a11y
      USING btree
      (crawled DESC);
END IF;
END$$;

DROP MATERIALIZED VIEW IF EXISTS overview;

CREATE MATERIALIZED VIEW overview AS
 SELECT a11y.origin_project AS origin,
    date_part('epoch'::text, a11y.crawled) * 1000::double precision AS "timestamp",
    a11y.standard,
    a11y.level,
    count(*) AS count
   FROM a11y
  GROUP BY a11y.origin_project, a11y.crawled, a11y.standard, a11y.level
  ORDER BY a11y.origin_project, a11y.crawled DESC, a11y.standard, a11y.level
WITH DATA;
