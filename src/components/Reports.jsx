import React, { useState } from 'react';
import { Download, User, Calendar, Receipt } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

// Generate Till Slip PDF for a worker
const generateTillSlipPDF = (worker, transactions, startDate, endDate) => {
  try {
    console.log('🧾 Generating PDF for:', worker.name);
    console.log('📊 Transactions:', transactions.length);
    
    if (!transactions || transactions.length === 0) {
      alert('⚠️ No transactions to include in till slip');
      return;
    }
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('LOOCK WINKEL', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Worker Purchase Report', 105, 28, { align: 'center' });
    
    // Line
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);
    
    // Worker details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Worker Details:', 20, 40);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${worker.name}`, 20, 48);
    doc.text(`Farm ID: ${worker.farmId}`, 20, 55);
    if (worker.houseNumber) {
      doc.text(`House: ${worker.houseNumber}`, 20, 62);
    }
    if (worker.idNumber) {
      doc.text(`ID Number: ${worker.idNumber}`, 20, worker.houseNumber ? 69 : 62);
    }
    
    // Date range
    const yPos = worker.houseNumber ? (worker.idNumber ? 76 : 69) : (worker.idNumber ? 69 : 62);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Period:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    
    if (startDate && endDate) {
      doc.text(`${startDate} to ${endDate}`, 20, yPos + 7);
    } else if (startDate) {
      doc.text(`From ${startDate}`, 20, yPos + 7);
    } else if (endDate) {
      doc.text(`Up to ${endDate}`, 20, yPos + 7);
    } else {
      doc.text('All transactions', 20, yPos + 7);
    }
    
    doc.text(`Generated: ${new Date().toLocaleDateString('en-ZA')}`, 20, yPos + 14);
    
    // Line
    doc.line(20, yPos + 18, 190, yPos + 18);
    
    // Items table
    const tableStartY = yPos + 24;
    
    doc.setFont('helvetica', 'bold');
    doc.text('ITEMS PURCHASED:', 20, tableStartY);
    
    // Prepare table data
    const tableData = transactions.map(t => [
      t.itemName,
      `x${t.quantity}`,
      `R ${t.total.toFixed(2)}`
    ]);
    
    // Add table
    autoTable(doc, {
      startY: tableStartY + 4,
      head: [['Item', 'Qty', 'Amount']],
      body: tableData,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [148, 0, 45], // BKB Maroon
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 110 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
    
    // Total
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setLineWidth(0.5);
    doc.line(20, finalY, 190, finalY);
    
    const total = transactions.reduce((sum, t) => sum + t.total, 0);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 110, finalY + 8);
    doc.text(`R ${total.toFixed(2)}`, 170, finalY + 8, { align: 'right' });
    
    doc.setLineWidth(1);
    doc.line(20, finalY + 12, 190, finalY + 12);
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('This is a computer-generated document.', 105, 280, { align: 'center' });
    doc.text('Thank you for your business!', 105, 285, { align: 'center' });
    
    // Save
    const filename = `${worker.name.replace(/\s+/g, '_')}_TillSlip_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('💾 Saving PDF:', filename);
    doc.save(filename);
    console.log('✅ PDF generated successfully!');
    
  } catch (error) {
    console.error('❌ PDF Generation Error:', error);
    alert(`Error generating PDF: ${error.message}\n\nMake sure jsPDF is installed:\nnpm install jspdf jspdf-autotable`);
  }
};

function Reports({ transactions, workers, stocktakes, stockData }) {
  const [activeReport, setActiveReport] = useState('transactions');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');

  // Filter transactions by date range
  const filterByDate = (items) => {
    return items.filter(item => {
      const itemDate = new Date(item.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return itemDate >= start && itemDate <= end;
      } else if (start) {
        return itemDate >= start;
      } else if (end) {
        return itemDate <= end;
      }
      return true;
    });
  };

  const filteredTransactions = filterByDate(transactions);

  // All Transactions Report
  const renderAllTransactions = () => {
    const exportData = filteredTransactions.map(t => ({
      'Date': t.date,
      'Worker': t.workerName,
      'Item': t.itemName,
      'Quantity': t.quantity,
      'Price': 'R ' + t.price.toFixed(2),
      'Total': 'R ' + t.total.toFixed(2)
    }));

    const grandTotal = filteredTransactions.reduce((sum, t) => sum + t.total, 0);

    return (
      <div>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '8px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '8px' }}
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => exportToExcel(exportData, 'All_Transactions')}
          >
            <Download size={16} />
            Export to Excel
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
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
              {filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.workerName}</td>
                  <td>{t.itemName}</td>
                  <td>{t.quantity}</td>
                  <td>R {t.price.toFixed(2)}</td>
                  <td>R {t.total.toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                <td colSpan="5" style={{ textAlign: 'right' }}>TOTAL:</td>
                <td>R {grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Worker Summary Report
  const renderWorkerSummary = () => {
    const workerTotals = {};

    workers.forEach(w => {
      workerTotals[w.id] = {
        name: w.name,
        farmId: w.farmId,
        total: 0
      };
    });

    filteredTransactions.forEach(t => {
      if (workerTotals[t.workerId]) {
        workerTotals[t.workerId].total += t.total;
      }
    });

    const summaryData = Object.values(workerTotals);
    const grandTotal = summaryData.reduce((sum, w) => sum + w.total, 0);

    const exportData = summaryData.map(w => ({
      'Worker Name': w.name,
      'Farm ID': w.farmId,
      'Total Purchases': 'R ' + w.total.toFixed(2)
    }));

    return (
      <div>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '8px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '8px' }}
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => exportToExcel(exportData, 'Worker_Summary')}
          >
            <Download size={16} />
            Export to Excel
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Farm ID</th>
                <th>Total Purchases</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map((w, i) => (
                <tr key={i}>
                  <td>{w.name}</td>
                  <td>{w.farmId}</td>
                  <td>R {w.total.toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                <td colSpan="2" style={{ textAlign: 'right' }}>TOTAL:</td>
                <td>R {grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Worker Detail Report (with PDF Till Slip option)
  const renderWorkerDetail = () => {
    const worker = workers.find(w => w.id === parseInt(selectedWorker));
    const workerTransactions = worker ? filteredTransactions.filter(t => t.workerId === worker.id) : [];
    const total = workerTransactions.reduce((sum, t) => sum + t.total, 0);

    const exportData = workerTransactions.map(t => ({
      'Date': t.date,
      'Item': t.itemName,
      'Quantity': t.quantity,
      'Price': 'R ' + t.price.toFixed(2),
      'Total': 'R ' + t.total.toFixed(2)
    }));

    return (
      <div>
        {/* ALWAYS show dropdown and date filters */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
              <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Select Worker
            </label>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              style={{ padding: '8px', minWidth: '200px' }}
            >
              <option value="">Choose a worker</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.farmId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
              <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '8px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
              <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '8px' }}
            />
          </div>
        </div>

        {/* Show buttons if worker selected */}
        {worker && (
          <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-primary"
              onClick={() => exportToExcel(exportData, `${worker.name.replace(/\s+/g, '_')}_Transactions`)}
              disabled={workerTransactions.length === 0}
              style={{ opacity: workerTransactions.length === 0 ? 0.5 : 1 }}
            >
              <Download size={16} />
              Export to Excel
            </button>
            <button
              className="btn"
              style={{ 
                backgroundColor: '#94002D', 
                color: 'white',
                opacity: workerTransactions.length === 0 ? 0.5 : 1
              }}
              onClick={() => generateTillSlipPDF(worker, workerTransactions, startDate, endDate)}
              disabled={workerTransactions.length === 0}
            >
              <Receipt size={16} />
              Generate Till Slip PDF
            </button>
          </div>
        )}

        {/* Show message if no worker selected */}
        {!worker && (
          <div className="alert alert-info">
            <User size={20} />
            <p>Please select a worker to view their transaction details</p>
          </div>
        )}

        {/* Show worker info and transactions if worker selected */}
        {worker && (
          <>
            <div className="alert alert-info" style={{ marginBottom: '16px' }}>
              <User size={20} />
              <div>
                <strong>{worker.name}</strong>
                <div style={{ fontSize: '14px' }}>Farm ID: {worker.farmId}</div>
                {worker.houseNumber && <div style={{ fontSize: '14px' }}>House: {worker.houseNumber}</div>}
              </div>
            </div>

            {workerTransactions.length === 0 ? (
              <div className="alert alert-info">
                <p>No transactions found for this worker in the selected date range.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
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
                    {workerTransactions.map(t => (
                      <tr key={t.id}>
                        <td>{t.date}</td>
                        <td>{t.itemName}</td>
                        <td>{t.quantity}</td>
                        <td>R {t.price.toFixed(2)}</td>
                        <td>R {t.total.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                      <td colSpan="4" style={{ textAlign: 'right' }}>TOTAL:</td>
                      <td>R {total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Stock Report
  const renderStockReport = () => {
    const itemSales = {};

    filteredTransactions.forEach(t => {
      if (!itemSales[t.itemId]) {
        const stockItem = stockData.find(s => s.id === t.itemId);
        itemSales[t.itemId] = {
          name: t.itemName,
          totalQty: 0,
          costTotal: 0,
          sellTotal: 0,
          costPrice: stockItem?.costPrice || 0
        };
      }
      itemSales[t.itemId].totalQty += t.quantity;
      itemSales[t.itemId].sellTotal += t.total;
      itemSales[t.itemId].costTotal += (itemSales[t.itemId].costPrice * t.quantity);
    });

    const salesData = Object.values(itemSales)
      .sort((a, b) => b.totalQty - a.totalQty);

    const totals = salesData.reduce((acc, item) => ({
      qty: acc.qty + item.totalQty,
      cost: acc.cost + item.costTotal,
      sell: acc.sell + item.sellTotal,
      profit: acc.profit + (item.sellTotal - item.costTotal)
    }), { qty: 0, cost: 0, sell: 0, profit: 0 });

    const exportData = salesData.map(item => ({
      'Item': item.name,
      'Total Sold': item.totalQty,
      'Cost Price Total': 'R ' + item.costTotal.toFixed(2),
      'Sell Price Total': 'R ' + item.sellTotal.toFixed(2),
      'Profit': 'R ' + (item.sellTotal - item.costTotal).toFixed(2)
    }));

    return (
      <div>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '8px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '8px' }}
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => exportToExcel(exportData, 'Stock_Report')}
          >
            <Download size={16} />
            Export to Excel
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
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
              {salesData.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>{item.totalQty}</td>
                  <td>R {item.costTotal.toFixed(2)}</td>
                  <td>R {item.sellTotal.toFixed(2)}</td>
                  <td style={{ color: (item.sellTotal - item.costTotal) >= 0 ? '#2e7d32' : '#c62828' }}>
                    R {(item.sellTotal - item.costTotal).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                <td>TOTALS:</td>
                <td>{totals.qty}</td>
                <td>R {totals.cost.toFixed(2)}</td>
                <td>R {totals.sell.toFixed(2)}</td>
                <td style={{ color: totals.profit >= 0 ? '#2e7d32' : '#c62828' }}>
                  R {totals.profit.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <h2>Reports</h2>

      <div className="card">
        <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
          <h3>Report Type</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`btn ${activeReport === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveReport('transactions')}
            >
              All Transactions
            </button>
            <button
              className={`btn ${activeReport === 'workerSummary' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveReport('workerSummary')}
            >
              Worker Summary
            </button>
            <button
              className={`btn ${activeReport === 'workerDetail' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveReport('workerDetail')}
            >
              Worker Detail
            </button>
            <button
              className={`btn ${activeReport === 'stock' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveReport('stock')}
            >
              Stock Report
            </button>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {activeReport === 'transactions' && renderAllTransactions()}
          {activeReport === 'workerSummary' && renderWorkerSummary()}
          {activeReport === 'workerDetail' && renderWorkerDetail()}
          {activeReport === 'stock' && renderStockReport()}
        </div>
      </div>
    </div>
  );
}

export default Reports;
