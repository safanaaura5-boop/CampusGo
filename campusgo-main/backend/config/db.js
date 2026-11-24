import 'dotenv/config';
import mysql from 'mysql2/promise';

export const DATABASE_NAME = 'eparking_pangkalpinang';

export const dbPool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
});

export async function verifyDatabaseConnection() {
  const [rows] = await dbPool.query('SELECT DATABASE() AS database_name');
  if (rows[0]?.database_name !== DATABASE_NAME) {
    throw new Error(`Connected to unexpected database: ${rows[0]?.database_name || 'none'}`);
  }
}
