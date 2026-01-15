# FARM SHOP APP - COMPLETE SETUP MANUAL

## 📋 Table of Contents
1. [First Time Setup](#first-time-setup)
2. [Google Sheets Configuration](#google-sheets-configuration)
3. [Change Login Passwords](#change-login-passwords)
4. [Import Your Stock List](#import-your-stock-list)
5. [Add Workers](#add-workers)
6. [Daily Operations](#daily-operations)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 FIRST TIME SETUP

### Step 1: Extract Files
1. Download the `farm-shop-app` folder
2. Extract to a location on your computer
3. Remember this location (e.g., `C:\Users\YourName\farm-shop-app`)

### Step 2: Install Node.js
1. Go to https://nodejs.org
2. Download the **LTS version** (Long Term Support)
3. Run the installer
4. Keep all default settings
5. Click "Next" through all steps
6. Restart your computer after installation

### Step 3: Open Command Prompt
**Windows:**
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. You'll see a black window with white text

**Mac:**
1. Press `Command + Space`
2. Type `Terminal` and press Enter

### Step 4: Navigate to App Folder
In the command prompt, type (replace with your actual path):
```bash
cd C:\Users\YourName\farm-shop-app
```
Press Enter

### Step 5: Install Dependencies
Type this command and press Enter:
```bash
npm install
```
Wait 2-5 minutes. You'll see lots of text scrolling. This is normal!

✅ **Checkpoint:** You should see "added XXX packages" when done.

---

## 📊 GOOGLE SHEETS CONFIGURATION

**GOOD NEWS:** We're using Google Apps Script - much easier than API setup!
No Google Cloud Console needed!

### Complete Apps Script Setup

Follow the dedicated guide: **APPS_SCRIPT_SETUP.md**

This guide covers:
- Creating your Google Sheet (5 min)
- Setting up Apps Script (5 min)  
- Deploying as Web App (3 min)
- Connecting to your app (2 min)

**Total time: ~15 minutes** (much faster than API method!)

Quick overview:
1. Create Google Sheet with 6 tabs
2. Add column headers
3. Copy Apps Script code into Extensions → Apps Script
4. Deploy as Web App
5. Copy the Web App URL
6. Paste URL into src/App.jsx

✅ **Checkpoint:** See APPS_SCRIPT_SETUP.md for detailed steps

---

## 🔐 CHANGE LOGIN PASSWORDS

**IMPORTANT:** Change the default passwords for security!

### Step 1: Open Login File
1. Navigate to `src/components` folder
2. Open `Login.jsx` in text editor

### Step 2: Find User Credentials
Look for these lines (around line 9-12):
```javascript
const USERS = [
  { username: 'farmer', password: 'farm2025', name: 'Farmer' },
  { username: 'wife', password: 'shop2025', name: 'Farmer\'s Wife' }
];
```

### Step 3: Change Passwords
Replace with your own:
```javascript
const USERS = [
  { username: 'farmer', password: 'YourSecurePassword1', name: 'Farmer' },
  { username: 'wife', password: 'YourSecurePassword2', name: 'Wife Name' }
];
```

**Tips for good passwords:**
- At least 8 characters
- Mix of letters and numbers
- Avoid common words
- Don't share passwords!

### Step 4: Save Changes
1. Save the file (Ctrl+S or Cmd+S)
2. Close the text editor

✅ **Checkpoint:** Login credentials updated!

---

## 📦 IMPORT YOUR STOCK LIST

### Step 1: Prepare Excel File
1. You already have: `STOOR_VOORRAAD_HANNELET__1_.xlsx`
2. A ready-to-import file has been created: `STOCK_IMPORT_READY.txt`

**Option A: Use the ready file (Easiest)**
- Skip to Step 3 below
- Use `STOCK_IMPORT_READY.txt`

**Option B: Export from your own Excel**
1. Open your stock Excel file
2. Go to **File** → **Save As**
3. Choose format: **Text (Tab delimited) (*.txt)**
4. Save it

### Step 2: Start the App
In command prompt (in your app folder), type:
```bash
npm run dev
```
Wait until you see: **"Local: http://localhost:3000"**

### Step 3: Login
1. Browser will open automatically to http://localhost:3000
2. Login with:
   - Username: `farmer` (or whatever you changed it to)
   - Password: `farm2025` (or whatever you changed it to)
3. Click **"Login"**

### Step 4: Import Stock
1. Click **"Stock Management"** in the sidebar
2. Click **"Import Excel"** button (top of page)
3. Select your `.txt` file (`STOCK_IMPORT_READY.txt`)
4. Click **"Open"**
5. Wait a few seconds
6. You should see: "Successfully imported 93 items!"

✅ **Checkpoint:** All 93 stock items are now in the app!

### Step 5: Update Stock Information
Now you need to set categories and verify prices for each item:

1. Click the **"Edit"** button (pencil icon) next to each item
2. Set the **Category** (Groceries, Toiletries, Household, etc.)
3. Check the **Prices** are correct
4. Update **Stock Code** if you use them
5. Set **Minimum Quantity** appropriately
6. Click **"Save Changes"**

**Suggested Categories:**
- **ACE/Kloof KOFFIE** → Groceries
- **Bakpoeier 50g** → Groceries
- **Groenseep** → Toiletries
- **Handy Andy** → Household
- **Toilet papier** → Household
- etc.

**Time-saving tip:** Do the most important items first!

### Step 6: Add Initial Stock Quantities
1. Click the green **"+" button** next to each item
2. Enter current stock quantity
3. Click **"Add Stock"**
4. Repeat for all items

Alternative: Use **"Receive Stock"** button if you want to record the date.

✅ **Checkpoint:** All stock items have categories, prices, and quantities!

---

## 👥 ADD WORKERS

### Step 1: Go to Workers Tab
1. Click **"Workers"** in the sidebar

### Step 2: Add Each Worker
1. Click **"Add Worker"** button
2. Fill in:
   - **Full Name**: e.g., Johannes Mkhize
   - **ID Number**: e.g., 7801015800082
   - **Contact Number**: e.g., 0721234567
3. Click **"Add Worker"**
4. Repeat for all farm workers

✅ **Checkpoint:** All workers are in the system!

---

## 💼 DAILY OPERATIONS

### Starting the App Each Day

**Step 1: Open Command Prompt**
- Navigate to app folder: `cd C:\Users\YourName\farm-shop-app`

**Step 2: Start App**
```bash
npm run dev
```

**Step 3: Login**
- Go to http://localhost:3000
- Login with your username and password

### Processing Sales

**Step 1: Go to Shop Tab**
1. Click **"Shop"** in sidebar

**Step 2: Select Worker**
1. Choose worker from dropdown
2. Their name appears in blue box

**Step 3: Add Items**
1. Click **"Add Item"** button
2. Select items from the list
3. Click **"Add"** for each item

**Step 4: Adjust Quantities**
1. Change quantities in cart if needed
2. Remove items with red trash button if needed

**Step 5: Complete Transaction**
1. Check total amount
2. Click **"Complete Transaction"**
3. Done! Amount added to worker's tab

### Adding Stock During the Day

**Quick Method:**
1. Go to **Stock Management**
2. Find the item in the table
3. Click green **"+" button**
4. Enter quantity
5. Click **"Add Stock"**

**Detailed Method (with date tracking):**
1. Go to **Stock Management**
2. Click **"Receive Stock"** button
3. Select item
4. Enter quantity and date
5. Click **"Receive Stock"**

### Checking Dashboard

**View Today's Sales:**
1. Click **"Dashboard"**
2. See total sales, transactions, profit

**View Period Sales:**
1. Click **"Dashboard"**
2. Set Start Date and End Date
3. See filtered statistics
4. Clear filter when done

### Editing Stock Items

**Update Prices:**
1. Go to **Stock Management**
2. Click **Edit button** (pencil) on item
3. Update prices
4. Click **"Save Changes"**

**Update Categories:**
- Same as above, change category dropdown

### Monthly Stocktake

**At Month End:**
1. Go to **"Stocktake"** tab
2. Click **"New Stocktake"**
3. Select **"Monthly"**
4. Set date
5. Count each item physically
6. Enter actual quantities
7. System shows variances
8. Click **"Save Stocktake"**

### Viewing Reports

**Worker Monthly Summary:**
1. Go to **"Reports"** tab
2. Select **"Worker Monthly Summary"**
3. See all workers' monthly purchases

**Individual Worker Detail:**
1. Go to **"Reports"**
2. Select **"Worker Detail"**
3. Choose worker
4. Set date range if needed
5. See their transaction history

**All Transactions:**
1. Go to **"Reports"**
2. Select **"All Transactions"**
3. Filter by date if needed

### End of Day

1. Review dashboard
2. Check low stock alerts
3. Note items to order
4. Close browser
5. Command prompt can stay open or press Ctrl+C to stop

---

## 🔧 TROUBLESHOOTING

### App Won't Start

**Problem:** Command `npm run dev` fails

**Solution:**
1. Make sure you're in the correct folder
2. Run `npm install` again
3. Check if Node.js is installed: `node --version`
4. Restart computer

### Can't Login

**Problem:** "Invalid username or password"

**Solution:**
1. Check username and password spelling
2. Passwords are case-sensitive
3. Check if you changed passwords in Login.jsx
4. Default: farmer / farm2025 or wife / shop2025

### Import Excel Not Working

**Problem:** "No items found in file"

**Solution:**
1. Make sure file is Tab-delimited (.txt or .tsv)
2. Don't use Excel .xlsx format directly
3. Use the provided `STOCK_IMPORT_READY.txt` file
4. Check file has data in second column

### Google Sheets Not Syncing

**Problem:** Data not saving to Google Sheets

**Solution:**
1. Check Sheet ID is correct in App.jsx
2. Check API Key is correct
3. Make sure Google Sheets API is enabled
4. Check sheet is shared publicly
5. For now, app works without sheets (data in browser)

### Low Stock Not Showing

**Problem:** Item is low but no alert

**Solution:**
Stock alerts work automatically based on quantity:
- **Out of Stock** (Red): Less than 5 units
- **Low Stock** (Orange): 5-10 units  
- **OK** (Green): More than 10 units

These are fixed rules - no need to set minimum quantities for alerts.

### Can't See Dashboard Stats

**Problem:** Dashboard showing zeros

**Solution:**
1. Make sure you've processed some transactions
2. Check date filter isn't set too narrow
3. Clear date filter and try again

### Forgot Password

**Solution:**
1. Open `src/components/Login.jsx` in text editor
2. See the passwords in the USERS array
3. You can change them there

### Need to Reset Everything

**Solution:**
1. Stop the app (Ctrl+C in command prompt)
2. Delete browser data for http://localhost:3000
3. Or just use Incognito/Private mode
4. Note: This won't delete Google Sheets data

---

## 📞 SUPPORT CHECKLIST

Before asking for help, check:
- [ ] Node.js is installed (`node --version` in command prompt)
- [ ] You're in the correct folder
- [ ] You ran `npm install`
- [ ] You changed Sheet ID and API Key in App.jsx
- [ ] You changed login passwords in Login.jsx
- [ ] Google Sheets has all 6 tabs with correct headers
- [ ] Sheet is shared publicly (Anyone with link can view)
- [ ] You imported the stock list

---

## ✅ QUICK START CHECKLIST

Use this checklist for first-time setup:

**Setup (Once)**
- [ ] Extract app files
- [ ] Install Node.js
- [ ] Run `npm install` in app folder
- [ ] Create Google Sheet with 6 tabs
- [ ] Add column headers to each tab
- [ ] Enable Google Sheets API
- [ ] Create API key
- [ ] Share Google Sheet publicly
- [ ] Update App.jsx with Sheet ID and API Key
- [ ] Change passwords in Login.jsx
- [ ] Import stock list (STOCK_IMPORT_READY.txt)
- [ ] Set categories for all items
- [ ] Verify/update prices
- [ ] Add initial stock quantities
- [ ] Add all workers

**Daily**
- [ ] Open command prompt
- [ ] Navigate to app folder
- [ ] Run `npm run dev`
- [ ] Login to app
- [ ] Process sales
- [ ] Add stock as needed
- [ ] Check dashboard

**Weekly**
- [ ] Review worker balances
- [ ] Check low stock alerts
- [ ] Order stock if needed

**Monthly**
- [ ] Run stocktake
- [ ] Generate worker reports
- [ ] Calculate worker payments

---

## 🎉 YOU'RE READY!

You've now completed the full setup. The app is ready to use!

**Remember:**
- Login with: farmer/farm2025 or wife/shop2025 (unless you changed them)
- Start app: `npm run dev` in command prompt
- Access at: http://localhost:3000
- Logout button is at bottom of sidebar

**Need more help?** Review the relevant section above or check the other documentation files.

Enjoy your new Farm Shop Management System! 🌾
