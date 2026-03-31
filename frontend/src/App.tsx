import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import theme from './theme/theme';
import { store } from './store/store';
import { LanguageProvider } from './i18n';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import WorkOrdersPage from './pages/work-orders/WorkOrdersPage';
import WorkOrderDetailPage from './pages/work-orders/WorkOrderDetailPage';
import StockCardsPage from './pages/stock-cards/StockCardsPage';
import MaintenanceCardsPage from './pages/maintenance-cards/MaintenanceCardsPage';
import ServiceAgreementsPage from './pages/service-agreements/ServiceAgreementsPage';
import AssetsPage from './pages/assets/AssetsPage';
import LocationsPage from './pages/locations/LocationsPage';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/work-orders" element={<WorkOrdersPage />} />
              <Route path="/work-orders/:id" element={<WorkOrderDetailPage />} />
              <Route path="/stock-cards" element={<StockCardsPage />} />
              <Route path="/maintenance-cards" element={<MaintenanceCardsPage />} />
              <Route path="/service-agreements" element={<ServiceAgreementsPage />} />
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="/locations" element={<LocationsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
