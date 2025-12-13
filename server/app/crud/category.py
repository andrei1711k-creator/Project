from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.engine import Result
from server.app import models, schemas


# CREATE
async def create_category(session: AsyncSession, data: schemas.CategoryCreate) -> models.Category:
    db_obj = models.Category(name=data.name)
    session.add(db_obj)
    await session.commit()
    await session.refresh(db_obj)
    return db_obj


# READ one
async def get_category(session: AsyncSession, category_id: int) -> models.Category | None:
    stmt = select(models.Category).where(models.Category.id == category_id)
    result: Result = await session.execute(stmt)
    return result.scalar_one_or_none()


# READ all
async def get_categories(session: AsyncSession) -> list[models.Category]:
    stmt = select(models.Category).order_by(models.Category.id)
    result: Result = await session.execute(stmt)
    return list(result.scalars().all())


# UPDATE
async def update_category(
    session: AsyncSession,
    category_id: int,
    data: schemas.CategoryUpdate | schemas.CategoryUpdatePartial,
    partial: bool = False
):
    stmt = select(models.Category).where(models.Category.id == category_id)
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
async def delete_category(session: AsyncSession, category_id: int) -> bool:
    stmt = delete(models.Category).where(models.Category.id == category_id)
    result = await session.execute(stmt)
    await session.commit()
    return result.rowcount > 0
