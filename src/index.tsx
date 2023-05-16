import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App.tsx';
import { MetaMaskProvider } from 'metamask-react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Wnft } from './pages/Wnft';
import { Hnft } from './pages/Hnft';
import { MyHNFT } from './pages/MyHNFT';

ReactDOM.render(
  <React.StrictMode>
    <MetaMaskProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App />}>
            <Route path='' element={<MyHNFT />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MetaMaskProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
