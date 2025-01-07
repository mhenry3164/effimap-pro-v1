import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';
import 'antd/dist/reset.css'; // Add Ant Design CSS

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);