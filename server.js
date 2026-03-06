import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("test.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium',
    note TEXT,
    status TEXT DEFAULT 'todo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/tasks", (req, res) => {
    try {
      const tasks = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tasks", (req, res) => {
    const { title, priority, note, status } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    
    try {
      const info = db.prepare("INSERT INTO tasks (title, priority, note, status) VALUES (?, ?, ?, ?)").run(title, priority || 'Medium', note, status || 'todo');
      const newTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(info.lastInsertRowid);
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { title, priority, note, status } = req.body;
    
    try {
      const result = db.prepare("UPDATE tasks SET title = ?, priority = ?, note = ?, status = ? WHERE id = ?").run(title, priority, note, status, id);
      if (result.changes === 0) return res.status(404).json({ error: "Task not found" });
      const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    try {
      const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
      if (result.changes === 0) return res.status(404).json({ error: "Task not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
