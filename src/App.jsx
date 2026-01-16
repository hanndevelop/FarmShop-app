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

  // Google Apps Script configuration - UPDATE THIS URL!
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2-cKcB7WZEgxgbOH4HY7mE4Aw0bDrHFQ0zl-K3HyXoPJP3d95_eKWR5wDQDm7oNft/exec';
  
  // Check for saved login session
  useEffect(() => {
    const savedUser = localStorage.getItem('farmShopUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // Load data from Google Sheets on login
  useEffect(() => {
    if (isLoggedIn) {
      loadAllData();
    }
  }, [isLoggedIn]);

  // Auto-save workers to Google Sheets when they change
  useEffect(() => {
    if (isLoggedIn && workers.length > 0) {
      saveToSheets('Workers', workers);
    }
  }, [workers, isLoggedIn]);

  // Auto-save stock data
  useEffect(() => {
    if (isLoggedIn && stockData.length > 0) {
      saveToSheets('Stock_Master', stockData);
    }
  }, [stockData, isLoggedIn]);

  // Auto-save transactions
  useEffect(() => {
    if (isLoggedIn && transactions.length > 0) {
      saveToSheets('Transactions', transactions);
    }
  }, [transactions, isLoggedIn]);

  // Auto-save stocktakes
  useEffect(() => {
    if (isLoggedIn && stocktakes.length > 0) {
      saveToSheets('Stocktakes', stocktakes);
    }
  }, [stocktakes, isLoggedIn]);

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

  // Load data from Google Sheets using JSONP (avoids CORS)
  const loadFromSheets = (sheetName) => {
    return new Promise((resolve, reject) => {
      const callbackName = 'jsonpCallback' + Date.now();
      
      // Create callback function
      window[callbackName] = (data) => {
        delete window[callbackName];
        document.body.removeChild(script);
        resolve(data);
      };
      
      // Create script tag
      const script = document.createElement('script');
      script.src = `${APPS_SCRIPT_URL}?action=read&sheet=${sheetName}&callback=${callbackName}`;
      script.onerror = () => {
        delete window[callbackName];
        document.body.removeChild(script);
        reject(new Error('Failed to load from ' + sheetName));
      };
      
      document.body.appendChild(script);
    });
  };

  // Load all data from Google Sheets
  const loadAllData = async () => {
    try {
      console.log('Loading data from Google Sheets using JSONP...');
      
      // Load workers
      try {
        const workersResult = await loadFromSheets('Workers');
        if (workersResult.status === 'success' && workersResult.data.length > 0) {
          setWorkers(workersResult.data);
          console.log('✅ Loaded workers:', workersResult.data.length);
        } else {
          loadSampleWorkers();
        }
      } catch (error) {
        console.error('Error loading workers:', error);
        loadSampleWorkers();
      }

      // Load stock
      try {
        const stockResult = await loadFromSheets('Stock_Master');
        if (stockResult.status === 'success' && stockResult.data.length > 0) {
          setStockData(stockResult.data);
          console.log('✅ Loaded stock items:', stockResult.data.length);
        } else {
          loadSampleStock();
        }
      } catch (error) {
        console.error('Error loading stock:', error);
        loadSampleStock();
      }

      // Load transactions
      try {
        const transactionsResult = await loadFromSheets('Transactions');
        if (transactionsResult.status === 'success') {
          setTransactions(transactionsResult.data);
          console.log('✅ Loaded transactions:', transactionsResult.data.length);
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
      }

      // Load stocktakes
      try {
        const stocktakesResult = await loadFromSheets('Stocktakes');
        if (stocktakesResult.status === 'success') {
          setStocktakes(stocktakesResult.data);
          console.log('✅ Loaded stocktakes:', stocktakesResult.data.length);
        }
      } catch (error) {
        console.error('Error loading stocktakes:', error);
      }

    } catch (error) {
      console.error('Error loading data from sheets:', error);
      loadSampleData();
    }
  };

  // Save data to Google Sheets using POST (works for writing)
  const saveToSheets = async (sheetName, data) => {
    try {
      console.log(`💾 Saving to ${sheetName}:`, data.length, 'items');
      
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
        console.log(`✅ Successfully saved to ${sheetName}`);
      } else {
        console.error(`❌ Error saving to ${sheetName}:`, result.message);
      }
      
      return result;
    } catch (error) {
      console.error(`Error saving to ${sheetName}:`, error);
      // Save to localStorage as backup
      localStorage.setItem(`farmShop_${sheetName}`, JSON.stringify(data));
      console.log(`💾 Saved to localStorage as backup`);
    }
  };

  // Load sample workers
  const loadSampleWorkers = () => {
    console.log('Loading sample workers...');
    setWorkers([
      { id: 1, name: 'Johannes Mkhize', idNumber: '7801015800082', farmId: 'W001' },
      { id: 2, name: 'Sarah Dlamini', idNumber: '8505129800083', farmId: 'W002' },
    ]);
  };

  // Load sample stock
  const loadSampleStock = () => {
    console.log('Loading sample stock...');
    setStockData([
      { id: 1, name: 'Maize Meal 5kg', category: 'Groceries', costPrice: 45, sellPrice: 65, quantity: 20, minQuantity: 5 },
      { id: 2, name: 'Sugar 2.5kg', category: 'Groceries', costPrice: 28, sellPrice: 40, quantity: 15, minQuantity: 5 },
    ]);
  };

  // Load sample data (fallback)
  const loadSampleData = () => {
    console.log('Loading all sample data...');
    loadSampleWorkers();
    loadSampleStock();
    setTransactions([]);
    setStocktakes([]);
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

  // Show login screen if not logged in
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
