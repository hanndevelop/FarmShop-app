# GOOGLE APPS SCRIPT SETUP - EASY METHOD!

**No Google Cloud Console needed!** 
**No API Keys needed!**
**Much simpler!**

---

## 📋 What You'll Do

1. Create your Google Sheet (5 minutes)
2. Copy Apps Script code (2 minutes)
3. Deploy as Web App (3 minutes)
4. Update your app with the URL (1 minute)

**Total time: ~10 minutes**

---

## STEP 1: Create Your Google Sheet

### 1.1 Create New Sheet
1. Go to https://sheets.google.com
2. Click **"+ Blank"** to create new sheet
3. Name it: **"Farm Shop Data"**

### 1.2 Create Required Tabs
Click the **"+"** at the bottom to add sheets. You need **6 tabs total**:

1. **Stock_Master**
2. **Stock_Receipts**
3. **Transactions**
4. **Workers**
5. **Stocktakes**
6. **Worker_Summaries**

✅ **Checkpoint:** You should have 6 tabs at the bottom

### 1.3 Add Headers to Each Tab

**In Stock_Master (Tab 1), add these in Row 1:**
```
A1: item_id
B1: item_name
C1: stock_code
D1: category
E1: cost_price
F1: sell_price
G1: current_quantity
H1: minimum_quantity
I1: date_added
```

**In Stock_Receipts (Tab 2):**
```
A1: receipt_id
B1: item_id
C1: item_name
D1: quantity_received
E1: date_received
F1: notes
```

**In Transactions (Tab 3):**
```
A1: transaction_id
B1: date
C1: worker_id
D1: worker_name
E1: item_id
F1: item_name
G1: quantity
H1: price
I1: total
```

**In Workers (Tab 4):**
```
A1: worker_id
B1: worker_name
C1: id_number
D1: contact_number
E1: date_added
```

**In Stocktakes (Tab 5):**
```
A1: stocktake_id
B1: date
C1: type
D1: item_id
E1: item_name
F1: system_quantity
G1: actual_quantity
H1: variance
I1: variance_value
```

**In Worker_Summaries (Tab 6):**
```
A1: worker_id
B1: worker_name
C1: month
D1: year
E1: total_purchases
F1: transaction_count
```

✅ **Checkpoint:** All 6 tabs have headers in row 1

### 1.4 Get Your Sheet ID
1. Look at your browser's address bar
2. The URL looks like: `https://docs.google.com/spreadsheets/d/LONG_STRING_HERE/edit`
3. Copy the **LONG_STRING_HERE** part (between `/d/` and `/edit`)
4. Save this somewhere - you'll need it soon!

**Example:**
URL: `https://docs.google.com/spreadsheets/d/1abc123XYZ789/edit`
Sheet ID: `1abc123XYZ789`

✅ **Checkpoint:** You have your Sheet ID copied

---

## STEP 2: Add Apps Script Code

### 2.1 Open Apps Script Editor
1. In your Google Sheet, click **Extensions** (top menu)
2. Click **Apps Script**
3. A new tab will open with a code editor

### 2.2 Delete Default Code
1. You'll see some default code in the editor
2. Select it all (Ctrl+A or Cmd+A)
3. Delete it (press Delete key)

### 2.3 Copy the Apps Script Code
1. Open the file: **GoogleAppsScript.js** (included in your download)
2. Copy ALL the code (Ctrl+A then Ctrl+C)
3. Paste it into the Apps Script editor (Ctrl+V)

### 2.4 Update Sheet ID in Code
1. In the Apps Script editor, find Line 5:
```javascript
const SHEET_ID = 'YOUR_SHEET_ID_HERE';
```
2. Replace `YOUR_SHEET_ID_HERE` with your actual Sheet ID
3. Example:
```javascript
const SHEET_ID = '1abc123XYZ789';
```

### 2.5 Save the Script
1. Click the **💾 Save** icon (or press Ctrl+S)
2. Give it a name: **"Farm Shop API"**
3. Click **OK**

✅ **Checkpoint:** Apps Script code is saved with your Sheet ID

---

## STEP 3: Deploy as Web App

### 3.1 Start Deployment
1. In Apps Script editor, click **Deploy** (top right)
2. Click **New deployment**

### 3.2 Configure Deployment
1. Click the **⚙️ gear icon** next to "Select type"
2. Choose **"Web app"**
3. Fill in the details:
   - **Description:** "Farm Shop API"
   - **Execute as:** "Me (your email)"
   - **Who has access:** "Anyone"
