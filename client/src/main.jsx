import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'react-hot-toast'
import store, {persistor} from './store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { LoadingOverlay } from './components/ui/LoadingOverlay';
import { TooltipProvider } from './components/ui/tooltip';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<LoadingOverlay />} persistor={persistor}>
      <TooltipProvider delayDuration={400}>
        <App />
        </TooltipProvider>
        <Toaster />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);