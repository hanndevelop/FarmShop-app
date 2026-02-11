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
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzhfPizVi_EiUZ1pMnDeQJmnrBVCwnNnlJlb0-WH8MwSobML0O-9vT4eCjknomztu2_mrkLFTxUC4gUu_wQpmr_Sww/exec';
  
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

  // Load data from localStorage FIRST, then try Google Sheets
  const loadAllData = async () => {
    console.log('🔄 Starting data load...');
    
    // STEP 1: Try localStorage first (most recent data)
    const localWorkers = localStorage.getItem('farmShop_Workers');
    const localStock = localStorage.getItem('farmShop_Stock');
    const localTransactions = localStorage.getItem('farmShop_Transactions');
    const localStocktakes = localStorage.getItem('farmShop_Stocktakes');

    let workersLoaded = false;
    let stockLoaded = false;

    // Load Workers
    if (localWorkers) {
      try {
        const parsed = JSON.parse(localWorkers);
        if (parsed && parsed.length > 0) {
          setWorkers(parsed);
          console.log('✅ Loaded ' + parsed.length + ' workers from localStorage');
          workersLoaded = true;
          // Sync to sheets in background
          saveToSheets('Workers', parsed);
        }
      } catch (e) {
        console.error('Error parsing local workers:', e);
      }
    }

    // Load Stock
    if (localStock) {
      try {
        const parsed = JSON.parse(localStock);
        if (parsed && parsed.length > 0) {
          setStockData(parsed);
          console.log('✅ Loaded ' + parsed.length + ' stock items from localStorage');
          stockLoaded = true;
          // Sync to sheets in background
          saveToSheets('Stock_Master', parsed);
        }
      } catch (e) {
        console.error('Error parsing local stock:', e);
      }
    }

    // Load Transactions
    if (localTransactions) {
      try {
        const parsed = JSON.parse(localTransactions);
        if (parsed && parsed.length > 0) {
          setTransactions(parsed);
          console.log('✅ Loaded ' + parsed.length + ' transactions from localStorage');
        }
      } catch (e) {
        console.error('Error parsing local transactions:', e);
      }
    }

    // Load Stocktakes
    if (localStocktakes) {
      try {
        const parsed = JSON.parse(localStocktakes);
        if (parsed && parsed.length > 0) {
          setStocktakes(parsed);
          console.log('✅ Loaded ' + parsed.length + ' stocktakes from localStorage');
        }
      } catch (e) {
        console.error('Error parsing local stocktakes:', e);
      }
    }

    // STEP 2: If no local data, try Google Sheets
    if (!workersLoaded) {
      console.log('📡 No local workers, trying Google Sheets...');
      try {
        const workersResult = await loadFromSheets('Workers');
        if (workersResult.status === 'success' && workersResult.data.length > 0) {
          setWorkers(workersResult.data);
          localStorage.setItem('farmShop_Workers', JSON.stringify(workersResult.data));
          console.log('✅ Loaded ' + workersResult.data.length + ' workers from Sheets');
          workersLoaded = true;
        }
      } catch (error) {
        console.error('❌ Error loading workers from Sheets:', error);
      }
    }

    if (!stockLoaded) {
      console.log('📡 No local stock, trying Google Sheets...');
      try {
        const stockResult = await loadFromSheets('Stock_Master');
        if (stockResult.status === 'success' && stockResult.data.length > 0) {
          setStockData(stockResult.data);
          localStorage.setItem('farmShop_Stock', JSON.stringify(stockResult.data));
          console.log('✅ Loaded ' + stockResult.data.length + ' stock items from Sheets');
          stockLoaded = true;
        }
      } catch (error) {
        console.error('❌ Error loading stock from Sheets:', error);
      }
    }

    // STEP 3: If still no data, load samples
    if (!workersLoaded) {
      console.log('📝 Loading sample workers...');
      const sampleWorkers = [
        { id: 1, name: 'Johannes Mkhize', idNumber: '7801015800082', farmId: 'W001', houseNumber: '' },
        { id: 2, name: 'Sarah Dlamini', idNumber: '8505129800083', farmId: 'W002', houseNumber: '' },
      ];
      setWorkers(sampleWorkers);
      localStorage.setItem('farmShop_Workers', JSON.stringify(sampleWorkers));
    }

    if (!stockLoaded) {
      console.log('📝 Loading sample stock...');
      const sampleStock = [
        { id: 1, name: 'Maize Meal 5kg', stockCode: 'MM5KG', category: 'Groceries', costPrice: 45, sellPrice: 56.70, quantity: 20, minQuantity: 5 },
        { id: 2, name: 'Sugar 2.5kg', stockCode: 'SG25', category: 'Groceries', costPrice: 28, sellPrice: 35.28, quantity: 15, minQuantity: 5 },
      ];
      setStockData(sampleStock);
      localStorage.setItem('farmShop_Stock', JSON.stringify(sampleStock));
    }

    setDataLoaded(true);
    console.log('✅ Data load complete!');
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

  // Save data to Google Sheets (background, doesn't block UI)
  const saveToSheets = async (sheetName, data) => {
    if (!data || data.length === 0) return;
    
    try {
      console.log(`💾 Saving ${data.length} items to ${sheetName}...`);
      
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'write',
          sheet: sheetName,
          rows: data
        })
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        console.log(`✅ Saved to ${sheetName}`);
      } else {
        console.error(`❌ Error saving to ${sheetName}:`, result.message);
      }
    } catch (error) {
      console.error(`❌ Error saving to ${sheetName}:`, error);
      // Don't throw - just log. Data is already in localStorage
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
        return <Dashboard stockData={stockData} transactions={transactions} />;
      case 'stock':
        return <StockManagement stockData={stockData} setStockData={setStockData} />;
      case 'shop':
        return <ShopFunction stockData={stockData} workers={workers} setTransactions={setTransactions} />;
      case 'workers':
        return <Workers workers={workers} setWorkers={setWorkers} />;
      case 'stocktake':
        return <Stocktake stockData={stockData} stocktakes={stocktakes} setStocktakes={setStocktakes} />;
      case 'reports':
        return <Reports transactions={transactions} workers={workers} stocktakes={stocktakes} />;
      default:
        return <Dashboard stockData={stockData} transactions={transactions} />;
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
