import { useForm } from '@tanstack/react-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../../shared/api/axiosInstance';
import { useCartStore } from '../../../store/cartStore';
import { handleApiError } from '../../../shared/api/handleApiError';
import { useState } from 'react';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, vaciar, total } = useCartStore();
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        items: items.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        ...data
      };
      await axiosInstance.post('/pedidos', payload);
    },
    onSuccess: () => {
      vaciar();
      navigate('/mis-pedidos');
    },
    onError: (e) => setError(handleApiError(e))
  });

  const form = useForm({
    defaultValues: { forma_pago: 'EFECTIVO', direccion_entrega: '', notas: '' },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    }
  });

  if (items.length === 0) return <div>No hay ítems en el carrito.</div>;

  return (
    <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Confirmar Pedido</h1>
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h2 className="font-bold mb-2">Resumen:</h2>
        <ul>
          {items.map(i => (
            <li key={i.producto_id}>{i.cantidad}x {i.nombre} - ${i.precio_unitario * i.cantidad}</li>
          ))}
        </ul>
        <div className="font-bold mt-2 text-right">Total a pagar: ${total()}</div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} className="space-y-4">
        <form.Field
          name="direccion_entrega"
          children={(field) => (
            <div>
              <label className="block font-medium mb-1">Dirección de Entrega</label>
              <input 
                value={field.state.value} 
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full border p-2 rounded"
                required
                minLength={5}
                maxLength={200}
              />
            </div>
          )}
        />
        <form.Field
          name="forma_pago"
          children={(field) => (
            <div>
              <label className="block font-medium mb-1">Forma de Pago</label>
              <select 
                value={field.state.value} 
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
          )}
        />
        <form.Field
          name="notas"
          children={(field) => (
            <div>
              <label className="block font-medium mb-1">Notas (Opcional)</label>
              <textarea 
                value={field.state.value} 
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
          )}
        />
        <button 
          type="submit" 
          disabled={mutation.isPending}
          className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Procesando...' : 'Confirmar Pedido'}
        </button>
      </form>
    </div>
  );
};
