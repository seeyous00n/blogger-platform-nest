DROP TABLE IF EXISTS "user";

CREATE TABLE "user"
(
    id                         serial,
    login                      varchar NOT NULL COLLATE "C",
    email                      varchar NOT NULL,
    password_hash              varchar NOT NULL,
    deletion_status            boolean                  DEFAULT false,
    created_at                 timestamp with time zone DEFAULT now(),

    CONSTRAINT pk_user_id PRIMARY KEY (id)
)