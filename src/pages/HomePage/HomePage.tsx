import { observer } from 'mobx-react-lite';
import { dataStore, authStore, navigationStore } from '@/store';
import { Card, Button, Badge } from '@/components/UI';
import styles from './HomePage.module.scss';

const StatCard = ({ title, value, icon, color }: { title: string; value: number | string; icon: React.ReactNode; color: 'primary' | 'success' | 'warning' | 'info'; }) => (
  <Card className={`${styles.statCard} ${styles[color]}`}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statContent}><span className={styles.statValue}>{value}</span><span className={styles.statTitle}>{title}</span></div>
  </Card>
);

export const HomePage = observer(() => {
  const { activeProducts, activeCategories, pendingOrdersCount, productsLoading } = dataStore;
  const { isSeller, isAdmin } = authStore;
  const { navigate } = navigationStore;

  return (
    <div className={styles.page}>
      <section className={styles.welcome}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>Магазин рукоделия</h1>
          <p className={styles.welcomeText}>
            Товары ручной работы и материалы для творчества.
            {!isSeller && ' Войдите для управления магазином.'}
          </p>
          {!authStore.isAuthenticated && (
            <Button variant="primary" size="lg" onClick={() => authStore.openLoginModal()}>Войти</Button>
          )}
        </div>
        <div className={styles.welcomeDecor}>
          <svg viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            <path d="M70 130 Q100 70 130 130" stroke="currentColor" strokeWidth="2" opacity="0.4" fill="none" />
            <circle cx="100" cy="90" r="20" stroke="currentColor" strokeWidth="2" opacity="0.3" fill="none" />
          </svg>
        </div>
      </section>

      <section className={styles.stats}>
        <StatCard title="Товаров" value={productsLoading ? '...' : activeProducts.length} color="primary"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>} />
        <StatCard title="Категорий" value={activeCategories.length} color="info"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>} />
        {isSeller && <StatCard title="Ожидающих заказов" value={pendingOrdersCount} color="warning"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></svg>} />}
        <StatCard title="В наличии" value={activeProducts.filter(p => p.stock > 0).length} color="success"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>} />
      </section>

      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Разделы</h2>
        <div className={styles.actionCards}>
          <Card className={styles.actionCard} hoverable onClick={() => navigate('catalog')}>
            <div className={styles.actionIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            </div>
            <h3>Каталог товаров</h3>
            <p>Просмотр всех товаров</p>
            <Badge variant="primary">{activeProducts.length} товаров</Badge>
          </Card>

          {isSeller && (
            <Card className={styles.actionCard} hoverable onClick={() => navigate('orders')}>
              <div className={styles.actionIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></svg>
              </div>
              <h3>Заказы</h3>
              <p>Управление заказами</p>
              {pendingOrdersCount > 0 && <Badge variant="warning">{pendingOrdersCount} ожидают</Badge>}
            </Card>
          )}

          {isAdmin && (
            <Card className={styles.actionCard} hoverable onClick={() => navigate('admin')}>
              <div className={styles.actionIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
              </div>
              <h3>Администрирование</h3>
              <p>Управление магазином</p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
});
