from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from server.app import schemas
from server.app.database import async_session_maker
from server.app.crud import bought_course as crud_bought_courses
from server.app.dependenses.auth_dependenses import get_current_user
from server.app import models

router = APIRouter(prefix="/bought-courses", tags=["Bought Courses"])


async def get_db():
    async with async_session_maker() as session:
        yield session


@router.post("/", response_model=schemas.BoughtCourse, status_code=status.HTTP_201_CREATED)
async def create_bought_course(
    bought_course: schemas.BoughtCourseCreate,
    session: AsyncSession = Depends(get_db)
):
    return await crud_bought_courses.create_bought_course(session, bought_course)


@router.get("/{bought_id}", response_model=schemas.BoughtCourse)
async def read_bought_course(bought_id: int, session: AsyncSession = Depends(get_db)):
    db_bought_course = await crud_bought_courses.get_bought_course(session, bought_id)
    if db_bought_course is None:
        raise HTTPException(status_code=404, detail=f"Bought course {bought_id} not found")
    return db_bought_course


@router.get("/user/me", response_model=List[schemas.BoughtCourse])
async def read_my_bought_courses(
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    stmt = (
        select(models.BoughtCourse)
        .where(models.BoughtCourse.user_id == current_user.id)
        .options(selectinload(models.BoughtCourse.course))
    )
    result = await session.execute(stmt)
    bought_courses = result.scalars().all()
    
    response = []
    for bc in bought_courses:
        course_short = None
        if bc.course:
            course_short = schemas.CourseShort(
                id=bc.course.id,
                title=bc.course.title,
                price=bc.course.price,
                image_url=bc.course.image_url  # Теперь включаем image_url
            )
        
        response.append(schemas.BoughtCourse(
            id=bc.id,
            user_id=bc.user_id,
            course_id=bc.course_id,
            course=course_short
        ))
    
    return response


@router.get("/user/{user_id}", response_model=List[schemas.BoughtCourse])
async def read_user_bought_courses(user_id: int, session: AsyncSession = Depends(get_db)):
    # Аналогичная логика для других пользователей
    stmt = (
        select(models.BoughtCourse)
        .where(models.BoughtCourse.user_id == user_id)
        .options(selectinload(models.BoughtCourse.course))
    )
    result = await session.execute(stmt)
    bought_courses = result.scalars().all()
    
    response = []
    for bc in bought_courses:
        course_short = None
        if bc.course:
            course_short = schemas.CourseShort(
                id=bc.course.id,
                title=bc.course.title,
                price=bc.course.price
            )
        
        response.append(schemas.BoughtCourse(
            id=bc.id,
            user_id=bc.user_id,
            course_id=bc.course_id,
            course=course_short
        ))
    
    return response


# Остальные методы остаются без изменений
@router.put("/{bought_id}", response_model=schemas.BoughtCourse)
async def update_bought_course(
    bought_id: int,
    bought_course: schemas.BoughtCourseUpdate,
    session: AsyncSession = Depends(get_db)
):
    db_bought_course = await crud_bought_courses.update_bought_course(session, bought_id, bought_course)
    if db_bought_course is None:
        raise HTTPException(status_code=404, detail=f"Bought course {bought_id} not found")
    return db_bought_course


@router.patch("/{bought_id}", response_model=schemas.BoughtCourse)
async def update_bought_course_partial(
    bought_id: int,
    bought_course: schemas.BoughtCourseUpdatePartial,
    session: AsyncSession = Depends(get_db)
):
    db_bought_course = await crud_bought_courses.update_bought_course(session, bought_id, bought_course, partial=True)
    if db_bought_course is None:
        raise HTTPException(status_code=404, detail=f"Bought course {bought_id} not found")
    return db_bought_course


@router.delete("/{bought_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bought_course(bought_id: int, session: AsyncSession = Depends(get_db)):
    deleted = await crud_bought_courses.delete_bought_course(session, bought_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Bought course {bought_id} not found")
    return None