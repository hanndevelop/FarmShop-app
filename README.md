# Farm Shop Management System

A complete inventory and sales management system for farm shops, designed to track stock, process worker purchases, manage accounts, and conduct regular stocktakes.

## Features

### 📊 Dashboard
- Overview of stock levels and value
- Low stock alerts
- Recent transaction history
- Quick access to all functions

### 📦 Stock Management
- Add new stock items with categories
- **Import stock list from Excel** (bulk import)
- **Edit items** - update prices, codes, categories anytime
- Receive stock function with date tracking
- Track **cost price vs sell price** with profit margins
- Add optional **stock codes** for inventory tracking
- Track current quantities and minimum levels
- **Automatic stock status alerts:**
  - **Out of Stock** (Red): Less than 5 units - Urgent!
  - **Low Stock** (Orange): 5-10 units - Reorder soon
  - **OK** (Green): More than 10 units
- View total stock value

### 🛒 Shop Function
- Select worker for purchases
- Add items to cart
- Process transactions
- Real-time stock updates
- Running tab system for workers

### 👥 Workers Management
- Add and edit worker details
- Store ID numbers and contact info
- Track all worker purchases
- View worker account summaries

### 📋 Stocktake
- Monthly and annual stocktake options
- Record physical counts
- Calculate variances automatically
- Track variance values
- Historical stocktake records

### 📈 Reports
- Worker monthly summaries
- Individual worker transaction history
- All transactions report with date filtering
- Stocktake variance reports
- Outstanding balance tracking

## Categories

The system includes these stock categories:
- Groceries
- Toiletries
- Household
- Clothing
- Other

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google account for Sheets integration

### Setup Steps

1. **Extract the files**
   - Extract all files to a folder on your computer

2. **Install dependencies**
   ```bash
   cd farm-shop-app
   npm install
   ```

3. **Set up Google Sheets**
   - Follow the guide in `APPS_SCRIPT_SETUP.md` (much easier than API!)
   - Create your Google Sheet with required tabs
   - Deploy Apps Script code
   - Get your Web App URL
   - Update `App.jsx` with the URL

4. **Run the application**
   ```bash
   npm run dev
   ```
   
   The app will open at `http://localhost:3000`

## Usage Guide

### Getting Started

1. **Import Your Stock List (Recommended)**
   - If you have an existing Excel stock list, go to Stock Management
   - Click "Import Excel"
   - Select your .txt or .tsv file (see EXCEL_IMPORT_GUIDE.md for details)
   - All items will be imported
   - Edit items to add/update categories and prices

2. **Add Workers First**
   - Go to Workers tab
   - Click "Add Worker"
   - Enter name, ID number, and contact
   - Workers must be added before processing sales

3. **Add Stock Items (or edit imported items)**
   - Go to Stock Management
   - Click "Add New Item" or "Edit" button
   - Fill in: name, stock code (optional), category, cost price, sell price, minimum quantity
   - Profit margin is calculated automatically
   - Item is now available for sale

4. **Receive Stock**
   - When new stock arrives, go to Stock Management
   - Click "Receive Stock"
   - Select item and enter quantity received
   - Stock levels update automatically

5. **Process Sales**
   - Go to Shop tab
   - Select the worker
   - Click "Add Item" to add products to cart
   - Adjust quantities as needed
   - Click "Complete Transaction"
   - Stock updates and amount is added to worker's tab
   - Go to Stocktake tab
   - Click "New Stocktake"
   - Choose monthly or annual
   - Count each item physically
   - Enter actual quantities
   - System calculates variances automatically

6. **View Reports**
   - Go to Reports tab
   - Choose report type:
     - Worker Monthly Summary: See all workers' monthly totals
     - Worker Detail: View individual worker transaction history
     - All Transactions: See complete sales record
     - Stocktake Reports: Review variance reports

### Monthly Process

**At Month Start:**
- Review low stock alerts
- Place orders for items below minimum

**During Month:**
- Process daily sales
- Receive stock as it arrives
- Monitor worker balances

**At Month End:**
- Run monthly stocktake
- Generate worker summary reports
- Calculate worker accounts for payment
- Archive transaction data if needed

**Annually:**
- Run annual stocktake
- Review year's sales trends
- Adjust minimum stock levels
- Update prices if needed

## Data Structure

### Stock Items
- Unique ID
- Name (e.g., "Maize Meal 12.5kg")
- Stock Code (optional, e.g., "MM125")
- Category
- Cost Price (what you pay)
- Sell Price (what you charge)
- Profit Margin (calculated automatically)
- Current quantity
- Minimum quantity threshold

### Workers
- Unique ID
- Full name
- ID number
- Contact number

### Transactions
- Date and time
- Worker details
- Item details
- Quantity purchased
- Unit price
- Total amount

### Stocktakes
- Date
- Type (monthly/annual)
- Item-by-item system vs actual counts
- Variance quantities
- Variance values

## Best Practices

### Stock Management
- Set realistic minimum quantities
- Update prices regularly
- Receive stock promptly when delivered
- Check low stock alerts daily

### Worker Accounts
- Process transactions immediately after purchase
- Review worker accounts weekly
- Clear accounts monthly after payment

### Stocktakes
- Conduct monthly stocktakes consistently
- Count during quiet times
- Investigate large variances
- Document reasons for variances

### Data Management
- Back up Google Sheet monthly
- Archive old data yearly
- Keep transaction history for at least 2 years

## Troubleshooting

### Low Stock Not Showing
- Check minimum quantity is set correctly
- Verify current quantity is accurate
- Refresh dashboard

### Transaction Not Processing
- Ensure worker is selected
- Check sufficient stock is available
- Verify all cart items have quantities

### Google Sheets Not Syncing
- Check API key is correct
- Verify Sheet ID matches
- Ensure sheet is shared publicly
- Check internet connection

### Wrong Totals in Reports
- Verify transaction dates are correct
- Check filter dates are set properly
- Ensure all transactions are saved

## Customization

### Adding Categories
Edit the categories array in `StockManagement.jsx`:
```javascript
const categories = ['Groceries', 'Toiletries', 'Household', 'Clothing', 'Other'];
```

### Changing Currency
Search and replace "R " with your currency symbol throughout the code.

### Adjusting Colors
Edit the color values in `App.css`:
- Primary green: `#2c5530`
- Accent green: `#8bc34a`
- Backgrounds and borders as needed

## Technical Details

### Built With
- React 18
- Lucide React (icons)
- Vite (build tool)
- Google Sheets API (data storage)

### File Structure
```
farm-shop-app/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── StockManagement.jsx
│   │   ├── ShopFunction.jsx
│   │   ├── Workers.jsx
│   │   ├── Stocktake.jsx
│   │   └── Reports.jsx
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── GOOGLE_SHEETS_SETUP.md
└── README.md
```

## Future Enhancements

Possible additions for future versions:
- Barcode scanning for faster checkout
- SMS notifications for low stock
- Automatic monthly report generation
- Multi-farm support
- Mobile app version
- Payment tracking and receipts
- Supplier management
- Price history tracking

## Support

For technical support:
1. Check this README first
2. Review GOOGLE_SHEETS_SETUP.md for setup issues
3. Verify your Google Sheets structure matches requirements
4. Check browser console for errors

## License

This software is provided as-is for farm management use.

## Version

Version 1.0 - January 2025

---

**Built for South African farm shops by BKB DSS Team**
