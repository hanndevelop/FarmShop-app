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

  // Google Apps Script configuration
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzhfPizVi_EiUZ1pMnDeQJmnrBVCwnNnlJlb0-WH8MwSobML0O-9vT4eCjknomztu2_mrkLFTxUC4gUu_wQpmr_Sww/exec';
  
  // NOTE: You don't need Google Cloud Console or API Keys anymore!
  // Just deploy the Apps Script and paste the URL above

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

  // Load all data from Google Sheets
  const loadAllData = async () => {
    try {
      console.log('Loading data from Google Sheets...');
      
      // Load workers
      const workersData = await loadFromSheets('Workers');
      if (workersData && workersData.length > 0) {
        setWorkers(workersData);
        console.log('Loaded workers:', workersData.length);
      } else {
        // Load sample data if sheet is empty
        setWorkers([
          { id: 1, name: 'Johannes Mkhize', idNumber: '7801015800082', farmId: 'W001' },
          { id: 2, name: 'Sarah Dlamini', idNumber: '8505129800083', farmId: 'W002' },
        ]);
      }

      // Load stock
      const stockDataFromSheets = await loadFromSheets('Stock_Master');
      if (stockDataFromSheets && stockDataFromSheets.length > 0) {
        setStockData(stockDataFromSheets);
        console.log('Loaded stock items:', stockDataFromSheets.length);
      } else {
        // Load sample data if sheet is empty
        setStockData([
          { id: 1, name: 'Maize Meal 5kg', category: 'Groceries', costPrice: 45, sellPrice: 65, quantity: 20, minQuantity: 5 },
          { id: 2, name: 'Sugar 2.5kg', category: 'Groceries', costPrice: 28, sellPrice: 40, quantity: 15, minQuantity: 5 },
        ]);
      }

      // Load transactions
      const transactionsData = await loadFromSheets('Transactions');
      if (transactionsData && transactionsData.length > 0) {
        setTransactions(transactionsData);
        console.log('Loaded transactions:', transactionsData.length);
      }

      // Load stocktakes
      const stocktakesData = await loadFromSheets('Stocktakes');
      if (stocktakesData && stocktakesData.length > 0) {
        setStocktakes(stocktakesData);
        console.log('Loaded stocktakes:', stocktakesData.length);
      }

    } catch (error) {
      console.error('Error loading data from sheets:', error);
      // Load sample data if there's an error
      loadSampleData();
    }
  };

  // Load data from a specific sheet
  const loadFromSheets = async (sheetName) => {
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?action=read&sheet=${sheetName}`);
      const result = await response.json();
      
      if (result.status === 'success') {
        console.log(`Successfully loaded from ${sheetName}:`, result.data);
        return result.data;
      } else {
        console.error(`Error loading from ${sheetName}:`, result.message);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching ${sheetName}:`, error);
      return [];
    }
  };

  // Save data to Google Sheets
  const saveToSheets = async (sheetName, data) => {
    try {
      console.log(`Saving to ${sheetName}:`, data.length, 'items');
      
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    }
  };

  // Load sample data (fallback)
  const loadSampleData = () => {
    console.log('Loading sample data...');
    
    setStockData([
      { id: 1, name: 'Maize Meal 5kg', category: 'Groceries', costPrice: 45, sellPrice: 65, quantity: 20, minQuantity: 5 },
      { id: 2, name: 'Sugar 2.5kg', category: 'Groceries', costPrice: 28, sellPrice: 40, quantity: 15, minQuantity: 5 },
      { id: 3, name: 'Cooking Oil 750ml', category: 'Groceries', costPrice: 22, sellPrice: 35, quantity: 12, minQuantity: 5 },
      { id: 4, name: 'Toilet Paper 9s', category: 'Household', costPrice: 18, sellPrice: 28, quantity: 8, minQuantity: 5 },
      { id: 5, name: 'Bar Soap', category: 'Toiletries', costPrice: 8, sellPrice: 12, quantity: 25, minQuantity: 10 },
    ]);

    setWorkers([
      { id: 1, name: 'Johannes Mkhize', idNumber: '7801015800082', farmId: 'W001' },
      { id: 2, name: 'Sarah Dlamini', idNumber: '8505129800083', farmId: 'W002' },
    ]);

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
