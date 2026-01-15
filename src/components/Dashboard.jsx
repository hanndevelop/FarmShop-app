import React, { useState } from 'react';
import { AlertCircle, Package, TrendingDown, Users, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';

function Dashboard({ stockData, transactions }) {
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  // Filter transactions by date
  const getFilteredTransactions = () => {
    if (!dateFilter.startDate && !dateFilter.endDate) {
      return transactions;
    }
    
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      const start = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
      const end = dateFilter.endDate ? new Date(dateFilter.endDate) : null;
      
      if (start && end) {
        return tDate >= start && tDate <= end;
      } else if (start) {
        return tDate >= start;
      } else if (end) {
        return tDate <= end;
      }
      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate statistics
  const totalItems = stockData.length;
  const outOfStockItems = stockData.filter(item => item.quantity < 5);
  const lowStockItems = stockData.filter(item => item.quantity >= 5 && item.quantity <= 10);
  const totalStockValue = stockData.reduce((sum, item) => {
    const price = item.sellPrice || item.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  // Calculate filtered period stats
  const periodTotalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const periodTransactionCount = filteredTransactions.length;
  const uniqueWorkers = [...new Set(filteredTransactions.map(t => t.workerId))].length;
  
  // Calculate profit for filtered period
  const periodProfit = filteredTransactions.reduce((sum, t) => {
    const item = stockData.find(i => i.id === t.itemId);
    if (item && item.costPrice) {
      const profit = (t.price - item.costPrice) * t.quantity;
      return sum + profit;
    }
    return sum;
  }, 0);

  // Recent transactions (last 5)
  const recentTransactions = filteredTransactions.slice(-5).reverse();

  const clearFilters = () => {
    setDateFilter({ startDate: '', endDate: '' });
  };

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your farm shop</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3>Filter Sales Period</h3>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Start Date</label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
            />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>End Date</label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
            />
          </div>
          {(dateFilter.startDate || dateFilter.endDate) && (
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filter
            </button>
          )}
        </div>
        {(dateFilter.startDate || dateFilter.endDate) && (
          <div className="alert alert-info" style={{ marginTop: '16px', marginBottom: 0 }}>
            <span>
              Showing data from {dateFilter.startDate || 'beginning'} to {dateFilter.endDate || 'today'}
            </span>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <div className="stat-card-value">R {periodTotalSales.toFixed(2)}</div>
          <div className="stat-card-label">
            {dateFilter.startDate || dateFilter.endDate ? 'Period Sales' : 'Total Sales'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}>
              <ShoppingBag size={24} />
            </div>
          </div>
          <div className="stat-card-value">{periodTransactionCount}</div>
          <div className="stat-card-label">
            {dateFilter.startDate || dateFilter.endDate ? 'Period Transactions' : 'Total Transactions'}
          </div>
        </div>

        {periodProfit > 0 && (
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="stat-card-value">R {periodProfit.toFixed(2)}</div>
            <div className="stat-card-label">
              {dateFilter.startDate || dateFilter.endDate ? 'Period Profit' : 'Total Profit'}
            </div>
          </div>
        )}

        {uniqueWorkers > 0 && (
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ backgroundColor: '#f3e5f5', color: '#7b1fa2' }}>
                <Users size={24} />
              </div>
            </div>
            <div className="stat-card-value">{uniqueWorkers}</div>
            <div className="stat-card-label">Active Workers</div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon">
              <Package size={24} />
            </div>
          </div>
          <div className="stat-card-value">{totalItems}</div>
          <div className="stat-card-label">Total Stock Items</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ backgroundColor: '#ffebee', color: '#c62828' }}>
              <TrendingDown size={24} />
            </div>
          </div>
          <div className="stat-card-value">{lowStockItems.length}</div>
          <div className="stat-card-label">Low Stock (5-10)</div>
        </div>

        {outOfStockItems.length > 0 && (
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ backgroundColor: '#d32f2f', color: 'white' }}>
                <AlertCircle size={24} />
              </div>
            </div>
            <div className="stat-card-value">{outOfStockItems.length}</div>
            <div className="stat-card-label">Out of Stock (&lt;5)</div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}>
              <Package size={24} />
            </div>
          </div>
          <div className="stat-card-value">R {totalStockValue.toFixed(2)}</div>
          <div className="stat-card-label">Total Stock Value</div>
        </div>
      </div>

      {outOfStockItems.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Out of Stock - Urgent!</h3>
          </div>
          <div className="alert alert-danger">
            <AlertCircle size={20} />
            <span>{outOfStockItems.length} items are OUT OF STOCK (&lt;5 units) and need immediate restocking</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Current Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {outOfStockItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td style={{ fontWeight: 'bold', color: '#c62828' }}>{item.quantity}</td>
                    <td>
                      <span className="badge badge-danger">Out of Stock</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {lowStockItems.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Low Stock Alerts</h3>
          </div>
          <div className="alert alert-warning">
            <AlertCircle size={20} />
            <span>{lowStockItems.length} items are running low (5-10 units) and need restocking soon</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Current Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td style={{ fontWeight: 'bold', color: '#e65100' }}>{item.quantity}</td>
                    <td>
                      <span className="badge badge-low">Low Stock</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recentTransactions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>{dateFilter.startDate || dateFilter.endDate ? 'Filtered Transactions' : 'Recent Transactions'}</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Worker</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{transaction.date}</td>
                    <td>{transaction.workerName}</td>
                    <td>{transaction.itemName}</td>
                    <td>{transaction.quantity}</td>
                    <td>R {transaction.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
