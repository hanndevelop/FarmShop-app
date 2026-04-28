import React, { useState, useEffect } from 'react';
import { 
  Home, Package, Users, ShoppingCart, 
  ClipboardCheck, BarChart3, Plus, AlertCircle, LogOut 
} from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StockManagement from './components/StockManagement';
import ShopFunction from './components/ShopFunction';
import Workers from './components/Workers';
import Stocktake from './components/Stocktake';
import Reports from './components/Reports';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stockData, setStockData] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stocktakes, setStocktakes] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Google Apps Script configuration - UPDATE THIS URL!
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtUwmvIPT3oLOAEH7ky8FeebHUeaowLAZZF-TBYYTx4UeCNGqJ4A579Jeun1YOiX5Y/exec';
  
  // Check for saved login session
  useEffect(() => {
    const savedUser = localStorage.getItem('farmShopUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // Load data when user logs in
  useEffect(() => {
    if (isLoggedIn && !dataLoaded) {
      loadAllData();
    }
  }, [isLoggedIn]);

  // Auto-save workers (to BOTH localStorage AND Sheets)
  useEffect(() => {
    if (dataLoaded && workers.length > 0) {
      localStorage.setItem('farmShop_Workers', JSON.stringify(workers));
      saveToSheets('Workers', workers);
    }
  }, [workers, dataLoaded]);

  // Auto-save stock data
  useEffect(() => {
    if (dataLoaded && stockData.length > 0) {
      localStorage.setItem('farmShop_Stock', JSON.stringify(stockData));
      saveToSheets('Stock_Master', stockData);
    }
  }, [stockData, dataLoaded]);

  // Auto-save transactions
  useEffect(() => {
    if (dataLoaded && transactions.length > 0) {
      localStorage.setItem('farmShop_Transactions', JSON.stringify(transactions));
      saveToSheets('Transactions', transactions);
    }
  }, [transactions, dataLoaded]);

  // Auto-save stocktakes
  useEffect(() => {
    if (dataLoaded && stocktakes.length > 0) {
      localStorage.setItem('farmShop_Stocktakes', JSON.stringify(stocktakes));
      saveToSheets('Stocktakes', stocktakes);
    }
  }, [stocktakes, dataLoaded]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('farmShopUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('farmShopUser');
    setActiveTab('dashboard');
  };

  // Load data from localStorage FIRST, then MERGE with Google Sheets
  const loadAllData = async () => {
    console.log('🔄 Starting data load...');
    
    // STEP 1: Load from localStorage
    const localWorkers = localStorage.getItem('farmShop_Workers');
    const localStock = localStorage.getItem('farmShop_Stock');
    const localTransactions = localStorage.getItem('farmShop_Transactions');
    const localStocktakes = localStorage.getItem('farmShop_Stocktakes');

    let localWorkersData = [];
    let localStockData = [];
    let localTransactionsData = [];
    let localStocktakesData = [];

    // Parse localStorage data
    if (localWorkers) {
      try {
        localWorkersData = JSON.parse(localWorkers);
        console.log('📱 Found ' + localWorkersData.length + ' workers in localStorage');
      } catch (e) {
        console.error('Error parsing local workers:', e);
      }
    }

    if (localStock) {
      try {
        localStockData = JSON.parse(localStock);
        console.log('📱 Found ' + localStockData.length + ' stock items in localStorage');
      } catch (e) {
        console.error('Error parsing local stock:', e);
      }
    }

    if (localTransactions) {
      try {
        localTransactionsData = JSON.parse(localTransactions);
        console.log('📱 Found ' + localTransactionsData.length + ' transactions in localStorage');
      } catch (e) {
        console.error('Error parsing local transactions:', e);
      }
    }

    if (localStocktakes) {
      try {
        localStocktakesData = JSON.parse(localStocktakes);
        console.log('📱 Found ' + localStocktakesData.length + ' stocktakes in localStorage');
      } catch (e) {
        console.error('Error parsing local stocktakes:', e);
      }
    }

    // STEP 2: Load from Google Sheets
    let sheetsWorkersData = [];
    let sheetsStockData = [];
    let sheetsTransactionsData = [];
    let sheetsStocktakesData = [];

    try {
      console.log('☁️ Loading from Google Sheets...');
      
      // Load Workers from Sheets
      try {
        const workersResult = await loadFromSheets('Workers');
        if (workersResult.status === 'success' && workersResult.data.length > 0) {
          sheetsWorkersData = workersResult.data;
          console.log('☁️ Found ' + sheetsWorkersData.length + ' workers in Sheets');
        }
      } catch (error) {
        console.error('Error loading workers from Sheets:', error);
      }

      // Load Stock from Sheets
      try {
        const stockResult = await loadFromSheets('Stock_Master');
        if (stockResult.status === 'success' && stockResult.data.length > 0) {
          sheetsStockData = stockResult.data;
          console.log('☁️ Found ' + sheetsStockData.length + ' stock items in Sheets');
        }
      } catch (error) {
        console.error('Error loading stock from Sheets:', error);
      }

      // Load Transactions from Sheets
      try {
        const transResult = await loadFromSheets('Transactions');
        if (transResult.status === 'success' && transResult.data.length > 0) {
          sheetsTransactionsData = transResult.data;
          console.log('☁️ Found ' + sheetsTransactionsData.length + ' transactions in Sheets');
        }
      } catch (error) {
        console.error('Error loading transactions from Sheets:', error);
      }

      // Load Stocktakes from Sheets
      try {
        const stocktakesResult = await loadFromSheets('Stocktakes');
        if (stocktakesResult.status === 'success' && stocktakesResult.data.length > 0) {
          sheetsStocktakesData = stocktakesResult.data;
          console.log('☁️ Found ' + sheetsStocktakesData.length + ' stocktakes in Sheets');
        }
      } catch (error) {
        console.error('Error loading stocktakes from Sheets:', error);
      }

    } catch (error) {
      console.error('Error loading from Sheets:', error);
    }

    // STEP 3: MERGE data (keep most recent based on ID)
    const mergedWorkers = mergeData(localWorkersData, sheetsWorkersData, 'farmId');
    const mergedStock = mergeData(localStockData, sheetsStockData, 'id');
    const mergedTransactions = mergeData(localTransactionsData, sheetsTransactionsData, 'id');
    const mergedStocktakes = mergeData(localStocktakesData, sheetsStocktakesData, 'id');

    console.log('🔀 Merged Workers: ' + mergedWorkers.length);
    console.log('🔀 Merged Stock: ' + mergedStock.length);
    console.log('🔀 Merged Transactions: ' + mergedTransactions.length);
    console.log('🔀 Merged Stocktakes: ' + mergedStocktakes.length);

    // STEP 4: Set merged data
    if (mergedWorkers.length > 0) {
      setWorkers(mergedWorkers);
      localStorage.setItem('farmShop_Workers', JSON.stringify(mergedWorkers));
    } else {
      // Load sample data if nothing exists
      const sampleWorkers = [
        { id: 1, name: 'Johannes Mkhize', idNumber: '7801015800082', farmId: 'W001', houseNumber: '' },
        { id: 2, name: 'Sarah Dlamini', idNumber: '8505129800083', farmId: 'W002', houseNumber: '' },
      ];
      setWorkers(sampleWorkers);
      localStorage.setItem('farmShop_Workers', JSON.stringify(sampleWorkers));
    }

    if (mergedStock.length > 0) {
      setStockData(mergedStock);
      localStorage.setItem('farmShop_Stock', JSON.stringify(mergedStock));
    } else {
      const sampleStock = [
        { id: 1, name: 'Maize Meal 5kg', stockCode: 'MM5KG', category: 'Groceries', costPrice: 45, sellPrice: 56.70, quantity: 20, minQuantity: 5 },
        { id: 2, name: 'Sugar 2.5kg', stockCode: 'SG25', category: 'Groceries', costPrice: 28, sellPrice: 35.28, quantity: 15, minQuantity: 5 },
      ];
      setStockData(sampleStock);
      localStorage.setItem('farmShop_Stock', JSON.stringify(sampleStock));
    }

    if (mergedTransactions.length > 0) {
      setTransactions(mergedTransactions);
      localStorage.setItem('farmShop_Transactions', JSON.stringify(mergedTransactions));
    }

    if (mergedStocktakes.length > 0) {
      setStocktakes(mergedStocktakes);
      localStorage.setItem('farmShop_Stocktakes', JSON.stringify(mergedStocktakes));
    }

    setDataLoaded(true);
    console.log('✅ Data load complete!');
  };

  // Merge function - combines local and sheets data, preferring sheets when both exist
  const mergeData = (localData, sheetsData, uniqueKey) => {
    console.log(`🔀 Merging data - Local: ${localData.length}, Sheets: ${sheetsData.length}`);
    
    // If sheets has data and local is empty, use sheets
    if (sheetsData.length > 0 && localData.length === 0) {
      console.log(`  ↪️ Using Sheets data (local empty)`);
      return sheetsData;
    }
    
    // If local has data and sheets is empty, use local
    if (localData.length > 0 && sheetsData.length === 0) {
      console.log(`  ↪️ Using local data (sheets empty)`);
      return localData;
    }
    
    // Both have data - merge by unique key, preferring sheets data for duplicates
    const sheetsKeys = new Set(sheetsData.map(item => String(item[uniqueKey])));
    const localOnly = localData.filter(item => !sheetsKeys.has(String(item[uniqueKey])));
    
    const merged = [...sheetsData, ...localOnly];
    console.log(`  ↪️ Merged result: ${merged.length} items (${sheetsData.length} from sheets + ${localOnly.length} local-only)`);
    
    return merged;
  };

  // Load data from Google Sheets using JSONP
  const loadFromSheets = (sheetName) => {
    return new Promise((resolve, reject) => {
      const callbackName = 'jsonpCallback' + Date.now();
      const timeout = setTimeout(() => {
        delete window[callbackName];
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
        reject(new Error('Timeout loading from ' + sheetName));
      }, 10000); // 10 second timeout
      
      window[callbackName] = (data) => {
        clearTimeout(timeout);
        delete window[callbackName];
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
        resolve(data);
      };
      
      const script = document.createElement('script');
      script.src = `${APPS_SCRIPT_URL}?action=read&sheet=${sheetName}&callback=${callbackName}`;
      script.onerror = () => {
        clearTimeout(timeout);
        delete window[callbackName];
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
        reject(new Error('Failed to load from ' + sheetName));
      };
      
      document.body.appendChild(script);
    });
  };

  // Save data to Google Sheets using GET (more reliable than POST)
  const saveToSheets = async (sheetName, data) => {
    if (!data || data.length === 0) {
      console.log(`⏭️ Skipping save to ${sheetName} - no data`);
      return { success: false, message: 'No data' };
    }
    
    try {
      console.log(`💾 Saving ${data.length} items to ${sheetName}...`);
      
      // Use GET with data in URL parameter (more reliable)
      const dataString = encodeURIComponent(JSON.stringify({
        action: 'write',
        sheet: sheetName,
        rows: data
      }));
      
      const url = `${APPS_SCRIPT_URL}?saveData=${dataString}`;
      
      // Create a script tag to make the request
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.log(`⏱️ Timeout saving to ${sheetName}`);
          localStorage.setItem(`farmShop_${sheetName}_lastSync`, new Date().toISOString());
          resolve({ success: true, message: 'Sent (timeout)' });
        }, 10000);

        const script = document.createElement('script');
        const callbackName = 'saveCallback_' + Date.now();
        
        window[callbackName] = function(response) {
          clearTimeout(timeout);
          delete window[callbackName];
          document.body.removeChild(script);
          
          console.log(`📤 Response from ${sheetName}:`, response);
          localStorage.setItem(`farmShop_${sheetName}_lastSync`, new Date().toISOString());
          resolve({ success: true, message: 'Saved' });
        };
        
        script.src = url + `&callback=${callbackName}`;
        script.onerror = () => {
          clearTimeout(timeout);
          console.error(`❌ Error saving to ${sheetName}`);
          reject(new Error('Script load failed'));
        };
        
        document.body.appendChild(script);
      });
      
    } catch (error) {
      console.error(`❌ Error saving to ${sheetName}:`, error);
      return { success: false, message: error.message };
    }
  };

  // Manual sync function with verification
  const forceSync = async () => {
    console.log('🔄 Force syncing all data to Google Sheets...');
    
    // Don't allow sync during initial load
    if (!dataLoaded) {
      alert('⚠️ Please wait...\n\nData is still loading from Google Sheets.\n\nTry again in a few seconds.');
      return;
    }
    
    // Check current data counts
    console.log(`Current data: Workers=${workers.length}, Stock=${stockData.length}, Trans=${transactions.length}`);
    
    // Check if we have any data to sync
    const hasData = workers.length > 0 || stockData.length > 0 || 
                    transactions.length > 0 || stocktakes.length > 0;
    
    if (!hasData) {
      // No local data - try loading from sheets first
      alert('ℹ️ No local data found.\n\nAttempting to load from Google Sheets...');
      
      try {
        await loadAllData();
        
        // Check again after loading
        const hasDataNow = workers.length > 0 || stockData.length > 0;
        
        if (hasDataNow) {
          alert(`✅ Loaded from Google Sheets!\n\n📊 Workers: ${workers.length}\n📦 Stock: ${stockData.length}\n\nData is now available on this device.`);
        } else {
          alert('⚠️ No data in Google Sheets either.\n\nAdd workers or stock first, then sync.');
        }
      } catch (error) {
        alert('❌ Failed to load from Sheets.\n\nCheck internet connection.');
      }
      return;
    }
    
    try {
      const results = [];
      
      // Save and verify Workers
      if (workers.length > 0) {
        console.log(`📤 Syncing ${workers.length} workers...`);
        await saveToSheets('Workers', workers);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        try {
          const verifyResult = await loadFromSheets('Workers');
          const count = verifyResult.status === 'success' ? verifyResult.data.length : 0;
          results.push({ name: 'Workers', sent: workers.length, confirmed: count });
        } catch (e) {
          console.error('Verify error:', e);
          results.push({ name: 'Workers', sent: workers.length, confirmed: 0 });
        }
      }
      
      // Save and verify Stock
      if (stockData.length > 0) {
        console.log(`📤 Syncing ${stockData.length} stock items...`);
        await saveToSheets('Stock_Master', stockData);
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const verifyResult = await loadFromSheets('Stock_Master');
          const count = verifyResult.status === 'success' ? verifyResult.data.length : 0;
          results.push({ name: 'Stock', sent: stockData.length, confirmed: count });
        } catch (e) {
          console.error('Verify error:', e);
          results.push({ name: 'Stock', sent: stockData.length, confirmed: 0 });
        }
      }
      
      // Save and verify Transactions
      if (transactions.length > 0) {
        console.log(`📤 Syncing ${transactions.length} transactions...`);
        await saveToSheets('Transactions', transactions);
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const verifyResult = await loadFromSheets('Transactions');
          const count = verifyResult.status === 'success' ? verifyResult.data.length : 0;
          results.push({ name: 'Transactions', sent: transactions.length, confirmed: count });
        } catch (e) {
          console.error('Verify error:', e);
          results.push({ name: 'Transactions', sent: transactions.length, confirmed: 0 });
        }
      }
      
      // Save and verify Stocktakes
      if (stocktakes.length > 0) {
        console.log(`📤 Syncing ${stocktakes.length} stocktakes...`);
        await saveToSheets('Stocktakes', stocktakes);
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const verifyResult = await loadFromSheets('Stocktakes');
          const count = verifyResult.status === 'success' ? verifyResult.data.length : 0;
          results.push({ name: 'Stocktakes', sent: stocktakes.length, confirmed: count });
        } catch (e) {
          console.error('Verify error:', e);
          results.push({ name: 'Stocktakes', sent: stocktakes.length, confirmed: 0 });
        }
      }
      
      // Build result message
      let message = '✅ Sync Complete!\n\n';
      let allConfirmed = true;
      
      results.forEach(r => {
        const confirmed = r.confirmed === r.sent;
        allConfirmed = allConfirmed && confirmed;
        message += `${confirmed ? '✅' : '⚠️'} ${r.name}: ${r.confirmed}/${r.sent}\n`;
      });
      
      if (allConfirmed && results.length > 0) {
        message += '\n🎉 All data verified in Google Sheets!\n\nSafe to use on other devices.';
      } else if (results.length === 0) {
        message = '⚠️ No data to sync.';
      } else {
        message += '\n⚠️ Some data may not have synced correctly.\n\nTry "Sync Now" again or check Google Sheets manually.';
      }
      
      alert(message);
      
    } catch (error) {
      console.error('Sync error:', error);
      alert('⚠️ Sync failed.\n\nData is safe in browser localStorage.\n\nCheck internet connection and try again.');
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'stock', name: 'Stock Management', icon: Package },
    { id: 'shop', name: 'Shop', icon: ShoppingCart },
    { id: 'workers', name: 'Workers', icon: Users },
    { id: 'stocktake', name: 'Stocktake', icon: ClipboardCheck },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard stockData={stockData} transactions={transactions} onForceSync={forceSync} />;
      case 'stock':
        return <StockManagement stockData={stockData} setStockData={setStockData} />;
      case 'shop':
        return <ShopFunction stockData={stockData} workers={workers} setTransactions={setTransactions} />;
      case 'workers':
        return <Workers workers={workers} setWorkers={setWorkers} />;
      case 'stocktake':
        return <Stocktake stockData={stockData} stocktakes={stocktakes} setStocktakes={setStocktakes} />;
      case 'reports':
        return <Reports transactions={transactions} workers={workers} stocktakes={stocktakes} stockData={stockData} />;
      default:
        return <Dashboard stockData={stockData} transactions={transactions} onForceSync={forceSync} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <ShoppingCart size={32} />
          <h1>Farm Shop</h1>
        </div>
        <nav className="sidebar-nav">
          {navigation.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
        <div style={{ 
          marginTop: 'auto', 
          padding: '16px 24px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <strong>{currentUser?.name}</strong>
          </div>
          <button 
            className="nav-item" 
            onClick={handleLogout}
            style={{ padding: '12px 0', width: '100%', justifyContent: 'flex-start' }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
