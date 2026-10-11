import "dotenv/config";
import pg from "pg";

console.log("sslmode lido:", new URL(process.env.DB_URL).searchParams.get("sslmode"));

const pool = new pg.Pool({
  connectionString: process.env.DB_URL,
});

export default pool;