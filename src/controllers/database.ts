import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco SQLite com sucesso!");
  }
});
db.run("PRAGMA foreign_keys = ON;");