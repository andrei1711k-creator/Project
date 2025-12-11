from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app import schemas
from app.database import async_session_maker
from app.crud import cart as crud_cart

router = APIRouter(prefix="/cart", tags=["Cart"])


async def get_db():
    async with async_session_maker() as session:
        yield session


@router.post("/", response_model=schemas.Cart, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    cart_item: schemas.CartCreate,
    session: AsyncSession = Depends(get_db)
):
    return await crud_cart.add_to_cart(session, cart_item)


@router.get("/{cart_id}", response_model=schemas.Cart)
async def read_cart_item(cart_id: int, session: AsyncSession = Depends(get_db)):
    db_cart_item = await crud_cart.get_cart_item(session, cart_id)
    if db_cart_item is None:
        raise HTTPException(status_code=404, detail=f"Cart item {cart_id} not found")
    return db_cart_item


@router.get("/user/{user_id}", response_model=List[schemas.Cart])
async def read_user_cart(user_id: int, session: AsyncSession = Depends(get_db)):
    return await crud_cart.get_user_cart(session, user_id)


@router.put("/{cart_id}", response_model=schemas.Cart)
async def update_cart_item(
    cart_id: int,
    cart_item: schemas.CartUpdate,
    session: AsyncSession = Depends(get_db)
):
    db_cart_item = await crud_cart.update_cart(session, cart_id, cart_item)
    if db_cart_item is None:
        raise HTTPException(status_code=404, detail=f"Cart item {cart_id} not found")
    return db_cart_item


@router.patch("/{cart_id}", response_model=schemas.Cart)
async def update_cart_item_partial(
    cart_id: int,
    cart_item: schemas.CartUpdatePartial,
    session: AsyncSession = Depends(get_db)
):
    db_cart_item = await crud_cart.update_cart(session, cart_id, cart_item, partial=True)
    if db_cart_item is None:
        raise HTTPException(status_code=404, detail=f"Cart item {cart_id} not found")
    return db_cart_item


@router.delete("/{cart_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cart_item(cart_id: int, session: AsyncSession = Depends(get_db)):
    deleted = await crud_cart.delete_cart_item(session, cart_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Cart item {cart_id} not found")
    return None