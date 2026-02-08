import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { navigationStore, dataStore } from '@/store';
import { MainLayout, LoginModal, ConfirmModal, Toast } from '@/components';
import { HomePage, CatalogPage, OrdersPage, AdminPage } from '@/pages';

const PageRouter = observer(() => {
  const { currentPage } = navigationStore;
  switch (currentPage) {
    case 'home': return <HomePage />;
    case 'catalog': return <CatalogPage />;
    case 'orders': return <OrdersPage />;
    case 'admin': case 'admin-products': case 'admin-categories': case 'admin-orders': return <AdminPage />;
    default: return <HomePage />;
  }
});

const App = observer(() => { useEffect(() => { dataStore.loadAllData(); }, []); return (<><MainLayout><PageRouter /></MainLayout><LoginModal /><ConfirmModal /><Toast /></>); });
export default App;
