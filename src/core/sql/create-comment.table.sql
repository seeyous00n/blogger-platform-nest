DROP TABLE IF EXISTS "comment";

CREATE TABLE "comment"
(
    id              serial,
    user_id         integer NOT NULL,
    post_id         integer NOT NULL,
    content         varchar NOT NULL,
    deletion_status boolean                  DEFAULT false,
    created_at      timestamp with time zone DEFAULT now(),

    CONSTRAINT pk_comment_id PRIMARY KEY (id),
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES "post" (id) ON DELETE CASCADE
);