4. Click **Deploy**

### 3.3 Authorize the Script
1. A popup will appear asking for permissions
2. Click **Authorize access**
3. Choose your Google account
4. Click **Advanced** (if you see a warning)
5. Click **"Go to Farm Shop API (unsafe)"** - This is YOUR script, it's safe!
6. Click **Allow**

### 3.4 Copy the Web App URL
1. After authorization, you'll see "Deployment successful"
2. **IMPORTANT:** Copy the **Web App URL** 
3. It looks like: `https://script.google.com/macros/s/AKfycby.../exec`
4. Save this URL - you'll need it in Step 4!

✅ **Checkpoint:** You have the Web App URL copied

---

## STEP 4: Update Your Farm Shop App

### 4.1 Open App Configuration
1. In your farm-shop-app folder
2. Navigate to: `src/App.jsx`
3. Open it in a text editor (Notepad, VS Code, etc.)

### 4.2 Find the Configuration Line
Look for (around line 21):
```javascript
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
```

### 4.3 Paste Your Web App URL
Replace with your actual URL:
```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
```

### 4.4 Save the File
1. Save the file (Ctrl+S or Cmd+S)
2. Close the text editor

✅ **Checkpoint:** App is now connected to Google Sheets!

---

## STEP 5: Test the Connection

### 5.1 Start Your App
1. Open Command Prompt / Terminal
2. Navigate to your app folder: `cd path/to/farm-shop-app`
3. Run: `npm run dev`
4. Browser opens to http://localhost:3000

### 5.2 Login
1. Username: `farmer`
2. Password: `farm2025`
3. Click **Login**

### 5.3 Import Your Stock
1. Click **Stock Management**
2. Click **Import Excel**
3. Select **STOCK_IMPORT_READY.txt**
4. You should see: "Successfully imported 93 items!"

### 5.4 Check Google Sheet
1. Go back to your Google Sheet
2. Check the **Stock_Master** tab
3. You should see your imported items!

✅ **Done! Everything is working!**

---

## 🎉 YOU'RE DONE!

**That's it! No Google Cloud Console, no API keys!**

Your app is now connected to Google Sheets via Apps Script.

---

## 🔧 Troubleshooting

### "Authorization required" error
**Solution:**
1. Go back to Apps Script
2. Click **Deploy** → **Manage deployments**
3. Click **Edit** (pencil icon)
4. Change "Who has access" to **"Anyone"**
5. Click **Deploy**
6. Copy the new URL and update App.jsx

### "Script not found" error
**Solution:**
1. Check the Web App URL in App.jsx is correct
2. Make sure you copied the ENTIRE URL including `/exec` at the end
3. Try redeploying the Apps Script

### Items not showing in Google Sheet
**Solution:**
1. Check Sheet ID in GoogleAppsScript.js is correct
2. Make sure all 6 tabs exist with correct names (case-sensitive!)
3. Check headers are in Row 1 of each tab

### "Permission denied" error
**Solution:**
1. In Apps Script, click **Deploy** → **Manage deployments**
2. Make sure "Execute as" is set to "Me"
3. Make sure "Who has access" is set to "Anyone"

---

## 📝 Quick Reference

**Your Settings:**
- Sheet ID: `[Write it here]`
- Web App URL: `[Write it here]`

**Files to Update:**
1. `GoogleAppsScript.js` - Line 5 (Sheet ID)
2. `src/App.jsx` - Line 21 (Web App URL)

**Sheet Names (must match exactly):**
- Stock_Master
- Stock_Receipts
- Transactions
- Workers
- Stocktakes
- Worker_Summaries

---

## ✅ Final Checklist

Setup is complete when you have:
- [ ] Created Google Sheet with 6 tabs
- [ ] Added headers to all tabs
- [ ] Copied Sheet ID
- [ ] Pasted Apps Script code
- [ ] Updated Sheet ID in Apps Script
- [ ] Deployed as Web App
- [ ] Copied Web App URL
- [ ] Updated App.jsx with Web App URL
- [ ] Tested by importing stock
- [ ] Verified data appears in Google Sheet

---

## 🌟 Advantages of Apps Script Method

✅ **Much simpler** - No Google Cloud Console
✅ **No API keys** - No need to manage credentials
✅ **More secure** - Script runs under your account
✅ **Free** - No quotas or limits for personal use
✅ **Easy updates** - Just edit and redeploy
✅ **Better control** - Full access to your data

---

**That's it! You're ready to use the system!**

If you have any issues, check the Troubleshooting section above.
