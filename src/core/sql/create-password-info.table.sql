DROP TABLE IF EXISTS "password_info";

CREATE TABLE "password_info"
(
    id                       serial,
    password_recovery_code   varchar                  DEFAULT NULL,
    password_expiration_date timestamp with time zone DEFAULT NULL,
    user_id                  integer NOT NULL,

    CONSTRAINT pk_password_info_id PRIMARY KEY (id),
    CONSTRAINT fk_password_info_user FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE
)