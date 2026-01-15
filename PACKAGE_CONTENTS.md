# 📦 FARM SHOP APP - PACKAGE CONTENTS

## ✅ What's Included

This complete package contains everything you need to run your Farm Shop Management System.

---

## 📁 Main Files & Folders

### `/src` - Application Source Code
Contains all the React components and application logic.

**Main Files:**
- `App.jsx` - Main application file (configure Google Sheets here)
- `App.css` - All styling
- `main.jsx` - Application entry point

**Components Folder (`/src/components`):**
- `Login.jsx` - Login screen (change passwords here)
- `Dashboard.jsx` - Main dashboard with stats
- `StockManagement.jsx` - Stock management & import
- `ShopFunction.jsx` - Sales processing
- `Workers.jsx` - Worker management
- `Stocktake.jsx` - Stocktake functionality
- `Reports.jsx` - All reports

### Root Files
- `package.json` - Dependencies list
- `vite.config.js` - Build configuration
- `index.html` - HTML entry point

### Documentation Files
- **SETUP_MANUAL.md** ⭐ - Complete step-by-step setup guide (START HERE!)
- **QUICK_REFERENCE.md** - Daily use quick reference (print this)
- **README.md** - Full system documentation
- **EXCEL_IMPORT_GUIDE.md** - How to import your stock
- **GOOGLE_SHEETS_SETUP.md** - Google Sheets details
- **SHEETS_TEMPLATE.md** - Sheet structure and formulas

### Data Files
- **STOCK_IMPORT_READY.txt** - Your 93 stock items ready to import!

---

## 🎯 Quick Start Path

**1. First Time Setup**
→ Read `SETUP_MANUAL.md` completely
→ Follow all steps in order
→ Takes about 30-60 minutes

**2. Configure The App**
→ Edit `src/App.jsx` (Google Sheets credentials)
→ Edit `src/components/Login.jsx` (change passwords)

**3. Start Using**
→ Run `npm install` once
→ Run `npm run dev` to start
→ Login and import your stock

**4. Daily Use**
→ Keep `QUICK_REFERENCE.md` handy
→ Run `npm run dev` each morning

---

## ⚙️ Important Configuration Files

### File 1: `src/App.jsx` (Lines 21-22)
**What to change:**
```javascript
const SHEET_ID = 'YOUR_SHEET_ID_HERE';  // ← Your Google Sheet ID
const API_KEY = 'YOUR_API_KEY_HERE';    // ← Your API Key
```

**When:** During initial setup
**Where to find values:** Follow SETUP_MANUAL.md Step 2

### File 2: `src/components/Login.jsx` (Lines 9-12)
**What to change:**
```javascript
const USERS = [
  { username: 'farmer', password: 'farm2025', name: 'Farmer' },          // ← Change these
  { username: 'wife', password: 'shop2025', name: 'Farmer\'s Wife' }   // ← Change these
];
```

**When:** Before first use (for security!)
**Default login:**
- Username: `farmer` / Password: `farm2025`
- Username: `wife` / Password: `shop2025`

---

## 📊 Stock Status Rules

**Automatic alerts based on quantity:**
- 🔴 **Out of Stock**: Less than 5 units (URGENT!)
- 🟠 **Low Stock**: 5-10 units (Reorder soon)
- 🟢 **OK**: More than 10 units (Good stock)

These work automatically - no configuration needed!

---

## 🔧 System Requirements

**Computer:**
- Windows 7+ or Mac OSX 10.12+
- 4GB RAM minimum
- 500MB free disk space
- Internet connection (for Google Sheets)

**Software:**
- Node.js (download from nodejs.org)
- Any web browser (Chrome, Firefox, Edge, Safari)
- Text editor (Notepad works fine)

**Accounts Needed:**
- Google account (for Google Sheets)
- Google Cloud Console (free - for API)

---

## 📝 Pre-Setup Checklist

Before you start, make sure you have:
- [ ] Downloaded and extracted this folder
- [ ] Installed Node.js from nodejs.org
- [ ] Google account ready
- [ ] Stock list ready (provided: STOCK_IMPORT_READY.txt)
- [ ] List of farm workers with ID numbers
- [ ] 30-60 minutes to complete setup
- [ ] SETUP_MANUAL.md open and ready to follow

