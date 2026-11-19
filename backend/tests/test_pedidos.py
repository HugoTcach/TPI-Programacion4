def test_crear_pedido(client, user_token, admin_token):
    # Admin creates category and product
    client.cookies.set("access_token", f"Bearer {admin_token}")
    cat_resp = client.post("/api/v1/categorias", json={"nombre": "Pizzas Pedidos", "descripcion": "Desc"})
    cat_id = cat_resp.json()["id"]

    prod_resp = client.post("/api/v1/productos", json={
        "nombre": "Pizza Especial Test",
        "precio_base": 5000.0,
        "stock": 20,
        "disponible": True,
        "categoria_id": cat_id
    })
    prod_id = prod_resp.json()["id"]

    # User creates order
    client.cookies.set("access_token", f"Bearer {user_token}")
    pedido_resp = client.post("/api/v1/pedidos", json={
        "items": [{"producto_id": prod_id, "cantidad": 2}],
        "forma_pago": "EFECTIVO",
        "direccion_entrega": "Calle Falsa 1234, Córdoba"
    })
    assert pedido_resp.status_code == 201
    pedido_data = pedido_resp.json()
    assert pedido_data["total"] == 10000.0
    assert pedido_data["estado"] == "PENDIENTE"
    pedido_id = pedido_data["id"]

    # Admin changes status
    client.cookies.set("access_token", f"Bearer {admin_token}")
    cambio_resp = client.patch(f"/api/v1/pedidos/{pedido_id}/estado", json={"estado": "EN_PREPARACION"})
    assert cambio_resp.status_code == 200
    assert cambio_resp.json()["estado"] == "EN_PREPARACION"

    # Admin checks summary
    resumen_resp = client.get("/api/v1/pedidos/resumen")
    assert resumen_resp.status_code == 200
    resumen_data = resumen_resp.json()
    assert "en_preparacion" in resumen_data
