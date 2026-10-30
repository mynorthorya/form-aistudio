import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { BrandingProvider } from './contexts/BrandingContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BrandingProvider>
    <App />
  </BrandingProvider>
);

