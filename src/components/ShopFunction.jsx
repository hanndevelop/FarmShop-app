import React, { useState } from 'react';
import { Plus, X, ShoppingCart, User, Search, Calendar } from 'lucide-react';

function ShopFunction({ stockData, workers, setTransactions }) {
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [cart, setCart] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [barcodeInput, setBarcodeInput] = useState('');

  const selectWorker = (worker) => {
    setSelectedWorker(worker);
    setCart([]);
  };

  // Handle barcode scanner input
  const handleBarcodeInput = (value) => {
    setBarcodeInput(value);
    
    // Auto-search when barcode is entered (typically 8-13 digits)
    if (value.length >= 8) {
      const item = stockData.find(i => 
        i.barcode && i.barcode.trim().toLowerCase() === value.trim().toLowerCase()
      );
      
      if (item && item.quantity > 0) {
        addToCart(item);
        setBarcodeInput(''); // Clear input after adding
      }
    }
  };

  // Handle Enter key press on barcode input
  const handleBarcodeKeyPress = (e) => {
    if (e.key === 'Enter') {
      const value = barcodeInput.trim();
      if (value) {
        const item = stockData.find(i => 
          i.barcode && i.barcode.trim().toLowerCase() === value.toLowerCase()
        );
        
        if (item) {
          if (item.quantity > 0) {
            addToCart(item);
            setBarcodeInput('');
          } else {
            alert(`${item.name} is out of stock!`);
            setBarcodeInput('');
          }
        } else {
          alert(`No item found with barcode: ${value}`);
          setBarcodeInput('');
        }
      }
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(i => i.id === item.id);
    
    if (existingItem) {
      const updatedCart = cart.map(i =>
        i.id === item.id
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
          : i
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: item.sellPrice,
        quantity: 1,
        total: item.sellPrice
      }]);
    }
    
    setShowAddItem(false);
    setSearchTerm('');
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    updatedCart[index].total = updatedCart[index].price * newQuantity;
    setCart(updatedCart);
  };

  const updatePrice = (index, newPrice) => {
    if (newPrice < 0) return;
    
    const updatedCart = [...cart];
    updatedCart[index].price = newPrice;
    updatedCart[index].total = newPrice * updatedCart[index].quantity;
    setCart(updatedCart);
  };

  const removeFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const completeTransaction = () => {
    if (!selectedWorker) {
      alert('Please select a worker first');
      return;
    }

    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    const newTransactions = cart.map(item => ({
      id: Date.now() + Math.random(),
      date: invoiceDate, // Use selected invoice date
      workerId: selectedWorker.id,
      workerName: selectedWorker.name,
      itemId: item.id,
      itemName: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total
    }));

    setTransactions(prevTransactions => [...prevTransactions, ...newTransactions]);
    
    alert(`Transaction completed!\nWorker: ${selectedWorker.name}\nDate: ${invoiceDate}\nTotal: R ${calculateTotal().toFixed(2)}`);
    
    setCart([]);
    setInvoiceDate(new Date().toISOString().split('T')[0]); // Reset to today
  };

  return (
    <div>
      <div className="page-header">
        <h2>Shop Function</h2>
        <p>Process sales and transactions</p>
      </div>

      {/* Worker Selection */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3>Select Worker</h3>
        </div>
        <div className="form-group">
          <select
            value={selectedWorker?.id || ''}
            onChange={(e) => {
              const worker = workers.find(w => w.id === parseInt(e.target.value));
              selectWorker(worker);
            }}
          >
            <option value="">Choose a worker</option>
            {workers
              .filter(worker => worker.status !== 'inactive')
              .map(worker => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} ({worker.farmId}){worker.houseNumber ? ` - House ${worker.houseNumber}` : ''}
                </option>
              ))}
          </select>
        </div>

        {selectedWorker && (
          <div className="alert alert-info">
            <User size={20} />
            <div>
              <strong>{selectedWorker.name}</strong>
              <div style={{ fontSize: '14px' }}>Farm ID: {selectedWorker.farmId}</div>
              {selectedWorker.houseNumber && (
                <div style={{ fontSize: '14px' }}>House Number: {selectedWorker.houseNumber}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Invoice Date Selection */}
      {selectedWorker && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} />
              <h3>Invoice Date</h3>
            </div>
          </div>
          <div className="form-group">
            <label>Transaction Date (for backdating)</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Can't select future dates
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Selected date: {new Date(invoiceDate).toLocaleDateString('en-ZA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </small>
          </div>
        </div>
      )}

      {/* Shopping Cart */}
      {selectedWorker && (
        <>
        {/* Barcode Scanner Input */}
        <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f0f9ff', borderColor: '#2196F3' }}>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Search size={20} color="#2196F3" />
              <strong style={{ color: '#2196F3' }}>Barcode Scanner</strong>
            </div>
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => handleBarcodeInput(e.target.value)}
              onKeyPress={handleBarcodeKeyPress}
              placeholder="Scan barcode or type barcode number..."
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '18px',
                border: '2px solid #2196F3',
                borderRadius: '8px',
                fontFamily: 'monospace'
              }}
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              💡 Tip: Focus this field and scan barcode - item will be added automatically
            </small>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Shopping Cart</h3>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddItem(true)}
            >
              <Plus size={20} />
              Add Item
            </button>
          </div>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <ShoppingCart size={48} />
              <p style={{ marginTop: '16px' }}>Cart is empty. Add items to get started.</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updatePrice(index, parseFloat(e.target.value) || 0)}
                            style={{ width: '100px', padding: '4px 8px' }}
                            step="0.01"
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                            min="1"
                            style={{ width: '60px', padding: '4px 8px' }}
                          />
                        </td>
                        <td>R {item.total.toFixed(2)}</td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            onClick={() => removeFromCart(index)}
                            style={{ padding: '6px 12px' }}
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        Total:
                      </td>
                      <td style={{ fontWeight: 'bold', fontSize: '18px' }}>
                        R {calculateTotal().toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div style={{ marginTop: '24px', textAlign: 'right', display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    Invoice Date: {new Date(invoiceDate).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {cart.length} item{cart.length !== 1 ? 's' : ''} • R {calculateTotal().toFixed(2)}
                  </div>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={completeTransaction}
                  style={{ fontSize: '16px', padding: '12px 32px' }}
                >
                  Complete Transaction
                </button>
              </div>
            </>
          )}
        </div>
        </>
      )}

      {/* Add Item Modal with Search */}
      {showAddItem && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>Add Item to Cart</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddItem(false);
                  setSearchTerm('');
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Box */}
            <div className="form-group">
              <label>Search Item (Name or Code)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or stock code..."
                  autoFocus
                  style={{ paddingLeft: '36px' }}
                />
                <Search 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#999'
                  }} 
                />
              </div>
            </div>

            <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData
                    .filter(item => {
                      if (!searchTerm) return true;
                      const search = searchTerm.toLowerCase();
                      return (
                        item.name.toLowerCase().includes(search) ||
                        (item.stockCode && item.stockCode.toLowerCase().includes(search)) ||
                        (item.barcode && item.barcode.toLowerCase().includes(search))
                      );
                    })
                    .map(item => (
                      <tr key={item.id}>
                        <td>{item.stockCode || '-'}</td>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>R {item.sellPrice.toFixed(2)}</td>
                        <td>
                          <span style={{ 
                            color: item.quantity === 0 ? '#c62828' : item.quantity <= 10 ? '#e65100' : '#2e7d32',
                            fontWeight: 'bold'
                          }}>
                            {item.quantity}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              addToCart(item);
                              setShowAddItem(false);
                              setSearchTerm('');
                            }}
                            disabled={item.quantity === 0}
                            style={{ padding: '6px 12px' }}
                          >
                            <Plus size={16} />
                            Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  {stockData.filter(item => {
                    if (!searchTerm) return true;
                    const search = searchTerm.toLowerCase();
                    return (
                      item.name.toLowerCase().includes(search) ||
                      (item.stockCode && item.stockCode.toLowerCase().includes(search))
                    );
                  }).length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        No items found matching "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopFunction;
