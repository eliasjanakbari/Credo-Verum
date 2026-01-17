// Direct SQL Server connection helpers
import sql from 'mssql';

// Parse connection string from environment variable or use individual variables
function getConnectionConfig(): sql.config {
  // Check if DATABASE_URL is provided (connection string format)
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;

    // Parse the connection string
    // Format: sqlserver://username:password@server:port;database=dbname;encrypt=true;trustServerCertificate=true
    const urlMatch = dbUrl.match(/sqlserver:\/\/([^:]+):([^@]+)@([^:;]+)(?::(\d+))?;database=([^;]+)/);

    if (urlMatch) {
      const [, user, password, server, port, database] = urlMatch;
      return {
        server,
        database,
        user,
        password: decodeURIComponent(password),
        options: {
          encrypt: true,
          trustServerCertificate: dbUrl.includes('trustServerCertificate=true'),
          enableArithAbort: true,
        },
        port: port ? parseInt(port, 10) : 1433,
      };
    }
  }

  // Fallback to individual environment variables or hardcoded values
  return {
    server: process.env.DB_SERVER || 'credoverum-server.database.windows.net',
    database: process.env.DB_NAME || 'credoverum-db',
    user: process.env.DB_USER || 'credoverum-admin',
    password: process.env.DB_PASSWORD || 'JV}O4!a9sP!S0[1FVRJ',
    options: {
      encrypt: true,
      trustServerCertificate: false,
      enableArithAbort: true,
    },
    port: parseInt(process.env.DB_PORT || '1433', 10),
  };
}

// Global connection pool
let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    try {
      const config = getConnectionConfig();
      console.log('Attempting to connect to database:', {
        server: config.server,
        database: config.database,
        user: config.user,
        // Don't log the password
      });
      pool = await sql.connect(config);
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection failed:', error);
      console.error('Connection error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  return pool;
}
