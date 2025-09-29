# How to Start & Stop Your App

## 🚀 Starting the Development Server

Open your terminal and run:

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## 🛑 Stopping the Server

### Method 1: In the Terminal (Easiest)
Press: **`Ctrl + C`**

### Method 2: Kill the Process
If Ctrl+C doesn't work, open a new terminal and run:

```bash
lsof -ti:3000 | xargs kill -9
```

## 🏗️ Building for Production

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Stop production server:**
   - Press `Ctrl + C` in the terminal
   - Or run: `lsof -ti:3000 | xargs kill -9`

## 🔧 If You Get Errors

### "routesManifest.dataRoutes is not iterable"
Clean and rebuild:
```bash
rm -rf .next
npm run build
```

### "Port 3000 is already in use"
Kill the process on port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

### General Issues
1. Stop all servers: `lsof -ti:3000 | xargs kill -9`
2. Clean build: `rm -rf .next`
3. Reinstall: `rm -rf node_modules && npm install`
4. Start fresh: `npm run dev`

## 📝 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `Ctrl + C` | Stop server (in terminal) |
| `lsof -ti:3000 \| xargs kill -9` | Force stop server |
| `rm -rf .next` | Clean build files |

## ✨ Your App is Ready!

All 12 pages are complete and functional:
- Dashboard
- Clients
- Estimates
- Jobs
- Schedule
- Invoices
- Payments
- Analytics
- Team
- Inventory
- Service Areas
- Messages
- Settings

**When you're ready, just run `npm run dev` and visit http://localhost:3000**
