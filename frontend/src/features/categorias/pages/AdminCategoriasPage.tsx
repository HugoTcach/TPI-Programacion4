import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../../shared/api/axiosInstance';
import { queryClient } from '../../../shared/api/queryClient';
import { useForm } from '@tanstack/react-form';
import { handleApiError } from '../../../shared/api/handleApiError';

export const AdminCategoriasPage = () => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const { data: categorias, isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await axiosInstance.get('/categorias');
      return res.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) {
        await axiosInstance.put(`/categorias/${editingId}`, data);
      } else {
        await axiosInstance.post('/categorias', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setEditingId(null);
      form.reset();
      setError('');
    },
    onError: (e) => setError(handleApiError(e))
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/categorias/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
    onError: (e) => alert(handleApiError(e))
  });

  const form = useForm({
    defaultValues: { nombre: '', descripcion: '' },
    onSubmit: async ({ value }) => {
      saveMutation.mutate(value);
    }
  });

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    form.setFieldValue('nombre', cat.nombre);
    form.setFieldValue('descripcion', cat.descripcion || '');
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.reset();
    setError('');
  };

  if (isLoading) return <div>Cargando categorías...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestión de Categorías</h1>
      
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-lg font-bold mb-4">{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} className="flex gap-4 items-end">
          <form.Field name="nombre" children={(field) => (
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="w-full border p-2 rounded" required minLength={2} maxLength={100} />
            </div>
          )} />
          <form.Field name="descripcion" children={(field) => (
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="w-full border p-2 rounded" />
            </div>
          )} />
          <div className="flex gap-2">
            <button type="submit" disabled={saveMutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar</button>
            {editingId && <button type="button" onClick={cancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b">ID</th>
              <th className="p-3 border-b">Nombre</th>
              <th className="p-3 border-b">Descripción</th>
              <th className="p-3 border-b text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias?.map((cat: any) => (
              <tr key={cat.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{cat.id}</td>
                <td className="p-3">{cat.nombre}</td>
                <td className="p-3">{cat.descripcion}</td>
                <td className="p-3 text-right">
                  <button onClick={() => startEdit(cat)} className="text-blue-600 hover:underline mr-4">Editar</button>
                  <button onClick={() => { if(confirm('¿Seguro?')) deleteMutation.mutate(cat.id) }} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
