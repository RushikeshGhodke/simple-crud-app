-- Create the database (used when running via Docker)
CREATE DATABASE IF NOT EXISTS library;

USE library;

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id     INT          NOT NULL AUTO_INCREMENT,
  book   VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);
