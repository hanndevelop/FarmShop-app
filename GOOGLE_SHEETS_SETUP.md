# Farm Shop Management - Google Sheets Setup Guide

## Overview
This guide will help you set up the Google Sheets backend for your Farm Shop Management system.

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "Farm Shop Data"

## Step 2: Create the Required Sheets

Create the following 6 sheets (tabs) in your spreadsheet:

### Sheet 1: Stock_Master
**Columns:**
- A: item_id
- B: item_name
- C: category
- D: price
- E: current_quantity
- F: minimum_quantity
- G: date_added

**Example data (row 2):**
```
1 | Maize Meal 12.5kg | Groceries | 89.99 | 50 | 10 | 2025-01-14
```

### Sheet 2: Stock_Receipts
**Columns:**
- A: receipt_id
- B: item_id
- C: item_name
- D: quantity_received
- E: date_received
- F: notes

**Purpose:** Track when stock is received/restocked

### Sheet 3: Transactions
**Columns:**
- A: transaction_id
- B: date
- C: worker_id
- D: worker_name
- E: item_id
- F: item_name
- G: quantity
- H: price
- I: total

**Purpose:** Record all sales to workers

### Sheet 4: Workers
**Columns:**
- A: worker_id
- B: worker_name
- C: id_number
- D: contact_number
- E: date_added

**Example data (row 2):**
```
1 | Johannes Mkhize | 7801015800082 | 0721234567 | 2025-01-14
```

### Sheet 5: Stocktakes
**Columns:**
- A: stocktake_id
- B: date
- C: type (monthly/annual)
- D: item_id
- E: item_name
- F: system_quantity
- G: actual_quantity
- H: variance
- I: variance_value

**Purpose:** Record physical stock counts and variances

### Sheet 6: Worker_Summaries
**Purpose:** This will be auto-calculated using formulas

**Columns:**
- A: worker_id
- B: worker_name
- C: month
- D: year
- E: total_purchases
- F: transaction_count

**Formula for E2 (assuming worker_id 1, month 1, year 2025):**
```
=SUMIFS(Transactions!I:I, Transactions!C:C, A2, Transactions!B:B, ">="&DATE(D2,C2,1), Transactions!B:B, "<"&DATE(D2,C2+1,1))
```

## Step 3: Format Your Sheets

### Stock_Master formatting:
- Set column D (price) format: Custom number format: R #,##0.00
- Set columns E, F (quantities) format: Number with 0 decimals

### Transactions formatting:
- Set column H (price) format: Custom number format: R #,##0.00
- Set column I (total) format: Custom number format: R #,##0.00
- Set column B (date) format: Date

### Stocktakes formatting:
- Set columns F, G, H (quantities) format: Number with 0 decimals
- Set column I (variance_value) format: Custom number format: R #,##0.00

## Step 4: Set Up Data Validation (Optional but Recommended)

### Stock_Master - Category column (C):
1. Select column C (from C2 downwards)
2. Data → Data validation
3. Criteria: List from a range
4. Create a new sheet called "Categories" with these values:
   - Groceries
   - Toiletries
   - Household
   - Clothing
   - Other

### Stocktakes - Type column (C):
1. Select column C (from C2 downwards)
2. Data → Data validation
3. Criteria: List of items
4. Values: monthly, annual

## Step 5: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the Google Sheets API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

## Step 6: Create API Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. (Optional) Restrict the API key to Google Sheets API only

## Step 7: Share Your Sheet

1. Click "Share" button in your Google Sheet
2. Change access to "Anyone with the link can view"
3. Copy the Sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
4. The part between `/d/` and `/edit` is your Sheet ID

## Step 8: Configure the App

In your `App.jsx` file, replace:
```javascript
const SHEET_ID = 'YOUR_SHEET_ID_HERE';
const API_KEY = 'YOUR_API_KEY_HERE';
```

With your actual Sheet ID and API Key.

## Example Google Sheets Formulas

### Low Stock Alert (add to Stock_Master sheet)
In column H (create a "Status" column):
```
=IF(E2<=F2,"LOW STOCK","OK")
```

### Monthly Summary (add to a Summary sheet)
Total sales this month:
```
=SUMIFS(Transactions!I:I, Transactions!B:B, ">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))
```

### Worker Outstanding Balance
In Worker_Summaries, calculate total outstanding:
```
=SUMIF(Transactions!C:C, A2, Transactions!I:I)
```

## Tips for Managing Your Sheet

1. **Backup regularly**: Make copies of your sheet monthly
2. **Use freeze rows**: Freeze row 1 (headers) for easier scrolling
3. **Color coding**: Use conditional formatting to highlight low stock items
4. **Protect sheets**: Protect formula sheets from accidental edits
5. **Archive old data**: Create yearly archive sheets for old transactions

## Troubleshooting

### API Key not working:
- Ensure Google Sheets API is enabled in Cloud Console
- Check API key restrictions
- Verify sheet is shared publicly

### Data not updating:
- Check sheet permissions
- Verify Sheet ID is correct
- Ensure column headers match exactly

### Formulas not calculating:
- Check date formats are consistent
- Verify cell references are correct
- Ensure no circular references exist

## Next Steps

Once your sheets are set up:
1. Test adding data manually to each sheet
2. Verify formulas are calculating correctly
3. Connect the React app and test the integration
4. Start using the system with real data

## Support

For issues with:
- Google Sheets setup: Check Google Workspace documentation
- App functionality: Review the React component code
- Integration: Verify API credentials and sheet permissions
