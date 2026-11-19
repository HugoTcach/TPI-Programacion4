import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../../shared/api/axiosInstance';
import { queryClient } from '../../../shared/api/queryClient';
import { handleApiError } from '../../../shared/api/handleApiError';

export const AdminPedidosPage = () => {
  const [page, setPage] = useState(0);
  const [estadoFilter, setEstadoFilter] = useState('');
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['pedidos-admin', page, estadoFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('skip', (page * limit).toString());
      params.append('limit', limit.toString());
      if (estadoFilter) params.append('estado', estadoFilter);
      return (await axiosInstance.get('/pedidos', { params })).data;
    }
  });

  const changeEstado = useMutation({
    mutationFn: async ({ id, estado }: { id: number, estado: string }) => {
      await axiosInstance.patch(`/pedidos/${id}/estado`, { estado });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pedidos-admin'] }),
    onError: (e) => alert(handleApiError(e))
  });

  if (isLoading) return <div>Cargando pedidos...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestión de Pedidos</h1>
      
      <div className="mb-6 flex gap-4 items-center">
        <label className="font-medium">Filtrar por estado:</label>
        <select value={estadoFilter} onChange={(e) => { setEstadoFilter(e.target.value); setPage(0); }} className="border p-2 rounded">
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="EN_PREPARACION">En Preparación</option>
          <option value="ENTREGADO">Entregados</option>
          <option value="CANCELADO">Cancelados</option>
        </select>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b">ID</th>
              <th className="p-3 border-b">Fecha</th>
              <th className="p-3 border-b">Cliente ID</th>
              <th className="p-3 border-b">Total</th>
              <th className="p-3 border-b">Forma Pago</th>
              <th className="p-3 border-b">Estado</th>
              <th className="p-3 border-b text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((ped: any) => (
              <tr key={ped.id} className="border-b hover:bg-gray-50">
                <td className="p-3">#{ped.id}</td>
                <td className="p-3">{new Date(ped.created_at).toLocaleString()}</td>
                <td className="p-3">{ped.usuario_id}</td>
                <td className="p-3">${ped.total}</td>
                <td className="p-3">{ped.forma_pago}</td>
                <td className="p-3 font-bold" style={{ color: ped.estado === 'PENDIENTE' ? '#d97706' : ped.estado === 'ENTREGADO' ? '#059669' : ped.estado === 'CANCELADO' ? '#dc2626' : '#2563eb' }}>{ped.estado}</td>
                <td className="p-3 text-right">
                  {ped.estado === 'PENDIENTE' && (
                    <>
                      <button onClick={() => { if(confirm('¿Avanzar a En Preparación?')) changeEstado.mutate({ id: ped.id, estado: 'EN_PREPARACION' }) }} className="text-blue-600 hover:underline mr-3">Preparar</button>
                      <button onClick={() => { if(confirm('¿Cancelar pedido?')) changeEstado.mutate({ id: ped.id, estado: 'CANCELADO' }) }} className="text-red-600 hover:underline">Cancelar</button>
                    </>
                  )}
                  {ped.estado === 'EN_PREPARACION' && (
                    <>
                      <button onClick={() => { if(confirm('¿Avanzar a Entregado?')) changeEstado.mutate({ id: ped.id, estado: 'ENTREGADO' }) }} className="text-green-600 hover:underline mr-3">Entregar</button>
                      <button onClick={() => { if(confirm('¿Cancelar pedido?')) changeEstado.mutate({ id: ped.id, estado: 'CANCELADO' }) }} className="text-red-600 hover:underline">Cancelar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center bg-white p-4 rounded shadow mt-4">
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded">Anterior</button>
        <span>Página {page + 1}</span>
        <button disabled={(page + 1) * limit >= (data?.total || 0)} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded">Siguiente</button>
      </div>
    </div>
  );
};
