def test_get_productos_paginados(client):
    response = client.get("/api/v1/productos?skip=0&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data

def test_create_y_actualizar_producto(client, admin_token):
    client.cookies.set("access_token", f"Bearer {admin_token}")
    
    # Create category first
    cat_resp = client.post(
        "/api/v1/categorias",
        json={"nombre": "Cat Producto Test", "descripcion": "Desc"}
    )
    cat_id = cat_resp.json()["id"]

    # Create product
    prod_resp = client.post(
        "/api/v1/productos",
        json={
            "nombre": "Empanada Criolla Test",
            "descripcion": "Empanada de carne jugosa",
            "precio_base": 1200.0,
            "stock": 50,
            "disponible": True,
            "categoria_id": cat_id
        }
    )
    assert prod_resp.status_code == 201
    prod_data = prod_resp.json()
    prod_id = prod_data["id"]
    assert prod_data["nombre"] == "Empanada Criolla Test"

    # Update product
    update_resp = client.put(
        f"/api/v1/productos/{prod_id}",
        json={
            "nombre": "Empanada Criolla Especial",
            "descripcion": "Empanada especial jugosa",
            "precio_base": 1500.0,
            "stock": 50,
            "disponible": True,
            "categoria_id": cat_id
        }
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["nombre"] == "Empanada Criolla Especial"
    assert update_resp.json()["precio_base"] == 1500.0

    # Update stock (PATCH)
    stock_resp = client.patch(
        f"/api/v1/productos/{prod_id}/stock",
        json={"stock": 100, "disponible": True}
    )
    assert stock_resp.status_code == 200
    assert stock_resp.json()["stock"] == 100
