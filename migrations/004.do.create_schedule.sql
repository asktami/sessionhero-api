CREATE TABLE schedule (
    id SERIAL PRIMARY KEY,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    sessionId VARCHAR
        REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
    userId INTEGER
        REFERENCES users(id) ON DELETE CASCADE NOT NULL
);
