from fastapi.testclient import TestClient

from app.main import create_app


def _login(client: TestClient, email: str, password: str) -> str:
    res = client.post(
        "/auth/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 200
    return res.json()["access_token"]


def test_refresh_flow_works() -> None:
    app = create_app()
    with TestClient(app) as client:
        res = client.post(
            "/auth/login",
            data={"username": "user@example.com", "password": "user123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "refresh_token" in data

        r2 = client.post("/auth/refresh", json={"refresh_token": data["refresh_token"]})
        assert r2.status_code == 200
        data2 = r2.json()
        assert "access_token" in data2
        assert "refresh_token" in data2

        me = client.get("/auth/me", headers={"Authorization": f"Bearer {data2['access_token']}"})
        assert me.status_code == 200
        assert me.json()["email"] == "user@example.com"


def test_admin_routes_forbidden_for_non_admin() -> None:
    app = create_app()
    with TestClient(app) as client:
        access = _login(client, "user@example.com", "user123")
        r = client.post(
            "/artists",
            json={"real_name": "Jane Doe", "performing_name": "JD", "date_of_birth": "1990-01-01"},
            headers={"Authorization": f"Bearer {access}"},
        )
        assert r.status_code == 403


def test_admin_routes_allow_admin() -> None:
    app = create_app()
    with TestClient(app) as client:
        access = _login(client, "admin@example.com", "admin123")
        r = client.post(
            "/artists",
            json={"real_name": "Jane Doe", "performing_name": "JD", "date_of_birth": "1990-01-01"},
            headers={"Authorization": f"Bearer {access}"},
        )
        assert r.status_code == 201
        assert r.json()["performing_name"] == "JD"

