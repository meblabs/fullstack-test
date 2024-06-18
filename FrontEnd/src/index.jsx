import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import Routes from './routes/index';
import { AppProvider } from './helpers/AppContext';
import { AuthContextProvider } from './helpers/core/AuthContext';
import { MessageProvider } from './helpers/core/MessageContext';
import ThemeProvider from './helpers/core/ThemeProvider';
import { ApiInterceptor } from './helpers/core/Api';

import FullpageLoading from './components/core/extra/FullpageLoading';

import './helpers/core/i18n';
import './styles/style.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Suspense fallback={<FullpageLoading />}>
    <AppProvider>
      <ThemeProvider>
        <MessageProvider>
          <ApiInterceptor>
            <AuthContextProvider>
              <Routes />
            </AuthContextProvider>
          </ApiInterceptor>
        </MessageProvider>
      </ThemeProvider>
    </AppProvider>
  </Suspense>
);
