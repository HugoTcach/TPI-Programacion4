def test_get_categorias(client):
    response = client.get("/api/v1/categorias")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_categoria_admin(client, admin_token):
    client.cookies.set("access_token", f"Bearer {admin_token}")
    response = client.post(
        "/api/v1/categorias",
        json={
            "nombre": "Postres Test",
            "descripcion": "Categoría de postres para pruebas"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Postres Test"
    assert "id" in data

def test_create_categoria_forbidden_for_user(client, user_token):
    client.cookies.set("access_token", f"Bearer {user_token}")
    response = client.post(
        "/api/v1/categorias",
        json={
            "nombre": "Categoría Prohibida",
            "descripcion": "Sin permisos de admin"
        }
    )
    assert response.status_code == 403
