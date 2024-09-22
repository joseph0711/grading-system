// lib/db.js
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST, // Use the environment variable for host
  user: process.env.DB_USER, // Use the environment variable for user
  password: process.env.DB_PASSWORD, // Use the environment variable for password
  database: process.env.DB_NAME, // Use the environment variable for the database name
  port: process.env.DB_PORT, // Use the environment variable for the port
});

export default pool;
