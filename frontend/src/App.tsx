import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { AppRouter } from './routes/AppRouter';

function App() {
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return <AppRouter />;
}

export default App;
