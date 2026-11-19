import { useForm } from '@tanstack/react-form';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../shared/api/axiosInstance';
import { useAuthStore } from '../../store/authStore';
import { handleApiError } from '../../shared/api/handleApiError';
import { useState } from 'react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const checkSession = useAuthStore((state) => state.checkSession);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new URLSearchParams();
      formData.append('username', data.username);
      formData.append('password', data.password);
      await axiosInstance.post('/auth/token', formData);
      await checkSession();
    },
    onSuccess: () => navigate('/'),
    onError: (e) => setError(handleApiError(e)),
  });

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Food Store - Login</h1>
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
                />
              </div>
            )}
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          ¿No tienes cuenta? <Link to="/register" className="text-blue-600 hover:underline">Regístrate</Link>
        </div>
      </div>
    </div>
  );
};
