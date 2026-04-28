import React, { useState } from 'react';
import { AlertCircle, Package, TrendingDown, Users, DollarSign, ShoppingBag, TrendingUp, RefreshCw, Cloud } from 'lucide-react';

function Dashboard({ stockData, transactions, onForceSync, onPullFromSheets }) {
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [syncing, setSyncing] = useState(false);
  const [pulling, setPulling] = useState(false);

  // Get last sync times from localStorage
  const getLastSyncTime = (sheetName) => {
    const lastSync = localStorage.getItem(`farmShop_${sheetName}_lastSync`);
    if (!lastSync) return 'Never';
    
    const syncDate = new Date(lastSync);
    const now = new Date();
    const diffMs = now - syncDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return syncDate.toLocaleDateString();
  };

  const handleSync = async () => {
    setSyncing(true);
    if (onForceSync) {
      await onForceSync();
    }
    setSyncing(false);
  };

  const handlePull = async () => {
    setPulling(true);
    if (onPullFromSheets) {
      await onPullFromSheets();
    }
    setPulling(false);
  };

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

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your farm shop</p>
        </div>
        
        {/* Sync Status Card */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px 20px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Cloud size={18} color="#2c5530" />
              <strong style={{ fontSize: '14px' }}>Cloud Sync</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Last sync: {getLastSyncTime('Workers')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={handlePull}
              disabled={pulling || syncing}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
              title="Pull new records added directly in Google Sheets into this device"
            >
              <RefreshCw size={15} className={pulling ? 'spinning' : ''} />
              {pulling ? 'Pulling...' : '⬇️ Pull from Sheets'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSync}
              disabled={syncing || pulling}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
              title="Push this device's data up to Google Sheets"
            >
              <RefreshCw size={15} className={syncing ? 'spinning' : ''} />
              {syncing ? 'Syncing...' : '⬆️ Push to Sheets'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>
            <Package size={24} color="#1976d2" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Stock Items</div>
            <div className="stat-value">{totalItems}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ffebee' }}>
            <AlertCircle size={24} color="#c62828" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Out of Stock</div>
            <div className="stat-value">{outOfStockItems.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>
            <TrendingDown size={24} color="#e65100" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Low Stock</div>
            <div className="stat-value">{lowStockItems.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
            <DollarSign size={24} color="#2e7d32" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Stock Value</div>
            <div className="stat-value">R {totalStockValue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3>Sales Period</h3>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setDateFilter({ startDate: '', endDate: '' })}
            >
              Clear Filter
            </button>
          </div>
        </div>
      </div>

      {/* Period Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f3e5f5' }}>
            <ShoppingBag size={24} color="#7b1fa2" />
          </div>
          <div className="stat-content">
            <div className="stat-label">
              {dateFilter.startDate || dateFilter.endDate ? 'Period Sales' : 'Total Sales'}
            </div>
            <div className="stat-value">R {periodTotalSales.toFixed(2)}</div>
            <div className="stat-subtext">{periodTransactionCount} transactions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
            <TrendingUp size={24} color="#2e7d32" />
          </div>
          <div className="stat-content">
            <div className="stat-label">
              {dateFilter.startDate || dateFilter.endDate ? 'Period Profit' : 'Total Profit'}
            </div>
            <div className="stat-value">R {periodProfit.toFixed(2)}</div>
            <div className="stat-subtext">
              {periodProfit > 0 ? `${((periodProfit / periodTotalSales) * 100).toFixed(1)}% margin` : 'No data'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0f2f1' }}>
            <Users size={24} color="#00695c" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Workers</div>
            <div className="stat-value">{uniqueWorkers}</div>
            <div className="stat-subtext">
              {periodTransactionCount > 0 
                ? `Avg R ${(periodTotalSales / uniqueWorkers).toFixed(2)} per worker`
                : 'No transactions'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>
            <ShoppingBag size={24} color="#e65100" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Avg Transaction</div>
            <div className="stat-value">
              R {periodTransactionCount > 0 ? (periodTotalSales / periodTransactionCount).toFixed(2) : '0.00'}
            </div>
            <div className="stat-subtext">Per sale</div>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
        <div className="card">
          <div className="card-header">
            <h3>Stock Alerts</h3>
          </div>

          {outOfStockItems.length > 0 && (
            <div className="alert alert-error" style={{ marginBottom: '16px' }}>
              <AlertCircle size={20} />
              <div>
                <strong>{outOfStockItems.length} items out of stock</strong>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  {outOfStockItems.slice(0, 3).map(item => item.name).join(', ')}
                  {outOfStockItems.length > 3 && ` and ${outOfStockItems.length - 3} more...`}
                </div>
              </div>
            </div>
          )}

          {lowStockItems.length > 0 && (
            <div className="alert alert-warning">
              <TrendingDown size={20} />
              <div>
                <strong>{lowStockItems.length} items running low</strong>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  {lowStockItems.slice(0, 3).map(item => `${item.name} (${item.quantity})`).join(', ')}
                  {lowStockItems.length > 3 && ` and ${lowStockItems.length - 3} more...`}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
