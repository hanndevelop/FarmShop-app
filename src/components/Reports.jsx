import React, { useState } from 'react';
import { Download, User, Calendar } from 'lucide-react';

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

function Reports({ transactions, workers, stocktakes, stockData }) {
  const [reportType, setReportType] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  const filterTransactionsByDate = (trans) => {
    // If no dates selected, return all
    if (!dateFilter.startDate && !dateFilter.endDate) {
      console.log('No date filter applied - returning all transactions');
      return trans;
    }
    
    const filtered = trans.filter(t => {
      const transDate = new Date(t.date);
      
      // If only start date provided
      if (dateFilter.startDate && !dateFilter.endDate) {
        const startDate = new Date(dateFilter.startDate);
        const isAfterStart = transDate >= startDate;
        if (!isAfterStart) {
          console.log(`Filtered OUT: ${t.date} (before ${dateFilter.startDate})`);
        }
        return isAfterStart;
      }
      
      // If only end date provided
      if (!dateFilter.startDate && dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        const isBeforeEnd = transDate <= endDate;
        if (!isBeforeEnd) {
          console.log(`Filtered OUT: ${t.date} (after ${dateFilter.endDate})`);
        }
        return isBeforeEnd;
      }
      
      // Both dates provided
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(dateFilter.endDate);
      const isInRange = transDate >= startDate && transDate <= endDate;
      
      if (!isInRange) {
        console.log(`Filtered OUT: ${t.date} (outside ${dateFilter.startDate} to ${dateFilter.endDate})`);
      }
      
      return isInRange;
    });
    
    console.log(`Date filter: ${trans.length} → ${filtered.length} transactions`);
    return filtered;
  };

  // REPORT 1: All Transactions
  const renderAllTransactions = () => {
    const filteredTransactions = filterTransactionsByDate(transactions);

    const handleExportAll = () => {
      const exportData = filteredTransactions.map(t => ({
        'Date': t.date,
        'Worker': t.workerName,
        'Item': t.itemName,
        'Quantity': t.quantity,
        'Price': 'R ' + t.price.toFixed(2),
        'Total': 'R ' + t.total.toFixed(2)
      }));
      
      const dateRange = dateFilter.startDate && dateFilter.endDate 
        ? `_${dateFilter.startDate}_to_${dateFilter.endDate}`
        : '';
      
      exportToExcel(exportData, `All_Transactions${dateRange}`);
    };

    const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.total, 0);

    return (
      <div className="card">
        <div className="card-header">
          <h3>All Transactions</h3>
          <button 
            className="btn btn-secondary"
            onClick={handleExportAll}
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

        {dateFilter.startDate && dateFilter.endDate && (
          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            📅 Period: {new Date(dateFilter.startDate).toLocaleDateString()} to {new Date(dateFilter.endDate).toLocaleDateString()}
            <br/>
            💰 Total: R {totalAmount.toFixed(2)}
          </div>
        )}

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
              <tfoot>
                <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                  <td colSpan="5">TOTAL</td>
                  <td style={{ fontSize: '18px' }}>R {totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    );
  };

  // REPORT 2: Worker Summary (Monthly)
  const renderWorkerSummary = () => {
    const filteredTransactions = filterTransactionsByDate(transactions);
    
    // Show ALL workers, even those with R0
    const workerSummaries = workers.map(worker => {
      const workerTrans = filteredTransactions.filter(t => t.workerId === worker.id);
      const total = workerTrans.reduce((sum, t) => sum + t.total, 0);
      
      return {
        workerId: worker.id,
        workerName: worker.name,
        farmId: worker.farmId || '-',
        houseNumber: worker.houseNumber || '-',
        transactionCount: workerTrans.length,
        totalAmount: total
      };
    });
    // REMOVED: .filter(w => w.totalAmount > 0) - now shows ALL workers!

    const handleExportSummary = () => {
      const exportData = workerSummaries.map(w => ({
        'Worker Name': w.workerName,
        'Farm ID': w.farmId,
        'House Number': w.houseNumber,
        'Transactions': w.transactionCount,
        'Total Amount': 'R ' + w.totalAmount.toFixed(2)
      }));
      
      const dateRange = dateFilter.startDate && dateFilter.endDate 
        ? `_${dateFilter.startDate}_to_${dateFilter.endDate}`
        : '';
      
      exportToExcel(exportData, `Worker_Summary${dateRange}`);
    };

    const grandTotal = workerSummaries.reduce((sum, w) => sum + w.totalAmount, 0);

    return (
      <div className="card">
        <div className="card-header">
          <h3>Worker Summary</h3>
          <button 
            className="btn btn-secondary"
            onClick={handleExportSummary}
            disabled={workerSummaries.length === 0}
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

        {dateFilter.startDate && dateFilter.endDate && (
          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            📅 Period: {new Date(dateFilter.startDate).toLocaleDateString()} to {new Date(dateFilter.endDate).toLocaleDateString()}
            <br/>
            💰 Total: R {grandTotal.toFixed(2)}
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
                  <th>House Number</th>
                  <th>Transactions</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {workerSummaries.map(worker => (
                  <tr key={worker.workerId}>
                    <td><strong>{worker.workerName}</strong></td>
                    <td>{worker.farmId}</td>
                    <td>{worker.houseNumber}</td>
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
                    R {grandTotal.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    );
  };

  // REPORT 3: Worker Detail
  const renderWorkerDetail = () => {
    if (!selectedWorker) {
      return (
        <div className="card">
          <div className="card-header">
            <h3>Worker Detail</h3>
          </div>
          <div className="form-group">
            <label>Select Worker</label>
            <select
              value=""
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
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <User size={48} />
            <p style={{ marginTop: '16px' }}>Select a worker to view details</p>
          </div>
        </div>
      );
    }

    const workerTransactions = transactions.filter(t => t.workerId === selectedWorker.id);
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
          <h3>Worker Detail: {selectedWorker.name}</h3>
          <button 
            className="btn btn-secondary"
            onClick={handleExportWorkerDetail}
            disabled={filteredTransactions.length === 0}
          >
            <Download size={20} />
            Export to Excel
          </button>
        </div>

        <div className="form-group">
          <label>Select Worker</label>
          <select
            value={selectedWorker.id}
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

        <div className="alert alert-info" style={{ marginBottom: '20px' }}>
          <User size={20} />
          <div>
            <div><strong>{selectedWorker.name}</strong></div>
            <div style={{ fontSize: '14px' }}>Farm ID: {selectedWorker.farmId}</div>
            {selectedWorker.houseNumber && (
              <div style={{ fontSize: '14px' }}>House: {selectedWorker.houseNumber}</div>
            )}
            <div style={{ fontSize: '14px', marginTop: '8px', fontWeight: 'bold' }}>
              Total Outstanding: R {total.toFixed(2)}
            </div>
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

  // REPORT 4: Stock Report (Items Sold)
  const renderItemsSoldReport = () => {
    const filteredTransactions = filterTransactionsByDate(transactions);

    // Group by item and calculate totals
    const itemSales = {};
    
    filteredTransactions.forEach(t => {
      if (!itemSales[t.itemName]) {
        itemSales[t.itemName] = {
          itemName: t.itemName,
          totalQuantity: 0,
          costPriceTotal: 0,
          sellPriceTotal: 0
        };
      }
      
      // Find the stock item to get cost price
      const stockItem = stockData.find(s => s.name === t.itemName);
      const costPrice = stockItem ? stockItem.costPrice : 0;
      
      itemSales[t.itemName].totalQuantity += t.quantity;
      itemSales[t.itemName].costPriceTotal += (costPrice * t.quantity);
      itemSales[t.itemName].sellPriceTotal += t.total; // Already calculated sell price
    });

    const itemsArray = Object.values(itemSales).sort((a, b) => b.totalQuantity - a.totalQuantity);

    const handleExportItemsSold = () => {
      const exportData = itemsArray.map(item => ({
        'Item': item.itemName,
        'Total Sold': item.totalQuantity,
        'Cost Price Total': 'R ' + item.costPriceTotal.toFixed(2),
        'Sell Price Total': 'R ' + item.sellPriceTotal.toFixed(2),
        'Profit': 'R ' + (item.sellPriceTotal - item.costPriceTotal).toFixed(2)
      }));
      
      const dateRange = dateFilter.startDate && dateFilter.endDate 
        ? `_${dateFilter.startDate}_to_${dateFilter.endDate}`
        : '';
      
      exportToExcel(exportData, `Stock_Report${dateRange}`);
    };

    const totalQty = itemsArray.reduce((sum, item) => sum + item.totalQuantity, 0);
    const totalCost = itemsArray.reduce((sum, item) => sum + item.costPriceTotal, 0);
    const totalSell = itemsArray.reduce((sum, item) => sum + item.sellPriceTotal, 0);
    const totalProfit = totalSell - totalCost;

    return (
      <div className="card">
        <div className="card-header">
          <h3>Stock Report - Items Sold</h3>
          <button 
            className="btn btn-secondary"
            onClick={handleExportItemsSold}
            disabled={itemsArray.length === 0}
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

        {dateFilter.startDate && dateFilter.endDate && (
          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            📅 Period: {new Date(dateFilter.startDate).toLocaleDateString()} to {new Date(dateFilter.endDate).toLocaleDateString()}
            <br/>
            📊 Total Units Sold: {totalQty}
            <br/>
            💰 Total Revenue: R {totalSell.toFixed(2)}
            <br/>
            💵 Total Profit: R {totalProfit.toFixed(2)}
          </div>
        )}

        {itemsArray.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No sales data for the selected period
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Total Sold</th>
                  <th>Cost Price Total</th>
                  <th>Sell Price Total</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {itemsArray.map((item) => {
                  const profit = item.sellPriceTotal - item.costPriceTotal;
                  return (
                    <tr key={item.itemName}>
                      <td><strong>{item.itemName}</strong></td>
                      <td style={{ fontWeight: 'bold' }}>{item.totalQuantity}</td>
                      <td>R {item.costPriceTotal.toFixed(2)}</td>
                      <td>R {item.sellPriceTotal.toFixed(2)}</td>
                      <td style={{ 
                        fontWeight: 'bold',
                        color: profit > 0 ? '#2e7d32' : '#c62828'
                      }}>
                        R {profit.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                  <td>TOTAL</td>
                  <td>{totalQty}</td>
                  <td>R {totalCost.toFixed(2)}</td>
                  <td>R {totalSell.toFixed(2)}</td>
                  <td style={{ 
                    fontSize: '18px',
                    color: totalProfit > 0 ? '#2e7d32' : '#c62828'
                  }}>
                    R {totalProfit.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
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
            }}
          >
            <option value="all">All Transactions</option>
            <option value="summary">Worker Summary</option>
            <option value="detail">Worker Detail</option>
            <option value="stock">Stock Report (Items Sold)</option>
          </select>
        </div>
      </div>

      {/* Render Selected Report */}
      {reportType === 'all' && renderAllTransactions()}
      {reportType === 'summary' && renderWorkerSummary()}
      {reportType === 'detail' && renderWorkerDetail()}
      {reportType === 'stock' && renderItemsSoldReport()}
    </div>
  );
}

export default Reports;
