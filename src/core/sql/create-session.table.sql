DROP TABLE IF EXISTS "session";

CREATE TABLE session
(
    id               serial,
    user_id          integer NOT NULL,
    token_iat        integer NOT NULL,
    token_exp        integer NOT NULL,
    ip               varchar NOT NULL,
    title            varchar NOT NULL,
    device_id        varchar NOT NULL,
    last_active_date timestamp with time zone DEFAULT now(),

    CONSTRAINT pk_session_id PRIMARY KEY (id),
    CONSTRAINT fk_session_user FOREIGN KEY (user_id)
        REFERENCES "user" (id)
        ON DELETE CASCADE
)

ALTER TABLE "session"
    ADD CONSTRAINT pk_session PRIMARY KEY (id);

ALTER TABLE "session"
    ADD CONSTRAINT fk_session FOREIGN KEY (user_id) REFERENCES "user" (id);