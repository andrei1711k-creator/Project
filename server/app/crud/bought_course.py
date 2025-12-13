from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.engine import Result
from server.app import models, schemas


# CREATE
async def create_bought_course(session: AsyncSession, data: schemas.BoughtCourseCreate) -> models.BoughtCourse:
    db_obj = models.BoughtCourse(**data.dict())
    session.add(db_obj)

    # Увеличиваем счётчик покупок курса
    stmt_course = select(models.Course).where(models.Course.id == data.course_id)
    course = (await session.execute(stmt_course)).scalar_one_or_none()
    if course:
        course.purchased_count += 1

    await session.commit()
    await session.refresh(db_obj)
    return db_obj


# READ one
async def get_bought_course(session: AsyncSession, bought_id: int):
    stmt = select(models.BoughtCourse).where(models.BoughtCourse.id == bought_id)
    result: Result = await session.execute(stmt)
    return result.scalar_one_or_none()


# READ all for user
async def get_user_bought_courses(session: AsyncSession, user_id: int):
    stmt = select(models.BoughtCourse).where(models.BoughtCourse.user_id == user_id)
    result: Result = await session.execute(stmt)
    return list(result.scalars().all())


# UPDATE
async def update_bought_course(
    session: AsyncSession,
    bought_id: int,
    data: schemas.BoughtCourseUpdate | schemas.BoughtCourseUpdatePartial,
    partial: bool = False
):
    stmt = select(models.BoughtCourse).where(models.BoughtCourse.id == bought_id)
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
async def delete_bought_course(session: AsyncSession, bought_id: int) -> bool:
    stmt = delete(models.BoughtCourse).where(models.BoughtCourse.id == bought_id)
    result = await session.execute(stmt)
    await session.commit()
    return result.rowcount > 0
