def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "new_user_test",
            "full_name": "Nuevo Usuario Test",
            "email": "newuser@test.com",
            "password": "Password123!"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "new_user_test"
    assert data["email"] == "newuser@test.com"
    assert "id" in data

def test_login_user(client):
    # Register user first
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "login_test_user",
            "full_name": "Login Test User",
            "email": "loginuser@test.com",
            "password": "Password123!"
        }
    )
    # Login via form-data
    response = client.post(
        "/api/v1/auth/token",
        data={
            "username": "login_test_user",
            "password": "Password123!"
        }
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Login exitoso"}
    assert "access_token" in response.cookies

def test_read_me_authenticated(client, user_token):
    client.cookies.set("access_token", f"Bearer {user_token}")
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "test_user"

def test_logout(client):
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert response.json() == {"message": "Logout exitoso"}
