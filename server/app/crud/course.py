from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.engine import Result
from server.app import models, schemas


# CREATE
async def create_course(session: AsyncSession, data: schemas.CourseCreate) -> models.Course:
    db_obj = models.Course(**data.dict())
    session.add(db_obj)
    await session.commit()
    await session.refresh(db_obj)
    return db_obj


# READ one
async def get_course(session: AsyncSession, course_id: int) -> models.Course | None:
    stmt = select(models.Course).where(models.Course.id == course_id)
    result: Result = await session.execute(stmt)
    return result.scalar_one_or_none()

async def get_course_by_category(session: AsyncSession, category_id: int) ->list[models.Course]:
    stmt = select(models.Course).where(models.Course.category_id == category_id)
    result: Result = await session.execute(stmt)
    return result.scalar_one_or_none()

# READ all
async def get_courses(session: AsyncSession) -> list[models.Course]:
    stmt = select(models.Course).order_by(models.Course.id)
    result: Result = await session.execute(stmt)
    return list(result.scalars().all())


# UPDATE
async def update_course(
    session: AsyncSession,
    course_id: int,
    data: schemas.CourseUpdate | schemas.CourseUpdatePartial,
    partial: bool = False
):
    stmt = select(models.Course).where(models.Course.id == course_id)
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
async def delete_course(session: AsyncSession, course_id: int) -> bool:
    stmt = delete(models.Course).where(models.Course.id == course_id)
    result = await session.execute(stmt)
    await session.commit()
    return result.rowcount > 0
