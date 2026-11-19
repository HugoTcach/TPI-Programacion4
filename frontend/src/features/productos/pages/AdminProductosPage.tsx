import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../../shared/api/axiosInstance';
import { queryClient } from '../../../shared/api/queryClient';
import { useForm } from '@tanstack/react-form';
import { handleApiError } from '../../../shared/api/handleApiError';

export const AdminProductosPage = () => {
  const [page, setPage] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stockEditingId, setStockEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const limit = 100;

  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: async () => (await axiosInstance.get('/categorias')).data });
  const { data: productos, isLoading } = useQuery({ queryKey: ['productos-admin', page], queryFn: async () => (await axiosInstance.get('/productos', { params: { skip: page * limit, limit } })).data });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data, categoria_id: parseInt(data.categoria_id) };
      if (editingId) await axiosInstance.put(`/productos/${editingId}`, payload);
      else await axiosInstance.post('/productos', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos-admin'] });
      setEditingId(null);
      form.reset();
      setError('');
    },
    onError: (e) => setError(handleApiError(e))
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => await axiosInstance.delete(`/productos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos-admin'] }),
    onError: (e) => alert(handleApiError(e))
  });

  const form = useForm({
    defaultValues: { nombre: '', descripcion: '', precio_base: 0, imagen_url: '', stock: 0, disponible: true, categoria_id: '' },
    onSubmit: async ({ value }) => saveMutation.mutate(value)
  });

  const stockForm = useForm({
    defaultValues: { stock: 0, disponible: true },
    onSubmit: async ({ value }) => {
      if (stockEditingId) {
        await axiosInstance.patch(`/productos/${stockEditingId}/stock`, value);
        queryClient.invalidateQueries({ queryKey: ['productos-admin'] });
        setStockEditingId(null);
      }
    }
  });

  const startEdit = (prod: any) => {
    setEditingId(prod.id);
    form.setFieldValue('nombre', prod.nombre);
    form.setFieldValue('descripcion', prod.descripcion || '');
    form.setFieldValue('precio_base', prod.precio_base);
    form.setFieldValue('imagen_url', prod.imagen_url || '');
    form.setFieldValue('stock', prod.stock);
    form.setFieldValue('disponible', prod.disponible);
    form.setFieldValue('categoria_id', prod.categoria_id.toString());
    setError('');
  };

  if (isLoading) return <div>Cargando productos...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestión de Productos</h1>
      
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-lg font-bold mb-4">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} className="grid grid-cols-2 gap-4">
          <form.Field name="nombre" children={(field) => (
            <div><label className="block text-sm font-medium mb-1">Nombre</label><input value={field.state.value} onChange={e => field.handleChange(e.target.value)} className="w-full border p-2 rounded" required /></div>
          )} />
          <form.Field name="categoria_id" children={(field) => (
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select value={field.state.value} onChange={e => field.handleChange(e.target.value)} className="w-full border p-2 rounded" required>
                <option value="">Seleccione...</option>
                {categorias?.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          )} />
          <form.Field name="descripcion" children={(field) => (
            <div><label className="block text-sm font-medium mb-1">Descripción</label><input value={field.state.value} onChange={e => field.handleChange(e.target.value)} className="w-full border p-2 rounded" /></div>
          )} />
          <form.Field name="imagen_url" children={(field) => (
            <div><label className="block text-sm font-medium mb-1">URL Imagen</label><input value={field.state.value} onChange={e => field.handleChange(e.target.value)} className="w-full border p-2 rounded" /></div>
          )} />
          <form.Field name="precio_base" children={(field) => (
            <div><label className="block text-sm font-medium mb-1">Precio</label><input type="number" min="0" step="0.01" value={field.state.value} onChange={e => field.handleChange(parseFloat(e.target.value))} className="w-full border p-2 rounded" required /></div>
          )} />
          <div className="flex gap-4">
            <form.Field name="stock" children={(field) => (
              <div className="flex-1"><label className="block text-sm font-medium mb-1">Stock inicial</label><input type="number" min="0" value={field.state.value} onChange={e => field.handleChange(parseInt(e.target.value))} className="w-full border p-2 rounded" required /></div>
            )} />
            <form.Field name="disponible" children={(field) => (
              <div className="flex items-end mb-2"><label className="flex items-center gap-2"><input type="checkbox" checked={field.state.value} onChange={e => field.handleChange(e.target.checked)} /> Disponible</label></div>
            )} />
          </div>
          <div className="col-span-2 flex gap-2 justify-end">
            <button type="submit" disabled={saveMutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
            {editingId && <button type="button" onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b">ID</th>
              <th className="p-3 border-b">Nombre</th>
              <th className="p-3 border-b">Cat.</th>
              <th className="p-3 border-b">Precio</th>
              <th className="p-3 border-b">Stock</th>
              <th className="p-3 border-b">Disp.</th>
              <th className="p-3 border-b text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos?.items.map((prod: any) => (
              <tr key={prod.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{prod.id}</td>
                <td className="p-3 font-medium">{prod.nombre}</td>
                <td className="p-3">{prod.categoria?.nombre}</td>
                <td className="p-3">${prod.precio_base}</td>
                <td className="p-3">
                  {stockEditingId === prod.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); stockForm.handleSubmit(); }} className="flex gap-2">
                      <stockForm.Field name="stock" children={field => <input type="number" min="0" className="border w-16 px-1" value={field.state.value} onChange={e => field.handleChange(parseInt(e.target.value))} />} />
                      <stockForm.Field name="disponible" children={field => <input type="checkbox" checked={field.state.value} onChange={e => field.handleChange(e.target.checked)} />} />
                      <button type="submit" className="text-green-600 text-sm font-bold">✓</button>
                      <button type="button" onClick={() => setStockEditingId(null)} className="text-red-600 text-sm font-bold">✕</button>
                    </form>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <span className={prod.stock === 0 ? 'text-red-500 font-bold' : ''}>{prod.stock}</span>
                      <button onClick={() => { setStockEditingId(prod.id); stockForm.setFieldValue('stock', prod.stock); stockForm.setFieldValue('disponible', prod.disponible); }} className="text-gray-400 hover:text-blue-600">✎</button>
                    </div>
                  )}
                </td>
                <td className="p-3">{prod.disponible ? 'Sí' : 'No'}</td>
                <td className="p-3 text-right">
                  <button onClick={() => startEdit(prod)} className="text-blue-600 hover:underline mr-4">Editar</button>
                  <button onClick={() => { if(confirm('¿Seguro?')) deleteMutation.mutate(prod.id) }} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center bg-white p-4 rounded shadow mt-4">
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded">Anterior</button>
        <span>Página {page + 1}</span>
        <button disabled={(page + 1) * limit >= (productos?.total || 0)} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded">Siguiente</button>
      </div>
    </div>
  );
};
