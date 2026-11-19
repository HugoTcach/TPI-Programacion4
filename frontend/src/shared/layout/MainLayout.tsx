import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

export const Navbar = () => {
  const { usuario, logout } = useAuthStore();
  const { items } = useCartStore();
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">Food Store</Link>
      <div className="flex gap-4 items-center">
        <Link to="/carrito" className="relative font-medium text-gray-700 hover:text-blue-600">
          Carrito
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
        {usuario ? (
          <>
            <Link to="/mis-pedidos" className="font-medium text-gray-700 hover:text-blue-600">Mis Pedidos</Link>
            {usuario.role === 'admin' && (
              <Link to="/admin/resumen" className="font-medium text-gray-700 hover:text-blue-600">Panel Admin</Link>
            )}
            <div className="text-sm">
              <span className="text-gray-500">Hola, {usuario.full_name} ({usuario.role})</span>
              <button onClick={logout} className="ml-4 text-red-600 hover:underline">Cerrar sesión</button>
            </div>
          </>
        ) : (
          <Link to="/login" className="font-medium text-gray-700 hover:text-blue-600">Ingresar</Link>
        )}
      </div>
    </nav>
  );
};

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
