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
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz50dn1gpHj4W6qbou2HUm-f6bzdrWCELdBUDVBoMPH2HP_6r7MtLJBMq_Sln7w7t1g/exec'; // Replace with your deployed Web App URL
  
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

  // Load data from Google Sheets
  useEffect(() => {
    if (isLoggedIn) {
      loadAllData();
    }
  }, [isLoggedIn]);

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

  const loadAllData = async () => {
    // This will load data from Google Sheets
    // For now, using dummy data until sheets are set up
    setStockData([
      { id: 1, name: 'Maize Meal 12.5kg', stockCode: 'MM125', category: 'Groceries', costPrice: 75.00, sellPrice: 89.99, quantity: 50, minQuantity: 10 },
      { id: 2, name: 'Sugar 2.5kg', stockCode: 'SUG25', category: 'Groceries', costPrice: 38.00, sellPrice: 45.50, quantity: 30, minQuantity: 15 },
      { id: 3, name: 'Soap Bar', stockCode: 'SOAP1', category: 'Toiletries', costPrice: 9.50, sellPrice: 12.99, quantity: 5, minQuantity: 20 },
    ]);

    setWorkers([
      { id: 1, name: 'Johannes Mkhize', idNumber: '7801015800082', contact: '0721234567' },
      { id: 2, name: 'Sarah Dlamini', idNumber: '8505129800083', contact: '0739876543' },
    ]);
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
