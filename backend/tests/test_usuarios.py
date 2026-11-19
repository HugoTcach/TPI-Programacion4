def test_list_usuarios_admin(client, admin_token):
    client.cookies.set("access_token", f"Bearer {admin_token}")
    response = client.get("/api/v1/admin/usuarios")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_desactivar_y_activar_usuario(client, admin_token, user_token):
    client.cookies.set("access_token", f"Bearer {admin_token}")
    
    # Get all users to locate non-admin user
    users_resp = client.get("/api/v1/admin/usuarios")
    users = users_resp.json()
    user_to_toggle = next((u for u in users if u["username"] == "test_user"), None)
    assert user_to_toggle is not None
    user_id = user_to_toggle["id"]

    # Desactivar
    des_resp = client.post(f"/api/v1/admin/usuarios/{user_id}/desactivar")
    assert des_resp.status_code == 200
    assert des_resp.json()["disabled"] is True

    # Activar
    act_resp = client.post(f"/api/v1/admin/usuarios/{user_id}/activar")
    assert act_resp.status_code == 200
    assert act_resp.json()["disabled"] is False
