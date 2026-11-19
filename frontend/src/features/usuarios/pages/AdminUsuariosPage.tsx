import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../../shared/api/axiosInstance';
import { queryClient } from '../../../shared/api/queryClient';
import { useAuthStore } from '../../../store/authStore';

export const AdminUsuariosPage = () => {
  const current_user = useAuthStore(state => state.usuario);

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => (await axiosInstance.get('/admin/usuarios')).data
  });

  const activar = useMutation({
    mutationFn: async (id: number) => await axiosInstance.post(`/admin/usuarios/${id}/activar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] })
  });

  const desactivar = useMutation({
    mutationFn: async (id: number) => await axiosInstance.post(`/admin/usuarios/${id}/desactivar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
    onError: (e: any) => alert(e.response?.data?.detail || 'Error al desactivar')
  });

  if (isLoading) return <div>Cargando usuarios...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>
      
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b">ID</th>
              <th className="p-3 border-b">Usuario</th>
              <th className="p-3 border-b">Nombre</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Rol</th>
              <th className="p-3 border-b">Estado</th>
              <th className="p-3 border-b text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios?.map((user: any) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{user.id}</td>
                <td className="p-3">{user.username}</td>
                <td className="p-3">{user.full_name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${user.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {user.disabled ? 'Inactivo' : 'Activo'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {current_user?.id !== user.id && (
                    user.disabled ? (
                      <button onClick={() => { if(confirm('¿Activar usuario?')) activar.mutate(user.id) }} className="text-green-600 hover:underline">Activar</button>
                    ) : (
                      <button onClick={() => { if(confirm('¿Desactivar usuario?')) desactivar.mutate(user.id) }} className="text-red-600 hover:underline">Desactivar</button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
