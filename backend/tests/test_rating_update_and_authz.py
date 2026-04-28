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


def test_purchase_requires_auth() -> None:
    app = create_app()
    with TestClient(app) as client:
        albums = client.get("/albums").json()
        album_id = albums[0]["id"]
        r = client.post(f"/purchases/{album_id}")
        assert r.status_code in (401, 403)


def test_library_requires_auth() -> None:
    app = create_app()
    with TestClient(app) as client:
        r = client.get("/library")
        assert r.status_code in (401, 403)


def test_rating_upsert_after_purchase() -> None:
    app = create_app()
    with TestClient(app) as client:
        access = _login(client, "user@example.com", "user123")
        albums = client.get("/albums").json()
        album_id = albums[0]["id"]

        # Ensure owned
        buy = client.post(f"/purchases/{album_id}", headers={"Authorization": f"Bearer {access}"})
        assert buy.status_code in (201, 400)  # already purchased is ok for this test

        r1 = client.put(
            f"/ratings/{album_id}",
            json={"value": 4},
            headers={"Authorization": f"Bearer {access}"},
        )
        assert r1.status_code == 200
        assert r1.json()["value"] == 4

        r2 = client.put(
            f"/ratings/{album_id}",
            json={"value": 2},
            headers={"Authorization": f"Bearer {access}"},
        )
        assert r2.status_code == 200
        assert r2.json()["value"] == 2

