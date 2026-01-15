import React, { useState } from 'react';
import { Plus, Edit, X, Upload } from 'lucide-react';

function Workers({ workers, setWorkers }) {
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  
  const [workerData, setWorkerData] = useState({
    name: '',
    idNumber: '',
    farmId: ''
  });

  const handleAddWorker = () => {
    if (!workerData.name || !workerData.farmId) {
      alert('Please fill in required fields: Name and Farm ID');
      return;
    }

    const worker = {
      id: Date.now(),
      name: workerData.name,
      idNumber: workerData.idNumber,
      farmId: workerData.farmId
    };

    setWorkers([...workers, worker]);
    setWorkerData({ name: '', idNumber: '', farmId: '' });
    setShowAddWorker(false);
  };

  const handleEditWorker = () => {
    if (!workerData.name || !workerData.farmId) {
      alert('Please fill in required fields: Name and Farm ID');
      return;
    }

    const updatedWorkers = workers.map(w => 
      w.id === editingWorker.id 
        ? { ...w, name: workerData.name, idNumber: workerData.idNumber, farmId: workerData.farmId }
        : w
    );

    setWorkers(updatedWorkers);
    setWorkerData({ name: '', idNumber: '', farmId: '' });
    setEditingWorker(null);
  };

  const openEditModal = (worker) => {
    setEditingWorker(worker);
    setWorkerData({
      name: worker.name,
      idNumber: worker.idNumber,
      farmId: worker.farmId || ''
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
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          
          const name = values[0];
          const idNumber = values[1] || '';
          const farmId = values[2];
          
          // Validate required fields (Name and Farm ID)
          if (!name || !farmId) {
            errors.push(`Row ${i + 1}: Missing required fields (Name or Farm ID)`);
            continue;
          }
          
          importedWorkers.push({
            id: Date.now() + i,
            name: name,
            idNumber: idNumber,
            farmId: farmId
          });
        }
        
        if (errors.length > 0) {
          alert('Some rows had errors:\n\n' + errors.join('\n') + '\n\nOther valid rows were imported.');
        }
        
        if (importedWorkers.length > 0) {
          setWorkers([...workers, ...importedWorkers]);
          alert(`Successfully imported ${importedWorkers.length} workers!`);
        } else {
          alert('No valid workers found in the file. Make sure all rows have Name and Farm ID (SA ID is optional).');
        }
      } catch (error) {
        alert('Error reading file. Please make sure it\'s a valid CSV file with format: name,id_number,farm_id');
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

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddWorker(true)}
        >
          <Plus size={20} />
          Add Worker
        </button>
        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          <Upload size={20} />
          Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            style={{ display: 'none' }}
          />
        </label>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map(worker => (
                <tr key={worker.id}>
                  <td>{worker.name}</td>
                  <td>{worker.idNumber}</td>
                  <td>{worker.farmId || '-'}</td>
                  <td>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => openEditModal(worker)}
                      style={{ padding: '6px 12px' }}
                    >
                      <Edit size={16} />
                    </button>
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
              <label>ID Number (SA ID)</label>
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
              <label>ID Number (SA ID)</label>
              <input
                type="text"
                value={workerData.idNumber}
                onChange={(e) => setWorkerData({...workerData, idNumber: e.target.value})}
                maxLength="13"
                placeholder="Optional"
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
