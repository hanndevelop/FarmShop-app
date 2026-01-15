import React, { useState } from 'react';
import { BarChart3, User, Calendar } from 'lucide-react';

function Reports({ transactions, workers, stocktakes }) {
  const [reportType, setReportType] = useState('worker-summary');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  const getWorkerTransactions = (workerId) => {
    return transactions.filter(t => t.workerId === workerId);
  };

  const getWorkerTotal = (workerId) => {
    return getWorkerTransactions(workerId).reduce((sum, t) => sum + t.total, 0);
  };

  const getMonthlyTotal = (workerId, month, year) => {
    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.workerId === workerId && 
               tDate.getMonth() === month && 
               tDate.getFullYear() === year;
      })
      .reduce((sum, t) => sum + t.total, 0);
  };

  const getCurrentMonthYear = () => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  };

  const filterTransactionsByDate = (trans) => {
    if (!dateFilter.startDate && !dateFilter.endDate) return trans;
    
    return trans.filter(t => {
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

  const renderWorkerSummary = () => {
    const { month, year } = getCurrentMonthYear();
    
    return (
      <div className="card">
        <div className="card-header">
          <h3>Worker Monthly Summary</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>ID Number</th>
                <th>This Month</th>
                <th>Total (All Time)</th>
                <th>Transactions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map(worker => {
                const workerTransactions = getWorkerTransactions(worker.id);
                const monthlyTotal = getMonthlyTotal(worker.id, month, year);
                const allTimeTotal = getWorkerTotal(worker.id);
                
                return (
                  <tr key={worker.id}>
                    <td>{worker.name}</td>
                    <td>{worker.idNumber}</td>
                    <td>R {monthlyTotal.toFixed(2)}</td>
                    <td>R {allTimeTotal.toFixed(2)}</td>
                    <td>{workerTransactions.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

  // Group transactions by month
  const transactionsByMonth = {};
  filteredTransactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString('en-ZA', { year: 'numeric', month: 'long' });
    
    if (!transactionsByMonth[monthKey]) {
      transactionsByMonth[monthKey] = {
        monthName,
        transactions: [],
        total: 0
      };
    }
    transactionsByMonth[monthKey].transactions.push(t);
    transactionsByMonth[monthKey].total += t.total;
  });

  const months = Object.keys(transactionsByMonth).sort().reverse();

  return (
    <div className="card">
      <div className="card-header">
        <h3>{selectedWorker.name} - Transaction History</h3>
      </div>

      <div className="alert alert-info">
        <User size={20} />
        <div>
          <div><strong>{selectedWorker.name}</strong></div>
          <div style={{ fontSize: '14px' }}>ID: {selectedWorker.idNumber}</div>
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
      </div>

      {filteredTransactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No transactions found for selected period
        </div>
      ) : (
        <>
          {months.map(monthKey => {
            const monthData = transactionsByMonth[monthKey];
            return (
              <div key={monthKey} style={{ marginBottom: '32px' }}>
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: '#2c5530',
                  color: 'white',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h4 style={{ margin: 0 }}>{monthData.monthName}</h4>
                  <strong style={{ fontSize: '18px' }}>R {monthData.total.toFixed(2)}</strong>
                </div>
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
                      {monthData.transactions.map((t, index) => (
                        <tr key={index}>
                          <td>{t.date}</td>
                          <td>{t.itemName}</td>
                          <td>{t.quantity}</td>
                          <td>R {t.price.toFixed(2)}</td>
                          <td>R {t.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

  const renderAllTransactions = () => {
    const filteredTransactions = filterTransactionsByDate(transactions);

    return (
      <div className="card">
        <div className="card-header">
          <h3>All Transactions</h3>
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
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <Calendar size={48} />
            <p style={{ marginTop: '16px' }}>No transactions found</p>
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

  const renderStocktakeReport = () => {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Stocktake Summary</h3>
        </div>
        {stocktakes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No stocktakes recorded yet
          </div>
        ) : (
          stocktakes.map(st => (
            <div key={st.id} style={{ marginBottom: '32px' }}>
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                      {st.type.charAt(0).toUpperCase() + st.type.slice(1)} Stocktake
                    </div>
                    <div style={{ color: '#666' }}>Date: {st.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>Total Variance</div>
                    <div 
                      style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        color: st.totalVarianceValue < 0 ? '#c62828' : '#2e7d32'
                      }}
                    >
                      R {st.totalVarianceValue.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>System Qty</th>
                      <th>Actual Qty</th>
                      <th>Variance</th>
                      <th>Value Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {st.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.itemName}</td>
                        <td>{item.systemQty}</td>
                        <td>{item.actualQty}</td>
                        <td 
                          style={{ 
                            color: item.variance < 0 ? '#c62828' : 
                                   item.variance > 0 ? '#2e7d32' : '#666',
                            fontWeight: 'bold'
                          }}
                        >
                          {item.variance}
                        </td>
                        <td 
                          style={{ 
                            color: item.varianceValue < 0 ? '#c62828' : 
                                   item.varianceValue > 0 ? '#2e7d32' : '#666',
                            fontWeight: 'bold'
                          }}
                        >
                          R {item.varianceValue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h2>Reports</h2>
        <p>View summaries and transaction history</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div className="form-group">
          <label>Report Type</label>
          <select
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setSelectedWorker(null);
              setDateFilter({ startDate: '', endDate: '' });
            }}
          >
            <option value="worker-summary">Worker Monthly Summary</option>
            <option value="worker-detail">Worker Detail</option>
            <option value="all-transactions">All Transactions</option>
            <option value="stocktake">Stocktake Reports</option>
          </select>
        </div>

        {reportType === 'worker-detail' && (
          <div className="form-group">
            <label>Select Worker</label>
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
        )}
      </div>

      {reportType === 'worker-summary' && renderWorkerSummary()}
      {reportType === 'worker-detail' && renderWorkerDetail()}
      {reportType === 'all-transactions' && renderAllTransactions()}
      {reportType === 'stocktake' && renderStocktakeReport()}
    </div>
  );
}

export default Reports;
