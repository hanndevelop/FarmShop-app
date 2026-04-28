import React, { useState } from 'react';
import { Plus, Edit, X, Upload, Download } from 'lucide-react';

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

function Workers({ workers, setWorkers }) {
  const handleExportWorkers = () => {
    const exportData = workers.map(w => ({
      'Name': w.name,
      'ID Number': w.idNumber || '',
      'Farm ID': w.farmId,
      'House Number': w.houseNumber || ''
    }));
    
    exportToExcel(exportData, 'Workers_List');
  };
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [workerData, setWorkerData] = useState({
    name: '',
    idNumber: '',
    farmId: '',
    houseNumber: '',
    status: 'active'
  });

  const handleAddWorker = () => {
    if (!workerData.name || !workerData.farmId) {
      alert('Please fill in required fields: Name and Farm ID');
      return;
    }

    // Check for duplicate Farm ID
    const duplicateFarmId = workers.find(w => 
      w.farmId.toLowerCase() === workerData.farmId.toLowerCase()
    );
    
    if (duplicateFarmId) {
      alert(`❌ Duplicate Farm ID!\n\nFarm ID "${workerData.farmId}" is already used by:\n${duplicateFarmId.name}\n\nPlease use a different Farm ID.`);
      return;
    }

    // Check for duplicate Name
    const duplicateName = workers.find(w => 
      w.name.toLowerCase() === workerData.name.toLowerCase()
    );
    
    if (duplicateName) {
      const confirm = window.confirm(
        `⚠️ Worker with this name already exists:\n\n` +
        `Name: ${duplicateName.name}\n` +
        `Farm ID: ${duplicateName.farmId}\n\n` +
        `Do you want to add this worker anyway?`
      );
      
      if (!confirm) {
        return;
      }
    }

    // Check for duplicate ID Number (if provided)
    if (workerData.idNumber && workerData.idNumber.length > 0) {
      const duplicateId = workers.find(w => 
        w.idNumber && w.idNumber === workerData.idNumber
      );
      
      if (duplicateId) {
        alert(`❌ Duplicate ID Number!\n\nID Number "${workerData.idNumber}" is already used by:\n${duplicateId.name} (${duplicateId.farmId})\n\nPlease check the ID number.`);
        return;
      }
    }

    const worker = {
      id: Date.now(),
      name: workerData.name,
      idNumber: workerData.idNumber,
      farmId: workerData.farmId,
      houseNumber: workerData.houseNumber,
      status: 'active'
    };

    setWorkers([...workers, worker]);
    setWorkerData({ name: '', idNumber: '', farmId: '', houseNumber: '', status: 'active' });
    setShowAddWorker(false);
  };

  const handleEditWorker = () => {
    if (!workerData.name || !workerData.farmId) {
      alert('Please fill in required fields: Name and Farm ID');
      return;
    }

    // Check for duplicate Farm ID (excluding current worker)
    const duplicateFarmId = workers.find(w => 
      w.id !== editingWorker.id && 
      w.farmId.toLowerCase() === workerData.farmId.toLowerCase()
    );
    
    if (duplicateFarmId) {
      alert(`❌ Duplicate Farm ID!\n\nFarm ID "${workerData.farmId}" is already used by:\n${duplicateFarmId.name}\n\nPlease use a different Farm ID.`);
      return;
    }

    // Check for duplicate ID Number (excluding current worker, if provided)
    if (workerData.idNumber && workerData.idNumber.length > 0) {
      const duplicateId = workers.find(w => 
        w.id !== editingWorker.id &&
        w.idNumber && 
        w.idNumber === workerData.idNumber
      );
      
      if (duplicateId) {
        alert(`❌ Duplicate ID Number!\n\nID Number "${workerData.idNumber}" is already used by:\n${duplicateId.name} (${duplicateId.farmId})\n\nPlease check the ID number.`);
        return;
      }
    }

    const updatedWorkers = workers.map(w => 
      w.id === editingWorker.id 
        ? { 
            ...w, 
            name: workerData.name, 
            idNumber: workerData.idNumber, 
            farmId: workerData.farmId,
            houseNumber: workerData.houseNumber,
            status: workerData.status
          }
        : w
    );

    setWorkers(updatedWorkers);
    setWorkerData({ name: '', idNumber: '', farmId: '', houseNumber: '', status: 'active' });
    setEditingWorker(null);
  };

  const handleDeleteWorker = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;
    
    const confirmDelete = window.confirm(
      `🗑️ Delete Worker?\n\n` +
      `Name: ${worker.name}\n` +
      `Farm ID: ${worker.farmId}\n\n` +
      `This action cannot be undone. Are you sure?`
    );
    
    if (confirmDelete) {
      const updatedWorkers = workers.filter(w => w.id !== workerId);
      setWorkers(updatedWorkers);
    }
  };

  const handleToggleStatus = (workerId) => {
    const updatedWorkers = workers.map(w => {
      if (w.id === workerId) {
        const newStatus = w.status === 'active' ? 'inactive' : 'active';
        return { ...w, status: newStatus };
      }
      return w;
    });
    
    setWorkers(updatedWorkers);
  };

  const openEditModal = (worker) => {
    setEditingWorker(worker);
    setWorkerData({
      name: worker.name,
      idNumber: worker.idNumber,
      farmId: worker.farmId || '',
      houseNumber: worker.houseNumber || '',
      status: worker.status || 'active'
    });
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          alert('CSV file must have headers and at least one worker');
          return;
        }
        
        const importedWorkers = [];
        const errors = [];
        const skipped = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          
          const name = values[0];
          const idNumber = values[1] || '';
          const farmId = values[2];
          const houseNumber = values[3] || '';
          
          // Validate required fields (Name and Farm ID)
          if (!name || !farmId) {
            errors.push(`Row ${i + 1}: Missing required fields (Name or Farm ID)`);
            continue;
          }
          
          // Check for duplicate Farm ID in existing workers
          const duplicateFarmId = workers.find(w => 
            w.farmId.toLowerCase() === farmId.toLowerCase()
          );
          
          if (duplicateFarmId) {
            skipped.push(`Row ${i + 1}: Farm ID "${farmId}" already exists (${duplicateFarmId.name})`);
            continue;
          }
          
          // Check for duplicate Farm ID in imported batch
          const duplicateInBatch = importedWorkers.find(w => 
            w.farmId.toLowerCase() === farmId.toLowerCase()
          );
          
          if (duplicateInBatch) {
            skipped.push(`Row ${i + 1}: Duplicate Farm ID "${farmId}" in import file`);
            continue;
          }
          
          // Check for duplicate ID Number (if provided)
          if (idNumber && idNumber.length > 0) {
            const duplicateId = workers.find(w => 
              w.idNumber && w.idNumber === idNumber
            );
            
            if (duplicateId) {
              skipped.push(`Row ${i + 1}: ID Number "${idNumber}" already exists (${duplicateId.name})`);
              continue;
            }
          }
          
          importedWorkers.push({
            id: Date.now() + i,
            name: name,
            idNumber: idNumber,
            farmId: farmId,
            houseNumber: houseNumber,
            status: 'active'
          });
        }
        
        let message = '';
        
        if (importedWorkers.length > 0) {
          setWorkers([...workers, ...importedWorkers]);
          message += `✅ Successfully imported ${importedWorkers.length} workers!\n\n`;
        }
        
        if (skipped.length > 0) {
          message += `⚠️ Skipped ${skipped.length} duplicates:\n${skipped.slice(0, 5).join('\n')}`;
          if (skipped.length > 5) {
            message += `\n... and ${skipped.length - 5} more`;
          }
          message += '\n\n';
        }
        
        if (errors.length > 0) {
          message += `❌ ${errors.length} errors:\n${errors.slice(0, 5).join('\n')}`;
          if (errors.length > 5) {
            message += `\n... and ${errors.length - 5} more`;
          }
        }
        
        if (importedWorkers.length === 0) {
          message = '❌ No workers imported.\n\nAll rows were either duplicates or had errors.';
        }
        
        alert(message);
        
      } catch (error) {
        alert('Error reading file. Please make sure it\'s a valid CSV file with format: name,id_number,farm_id,house_number');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Workers</h2>
        <p>Manage farm workers</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddWorker(true)}
        >
          <Plus size={20} />
          Add Worker
        </button>

        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          <Upload size={20} />
          Import Workers (CSV)
          <input
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            style={{ display: 'none' }}
          />
        </label>

        <button 
          className="btn btn-secondary"
          onClick={handleExportWorkers}
          disabled={workers.length === 0}
        >
          <Download size={20} />
          Export Workers to Excel
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All Workers</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>ID Number</th>
                <th>Farm ID</th>
                <th>House Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map(worker => (
                <tr key={worker.id} style={{ 
                  backgroundColor: worker.status === 'inactive' ? '#f5f5f5' : 'white',
                  opacity: worker.status === 'inactive' ? 0.6 : 1
                }}>
                  <td><strong>{worker.name}</strong></td>
                  <td>{worker.idNumber || '-'}</td>
                  <td>{worker.farmId}</td>
                  <td>{worker.houseNumber || '-'}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: worker.status === 'active' ? '#e8f5e9' : '#ffebee',
                      color: worker.status === 'active' ? '#2e7d32' : '#c62828'
                    }}>
                      {worker.status === 'active' ? '✓ Active' : '✕ Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => openEditModal(worker)}
                        style={{ padding: '6px 12px' }}
                        title="Edit worker"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleToggleStatus(worker.id)}
                        style={{ 
                          padding: '6px 12px',
                          backgroundColor: worker.status === 'active' ? '#ff9800' : '#4caf50',
                          color: 'white'
                        }}
                        title={worker.status === 'active' ? 'Make inactive' : 'Make active'}
                      >
                        {worker.status === 'active' ? '⏸' : '▶'}
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleDeleteWorker(worker.id)}
                        style={{ 
                          padding: '6px 12px',
                          backgroundColor: '#c62828',
                          color: 'white'
                        }}
                        title="Delete worker"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Worker Modal */}
      {showAddWorker && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Worker</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddWorker(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={workerData.name}
                onChange={(e) => setWorkerData({...workerData, name: e.target.value})}
                placeholder="e.g., Johannes Mkhize"
              />
            </div>

            <div className="form-group">
              <label>ID Number (SA ID) - Optional</label>
              <input
                type="text"
                value={workerData.idNumber}
                onChange={(e) => setWorkerData({...workerData, idNumber: e.target.value})}
                placeholder="e.g., 7801015800082 (Optional)"
                maxLength="13"
              />
            </div>

            <div className="form-group">
              <label>Farm ID *</label>
              <input
                type="text"
                value={workerData.farmId}
                onChange={(e) => setWorkerData({...workerData, farmId: e.target.value})}
                placeholder="e.g., W001 or FARM-123"
              />
            </div>

            <div className="form-group">
              <label>House Number - Optional</label>
              <input
                type="text"
                value={workerData.houseNumber}
                onChange={(e) => setWorkerData({...workerData, houseNumber: e.target.value})}
                placeholder="e.g., H15 or House 15"
              />
            </div>

            <div className="alert alert-info" style={{ fontSize: '13px' }}>
              * Required fields: Name and Farm ID
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddWorker(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddWorker}
              >
                Add Worker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Worker Modal */}
      {editingWorker && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Worker</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => setEditingWorker(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={workerData.name}
                onChange={(e) => setWorkerData({...workerData, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>ID Number (SA ID) - Optional</label>
              <input
                type="text"
                value={workerData.idNumber}
                onChange={(e) => setWorkerData({...workerData, idNumber: e.target.value})}
                maxLength="13"
              />
            </div>

            <div className="form-group">
              <label>Farm ID *</label>
              <input
                type="text"
                value={workerData.farmId}
                onChange={(e) => setWorkerData({...workerData, farmId: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>House Number - Optional</label>
              <input
                type="text"
                value={workerData.houseNumber}
                onChange={(e) => setWorkerData({...workerData, houseNumber: e.target.value})}
                placeholder="e.g., H15 or House 15"
              />
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setEditingWorker(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleEditWorker}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workers;
