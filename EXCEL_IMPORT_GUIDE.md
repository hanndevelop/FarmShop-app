# Excel Stock Import Guide

## How to Import Your Stock List

The app can import stock items from your Excel file. Follow these steps:

### Step 1: Prepare Your Excel File

Your Excel file should have these columns (in this order):
1. Index/Number (optional)
2. **Stock item** - Item name (required)
3. **Stock code** - Item code (optional)
4. **Stock cost price** - What you pay for it (optional)
5. **Stock sell price** - What you sell it for (optional)
6. **Warning stock level** - Minimum quantity (optional)

**Example:**
```
| # | Stock item        | Stock code | Stock cost price | Stock sell price | Warning stock level |
|---|-------------------|------------|------------------|------------------|---------------------|
| 1 | Maize Meal 12.5kg | MM125      | 75.00            | 89.99            | 10                  |
| 2 | Sugar 2.5kg       | SUG25      | 38.00            | 45.50            | 15                  |
```

### Step 2: Export Excel as Tab-Delimited Text

**In Excel:**
1. Open your file (like STOOR_VOORRAAD_HANNELET__1_.xlsx)
2. Go to **File → Save As**
3. Choose format: **Text (Tab delimited) (*.txt)**
4. Save the file

**In Google Sheets:**
1. Open your file
2. Go to **File → Download → Tab-separated values (.tsv)**

### Step 3: Import into the App

1. Open the Farm Shop app
2. Go to **Stock Management** tab
3. Click the **Import Excel** button
4. Select your .txt or .tsv file
5. The app will import all items

### What Gets Imported

- **Item Name**: Copied directly from your Excel
- **Stock Code**: Copied if available, blank if not
- **Category**: Set to "Other" by default (you can edit later)
- **Cost Price**: Copied if available, set to 0 if blank
- **Sell Price**: Copied if available, set to 0 if blank
- **Current Quantity**: Set to 0 initially (add stock using "Receive Stock")
- **Min Quantity**: Copied if available, set to 5 if blank

### After Import

**You need to:**
1. ✅ Review all imported items
2. ✅ Set correct **categories** for each item
3. ✅ Add or update **prices** if they're missing or wrong
4. ✅ Use **Receive Stock** to add initial quantities
5. ✅ Update **minimum quantities** if needed

**To edit an item:**
- Click the **Edit** button (pencil icon) next to any item
- Update the information
- Click **Save Changes**

### Your Stock List Items

From STOOR_VOORRAAD_HANNELET__1_.xlsx, these items will be imported:

1. ACE/Kloof KOFFIE
2. Afval Bees
3. Afval Skaap
4. Appelkooskonf
5. Auto Waspoeier
6. Bakpoeier 50g
7. BB 25g
8. Bene
9. Besem sag
10. Blades Manora
... (and 83 more items)

### Tips

**Before Import:**
- Fill in as many prices as possible in Excel
- Add stock codes if you use them
- Set warning levels for critical items

**After Import:**
- Assign categories to make finding items easier
- Set realistic minimum quantities for each item
- Use "Receive Stock" to record your initial inventory count

**Suggested Categories:**
- **Groceries**: Maize meal, sugar, rice, cooking oil, beans, etc.
- **Toiletries**: Soap, toothpaste, shampoo, deodorant, etc.
- **Household**: Cleaning products, toilet paper, matches, etc.
- **Clothing**: Socks, work gloves, overalls, etc.
- **Other**: Anything that doesn't fit above

### Troubleshooting

**"No items found in the file"**
- Make sure you exported as Tab-delimited text, not Excel format
- Check that your file has item names in the second column

**"Error reading file"**
- Try re-exporting from Excel as Tab-delimited
- Make sure the file isn't corrupted

**Items imported but prices are zero**
- This is normal if prices weren't in the Excel file
- Edit each item to add prices

**Wrong item names imported**
- Check that your Excel doesn't have extra header rows
- The app expects data to start from row 2 (row 1 is headers)

### Example: Complete Workflow

1. **Export your stock list** from Excel as .txt
2. **Import** into the app via "Import Excel" button
3. **Edit items** one by one:
   - Add/update prices
   - Set categories
   - Adjust minimum quantities
4. **Receive stock** for items you have on hand
5. **Start using** the shop function!

### Re-Importing

If you need to import again:
- The app will ADD new items to existing ones
- It won't delete or overwrite existing items
- Duplicate items will have different IDs
- Consider starting fresh if you need to re-import everything

### Updates to Existing Items

Once items are in the system:
- Use the **Edit** button to update prices, codes, categories
- Use **Receive Stock** to add quantities
- Don't re-import unless adding completely new items

---

**Need help?** Make sure your Excel file matches the expected format and is exported as tab-delimited text.
