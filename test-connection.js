// Test Azure SQL connection
const sql = require('mssql');

const config = {
    server: 'credoverum-server.database.windows.net',
    database: 'credoverum-db',
    user: 'credoverum-admin',
    password: 'JV}O4!a9sP!S0[1FVRJ',
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true
    },
    port: 1433
};

async function testConnection() {
    try {
        console.log('Attempting to connect to Azure SQL...');
        console.log('Server:', config.server);
        console.log('Database:', config.database);
        console.log('User:', config.user);

        await sql.connect(config);
        console.log('✅ Connection successful!');
        await sql.close();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        console.error('Error code:', err.code);
    }
}

testConnection();
