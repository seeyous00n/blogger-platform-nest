DROP TABLE IF EXISTS "post";

CREATE TABLE "post"
(
    id                serial,
    title             varchar NOT NULL,
    short_description varchar NOT NULL,
    content           varchar NOT NULL,
    blog_id           integer NOT NULL,
    deletion_status   boolean                  DEFAULT false,
    created_at        timestamp with time zone DEFAULT now(),

    CONSTRAINT pk_post_id PRIMARY KEY (id),
    CONSTRAINT fk_post_blog FOREIGN KEY (blog_id) REFERENCES "blog" (id) ON DELETE CASCADE
);