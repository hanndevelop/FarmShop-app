import React, { useState } from 'react';
import { ClipboardCheck, Plus, X } from 'lucide-react';

function Stocktake({ stockData, stocktakes, setStocktakes }) {
  const [showNewStocktake, setShowNewStocktake] = useState(false);
  const [stocktakeType, setStocktakeType] = useState('monthly');
  const [stocktakeDate, setStocktakeDate] = useState(new Date().toISOString().split('T')[0]);
  const [counts, setCounts] = useState({});

  const startNewStocktake = () => {
    // Initialize counts with current system quantities
    const initialCounts = {};
    stockData.forEach(item => {
      initialCounts[item.id] = {
        systemQty: item.quantity,
        actualQty: item.quantity,
        variance: 0
      };
    });
    setCounts(initialCounts);
    setShowNewStocktake(true);
  };

  const updateActualCount = (itemId, actualQty) => {
    const systemQty = counts[itemId].systemQty;
    const variance = actualQty - systemQty;
    
    setCounts({
      ...counts,
      [itemId]: {
        ...counts[itemId],
        actualQty: parseInt(actualQty) || 0,
        variance
      }
    });
  };

  const saveStocktake = () => {
    const stocktakeData = {
      id: Date.now(),
      date: stocktakeDate,
      type: stocktakeType,
      items: Object.entries(counts).map(([itemId, data]) => {
        const item = stockData.find(i => i.id === parseInt(itemId));
        return {
          itemId: parseInt(itemId),
          itemName: item.name,
          systemQty: data.systemQty,
          actualQty: data.actualQty,
          variance: data.variance,
          varianceValue: data.variance * item.price
        };
      })
    };

    const totalVarianceValue = stocktakeData.items.reduce(
      (sum, item) => sum + item.varianceValue, 0
    );
    stocktakeData.totalVarianceValue = totalVarianceValue;

    setStocktakes([...stocktakes, stocktakeData]);
    setShowNewStocktake(false);
    setCounts({});
    alert('Stocktake saved successfully!');
  };

  const getTotalVariance = () => {
    return Object.values(counts).reduce((sum, item) => sum + item.variance, 0);
  };

  const getVarianceValue = () => {
    return Object.entries(counts).reduce((sum, [itemId, data]) => {
      const item = stockData.find(i => i.id === parseInt(itemId));
      return sum + (data.variance * item.price);
    }, 0);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Stocktake</h2>
        <p>Record physical stock counts</p>
      </div>

      <button 
        className="btn btn-primary"
        onClick={startNewStocktake}
        style={{ marginBottom: '24px' }}
      >
        <Plus size={20} />
        New Stocktake
      </button>

      <div className="card">
        <div className="card-header">
          <h3>Stocktake History</h3>
        </div>
        {stocktakes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <ClipboardCheck size={48} />
            <p style={{ marginTop: '16px' }}>No stocktakes recorded yet</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Items Counted</th>
                  <th>Total Variance (Units)</th>
                  <th>Variance Value</th>
                </tr>
              </thead>
              <tbody>
                {stocktakes.map(st => {
                  const totalVariance = st.items.reduce((sum, item) => sum + item.variance, 0);
                  return (
                    <tr key={st.id}>
                      <td>{st.date}</td>
                      <td style={{ textTransform: 'capitalize' }}>{st.type}</td>
                      <td>{st.items.length}</td>
                      <td>{totalVariance}</td>
                      <td 
                        style={{ 
                          color: st.totalVarianceValue < 0 ? '#c62828' : '#2e7d32',
                          fontWeight: 'bold'
                        }}
                      >
                        R {st.totalVarianceValue.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Stocktake Modal */}
      {showNewStocktake && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>New Stocktake</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowNewStocktake(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stocktake Type</label>
                <select
                  value={stocktakeType}
                  onChange={(e) => setStocktakeType(e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={stocktakeDate}
                  onChange={(e) => setStocktakeDate(e.target.value)}
                />
              </div>
            </div>

            <div className="alert alert-info" style={{ marginBottom: '20px' }}>
              <ClipboardCheck size={20} />
              <span>Count each item physically and enter the actual quantity</span>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>System Qty</th>
                    <th>Actual Qty</th>
                    <th>Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{counts[item.id]?.systemQty || 0}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={counts[item.id]?.actualQty || 0}
                          onChange={(e) => updateActualCount(item.id, e.target.value)}
                          style={{ width: '100px', padding: '6px' }}
                        />
                      </td>
                      <td 
                        style={{ 
                          color: counts[item.id]?.variance < 0 ? '#c62828' : 
                                 counts[item.id]?.variance > 0 ? '#2e7d32' : '#666',
                          fontWeight: 'bold'
                        }}
                      >
                        {counts[item.id]?.variance || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>Total Variance (Units):</span>
                <span 
                  style={{ 
                    color: getTotalVariance() < 0 ? '#c62828' : 
                           getTotalVariance() > 0 ? '#2e7d32' : '#666',
                    fontWeight: 'bold'
                  }}
                >
                  {getTotalVariance()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Variance Value:</span>
                <span 
                  style={{ 
                    color: getVarianceValue() < 0 ? '#c62828' : 
                           getVarianceValue() > 0 ? '#2e7d32' : '#666',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}
                >
                  R {getVarianceValue().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowNewStocktake(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={saveStocktake}
              >
                Save Stocktake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stocktake;
