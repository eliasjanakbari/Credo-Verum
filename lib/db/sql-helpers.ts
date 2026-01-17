// Direct SQL Server connection helpers
import sql from 'mssql';

// Connection configuration
const config: sql.config = {
  server: 'credoverum-server.database.windows.net',
  database: 'credoverum-db',
  user: 'credoverum-admin',
  password: 'JV}O4!a9sP!S0[1FVRJ',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  port: 1433,
};

// Global connection pool
let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}
