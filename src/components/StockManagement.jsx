import React, { useState } from 'react';
import { Plus, Edit, X, Upload, Package, Download } from 'lucide-react';

// Helper function to export to Excel (CSV format)
const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename + '.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function StockManagement({ stockData, setStockData }) {
  const [showAddStock, setShowAddStock] = useState(false);
  const [showReceiveStock, setShowReceiveStock] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  
  const [stockForm, setStockForm] = useState({
    name: '',
    stockCode: '',
    category: '',
    costPrice: 0,
    sellPrice: 0,
    quantity: 0,
    minQuantity: 5
  });

  const [receiveForm, setReceiveForm] = useState({
    itemId: '',
    quantity: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Groceries', 'Toiletries', 'Household', 'Clothing', 'Other'];

  const handleExportStock = () => {
    const exportData = stockData.map(item => ({
      'Stock Code': item.stockCode || '',
      'Name': item.name,
      'Category': item.category,
      'Cost Price': 'R ' + (item.costPrice || 0).toFixed(2),
      'Sell Price': 'R ' + (item.sellPrice || 0).toFixed(2),
      'Margin %': calculateMargin(item.costPrice, item.sellPrice) + '%',
      'Quantity': item.quantity,
      'Min Quantity': item.minQuantity,
      'Status': item.quantity < 5 ? 'Out of Stock' : item.quantity <= 10 ? 'Low Stock' : 'OK'
    }));
    
    exportToExcel(exportData, 'Stock_List');
  };

  const handleAddStock = () => {
    if (!stockForm.name || !stockForm.category) {
      alert('Please fill in at least name and category');
      return;
    }

    const newItem = {
      id: Date.now(),
      ...stockForm
    };

    setStockData([...stockData, newItem]);
    setStockForm({
      name: '',
      stockCode: '',
      category: '',
      costPrice: 0,
      sellPrice: 0,
      quantity: 0,
      minQuantity: 5
    });
    setShowAddStock(false);
  };

  const handleEditStock = () => {
    if (!stockForm.name || !stockForm.category) {
      alert('Please fill in at least name and category');
      return;
    }

    const updatedStock = stockData.map(item =>
      item.id === editingStock.id
        ? { ...item, ...stockForm }
        : item
    );

    setStockData(updatedStock);
    setStockForm({
      name: '',
      stockCode: '',
      category: '',
      costPrice: 0,
      sellPrice: 0,
      quantity: 0,
      minQuantity: 5
    });
    setEditingStock(null);
  };

  const openEditModal = (item) => {
    setEditingStock(item);
    setStockForm({
      name: item.name,
      stockCode: item.stockCode || '',
      category: item.category,
      costPrice: item.costPrice || 0,
      sellPrice: item.sellPrice || 0,
      quantity: item.quantity,
      minQuantity: item.minQuantity || 5
    });
  };

  const handleReceiveStock = () => {
    if (!receiveForm.itemId || receiveForm.quantity <= 0) {
      alert('Please select item and enter valid quantity');
      return;
    }

    const updatedStock = stockData.map(item =>
      item.id === parseInt(receiveForm.itemId)
        ? { ...item, quantity: item.quantity + receiveForm.quantity }
        : item
    );

    setStockData(updatedStock);
    setReceiveForm({
      itemId: '',
      quantity: 0,
      date: new Date().toISOString().split('T')[0]
    });
    setShowReceiveStock(false);
    alert('Stock received successfully!');
  };

  const handleQuickAddStock = (item) => {
    const quantity = prompt(`Add stock for ${item.name}.\nEnter quantity to add:`, '10');
    if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
      const updatedStock = stockData.map(i =>
        i.id === item.id
          ? { ...i, quantity: i.quantity + parseInt(quantity) }
          : i
      );
      setStockData(updatedStock);
      alert(`Added ${quantity} units to ${item.name}`);
    }
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        // Handle both Windows (\r\n) and Unix (\n) line endings
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        
        if (lines.length < 2) {
          alert('File must have headers and at least one item');
          return;
        }

        // Check if it's comma or tab delimited
        const firstLine = lines[0];
        const delimiter = firstLine.includes('\t') ? '\t' : ',';
        
        const headers = lines[0].toLowerCase().split(delimiter).map(h => h.trim());
        console.log('Found ' + headers.length + ' columns:', headers);
        
        const importedItems = [];
        const errors = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue; // Skip empty lines
          
          const values = line.split(delimiter).map(v => v.trim());
          
          console.log('Row ' + (i+1) + ':', values);
          
          // Map columns by header name (flexible mapping)
          const getColumn = (possibleNames) => {
            for (let name of possibleNames) {
              const index = headers.indexOf(name.toLowerCase());
              if (index !== -1 && values[index]) {
                return values[index];
              }
            }
            return '';
          };
          
          const stockCode = getColumn(['id', 'stockcode', 'code', 'stock_code']);
          const name = getColumn(['name', 'item', 'description', 'product']);
          const category = getColumn(['category', 'cat']);
          const costPriceStr = getColumn(['costprice', 'cost_price', 'cost', 'costPrice']);
          const quantityStr = getColumn(['quantity', 'qty', 'stock']);
          const minQuantityStr = getColumn(['minquantity', 'min_quantity', 'minQuantity', 'min']);
          
          const costPrice = parseFloat(costPriceStr) || 0;
          const quantity = parseInt(quantityStr) || 0;
          const minQuantity = parseInt(minQuantityStr) || 5;
          
          // Skip if no name
          if (!name) {
            errors.push(`Row ${i + 1}: No name found`);
            continue;
          }
          
          // Auto-calculate sell price with 26% margin
          const sellPrice = costPrice > 0 ? parseFloat((costPrice * 1.26).toFixed(2)) : 0;
          
          importedItems.push({
            id: Date.now() + i,
            name: name,
            stockCode: stockCode || '',
            category: category || '',
            costPrice: costPrice,
            sellPrice: sellPrice,
            quantity: quantity,
            minQuantity: minQuantity
          });
        }
        
        console.log('Successfully parsed ' + importedItems.length + ' items');
        
        if (importedItems.length > 0) {
          setStockData([...stockData, ...importedItems]);
          
          const withCost = importedItems.filter(i => i.costPrice > 0).length;
          const withStock = importedItems.filter(i => i.quantity > 0).length;
          const withCategory = importedItems.filter(i => i.category).length;
          
          const summary = `✅ Successfully imported ${importedItems.length} items!\n\n` +
                         `📊 Summary:\n` +
                         `- Items with cost price: ${withCost}\n` +
                         `- Items with stock: ${withStock}\n` +
                         `- Items with category: ${withCategory}\n\n` +
                         `💡 Sell prices auto-calculated at Cost + 26%\n` +
                         `${errors.length > 0 ? `\n⚠️ ${errors.length} rows skipped (check console)` : ''}`;
          
          alert(summary);
        } else {
          alert('❌ No items found in file.\n\nPossible issues:\n- File might be empty\n- Column names don\'t match\n\nExpected columns:\n- id (or stockCode)\n- name\n- costPrice\n- quantity\n\nFound columns:\n' + headers.join(', '));
        }
        
        if (errors.length > 0) {
          console.log('Import errors:', errors);
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('❌ Error reading file: ' + error.message + '\n\nSupported formats:\n- Comma delimited (CSV)\n- Tab delimited (TSV)\n\nMake sure file has headers in first row!');
      }
    };
    reader.readAsText(file);
  };

  const handleBulkReceiveStock = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          alert('CSV file must have headers and at least one item\n\nFormat:\nitem_name,quantity_to_add');
          return;
        }

        let updatedCount = 0;
        const errors = [];
        let updatedStock = [...stockData];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const itemName = values[0];
          const quantityToAdd = parseInt(values[1]) || 0;

          if (!itemName || quantityToAdd <= 0) {
            errors.push(`Row ${i + 1}: Invalid data`);
            continue;
          }

          const itemIndex = updatedStock.findIndex(item => 
            item.name.toLowerCase() === itemName.toLowerCase() ||
            (item.stockCode && item.stockCode.toLowerCase() === itemName.toLowerCase())
          );

          if (itemIndex !== -1) {
            updatedStock[itemIndex] = {
              ...updatedStock[itemIndex],
              quantity: updatedStock[itemIndex].quantity + quantityToAdd
            };
            updatedCount++;
          } else {
            errors.push(`Row ${i + 1}: Item "${itemName}" not found`);
          }
        }

        setStockData(updatedStock);

        if (errors.length > 0) {
          alert(`✅ Updated ${updatedCount} items.\n\n⚠️ Errors:\n${errors.slice(0, 10).join('\n')}${errors.length > 10 ? '\n...' : ''}`);
        } else {
          alert(`✅ Successfully added stock to ${updatedCount} items!`);
        }
      } catch (error) {
        alert('Error reading file.\n\nExpected format:\nitem_name,quantity\nMaize Meal 5kg,20\nSugar 2.5kg,15');
      }
    };
    reader.readAsText(file);
  };

  const getStockStatus = (item) => {
    if (item.quantity < 5) {
      return <span className="badge badge-danger">Out of Stock</span>;
    } else if (item.quantity >= 5 && item.quantity <= 10) {
      return <span className="badge badge-low">Low Stock</span>;
    }
    return <span className="badge badge-ok">OK</span>;
  };

  const calculateMargin = (cost, sell) => {
    if (cost === 0) return 0;
    return ((sell - cost) / cost * 100).toFixed(1);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Stock Management</h2>
        <p>Manage your inventory</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddStock(true)}
        >
          <Plus size={20} />
          Add Stock Item
        </button>

        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          <Upload size={20} />
          Import Items (CSV)
          <input
            type="file"
            accept=".csv,.txt,.tsv"
            onChange={handleImportCSV}
            style={{ display: 'none' }}
          />
        </label>

        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          <Package size={20} />
          Bulk Receive Stock (CSV)
          <input
            type="file"
            accept=".csv"
            onChange={handleBulkReceiveStock}
            style={{ display: 'none' }}
          />
        </label>

        <button 
          className="btn btn-secondary"
          onClick={() => setShowReceiveStock(true)}
        >
          <Plus size={20} />
          Receive Stock
        </button>

        <button 
          className="btn btn-secondary"
          onClick={handleExportStock}
          disabled={stockData.length === 0}
        >
          <Download size={20} />
          Export Stock to Excel
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All Stock Items ({stockData.length})</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Stock Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Cost Price</th>
                <th>Sell Price</th>
                <th>Margin</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map(item => (
                <tr key={item.id}>
                  <td>{item.stockCode || '-'}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>R {(item.costPrice || 0).toFixed(2)}</td>
                  <td>R {(item.sellPrice || 0).toFixed(2)}</td>
                  <td>{calculateMargin(item.costPrice, item.sellPrice)}%</td>
                  <td>{item.quantity}</td>
                  <td>{getStockStatus(item)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => openEditModal(item)}
                        style={{ padding: '6px 12px' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleQuickAddStock(item)}
                        style={{ padding: '6px 12px', backgroundColor: '#8bc34a' }}
                        title="Quick add stock"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddStock && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Stock Item</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddStock(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                value={stockForm.name}
                onChange={(e) => setStockForm({...stockForm, name: e.target.value})}
                placeholder="e.g., Maize Meal 5kg"
              />
            </div>

            <div className="form-group">
              <label>Stock Code</label>
              <input
                type="text"
                value={stockForm.stockCode}
                onChange={(e) => setStockForm({...stockForm, stockCode: e.target.value})}
                placeholder="e.g., MM5KG"
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={stockForm.category}
                onChange={(e) => setStockForm({...stockForm, category: e.target.value})}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Cost Price *</label>
              <input
                type="number"
                value={stockForm.costPrice}
                onChange={(e) => {
                  const cost = parseFloat(e.target.value) || 0;
                  const sell = cost > 0 ? parseFloat((cost * 1.26).toFixed(2)) : 0;
                  setStockForm({
                    ...stockForm, 
                    costPrice: cost,
                    sellPrice: sell
                  });
                }}
                placeholder="e.g., 45.00"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Sell Price * (Auto: Cost + 26%)</label>
              <input
                type="number"
                value={stockForm.sellPrice}
                onChange={(e) => setStockForm({...stockForm, sellPrice: parseFloat(e.target.value) || 0})}
                placeholder="Auto-calculated from cost"
                step="0.01"
              />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Current margin: {calculateMargin(stockForm.costPrice, stockForm.sellPrice)}%
              </small>
            </div>

            <div className="form-group">
              <label>Initial Quantity</label>
              <input
                type="number"
                value={stockForm.quantity}
                onChange={(e) => setStockForm({...stockForm, quantity: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Minimum Quantity Alert</label>
              <input
                type="number"
                value={stockForm.minQuantity}
                onChange={(e) => setStockForm({...stockForm, minQuantity: parseInt(e.target.value) || 5})}
                placeholder="5"
              />
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddStock(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddStock}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {editingStock && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Stock Item</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => setEditingStock(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                value={stockForm.name}
                onChange={(e) => setStockForm({...stockForm, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Stock Code</label>
              <input
                type="text"
                value={stockForm.stockCode}
                onChange={(e) => setStockForm({...stockForm, stockCode: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={stockForm.category}
                onChange={(e) => setStockForm({...stockForm, category: e.target.value})}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Cost Price *</label>
              <input
                type="number"
                value={stockForm.costPrice}
                onChange={(e) => {
                  const cost = parseFloat(e.target.value) || 0;
                  const sell = cost > 0 ? parseFloat((cost * 1.26).toFixed(2)) : 0;
                  setStockForm({
                    ...stockForm, 
                    costPrice: cost,
                    sellPrice: sell
                  });
                }}
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Sell Price * (Auto: Cost + 26%)</label>
              <input
                type="number"
                value={stockForm.sellPrice}
                onChange={(e) => setStockForm({...stockForm, sellPrice: parseFloat(e.target.value) || 0})}
                step="0.01"
              />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Current margin: {calculateMargin(stockForm.costPrice, stockForm.sellPrice)}%
              </small>
            </div>

            <div className="form-group">
              <label>Current Quantity</label>
              <input
                type="number"
                value={stockForm.quantity}
                onChange={(e) => setStockForm({...stockForm, quantity: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="form-group">
              <label>Minimum Quantity Alert</label>
              <input
                type="number"
                value={stockForm.minQuantity}
                onChange={(e) => setStockForm({...stockForm, minQuantity: parseInt(e.target.value) || 5})}
              />
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setEditingStock(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleEditStock}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Stock Modal */}
      {showReceiveStock && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Receive Stock</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowReceiveStock(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Select Item *</label>
              <select
                value={receiveForm.itemId}
                onChange={(e) => setReceiveForm({...receiveForm, itemId: e.target.value})}
              >
                <option value="">Choose item</option>
                {stockData.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Current: {item.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity Received *</label>
              <input
                type="number"
                value={receiveForm.quantity}
                onChange={(e) => setReceiveForm({...receiveForm, quantity: parseInt(e.target.value) || 0})}
                placeholder="Enter quantity"
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Date Received</label>
              <input
                type="date"
                value={receiveForm.date}
                onChange={(e) => setReceiveForm({...receiveForm, date: e.target.value})}
              />
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowReceiveStock(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleReceiveStock}
              >
                Receive Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockManagement;
