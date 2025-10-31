# Movie Project - Express Backend

A Node.js Express backend application using Prisma ORM with MySQL database.

## 🚀 Tech Stack

- **Node.js**: v25.x
- **Express.js**: Web framework
- **Prisma**: ORM for database management
- **MySQL**: Database (XAMPP)

## 📋 Prerequisites

- [Node.js v25.x](https://nodejs.org/)
- [XAMPP](https://www.apachefriends.org/) (for MySQL)

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file based on your database setup:
```env
DATABASE_URL="mysql://root:@localhost:3036/moviedb"
```

**Update these values:**
- `root` - Your MySQL username (default is `root` for XAMPP)
- `@localhost` - Your MySQL host
- `3036` - Your MySQL port (check XAMPP, usually `3306` or `3036`)
- `moviedb` - Your database name

### 3. Start XAMPP MySQL

- Open XAMPP Control Panel
- Start MySQL service
- Ensure it's running on port 3036

### 4. Setup Database

**Option A: Fresh Setup (Recommended for first time)**

```bash
# Delete existing migrations folder (if any)
rmdir /s prisma\migrations

# Reset the database
npx prisma migrate reset

# Create a fresh migration
npx prisma migrate dev --name init
```

**Option B: Quick Setup (Using db push - no migrations)**

```bash
# Push schema directly to database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 5. Run the Application

```bash
npm run <your-script-name>
```

### 6. (Optional) View Database

Open Prisma Studio to view/edit data:
```bash
npx prisma studio
```
Access at: http://localhost:5555

## 🐛 Troubleshooting

**Migration Errors:**

If you encounter shadow database errors during setup, the `.env` configuration with `PRISMA_DISABLE_SHADOW_DATABASE=1` should prevent this. If issues persist:

```bash
npx prisma db push
```

**MySQL Connection Issues:**
- Verify XAMPP MySQL is running
- Check port number (default: 3036)
- Ensure `DATABASE_URL` in `.env` matches your XAMPP configuration

---

That's it! Your backend should now be running.