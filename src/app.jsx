import React, { useState } from 'react';
import Projetos from './projetos';
import Ideias from './ideias';
import Equipas from './equipas';
import Chat from './chat';
import Config from './config';
import Account from './account';


function App() {
  const [currentView, setCurrentView] = useState('home'); // Estado inicial: página principal

  return (
    <div>
      <header>
        <h1>Planora</h1>
      </header>
      <nav>
        <ul>
          <li onClick={() => setCurrentView('projetos')}>Projetos</li>
          <li onClick={() => setCurrentView('ideias')}>Ideias</li>
          <li onClick={() => setCurrentView('equipas')}>Equipas</li>
          <li onClick={() => setCurrentView('chat')}>Chat</li>
          <li onClick={() => setCurrentView('config')}>Config</li>
        </ul>
      </nav>
      <main>
        {currentView === 'projetos' && <Projetos />}
        {currentView === 'ideias' && <Ideias />}
        {currentView === 'equipas' && <Equipas />}
        {currentView === 'chat' && <Chat />}
        {currentView === 'config' && <Config />}
        {currentView === 'home' && <p>Bem-vindo à Planora!</p>} {/* Conteúdo da página inicial */}
      </main>
      <footer>
        <button onClick={() => setCurrentView('account')}>Conta</button>
      </footer>
    </div>
  );
}

export default App;
