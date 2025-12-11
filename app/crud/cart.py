from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.engine import Result
from app import models, schemas


# CREATE
async def add_to_cart(session: AsyncSession, data: schemas.CartCreate) -> models.Cart:
    db_obj = models.Cart(**data.dict())
    session.add(db_obj)
    await session.commit()
    await session.refresh(db_obj)
    return db_obj


# READ one
async def get_cart_item(session: AsyncSession, cart_id: int):
    stmt = select(models.Cart).where(models.Cart.id == cart_id)
    result: Result = await session.execute(stmt)
    return result.scalar_one_or_none()


# READ all for user
async def get_user_cart(session: AsyncSession, user_id: int):
    stmt = select(models.Cart).where(models.Cart.user_id == user_id)
    result: Result = await session.execute(stmt)
    return list(result.scalars().all())


# UPDATE
async def update_cart(
    session: AsyncSession,
    cart_id: int,
    data: schemas.CartUpdate | schemas.CartUpdatePartial,
    partial: bool = False
):
    stmt = select(models.Cart).where(models.Cart.id == cart_id)
    result: Result = await session.execute(stmt)
    db_obj = result.scalar_one_or_none()

    if not db_obj:
        return None

    update_data = data.model_dump(exclude_unset=partial)

    for field, value in update_data.items():
        setattr(db_obj, field, value)

    await session.commit()
    await session.refresh(db_obj)
    return db_obj


# DELETE
async def delete_cart_item(session: AsyncSession, cart_id: int) -> bool:
    stmt = delete(models.Cart).where(models.Cart.id == cart_id)
    result = await session.execute

async def delete_cart_item(session: AsyncSession, cart_id: int) -> bool:
    stmt = delete(models.Cart).where(models.Cart.id == cart_id)
    result = await session.execute(stmt)
    await session.commit()
    return result.rowcount > 0
