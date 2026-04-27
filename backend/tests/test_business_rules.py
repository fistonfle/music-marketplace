from fastapi.testclient import TestClient

from app.main import create_app


def test_purchase_once_enforced() -> None:
    app = create_app()
    with TestClient(app) as client:
        # login as seeded user
        res = client.post(
            "/auth/login",
            data={"username": "user@example.com", "password": "user123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert res.status_code == 200
        access = res.json()["access_token"]

        # list albums
        albums = client.get("/albums").json()
        assert len(albums) > 0
        album_id = albums[0]["id"]

        # purchase first time
        r1 = client.post(f"/purchases/{album_id}", headers={"Authorization": f"Bearer {access}"})
        assert r1.status_code == 201

        # purchase again should fail
        r2 = client.post(f"/purchases/{album_id}", headers={"Authorization": f"Bearer {access}"})
        assert r2.status_code == 400


def test_cannot_rate_without_purchase() -> None:
    app = create_app()
    with TestClient(app) as client:
        res = client.post(
            "/auth/login",
            data={"username": "user@example.com", "password": "user123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert res.status_code == 200
        access = res.json()["access_token"]

        albums = client.get("/albums").json()
        album_id = albums[-1]["id"]

        rate = client.put(
            f"/ratings/{album_id}",
            json={"value": 5},
            headers={"Authorization": f"Bearer {access}"},
        )
        assert rate.status_code == 403

