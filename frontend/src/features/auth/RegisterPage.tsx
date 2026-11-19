import { useForm } from '@tanstack/react-form';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../shared/api/axiosInstance';
import { handleApiError } from '../../shared/api/handleApiError';
import { useState } from 'react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await axiosInstance.post('/auth/register', data);
    },
    onSuccess: () => navigate('/login'),
    onError: (e) => setError(handleApiError(e)),
  });

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Registro</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="username"
            children={(field) => (
              <div>
                <label className="block text-sm font-medium mb-1">Usuario</label>
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
            )}
          />
          <form.Field
            name="full_name"
            children={(field) => (
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
            )}
          />
          <form.Field
            name="email"
            children={(field) => (
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
            )}
          />
          <form.Field
            name="password"
            children={(field) => (
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <input
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                  minLength={8}
                />
              </div>
            )}
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 hover:underline">Ingresa</Link>
        </div>
      </div>
    </div>
  );
};
