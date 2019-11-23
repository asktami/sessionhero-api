CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    rating INTEGER NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    date_modified TIMESTAMP DEFAULT now() NOT NULL,
    sessionId INTEGER
        REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
    userId INTEGER
        REFERENCES users(id) ON DELETE CASCADE NOT NULL
);
