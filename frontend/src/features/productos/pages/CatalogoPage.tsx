import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../shared/api/axiosInstance';
import { useCartStore } from '../../../store/cartStore';

export const CatalogoPage = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const limit = 6;
  const { agregar } = useCartStore();

  const { data: categoriasData } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await axiosInstance.get('/categorias');
      return res.data;
    }
  });

  const { data: productosData, isLoading } = useQuery({
    queryKey: ['productos', page, search, categoriaId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('skip', (page * limit).toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (categoriaId) params.append('categoria_id', categoriaId);
      
      const res = await axiosInstance.get('/productos', { params });
      return res.data;
    }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Catálogo</h1>
      <div className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Buscar producto..." 
          value={search} 
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="border p-2 rounded flex-1"
        />
        <select 
          value={categoriaId} 
          onChange={(e) => { setCategoriaId(e.target.value); setPage(0); }}
          className="border p-2 rounded"
        >
          <option value="">Todas las categorías</option>
          {categoriasData?.map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 animate-pulse rounded"></div>)}
        </div>
      ) : productosData?.items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No se encontraron productos.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {productosData?.items.map((prod: any) => (
              <div key={prod.id} className="bg-white p-4 rounded shadow">
                {prod.imagen_url && <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-40 object-cover mb-4 rounded" />}
                <h3 className="font-bold text-xl">{prod.nombre}</h3>
                <p className="text-gray-600 mb-2">${prod.precio_base}</p>
                <button 
                  onClick={() => agregar({ producto_id: prod.id, nombre: prod.nombre, precio_unitario: prod.precio_base, cantidad: 1 })}
                  className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
                >
                  Agregar al carrito
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center bg-white p-4 rounded shadow">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span>Página {page + 1} de {Math.ceil((productosData?.total || 0) / limit)}</span>
            <button 
              disabled={(page + 1) * limit >= (productosData?.total || 0)} 
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};
