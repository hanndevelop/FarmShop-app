import React, { useState } from 'react';
import { Plus, Package, X, Edit, Upload } from 'lucide-react';

function StockManagement({ stockData, setStockData }) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [showReceiveStock, setShowReceiveStock] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [newItem, setNewItem] = useState({
    name: '',
    stockCode: '',
    category: '',
    costPrice: '',
    sellPrice: '',
    quantity: '',
    minQuantity: ''
  });

  const [editItem, setEditItem] = useState({
    id: null,
    name: '',
    stockCode: '',
    category: '',
    costPrice: '',
    sellPrice: '',
    quantity: '',
    minQuantity: ''
  });

  const [receiveData, setReceiveData] = useState({
    quantity: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [quickAddData, setQuickAddData] = useState({
    itemId: null,
    quantity: ''
  });

  const categories = ['Groceries', 'Toiletries', 'Household', 'Clothing', 'Other'];

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category || !newItem.sellPrice || !newItem.quantity || !newItem.minQuantity) {
      alert('Please fill in required fields: name, category, sell price, quantity, and minimum quantity');
      return;
    }

    const item = {
      id: Date.now(),
      name: newItem.name,
      stockCode: newItem.stockCode,
      category: newItem.category,
      costPrice: newItem.costPrice ? parseFloat(newItem.costPrice) : 0,
      sellPrice: parseFloat(newItem.sellPrice),
      quantity: parseInt(newItem.quantity),
      minQuantity: parseInt(newItem.minQuantity)
    };

    setStockData([...stockData, item]);
    setNewItem({ name: '', stockCode: '', category: '', costPrice: '', sellPrice: '', quantity: '', minQuantity: '' });
    setShowAddItem(false);
  };

  const handleEditItem = () => {
    if (!editItem.name || !editItem.category || !editItem.sellPrice || !editItem.minQuantity) {
      alert('Please fill in required fields');
      return;
    }

    const updatedStock = stockData.map(item => {
      if (item.id === editItem.id) {
        return {
          ...item,
          name: editItem.name,
          stockCode: editItem.stockCode,
          category: editItem.category,
          costPrice: editItem.costPrice ? parseFloat(editItem.costPrice) : 0,
          sellPrice: parseFloat(editItem.sellPrice),
          quantity: parseInt(editItem.quantity),
          minQuantity: parseInt(editItem.minQuantity)
        };
      }
      return item;
    });

    setStockData(updatedStock);
    setEditItem({ id: null, name: '', stockCode: '', category: '', costPrice: '', sellPrice: '', quantity: '', minQuantity: '' });
    setShowEditItem(false);
  };

  const openEditModal = (item) => {
    setEditItem({
      id: item.id,
      name: item.name,
      stockCode: item.stockCode || '',
      category: item.category,
      costPrice: item.costPrice || '',
      sellPrice: item.sellPrice || item.price,
      quantity: item.quantity,
      minQuantity: item.minQuantity
    });
    setShowEditItem(true);
  };

  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Simple CSV/TSV parsing for Excel export
        const text = e.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split('\t');
        
        const importedItems = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split('\t');
          if (values.length > 1 && values[1]?.trim()) {
            const itemName = values[1].trim();
            if (itemName && itemName !== 'nan') {
              importedItems.push({
                id: Date.now() + i,
                name: itemName,
                stockCode: values[2]?.trim() || '',
                category: 'Other', // Default category, can be changed later
                costPrice: values[3] ? parseFloat(values[3]) : 0,
                sellPrice: values[4] ? parseFloat(values[4]) : 0,
                quantity: 0, // Start with 0, will be updated when stock is received
                minQuantity: values[5] ? parseInt(values[5]) : 5
              });
            }
          }
        }
        
        if (importedItems.length > 0) {
          setStockData([...stockData, ...importedItems]);
          alert(`Successfully imported ${importedItems.length} items!`);
        } else {
          alert('No items found in the file');
        }
      } catch (error) {
        alert('Error reading file. Please make sure it\'s a valid Excel file exported as Tab-delimited text.');
      }
    };
    reader.readAsText(file);
  };

  const handleReceiveStock = () => {
    if (!receiveData.quantity || !selectedItem) {
      alert('Please fill in all fields');
      return;
    }

    const updatedStock = stockData.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          quantity: item.quantity + parseInt(receiveData.quantity)
        };
      }
      return item;
    });

    setStockData(updatedStock);
    setReceiveData({ quantity: '', date: new Date().toISOString().split('T')[0] });
    setSelectedItem(null);
    setShowReceiveStock(false);
  };

  const openQuickAdd = (item) => {
    setQuickAddData({ itemId: item.id, quantity: '' });
    setShowQuickAdd(true);
  };

  const handleQuickAdd = () => {
    if (!quickAddData.quantity || quickAddData.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const updatedStock = stockData.map(item => {
      if (item.id === quickAddData.itemId) {
        return {
          ...item,
          quantity: item.quantity + parseInt(quickAddData.quantity)
        };
      }
      return item;
    });

    setStockData(updatedStock);
    setQuickAddData({ itemId: null, quantity: '' });
    setShowQuickAdd(false);
  };

  const getStockStatus = (item) => {
    if (item.quantity < 5) {
      return <span className="badge badge-danger">Out of Stock</span>;
    } else if (item.quantity >= 5 && item.quantity <= 10) {
      return <span className="badge badge-low">Low Stock</span>;
    }
    return <span className="badge badge-ok">OK</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h2>Stock Management</h2>
        <p>Manage your inventory and receive stock</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button className="btn btn-primary" onClick={() => setShowAddItem(true)}>
          <Plus size={20} />
          Add New Item
        </button>
        <button className="btn btn-secondary" onClick={() => setShowReceiveStock(true)}>
          <Package size={20} />
          Receive Stock
        </button>
        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          <Upload size={20} />
          Import Excel
          <input
            type="file"
            accept=".xlsx,.xls,.csv,.txt"
            onChange={handleImportExcel}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Current Stock</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Stock Code</th>
                <th>Category</th>
                <th>Cost Price</th>
                <th>Sell Price</th>
                <th>Margin</th>
                <th>Quantity</th>
                <th>Min Qty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map(item => {
                const sellPrice = item.sellPrice || item.price;
                const costPrice = item.costPrice || 0;
                const margin = sellPrice > 0 && costPrice > 0 ? ((sellPrice - costPrice) / sellPrice * 100).toFixed(1) : '-';
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.stockCode || '-'}</td>
                    <td>{item.category}</td>
                    <td>R {costPrice.toFixed(2)}</td>
                    <td>R {sellPrice.toFixed(2)}</td>
                    <td>{margin !== '-' ? `${margin}%` : '-'}</td>
                    <td>{item.quantity}</td>
                    <td>{item.minQuantity}</td>
                    <td>{getStockStatus(item)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-primary"
                          onClick={() => openQuickAdd(item)}
                          style={{ padding: '6px 12px' }}
                          title="Quick add stock"
                        >
                          <Plus size={16} />
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => openEditModal(item)}
                          style={{ padding: '6px 12px' }}
                          title="Edit item"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Item Modal */}
      {showAddItem && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Stock Item</h3>
              <button className="btn btn-secondary" onClick={() => setShowAddItem(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                placeholder="e.g., Maize Meal 12.5kg"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stock Code</label>
                <input
                  type="text"
                  value={newItem.stockCode}
                  onChange={(e) => setNewItem({...newItem, stockCode: e.target.value})}
                  placeholder="Optional"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cost Price (R)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.costPrice}
                  onChange={(e) => setNewItem({...newItem, costPrice: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Sell Price (R) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.sellPrice}
                  onChange={(e) => setNewItem({...newItem, sellPrice: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

            {newItem.costPrice && newItem.sellPrice && (
              <div className="alert alert-info" style={{ marginBottom: '16px' }}>
                Profit Margin: {((parseFloat(newItem.sellPrice) - parseFloat(newItem.costPrice)) / parseFloat(newItem.sellPrice) * 100).toFixed(1)}%
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Initial Quantity *</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>Minimum Quantity *</label>
                <input
                  type="number"
                  value={newItem.minQuantity}
                  onChange={(e) => setNewItem({...newItem, minQuantity: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddItem(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddItem}>
                Add Item
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
              <button className="btn btn-secondary" onClick={() => setShowReceiveStock(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Select Item</label>
              <select
                value={selectedItem?.id || ''}
                onChange={(e) => {
                  const item = stockData.find(i => i.id === parseInt(e.target.value));
                  setSelectedItem(item);
                }}
              >
                <option value="">Select an item</option>
                {stockData.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Current: {item.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantity Received</label>
                <input
                  type="number"
                  value={receiveData.quantity}
                  onChange={(e) => setReceiveData({...receiveData, quantity: e.target.value})}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>Date Received</label>
                <input
                  type="date"
                  value={receiveData.date}
                  onChange={(e) => setReceiveData({...receiveData, date: e.target.value})}
                />
              </div>
            </div>

            {selectedItem && receiveData.quantity && (
              <div className="alert alert-info">
                New quantity will be: {selectedItem.quantity + parseInt(receiveData.quantity)}
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReceiveStock(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleReceiveStock}>
                Receive Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditItem && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Stock Item</h3>
              <button className="btn btn-secondary" onClick={() => setShowEditItem(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                value={editItem.name}
                onChange={(e) => setEditItem({...editItem, name: e.target.value})}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stock Code</label>
                <input
                  type="text"
                  value={editItem.stockCode}
                  onChange={(e) => setEditItem({...editItem, stockCode: e.target.value})}
                  placeholder="Optional"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={editItem.category}
                  onChange={(e) => setEditItem({...editItem, category: e.target.value})}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cost Price (R)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editItem.costPrice}
                  onChange={(e) => setEditItem({...editItem, costPrice: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Sell Price (R) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editItem.sellPrice}
                  onChange={(e) => setEditItem({...editItem, sellPrice: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

            {editItem.costPrice && editItem.sellPrice && (
              <div className="alert alert-info" style={{ marginBottom: '16px' }}>
                Profit Margin: {((parseFloat(editItem.sellPrice) - parseFloat(editItem.costPrice)) / parseFloat(editItem.sellPrice) * 100).toFixed(1)}%
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Current Quantity *</label>
                <input
                  type="number"
                  value={editItem.quantity}
                  onChange={(e) => setEditItem({...editItem, quantity: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Minimum Quantity *</label>
                <input
                  type="number"
                  value={editItem.minQuantity}
                  onChange={(e) => setEditItem({...editItem, minQuantity: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEditItem(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleEditItem}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Stock Modal */}
      {showQuickAdd && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Quick Add Stock</h3>
              <button className="btn btn-secondary" onClick={() => setShowQuickAdd(false)}>
                <X size={20} />
              </button>
            </div>

            {quickAddData.itemId && (
              <>
                <div className="alert alert-info" style={{ marginBottom: '20px' }}>
                  <Package size={20} />
                  <div>
                    <strong>{stockData.find(i => i.id === quickAddData.itemId)?.name}</strong>
                    <div style={{ fontSize: '14px' }}>
                      Current stock: {stockData.find(i => i.id === quickAddData.itemId)?.quantity}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Quantity to Add</label>
                  <input
                    type="number"
                    min="1"
                    value={quickAddData.quantity}
                    onChange={(e) => setQuickAddData({...quickAddData, quantity: e.target.value})}
                    placeholder="Enter quantity"
                    autoFocus
                  />
                </div>

                {quickAddData.quantity && (
                  <div className="alert alert-success">
                    New stock will be: {stockData.find(i => i.id === quickAddData.itemId)?.quantity + parseInt(quickAddData.quantity)}
                  </div>
                )}
              </>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowQuickAdd(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleQuickAdd}>
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockManagement;
