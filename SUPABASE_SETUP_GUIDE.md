# Supabase Setup Guide - WhatsApp API Platform

This guide will help you set up Supabase as the database for the WhatsApp API Platform.

## Why Supabase?

- ✅ **Cloud-hosted PostgreSQL** - No need to manage database servers
- ✅ **Free tier available** - 500MB database, 2GB file storage
- ✅ **Auto-scaling** - Handles traffic spikes automatically
- ✅ **Built-in authentication** - Can be used for future features
- ✅ **Real-time subscriptions** - PostgreSQL changes in real-time
- ✅ **Automatic backups** - Daily backups included
- ✅ **SSL by default** - Secure connections out of the box

---

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Verify your email address

---

## Step 2: Create a New Project

1. Click "New Project" in your Supabase dashboard
2. Fill in the project details:
   - **Name**: `whatsapp-api-platform` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is sufficient to start

3. Click "Create new project"
4. Wait 2-3 minutes for the project to be provisioned

---

## Step 3: Get Your Database Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **Database** in the left menu
3. Scroll down to **Connection string**
4. Copy the **URI** connection string (it looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```

5. Also note down these values:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: The password you set when creating the project

---

## Step 4: Get Your Supabase API Keys

1. Go to **Project Settings** → **API**
2. Copy these keys:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this secret!)

---

## Step 5: Configure Your Application

### Update `server/.env` file:

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Connection (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:your-password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-db-password
DB_POOL_MIN=2
DB_POOL_MAX=10
```

**Important**: Replace the placeholders with your actual Supabase credentials!

---

## Step 6: Initialize the Database

Run the database migrations to create all necessary tables:

```bash
cd server
npm install
npm run db:migrate
npm run db:seed  # Optional: Add test data
```

This will create the following tables in your Supabase database:
- `users` - User accounts
- `sessions` - WhatsApp sessions
- `messages` - Message history
- `contacts` - Contact management
- `groups` - Group management
- `webhooks` - Webhook configurations
- `api_keys` - API key management

---

## Step 7: Verify the Setup

1. Go to your Supabase dashboard
2. Click on **Table Editor** in the sidebar
3. You should see all the tables created
4. Click on the `users` table to verify it's empty (or has seed data if you ran the seed script)

---

## Step 8: Test the Connection

Start your backend server:

```bash
cd server
npm run dev
```

You should see in the logs:
```
✓ Database connection established successfully
✓ Database synchronized successfully
✓ Server running on port 3000
```

If you see any errors, double-check your credentials in the `.env` file.

---

## Supabase Dashboard Features

### Table Editor
- View and edit data directly
- Add/remove columns
- Set up relationships

### SQL Editor
- Run custom SQL queries
- Create views and functions
- Manage indexes

### Database Backups
- Automatic daily backups (paid plans)
- Point-in-time recovery (paid plans)
- Manual backups available

### Monitoring
- View database size
- Monitor query performance
- Check connection pool usage

---

## Security Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use service_role key only on backend** - Never expose it to frontend
3. **Enable Row Level Security (RLS)** - For additional data protection
4. **Rotate keys regularly** - Change passwords and keys periodically
5. **Use environment variables** - Never hardcode credentials

---

## Scaling Considerations

### Free Tier Limits:
- 500 MB database space
- 2 GB file storage
- 50,000 monthly active users
- 500 MB egress

### When to Upgrade:
- Database size > 500 MB
- Need more than 2 GB file storage
- Require daily backups
- Need point-in-time recovery
- Want dedicated resources

### Pro Tier ($25/month):
- 8 GB database space
- 100 GB file storage
- Daily backups
- 7-day point-in-time recovery
- No pausing

---

## Troubleshooting

### Connection Timeout
- Check if your IP is allowed (Supabase allows all IPs by default)
- Verify the connection string is correct
- Ensure SSL is enabled in database config

### SSL Certificate Error
- Make sure `dialectOptions.ssl.rejectUnauthorized` is set to `false` in `server/src/config/database.js`

### Migration Errors
- Check if tables already exist
- Verify database user has CREATE permissions
- Review migration logs for specific errors

### Performance Issues
- Add indexes to frequently queried columns
- Use connection pooling (already configured)
- Monitor slow queries in Supabase dashboard

---

## Migration from Local PostgreSQL

If you were using local PostgreSQL:

1. **Export your data**:
   ```bash
   pg_dump -U postgres whatsapp_api > backup.sql
   ```

2. **Import to Supabase**:
   - Go to Supabase SQL Editor
   - Paste the SQL from backup.sql
   - Execute the query

3. **Update environment variables** as shown in Step 5

4. **Test the connection** as shown in Step 8

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Best Practices](https://supabase.com/docs/guides/database/postgres)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

---

## Support

If you encounter any issues:

1. Check the [Supabase Status Page](https://status.supabase.com/)
2. Review the [Supabase Community](https://github.com/supabase/supabase/discussions)
3. Check application logs for specific error messages
4. Verify all environment variables are set correctly

---

**Your Supabase database is now ready for the WhatsApp API Platform!** 🚀

