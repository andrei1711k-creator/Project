from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.engine import Result
from server.app import models, schemas


# CREATE
async def create_comment(session: AsyncSession, data: schemas.CommentCreate) -> models.Comment:
    db_obj = models.Comment(**data.dict())
    session.add(db_obj)
    await session.commit()
    await session.refresh(db_obj)
    return db_obj


# READ one
async def get_comment(session: AsyncSession, comment_id: int):
    stmt = select(models.Comment).where(models.Comment.id == comment_id)
    result: Result = await session.execute(stmt)
    return result.scalar_one_or_none()


# READ all for course
async def get_course_comments(session: AsyncSession, course_id: int):
    stmt = select(models.Comment).where(models.Comment.course_id == course_id)
    result: Result = await session.execute(stmt)
    return list(result.scalars().all())


# UPDATE
async def update_comment(
    session: AsyncSession,
    comment_id: int,
    data: schemas.CommentUpdate | schemas.CommentUpdatePartial,
    partial: bool = False
):
    stmt = select(models.Comment).where(models.Comment.id == comment_id)
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
async def delete_comment(session: AsyncSession, comment_id: int) -> bool:
    stmt = delete(models.Comment).where(models.Comment.id == comment_id)
    result = await session.execute(stmt)
    await session.commit()
    return result.rowcount > 0
