DROP TABLE IF EXISTS "email_info";

CREATE TABLE "email_info"
(
    id                         serial,
    email_confirmation_code    varchar                  DEFAULT NULL,
    email_is_confirmed         boolean                  DEFAULT false,
    email_code_expiration_date timestamp with time zone DEFAULT NULL,
    user_id                    integer NOT NULL,

    CONSTRAINT pk_email_info_id PRIMARY KEY (id),
    CONSTRAINT fk_email_info_user FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE
)