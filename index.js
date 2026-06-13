import "dotenv/config";
import express from "express";
import mysql from "mysql2/promise";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ─── DB Connection Pool ───────────────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("hello from backend");
});

// ─── CREATE — POST /books ──────────────────────────────────────────────────────
app.post("/books", async (req, res) => {
  const { book, author } = req.body;

  if (!book || !author) {
    return res.status(400).json({ error: "Both 'book' and 'author' are required." });
  }

  const [result] = await pool.query(
    "INSERT INTO books (book, author) VALUES (?, ?)",
    [book, author]
  );

  res.status(201).json({ id: result.insertId, book, author });
});

// ─── READ ALL — GET /books ─────────────────────────────────────────────────────
app.get("/books", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM books");
  res.json(rows);
});

// ─── READ ONE — GET /books/:id ─────────────────────────────────────────────────
app.get("/books/:id", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM books WHERE id = ?", [req.params.id]);

  if (rows.length === 0) {
    return res.status(404).json({ error: "Book not found." });
  }

  res.json(rows[0]);
});

// ─── UPDATE — PUT /books/:id ───────────────────────────────────────────────────
app.put("/books/:id", async (req, res) => {
  const { book, author } = req.body;

  if (!book || !author) {
    return res.status(400).json({ error: "Both 'book' and 'author' are required." });
  }

  const [result] = await pool.query(
    "UPDATE books SET book = ?, author = ? WHERE id = ?",
    [book, author, req.params.id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Book not found." });
  }

  res.json({ id: Number(req.params.id), book, author });
});

// ─── DELETE — DELETE /books/:id ────────────────────────────────────────────────
app.delete("/books/:id", async (req, res) => {
  const [result] = await pool.query("DELETE FROM books WHERE id = ?", [req.params.id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Book not found." });
  }

  res.json({ message: `Book with id ${req.params.id} deleted.` });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
