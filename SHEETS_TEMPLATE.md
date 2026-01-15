# Google Sheets Template Structure

## Quick Copy-Paste Headers

Copy these headers directly into your Google Sheets:

### Stock_Master (Sheet 1)
```
item_id	item_name	category	price	current_quantity	minimum_quantity	date_added
```

### Stock_Receipts (Sheet 2)
```
receipt_id	item_id	item_name	quantity_received	date_received	notes
```

### Transactions (Sheet 3)
```
transaction_id	date	worker_id	worker_name	item_id	item_name	quantity	price	total
```

### Workers (Sheet 4)
```
worker_id	worker_name	id_number	contact_number	date_added
```

### Stocktakes (Sheet 5)
```
stocktake_id	date	type	item_id	item_name	system_quantity	actual_quantity	variance	variance_value
```

### Worker_Summaries (Sheet 6)
```
worker_id	worker_name	month	year	total_purchases	transaction_count
```

## Sample Data to Get Started

### Sample Stock Items (Stock_Master):
```
1	Maize Meal 12.5kg	Groceries	89.99	50	10	2025-01-14
2	Sugar 2.5kg	Groceries	45.50	30	15	2025-01-14
3	Soap Bar	Toiletries	12.99	100	20	2025-01-14
4	Cooking Oil 2L	Groceries	65.00	25	8	2025-01-14
5	Washing Powder 2kg	Household	75.99	20	10	2025-01-14
```

### Sample Workers (Workers):
```
1	Johannes Mkhize	7801015800082	0721234567	2025-01-14
2	Sarah Dlamini	8505129800083	0739876543	2025-01-14
3	Petrus van der Merwe	9203136789084	0837654321	2025-01-14
```

### Sample Transaction (Transactions):
```
1	2025-01-14	1	Johannes Mkhize	1	Maize Meal 12.5kg	2	89.99	179.98
2	2025-01-14	1	Johannes Mkhize	3	Soap Bar	5	12.99	64.95
3	2025-01-14	2	Sarah Dlamini	2	Sugar 2.5kg	1	45.50	45.50
```

## Advanced Formulas

### Stock_Master Sheet - Add these helper columns:

**Column H - Stock Status:**
```
=IF(E2<=F2,"LOW STOCK","OK")
```

**Column I - Stock Value:**
```
=D2*E2
```

### Worker_Summaries Sheet - Auto-calculate monthly totals:

**Setup:**
- In columns A-B: List all workers (can link to Workers sheet)
- In column C: Month number (1-12)
- In column D: Year (2025, 2026, etc.)

**Column E - Total Purchases (Monthly):**
```
=SUMIFS(Transactions!$I:$I,Transactions!$C:$C,$A2,Transactions!$B:$B,">="&DATE($D2,$C2,1),Transactions!$B:$B,"<"&DATE($D2,$C2+1,1))
```

**Column F - Transaction Count:**
```
=COUNTIFS(Transactions!$C:$C,$A2,Transactions!$B:$B,">="&DATE($D2,$C2,1),Transactions!$B:$B,"<"&DATE($D2,$C2+1,1))
```

### Dashboard Summary Sheet (Optional - Create new sheet called "Dashboard")

**Total Stock Value:**
```
=SUMPRODUCT(Stock_Master!$D:$D,Stock_Master!$E:$E)
```

**Low Stock Items Count:**
```
=COUNTIF(Stock_Master!$H:$H,"LOW STOCK")
```

**Total Transactions Today:**
```
=COUNTIF(Transactions!$B:$B,TODAY())
```

**Total Sales Today:**
```
=SUMIF(Transactions!$B:$B,TODAY(),Transactions!$I:$I)
```

**Total Sales This Month:**
```
=SUMIFS(Transactions!$I:$I,Transactions!$B:$B,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))
```

### Conditional Formatting Rules

**Stock_Master - Highlight Low Stock:**
1. Select column H (Status column)
2. Format → Conditional formatting
3. Format rules: Text contains "LOW STOCK"
4. Formatting style: Red background

**Stock_Master - Highlight Quantities:**
1. Select column E (current_quantity)
2. Format → Conditional formatting
3. Custom formula: `=E2<=F2`
4. Formatting style: Light red background

**Transactions - Highlight Large Purchases:**
1. Select column I (total)
2. Format → Conditional formatting
3. Format rules: Greater than 500
4. Formatting style: Yellow background

## Data Validation Setup

### Stock_Master - Category Dropdown:
1. Create a "Categories" sheet with values:
   ```
   Groceries
   Toiletries
   Household
   Clothing
   Other
   ```
2. Select Stock_Master column C (from C2 down)
3. Data → Data validation
4. Criteria: List from a range
5. Range: Categories!A:A

### Stocktakes - Type Dropdown:
1. Select Stocktakes column C (from C2 down)
2. Data → Data validation
3. Criteria: List of items
4. Items: monthly,annual

## Protected Ranges (Recommended)

Protect these sheets from accidental editing:
1. Worker_Summaries (formulas only)
2. Dashboard (if using summary sheet)

Allow editing for:
1. Stock_Master (farmer needs to add items)
2. Workers (farmer needs to add workers)
3. Stock_Receipts (farmer records stock received)
4. Transactions (app writes here)
5. Stocktakes (app writes here)

## Sheet Colors (For Organization)

Assign tab colors:
- Stock_Master: Green
- Stock_Receipts: Light green
- Transactions: Blue
- Workers: Orange
- Stocktakes: Purple
- Worker_Summaries: Light blue
- Dashboard: Dark green (if created)
- Categories: Grey

## Tips for Setting Up

1. **Start with headers**: Copy all headers first
2. **Add sample data**: Test with a few items
3. **Set up formulas**: Add helper columns
4. **Apply formatting**: Colors and validation
5. **Test the flow**: Manually add a transaction
6. **Protect sheets**: Lock formula sheets
7. **Share properly**: Set to "Anyone with link can view"

## Common Excel/Google Sheets Functions Used

- `SUMIF` / `SUMIFS`: Sum with conditions
- `COUNTIF` / `COUNTIFS`: Count with conditions
- `IF`: Conditional logic
- `DATE`: Create date values
- `TODAY()`: Current date
- `YEAR()`, `MONTH()`: Extract date parts
- `SUMPRODUCT`: Multiply and sum arrays

## Maintenance Schedule

**Daily:**
- Check low stock alerts
- Verify transactions are recording

**Weekly:**
- Review worker balances
- Check for data errors

**Monthly:**
- Run stocktake
- Generate worker summaries
- Archive if needed

**Quarterly:**
- Review and update prices
- Adjust minimum quantities
- Check formula accuracy

**Annually:**
- Full stocktake
- Archive old data
- Backup entire sheet

## Backup Strategy

1. **Make monthly copies**: File → Make a copy
2. **Name with date**: "Farm Shop Data - Jan 2025 Backup"
3. **Download as Excel**: File → Download → Excel (.xlsx)
4. **Store locally**: Keep on farm computer and USB drive

## Integration Checklist

Before connecting to the app:

- [ ] All 6 sheets created
- [ ] Headers match exactly
- [ ] Sample data added and tested
- [ ] Formulas working correctly
- [ ] Sheet shared publicly
- [ ] Sheet ID copied
- [ ] API key created
- [ ] API key added to app
- [ ] Sheet ID added to app
- [ ] Test connection successful

---

**Ready to use! Follow the setup guide and you'll be running in no time.**
