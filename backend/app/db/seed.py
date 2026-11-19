from sqlmodel import Session, select
from app.core.database import create_all_tables, engine
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.pedidos.models import Pedido
from app.core.security import get_password_hash

def seed_db():
    create_all_tables()
    with Session(engine) as session:
        admin_user = session.exec(select(Usuario).where(Usuario.username == "admin")).first()
        if not admin_user:
            admin_user = Usuario(
                username="admin",
                full_name="Administrador",
                email="admin@foodstore.com",
                hashed_password=get_password_hash("Admin1234!"),
                role="admin"
            )
            session.add(admin_user)

        cat_pizzas = session.exec(select(Categoria).where(Categoria.nombre == "Pizzas")).first()
        if not cat_pizzas:
            cat_pizzas = Categoria(nombre="Pizzas", descripcion="Pizzas a la piedra")
            session.add(cat_pizzas)
            
        cat_hamburguesas = session.exec(select(Categoria).where(Categoria.nombre == "Hamburguesas")).first()
        if not cat_hamburguesas:
            cat_hamburguesas = Categoria(nombre="Hamburguesas", descripcion="Hamburguesas caseras")
            session.add(cat_hamburguesas)
            
        cat_bebidas = session.exec(select(Categoria).where(Categoria.nombre == "Bebidas")).first()
        if not cat_bebidas:
            cat_bebidas = Categoria(nombre="Bebidas", descripcion="Bebidas frias")
            session.add(cat_bebidas)

        session.commit()
        session.refresh(cat_pizzas)
        session.refresh(cat_hamburguesas)
        session.refresh(cat_bebidas)

        productos_data = [
            ("Muzzarella", cat_pizzas.id, 5000, 50),
            ("Napolitana", cat_pizzas.id, 6000, 40),
            ("Fugazzetta", cat_pizzas.id, 6500, 30),
            ("Clásica", cat_hamburguesas.id, 4500, 100),
            ("Doble Queso", cat_hamburguesas.id, 5500, 80),
            ("Bacon", cat_hamburguesas.id, 6000, 60),
            ("Coca Cola 1.5L", cat_bebidas.id, 2000, 200),
            ("Cerveza IPA 500ml", cat_bebidas.id, 2500, 150),
        ]
        
        for nombre, cat_id, precio, stock in productos_data:
            prod = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if not prod:
                prod = Producto(
                    nombre=nombre,
                    categoria_id=cat_id,
                    precio_base=precio,
                    stock=stock,
                    disponible=True,
                    activo=True
                )
                session.add(prod)

        session.commit()

if __name__ == "__main__":
    seed_db()
    print("Seed ejecutado exitosamente.")
