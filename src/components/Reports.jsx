import React, { useState } from 'react';
import { Download, User, Calendar } from 'lucide-react';

// Helper function to export to Excel (CSV format)
const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Convert data to CSV
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Add BOM for Excel to recognize UTF-8
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

function Reports({ transactions, workers, stocktakes }) {
  const [reportType, setReportType] = useState('summary');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [monthFilter, setMonthFilter] = useState({
    startDate: '',
    endDate: ''
  });

  const filterTransactionsByDate = (trans) => {
    if (!dateFilter.startDate || !dateFilter.endDate) return trans;
    
    return trans.filter(t => {
      const transDate = new Date(t.date);
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(dateFilter.endDate);
      return transDate >= startDate && transDate <= endDate;
    });
  };

  const getWorkerTransactions = (workerId) => {
    return transactions.filter(t => t.workerId === workerId);
  };

  const renderWorkerSummary = () => {
    // Filter transactions by month if filter is set
    let filteredTransactions = transactions;
    
    if (monthFilter.startDate && monthFilter.endDate) {
      filteredTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        const startDate = new Date(monthFilter.startDate);
        const endDate = new Date(monthFilter.endDate);
        return transDate >= startDate && transDate <= endDate;
      });
    }

    // Group by worker
    const workerSummaries = workers.map(worker => {
      const workerTrans = filteredTransactions.filter(t => t.workerId === worker.id);
      const total = workerTrans.reduce((sum, t) => sum + t.total, 0);
      return {
        workerId: worker.id,
        workerName: worker.name,
        farmId: worker.farmId || '-',
        idNumber: worker.idNumber || '-',
        transactionCount: workerTrans.length,
        totalAmount: total
      };
    }).filter(w => w.totalAmount > 0);

    const handleExportSummary = () => {
      const exportData = workerSummaries.map(w => ({
        'Worker Name': w.workerName,
        'Farm ID': w.farmId,
        'ID Number': w.idNumber,
        'Transactions': w.transactionCount,
        'Total Amount': 'R ' + w.totalAmount.toFixed(2)
      }));
      
      const dateRange = monthFilter.startDate && monthFilter.endDate 
        ? `_${monthFilter.startDate}_to_${monthFilter.endDate}`
        : '';
      
      exportToExcel(exportData, `Worker_Summary${dateRange}`);
    };

    return (
      <div className="card">
        <div className="card-header">
          <h3>Worker Monthly Summary</h3>
          <button 
            className="btn btn-secondary"
            onClick={handleExportSummary}
            disabled={workerSummaries.length === 0}
          >
            <Download size={20} />
            Export to Excel
          </button>
        </div>

        {/* Farm Month Filter (15th to 15th) */}
        <div className="form-row" style={{ marginBottom: '20px', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="#2c5530" />
            <strong>Farm Month Filter (15th to 15th)</strong>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>Start Date (e.g., Jan 15)</label>
              <input
                type="date"
                value={monthFilter.startDate}
                onChange={(e) => setMonthFilter({...monthFilter, startDate: e.target.value})}
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>End Date (e.g., Feb 15)</label>
              <input
                type="date"
                value={monthFilter.endDate}
                onChange={(e) => setMonthFilter({...monthFilter, endDate: e.target.value})}
              />
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => setMonthFilter({ startDate: '', endDate: '' })}
              style={{ marginBottom: '8px' }}
            >
              Clear Filter
            </button>
          </div>
        </div>

        {monthFilter.startDate && monthFilter.endDate && (
          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            📅 Showing transactions from {new Date(monthFilter.startDate).toLocaleDateString()} to {new Date(monthFilter.endDate).toLocaleDateString()}
            <br/>
            Total: R {workerSummaries.reduce((sum, w) => sum + w.totalAmount, 0).toFixed(2)}
          </div>
        )}

        {workerSummaries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No transactions found for the selected period
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Farm ID</th>
                  <th>ID Number</th>
                  <th>Transactions</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {workerSummaries.map(worker => (
                  <tr key={worker.workerId}>
                    <td><strong>{worker.workerName}</strong></td>
                    <td>{worker.farmId}</td>
                    <td>{worker.idNumber}</td>
                    <td>{worker.transactionCount}</td>
                    <td style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      R {worker.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                  <td colSpan="3">TOTAL</td>
                  <td>{workerSummaries.reduce((sum, w) => sum + w.transactionCount, 0)}</td>
                  <td style={{ fontSize: '18px' }}>
                    R {workerSummaries.reduce((sum, w) => sum + w.totalAmount, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderWorkerDetail = () => {
    if (!selectedWorker) {
      return (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <User size={48} />
            <p style={{ marginTop: '16px' }}>Select a worker to view details</p>
          </div>
        </div>
      );
    }

    const workerTransactions = getWorkerTransactions(selectedWorker.id);
    const filteredTransactions = filterTransactionsByDate(workerTransactions);
    const total = filteredTransactions.reduce((sum, t) => sum + t.total, 0);

    const handleExportWorkerDetail = () => {
      const exportData = filteredTransactions.map(t => ({
        'Date': t.date,
        'Item': t.itemName,
        'Quantity': t.quantity,
        'Price': 'R ' + t.price.toFixed(2),
        'Total': 'R ' + t.total.toFixed(2)
      }));
      
      exportToExcel(exportData, `${selectedWorker.name}_Transactions`);
    };

    return (
      <div className="card">
        <div className="card-header">
          <h3>{selectedWorker.name} - Transaction History</h3>
          <button 
            className="btn btn-secondary"
            onClick={handleExportWorkerDetail}
            disabled={filteredTransactions.length === 0}
          >
            <Download size={20} />
            Export to Excel
          </button>
        </div>

        <div className="alert alert-info">
          <User size={20} />
          <div>
            <div><strong>{selectedWorker.name}</strong></div>
            <div style={{ fontSize: '14px' }}>Farm ID: {selectedWorker.farmId}</div>
            <div style={{ fontSize: '14px' }}>Total Outstanding: R {total.toFixed(2)}</div>
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: '20px' }}>
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
              Clear
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No transactions found
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t, index) => (
                  <tr key={index}>
                    <td>{t.date}</td>
                    <td>{t.itemName}</td>
                    <td>{t.quantity}</td>
                    <td>R {t.price.toFixed(2)}</td>
                    <td>R {t.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                  <td colSpan="4">TOTAL</td>
                  <td style={{ fontSize: '18px' }}>R {total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderAllTransactions = () => {
    const filteredTransactions = filterTransactionsByDate(transactions);

    const handleExportAllTransactions = () => {
      const exportData = filteredTransactions.map(t => ({
        'Date': t.date,
        'Worker': t.workerName,
        'Item': t.itemName,
        'Quantity': t.quantity,
        'Price': 'R ' + t.price.toFixed(2),
        'Total': 'R ' + t.total.toFixed(2)
      }));
      
      exportToExcel(exportData, 'All_Transactions');
    };

    return (
      <div className="card">
        <div className="card-header">
          <h3>All Transactions</h3>
          <button 
            className="btn btn-secondary"
            onClick={handleExportAllTransactions}
            disabled={filteredTransactions.length === 0}
          >
            <Download size={20} />
            Export to Excel
          </button>
        </div>

        <div className="form-row" style={{ marginBottom: '20px' }}>
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
              Clear
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No transactions found
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Worker</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t, index) => (
                  <tr key={index}>
                    <td>{t.date}</td>
                    <td>{t.workerName}</td>
                    <td>{t.itemName}</td>
                    <td>{t.quantity}</td>
                    <td>R {t.price.toFixed(2)}</td>
                    <td>R {t.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderStocktakeReports = () => {
    if (stocktakes.length === 0) {
      return (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No stocktakes recorded yet
          </div>
        </div>
      );
    }

    const latestStocktake = stocktakes[stocktakes.length - 1];

    const handleExportStocktake = () => {
      const exportData = stocktakes.map(s => ({
        'Date': s.date,
        'Type': s.type,
        'Item': s.itemName,
        'System Qty': s.systemQty,
        'Actual Qty': s.actualQty,
        'Variance': s.variance,
        'Value': 'R ' + (s.varianceValue || 0).toFixed(2)
      }));
      
      exportToExcel(exportData, 'Stocktake_Report');
    };

    return (
      <div className="card">
        <div className="card-header">
          <h3>Stocktake Reports</h3>
          <button 
            className="btn btn-secondary"
            onClick={handleExportStocktake}
          >
            <Download size={20} />
            Export to Excel
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Item</th>
                <th>System Qty</th>
                <th>Actual Qty</th>
                <th>Variance</th>
              </tr>
            </thead>
            <tbody>
              {stocktakes.map((s, index) => (
                <tr key={index}>
                  <td>{s.date}</td>
                  <td>{s.type}</td>
                  <td>{s.itemName}</td>
                  <td>{s.systemQty}</td>
                  <td>{s.actualQty}</td>
                  <td style={{ 
                    color: s.variance === 0 ? '#2e7d32' : '#c62828',
                    fontWeight: 'bold'
                  }}>
                    {s.variance > 0 ? '+' : ''}{s.variance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h2>Reports</h2>
        <p>View and export reports</p>
      </div>

      {/* Report Type Selector */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="form-group">
          <label>Select Report Type</label>
          <select
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setSelectedWorker(null);
              setDateFilter({ startDate: '', endDate: '' });
              setMonthFilter({ startDate: '', endDate: '' });
            }}
          >
            <option value="summary">Worker Monthly Summary</option>
            <option value="detail">Worker Detail</option>
            <option value="all">All Transactions</option>
            <option value="stocktake">Stocktake Reports</option>
          </select>
        </div>

        {reportType === 'detail' && (
          <div className="form-group">
            <label>Select Worker</label>
            <select
              value={selectedWorker?.id || ''}
              onChange={(e) => {
                const worker = workers.find(w => w.id === parseInt(e.target.value));
                setSelectedWorker(worker);
              }}
            >
              <option value="">Choose a worker</option>
              {workers.map(worker => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} ({worker.farmId})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Render Selected Report */}
      {reportType === 'summary' && renderWorkerSummary()}
      {reportType === 'detail' && renderWorkerDetail()}
      {reportType === 'all' && renderAllTransactions()}
      {reportType === 'stocktake' && renderStocktakeReports()}
    </div>
  );
}

export default Reports;
