// App.js
import React from 'react';
import './App.css';
import Home from './components/home'; // import  Home component

function App() {
  return (
    <div className="App">
      <Home /> {/* render  Home component instead of default React  */}
    </div>
  );
}

export default App;
