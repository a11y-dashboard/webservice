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

-- Index: a11y_origin_idx

-- DROP INDEX a11y_origin_idx;
DO $$
BEGIN
IF NOT EXISTS (
    SELECT 1
    FROM   pg_class
    JOIN   pg_namespace
    ON pg_namespace.oid = pg_class.relnamespace
    WHERE  pg_class.relname = 'a11y_origin_idx'
    AND    pg_namespace.nspname = 'public'
    ) THEN
    CREATE INDEX a11y_origin_idx
      ON a11y
      USING btree
      (origin COLLATE pg_catalog."default");
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
