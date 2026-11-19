# Food Store - Sistema de Pedidos de Comida

URL del repositorio público de GitHub: https://github.com/HugoTcach/TPI-Programacion4.git
LINK al video: https://drive.google.com/file/d/1K-oCJLCnZzULgx8lAcwf9SZ4daygkaOL/view?usp=sharing

Este es el Trabajo Práctico Integrador para la materia Programación 4.
El proyecto implementa un sistema completo con un backend en **FastAPI** + **SQLModel** (PostgreSQL/SQLite) y un frontend en **React** + **TypeScript** con **Vite**.

## Requisitos

- **Python 3.11 o superior** (para el backend)
- **Node.js 20.19 o superior** (para el frontend)
- **pnpm** (para gestionar paquetes de Node.js)

## Instalación y Ejecución del Backend

1. Navegar a la carpeta del backend:
   ```bash
   cd backend
   ```
2. (Opcional pero recomendado) Crear y activar un entorno virtual:
   ```bash
   python -m venv venv
   # En Windows:
   .\venv\Scripts\activate
   # En Linux/Mac:
   source venv/bin/activate
   ```
3. Instalar las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Crear el archivo de configuración `.env` a partir del ejemplo:
   ```bash
   cp .env.example .env
   ```
5. Ejecutar el seed para poblar la base de datos (crea al usuario administrador, categorías y productos):
   ```bash
   python -m app.db.seed
   ```
6. Iniciar el servidor backend:
   ```bash
   uvicorn app.main:app --reload
   ```
   La API estará disponible en `http://localhost:8000`.
   La documentación interactiva (Swagger) estará en `http://localhost:8000/docs`.

### Credenciales de administrador por defecto (generadas por el seed)
- **Usuario:** `admin`
- **Contraseña:** `Admin1234!`

## Instalación y Ejecución del Frontend

1. Navegar a la carpeta del frontend (desde la raíz del proyecto):
   ```bash
   cd frontend
   ```
2. Instalar las dependencias con pnpm:
   ```bash
   pnpm install
   ```
3. Crear el archivo de configuración `.env` a partir del ejemplo:
   ```bash
   cp .env.example .env
   ```
4. Construir y verificar los tipos:
   ```bash
   pnpm build
   ```
5. Iniciar el servidor de desarrollo:
   ```bash
   pnpm dev
   ```
   El frontend estará disponible en `http://localhost:5173`.

## Funcionalidades del Sistema
- Catálogo público con categorías, buscador y paginación.
- Carrito de compras (estado persistido localmente).
- Confirmación de pedido con validación de stock y transacciones.
- Panel de cliente para ver y cancelar pedidos propios en estado PENDIENTE.
- Panel de administrador para el ABM de Categorías, Productos, Usuarios y la gestión de la máquina de estados de los Pedidos.
