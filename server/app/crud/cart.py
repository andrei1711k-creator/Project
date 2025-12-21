from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from server.app import models


# ADD TO CART
async def add_to_cart(
    session: AsyncSession,
    user_id: int,
    course_id: int,
) -> models.Cart:
    cart_item = models.Cart(
        user_id=user_id,
        course_id=course_id,
    )
    session.add(cart_item)
    await session.commit()

    result = await session.execute(
        select(models.Cart)
        .where(models.Cart.id == cart_item.id)
        .options(selectinload(models.Cart.course))
    )
    return result.scalar_one()


# GET ONE
async def get_cart_item(session: AsyncSession, cart_id: int):
    result = await session.execute(
        select(models.Cart)
        .where(models.Cart.id == cart_id)
        .options(selectinload(models.Cart.course))
    )
    return result.scalar_one_or_none()


# GET ALL USER CART (🔥 JOIN COURSE)
async def get_user_cart(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(models.Cart)
        .where(models.Cart.user_id == user_id)
        .options(selectinload(models.Cart.course))
    )
    return result.scalars().all()


# DELETE ONE
async def delete_cart_item(session: AsyncSession, cart_id: int) -> None:
    await session.execute(
        delete(models.Cart).where(models.Cart.id == cart_id)
    )
    await session.commit()


# 🔥 CLEAR USER CART (для оплаты)
async def clear_user_cart(session: AsyncSession, user_id: int) -> None:
    await session.execute(
        delete(models.Cart).where(models.Cart.user_id == user_id)
    )
    await session.commit()
