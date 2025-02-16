DROP TABLE IF EXISTS "blog" CASCADE;

CREATE TABLE blog
(
    id              serial,
    name            varchar NOT NULL COLLATE "C",
    description     varchar NOT NULL,
    website_url     varchar NOT NULL,
    is_membership   boolean                  DEFAULT false,
    deletion_status boolean                  DEFAULT false,
    created_at      timestamp with time zone DEFAULT now(),

    CONSTRAINT pk_blog_id PRIMARY KEY (id)
);