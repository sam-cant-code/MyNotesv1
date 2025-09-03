import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,  
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

const connectDB = async () => {
  try {
    await pool.connect();
    console.log("✅ PostgreSQL Connected Successfully!");
  } catch (err) {
    console.error("❌ PostgreSQL Connection Error:", err.message);
  }
};


export default connectDB;
export { pool };
