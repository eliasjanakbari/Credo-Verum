# Azure SQL Database Setup Guide

This guide will help you set up an Azure SQL database for your Jesus Hub application.

## Step 1: Create Azure SQL Database

### Option A: Using Azure Portal (Recommended for beginners)

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" → Search for "SQL Database"
3. Click "Create"

**Basic Settings:**
- **Subscription**: Select your Azure subscription
- **Resource Group**: Create new or use existing (e.g., "jesushub-rg")
- **Database Name**: Choose a name (e.g., "jesushub-db")
- **Server**: Click "Create new"
  - **Server name**: Choose unique name (e.g., "jesushub-server")
  - **Location**: Choose nearest region
  - **Authentication**: SQL authentication
  - **Server admin login**: Choose username (e.g., "jesushub-admin")
  - **Password**: Create a strong password

**Compute + Storage:**
- Click "Configure database"
- Choose "Basic" tier for development (most cost-effective)
- Or choose "Serverless" for auto-scaling

**Networking:**
- **Connectivity method**: Public endpoint
- **Firewall rules**:
  - ✅ Allow Azure services and resources to access this server
  - ✅ Add your current client IP address

4. Click "Review + Create" → "Create"
5. Wait for deployment (2-5 minutes)

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name jesushub-rg --location eastus

# Create SQL server
az sql server create \
  --name jesushub-server \
  --resource-group jesushub-rg \
  --location eastus \
  --admin-user jesushub-admin \
  --admin-password YourStrongPassword123!

# Create database
az sql db create \
  --resource-group jesushub-rg \
  --server jesushub-server \
  --name jesushub-db \
  --service-objective Basic

# Configure firewall to allow your IP
az sql server firewall-rule create \
  --resource-group jesushub-rg \
  --server jesushub-server \
  --name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP

# Allow Azure services
az sql server firewall-rule create \
  --resource-group jesushub-rg \
  --server jesushub-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## Step 2: Get Connection String

1. In Azure Portal, go to your SQL Database
2. Click "Connection strings" in the left menu
3. Copy the **ADO.NET** connection string
4. It will look like:
   ```
   Server=tcp:jesushub-server.database.windows.net,1433;Initial Catalog=jesushub-db;Persist Security Info=False;User ID=jesushub-admin;Password={your_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
   ```

## Step 3: Configure Your Application

1. Open the `.env` file in your project root
2. Convert the connection string to Prisma format:

   **Azure format:**
   ```
   Server=tcp:jesushub-server.database.windows.net,1433;Initial Catalog=jesushub-db;User ID=jesushub-admin;Password=YourPassword123!
   ```

   **Prisma format:**
   ```
   DATABASE_URL="sqlserver://jesushub-server.database.windows.net:1433;database=jesushub-db;user=jesushub-admin;password=YourPassword123!;encrypt=true"
   ```

3. Update your `.env` file with the correct values:
   ```env
   DATABASE_URL="sqlserver://YOUR_SERVER_NAME.database.windows.net:1433;database=YOUR_DATABASE_NAME;user=YOUR_USERNAME;password=YOUR_PASSWORD;encrypt=true"
   ```

## Step 4: Create Database Tables

Run the following commands to create the database schema:

npx prisma generate
# Generate Prisma Client
npx prisma generate

# Create the database tables
npx prisma db push
```

## Step 5: Seed Your Data

Run the seed script to migrate your existing data to Azure SQL:

```bash
npx tsx prisma/seed.ts
```

This will:
- Transfer all evidence sources from `data/sources.ts` to the database
- Transfer all miracles from `data/miracles.ts` to the database

## Step 6: Verify Data

You can verify your data was migrated successfully:

```bash
# Open Prisma Studio to browse your data
npx prisma studio
```

Or query directly in Azure Portal:
1. Go to your database in Azure Portal
2. Click "Query editor"
3. Login with your credentials
4. Run SQL queries:
   ```sql
   SELECT COUNT(*) FROM evidence_sources;
   SELECT COUNT(*) FROM miracles;
   ```

## Troubleshooting

### Firewall Issues
If you get connection errors, ensure your IP is allowed:
1. Go to SQL Server in Azure Portal
2. Click "Networking" or "Firewalls and virtual networks"
3. Add your current IP address

### Connection String Issues
Make sure:
- Server name ends with `.database.windows.net`
- Port is `1433`
- `encrypt=true` is included
- Password doesn't contain special characters that need URL encoding

### Free Tier Limits
- Basic tier: $5/month, 2GB storage
- Free Azure account: $200 credit for 30 days

## Security Best Practices

1. **Never commit `.env` to git** - it's already in `.gitignore`
2. **Use strong passwords** - at least 12 characters with mixed case, numbers, symbols
3. **Rotate credentials** periodically
4. **Use Azure Key Vault** for production secrets
5. **Enable Advanced Threat Protection** in Azure SQL settings
6. **Review firewall rules** regularly - only allow necessary IPs

## Cost Management

- **Basic tier**: ~$5/month
- **Serverless**: Pay per use (can be $0 when not in use)
- Set up **cost alerts** in Azure Portal
- Use **auto-pause** for serverless databases in development

## Next Steps

After setup, your application will:
1. Read data from Azure SQL instead of TypeScript files
2. Support dynamic updates without code changes
3. Enable server-side filtering and search
4. Allow you to build admin panels for content management
