import { useCartStore } from '../../../store/cartStore';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';

export const CarritoPage = () => {
  const { items, quitar, cambiarCantidad, vaciar, total } = useCartStore();
  const { usuario } = useAuthStore();

  if (items.length === 0) {
    return <div className="text-center py-12">El carrito está vacío. <Link to="/" className="text-blue-600 hover:underline">Volver al catálogo</Link></div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Tu Carrito</h1>
      <table className="w-full text-left border-collapse mb-6">
        <thead>
          <tr className="border-b">
            <th className="p-2">Producto</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Subtotal</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.producto_id} className="border-b">
              <td className="p-2">{item.nombre}</td>
              <td className="p-2">${item.precio_unitario}</td>
              <td className="p-2">
                <input 
                  type="number" 
                  min="1" 
                  value={item.cantidad} 
                  onChange={(e) => cambiarCantidad(item.producto_id, parseInt(e.target.value) || 1)}
                  className="border w-16 p-1 rounded"
                />
              </td>
              <td className="p-2">${item.precio_unitario * item.cantidad}</td>
              <td className="p-2 text-right">
                <button onClick={() => quitar(item.producto_id)} className="text-red-600 hover:underline">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mb-6">
        <button onClick={vaciar} className="text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-50">Vaciar Carrito</button>
        <div className="text-xl font-bold">Total: ${total()}</div>
      </div>
      <div className="text-right">
        {usuario ? (
          <Link to="/checkout" className="bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700">Ir al Checkout</Link>
        ) : (
          <div className="text-red-600">Debes <Link to="/login" className="underline font-bold">iniciar sesión</Link> para continuar.</div>
        )}
      </div>
    </div>
  );
};
