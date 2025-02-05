DROP TABLE IF EXISTS "like";

CREATE TABLE "like"
(
    id          serial,
    status      varchar NOT NULL,
    author_id   integer NOT NULL,
    parent_id   integer NOT NULL,
    is_new_like integer NOT NULL,
    created_at  timestamp with time zone DEFAULT now(),

    CONSTRAINT pk_like_id PRIMARY KEY (id),
    CONSTRAINT fk_like_user FOREIGN KEY (author_id) REFERENCES "user" (id) ON DELETE CASCADE
);

-- DROP TABLE IF EXISTS "like";
--
-- CREATE TABLE "like"
-- (
--     id          serial,
--     status      varchar NOT NULL,
--     author_id   integer NOT NULL,
--     post_id     integer NULL,
--     comment_id  integer NULL,
--     is_new_like integer NOT NULL,
--     created_at  timestamp with time zone DEFAULT now(),
--
--     CONSTRAINT pk_like_id PRIMARY KEY (id),
--     CONSTRAINT fk_like_user FOREIGN KEY (author_id) REFERENCES "user" (id) ON DELETE CASCADE,
--     CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES "post" (id) ON DELETE CASCADE,
--     CONSTRAINT fk_like_comment FOREIGN KEY (comment_id) REFERENCES "comment" (id) ON DELETE CASCADEб
--         CONSTRAINT check_parent CHECK (
--         (post_id IS NOT NULL AND comment_id IS NULL) OR
--         (post_id IS NULL AND comment_id IS NOT NULL)
--         )
-- );