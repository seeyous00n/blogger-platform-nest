DROP TABLE IF EXISTS "user";

CREATE TABLE "user"
(
    id                         serial,
    login                      varchar NOT NULL COLLATE "C",
    email                      varchar NOT NULL,
    password_hash              varchar NOT NULL,
    password_recovery_code     varchar                  DEFAULT NULL,
    password_expiration_date   timestamp with time zone DEFAULT NULL,
    email_confirmation_code    varchar                  DEFAULT NULL,
    email_is_confirmed         boolean                  DEFAULT false,
    email_code_expiration_date timestamp with time zone DEFAULT NULL,
    deletion_status            boolean                  DEFAULT false,
    created_at                 timestamp with time zone DEFAULT now(),

    CONSTRAINT pk_user_id PRIMARY KEY (id)
)