CREATE TABLE sessions(
  track       VARCHAR NOT NULL,
  day         VARCHAR(3) NOT NULL,
  date        DATE NOT NULL,
  time_start  TIME NOT NULL,
  time_end    TIME NOT NULL,
  location    VARCHAR NOT NULL,
  id          VARCHAR NOT NULL PRIMARY KEY,
  name        VARCHAR NOT NULL,
  description VARCHAR,
  background  VARCHAR,
  objective_1 VARCHAR,
  objective_2 VARCHAR,
  objective_3 VARCHAR,
  objective_4 VARCHAR,
  speaker     VARCHAR,
  date_created TIMESTAMP DEFAULT now() NOT NULL
);
