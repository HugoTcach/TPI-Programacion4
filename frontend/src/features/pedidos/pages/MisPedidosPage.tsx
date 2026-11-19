import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../../shared/api/axiosInstance';
import { queryClient } from '../../../shared/api/queryClient';
import { useState } from 'react';

export const MisPedidosPage = () => {
  const [page, setPage] = useState(0);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['mis-pedidos', page],
    queryFn: async () => {
      const res = await axiosInstance.get('/pedidos', { params: { skip: page * limit, limit } });
      return res.data;
    }
  });

  const cancelar = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.patch(`/pedidos/${id}/cancelar`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] });
    }
  });

  if (isLoading) return <div>Cargando pedidos...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis Pedidos</h1>
      {data?.items.length === 0 ? (
        <p>No tienes pedidos.</p>
      ) : (
        <div className="space-y-4">
          {data?.items.map((pedido: any) => (
            <div key={pedido.id} className="bg-white p-4 rounded shadow border-l-4" style={{ borderColor: pedido.estado === 'PENDIENTE' ? '#fbbf24' : pedido.estado === 'ENTREGADO' ? '#34d399' : pedido.estado === 'CANCELADO' ? '#f87171' : '#60a5fa' }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">Pedido #{pedido.id} - ${pedido.total}</h3>
                  <p className="text-sm text-gray-500">{new Date(pedido.created_at).toLocaleString()}</p>
                  <p className="mt-2"><span className="font-medium">Estado:</span> {pedido.estado}</p>
                  <p><span className="font-medium">Forma de pago:</span> {pedido.forma_pago}</p>
                  <p><span className="font-medium">Entrega:</span> {pedido.direccion_entrega}</p>
                </div>
                {pedido.estado === 'PENDIENTE' && (
                  <button 
                    onClick={() => { if(confirm('¿Seguro que deseas cancelar?')) cancelar.mutate(pedido.id) }}
                    disabled={cancelar.isPending}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Detalle:</h4>
                <ul className="text-sm space-y-1">
                  {pedido.items.map((item: any) => (
                    <li key={item.producto_id}>• {item.cantidad}x {item.nombre_producto} (${item.precio_unitario}) = ${item.subtotal}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center bg-white p-4 rounded shadow mt-6">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded disabled:opacity-50">Anterior</button>
            <span>Página {page + 1} de {Math.ceil((data?.total || 0) / limit)}</span>
            <button disabled={(page + 1) * limit >= (data?.total || 0)} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded disabled:opacity-50">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
};
