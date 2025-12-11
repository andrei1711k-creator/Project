from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.engine import Result
from app import models, schemas



async def create_cart_item(session: AsyncSession, new_cart_item: schemas.CartItemCreate):
    cart_item = models.CartItem(**new_cart_item.model_dump())
    session.add(cart_item)
    await session.commit()
    await session.refresh(cart_item)
    return cart_item



async def get_cart_items(session: AsyncSession):
    stmt = select(models.CartItem).order_by(models.CartItem.id)
    result: Result = await session.execute(stmt)
    cart_items = result.scalars().all()
    return list(cart_items)



async def get_cart_item(session: AsyncSession, cart_item_id: int):
    return await session.get(models.CartItem, cart_item_id)



async def update_cart_item(
    session: AsyncSession,
    cart_item: models.CartItem,
    cart_item_update: schemas.CartItemUpdate | schemas.CartItemUpdatePartial,
    partial: bool = False
):

    for name, value in cart_item_update.model_dump(exclude_unset=partial).items():
        setattr(cart_item, name, value)
    await session.commit()
    await session.refresh(cart_item)
    return cart_item



async def delete_cart_item(session: AsyncSession, cart_item: models.CartItem) -> None:
    await session.delete(cart_item)
    await session.commit()