---

## 🎓 Learning Path

**Complete Beginner:**
1. Read SETUP_MANUAL.md (Step-by-step)
2. Follow each step exactly
3. Don't skip any steps
4. Use QUICK_REFERENCE.md after setup

**Some Computer Experience:**
1. Scan SETUP_MANUAL.md for overview
2. Focus on configuration sections
3. Skip basic explanations
4. Refer to QUICK_REFERENCE.md for daily use

**Experienced Developer:**
1. Check package.json for dependencies
2. Configure src/App.jsx with credentials
3. Update src/components/Login.jsx passwords
4. Run `npm install && npm run dev`
5. Import stock via UI

---

## 🆘 Support Files

**Having Problems?**
1. Check SETUP_MANUAL.md Troubleshooting section
2. Review QUICK_REFERENCE.md for common tasks
3. Check configuration in App.jsx and Login.jsx
4. Verify all 6 Google Sheets tabs exist
5. Ensure Sheet is shared publicly

**Error Messages:**
- "Module not found" → Run `npm install`
- "Invalid credentials" → Check Login.jsx passwords
- "Cannot connect to sheets" → Verify SHEET_ID and API_KEY
- "Port already in use" → Close other app instances

---

## 📂 File Structure Overview

```
farm-shop-app/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── StockManagement.jsx
│   │   ├── ShopFunction.jsx
│   │   ├── Workers.jsx
│   │   ├── Stocktake.jsx
│   │   ├── Reports.jsx
│   │   └── Login.jsx
│   ├── App.jsx              ← Configure Google Sheets here
│   ├── App.css
│   └── main.jsx
├── package.json
├── vite.config.js
├── index.html
├── SETUP_MANUAL.md          ← START HERE!
├── QUICK_REFERENCE.md       ← Print for daily use
├── README.md
├── EXCEL_IMPORT_GUIDE.md
├── GOOGLE_SHEETS_SETUP.md
├── SHEETS_TEMPLATE.md
└── STOCK_IMPORT_READY.txt   ← Your stock list
```

---

## ✨ Key Features Summary

**Stock Management:**
- Import 93+ items from Excel
- Edit prices, codes, categories anytime
- Quick add stock with "+" button
- Track cost vs sell price with margins
- Automatic stock alerts (Out of Stock, Low Stock, OK)

**Sales Processing:**
- Select worker from dropdown
- Add items to cart
- Process transactions instantly
- Worker tabs tracked automatically

**Reporting:**
- Dashboard with date filtering
- Period sales and profit tracking
- Worker summaries and details
- Transaction history
- Stocktake variance reports

**Security:**
- Password protected login
- Two user accounts (Farmer & Wife)
- Session management
- Logout functionality

---

## 🎉 Ready to Start!

**Next Steps:**
1. Open `SETUP_MANUAL.md`
2. Follow Step 1: First Time Setup
3. Continue through all steps
4. Import your stock
5. Start processing sales!

**Time Investment:**
- Initial setup: 30-60 minutes
- Stock import & categorization: 30-60 minutes
- Learning the system: 15-30 minutes
- Daily use: 2-5 minutes per transaction

---

## 📞 Important Notes

**Google Sheets:**
- Data syncs automatically (once configured)
- Works offline (data stored in browser)
- Backup sheets monthly
- Keep credentials safe

**Security:**
- Change default passwords immediately
- Don't share credentials
- Logout when done
- Keep API key confidential

**Maintenance:**
- Update prices as needed
- Do weekly/monthly stocktakes
- Review reports regularly
- Backup Google Sheets monthly

---

## ✅ Version Information

**Version:** 1.0
**Release Date:** January 2025
**Built For:** South African Farm Shops
**Language:** English & Afrikaans support
**Currency:** South African Rand (R)

---

## 🌟 You Have Everything!

This package is 100% complete and ready to use. All files are included, tested, and documented.

**No additional downloads needed!**

**Start with SETUP_MANUAL.md and you'll be running in 30-60 minutes!**

Enjoy your new Farm Shop Management System! 🌾

---

*For support or questions, refer to the Troubleshooting section in SETUP_MANUAL.md*
