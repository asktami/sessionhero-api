CREATE TABLE schedule (
    id SERIAL PRIMARY KEY,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    session_id VARCHAR
        REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER
        REFERENCES users(id) ON DELETE CASCADE NOT NULL
);
