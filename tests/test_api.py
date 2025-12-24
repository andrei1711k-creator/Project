import pytest
from httpx import AsyncClient
from httpx import ASGITransport

from server.main import app


@pytest.mark.asyncio
async def test_app_starts():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code in (200, 404)


@pytest.mark.asyncio
async def test_docs_available():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/docs")
    assert response.status_code == 200


