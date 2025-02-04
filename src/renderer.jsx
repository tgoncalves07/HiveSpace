import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '/App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('👋 This message is being logged by "renderer.jsx", included via Vite');
