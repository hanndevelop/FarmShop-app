import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, User } from 'lucide-react';

function ShopFunction({ stockData, workers, setTransactions }) {
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [cart, setCart] = useState([]);
  const [showItemSelect, setShowItemSelect] = useState(false);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? {...cartItem, quantity: cartItem.quantity + 1}
          : cartItem
      ));
    } else {
      const price = item.sellPrice || item.price;
      setCart([...cart, { ...item, price, quantity: 1 }]);
    }
    setShowItemSelect(false);
  };

  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const item = stockData.find(i => i.id === itemId);
    if (newQuantity > item.quantity) {
      alert(`Only ${item.quantity} units available in stock`);
      return;
    }

    setCart(cart.map(cartItem => 
      cartItem.id === itemId 
        ? {...cartItem, quantity: newQuantity}
        : cartItem
    ));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const processTransaction = () => {
    if (!selectedWorker) {
      alert('Please select a worker');
      return;
    }

    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    // Check stock availability
    for (let cartItem of cart) {
      const stockItem = stockData.find(s => s.id === cartItem.id);
      if (cartItem.quantity > stockItem.quantity) {
        alert(`Insufficient stock for ${cartItem.name}`);
        return;
      }
    }

    // Create transaction records
    const date = new Date().toISOString().split('T')[0];
    const newTransactions = cart.map(item => ({
      date,
      workerId: selectedWorker.id,
      workerName: selectedWorker.name,
      itemId: item.id,
      itemName: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    }));

    setTransactions(prev => [...prev, ...newTransactions]);

    // Clear cart
    setCart([]);
    alert('Transaction completed successfully!');
  };

  const getAvailableItems = () => {
    return stockData.filter(item => item.quantity > 0);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Shop</h2>
        <p>Process worker purchases</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Select Worker</h3>
        </div>
        <div className="form-group">
          <select
            value={selectedWorker?.id || ''}
            onChange={(e) => {
              const worker = workers.find(w => w.id === parseInt(e.target.value));
              setSelectedWorker(worker);
            }}
          >
            <option value="">Select a worker</option>
            {workers.map(worker => (
              <option key={worker.id} value={worker.id}>
                {worker.name}
              </option>
            ))}
          </select>
        </div>

        {selectedWorker && (
          <div className="alert alert-info">
            <User size={20} />
            <span>Shopping for: {selectedWorker.name}</span>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Shopping Cart</h3>
          <button 
            className="btn btn-primary"
            onClick={() => setShowItemSelect(true)}
            disabled={!selectedWorker}
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <ShoppingCart size={48} />
            <p style={{ marginTop: '16px' }}>Cart is empty</p>
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
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>R {item.price.toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value))}
                          style={{ width: '80px', padding: '4px 8px' }}
                        />
                      </td>
                      <td>R {(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        <button 
                          className="btn btn-danger"
                          onClick={() => removeFromCart(item.id)}
                          style={{ padding: '6px 12px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                Total: R {calculateTotal().toFixed(2)}
              </div>
              <button 
                className="btn btn-primary"
                onClick={processTransaction}
                style={{ fontSize: '16px', padding: '12px 32px' }}
              >
                Complete Transaction
              </button>
            </div>
          </>
        )}
      </div>

      {/* Item Selection Modal */}
      {showItemSelect && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Select Item</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowItemSelect(false)}
              >
                ×
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Available</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {getAvailableItems().map(item => {
                    const price = item.sellPrice || item.price;
                    return (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>R {price.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>
                          <button 
                            className="btn btn-primary"
                            onClick={() => addToCart(item)}
                          >
                            Add
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
