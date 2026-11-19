import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../shared/api/axiosInstance';
import { Link } from 'react-router-dom';

export const AdminResumenPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['resumen'],
    queryFn: async () => {
      const res = await axiosInstance.get('/pedidos/resumen');
      return res.data;
    }
  });

  if (isLoading) return <div>Cargando resumen...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Panel de Administración - Resumen</h1>
      
      <div className="flex gap-4 mb-8">
        <Link to="/admin/categorias" className="text-blue-600 hover:underline font-medium">Categorías</Link>
        <Link to="/admin/productos" className="text-blue-600 hover:underline font-medium">Productos</Link>
        <Link to="/admin/pedidos" className="text-blue-600 hover:underline font-medium">Pedidos</Link>
        <Link to="/admin/usuarios" className="text-blue-600 hover:underline font-medium">Usuarios</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow border-t-4 border-yellow-400">
          <h3 className="text-gray-500 font-medium">Pedidos Pendientes</h3>
          <p className="text-3xl font-bold">{data?.pendientes}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-t-4 border-blue-400">
          <h3 className="text-gray-500 font-medium">En Preparación</h3>
          <p className="text-3xl font-bold">{data?.en_preparacion}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-t-4 border-green-400">
          <h3 className="text-gray-500 font-medium">Entregados</h3>
          <p className="text-3xl font-bold">{data?.entregados}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-t-4 border-red-400">
          <h3 className="text-gray-500 font-medium">Cancelados</h3>
          <p className="text-3xl font-bold">{data?.cancelados}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-t-4 border-indigo-400">
          <h3 className="text-gray-500 font-medium">Pedidos de Hoy</h3>
          <p className="text-3xl font-bold">{data?.pedidos_hoy}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-t-4 border-emerald-400">
          <h3 className="text-gray-500 font-medium">Ingresos Totales (Entregados)</h3>
          <p className="text-3xl font-bold">${data?.ingresos_entregados}</p>
        </div>
      </div>
    </div>
  );
};
