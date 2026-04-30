# MongoDB Atlas Setup Guide

This guide will help you connect your phone shop application to MongoDB Atlas.

## Prerequisites

1. A MongoDB Atlas account (free tier works)
2. Node.js and npm installed

## Steps to Connect

### 1. Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a free cluster (choose M0 Free Tier)

### 2. Get Your Connection String

1. In MongoDB Atlas, click "Database" → "Connect"
2. Choose "Drivers" option
3. Copy the connection string. It will look like:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
   ```

### 3. Update the `.env` File

1. Edit the `.env` file in your project root
2. Replace the placeholder connection string with your actual MongoDB Atlas connection string:
   ```
   MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/phone_shop?retryWrites=true&w=majority
   ```
3. Replace `your_username` and `your_password` with your database user credentials
4. Replace `your_cluster` with your actual cluster name

### 4. Create Database User

In MongoDB Atlas:
1. Go to "Database Access"
2. Click "Add New Database User"
3. Create a username and password (save these for the connection string)
4. Grant "Atlas Admin" or "Read and Write" privileges

### 5. Configure Network Access

In MongoDB Atlas:
1. Go to "Network Access"
2. Click "Add IP Address"
3. For development, you can use "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, restrict to your specific IP address

### 6. Test the Connection

Run the server:
```bash
npm start
```

You should see:
```
MongoDB Connected: <your-cluster-name>.mongodb.net
Server running on port 3000
```

## Environment Variables

The `.env` file contains:

- `MONGO_URI` - Your MongoDB Atlas connection string
- `SESSION_SECRET` - Secret for express-session (change to a random string)
- `PORT` - Server port (optional, defaults to 3000)

## Troubleshooting

### "Authentication failed"
- Check your username and password in the connection string
- Make sure the database user exists in MongoDB Atlas

### "Connection timed out"
- Check your network access settings in MongoDB Atlas
- Make sure the cluster is not paused

### "Database not found"
- The database will be created automatically when you first use it
- Or create it manually in MongoDB Atlas

## Security Notes

1. Never commit the `.env` file to version control
2. The `.env.example` file is safe to commit (it only has placeholder values)
3. Add `.env` to your `.gitignore` file
