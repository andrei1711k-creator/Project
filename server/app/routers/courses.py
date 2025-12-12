from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app import schemas
from app.database import async_session_maker
from app.crud import course as crud_courses

router = APIRouter(prefix="/courses", tags=["Courses"])


async def get_db():
    async with async_session_maker() as session:
        yield session


@router.post("/", response_model=schemas.Course, status_code=status.HTTP_201_CREATED)
async def create_course(
    course: schemas.CourseCreate,
    session: AsyncSession = Depends(get_db)
):
    return await crud_courses.create_course(session, course)


@router.get("/", response_model=List[schemas.Course])
async def read_courses(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db)
):
    courses_list = await crud_courses.get_courses(session)
    return courses_list[skip:skip + limit]


@router.get("/{course_id}", response_model=schemas.Course)
async def read_course(course_id: int, session: AsyncSession = Depends(get_db)):
    db_course = await crud_courses.get_course(session, course_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail=f"Course {course_id} not found")
    return db_course


@router.put("/{course_id}", response_model=schemas.Course)
async def update_course(
    course_id: int,
    course: schemas.CourseUpdate,
    session: AsyncSession = Depends(get_db)
):
    db_course = await crud_courses.update_course(session, course_id, course)
    if db_course is None:
        raise HTTPException(status_code=404, detail=f"Course {course_id} not found")
    return db_course


@router.patch("/{course_id}", response_model=schemas.Course)
async def update_course_partial(
    course_id: int,
    course: schemas.CourseUpdatePartial,
    session: AsyncSession = Depends(get_db)
):
    db_course = await crud_courses.update_course(session, course_id, course, partial=True)
    if db_course is None:
        raise HTTPException(status_code=404, detail=f"Course {course_id} not found")
    return db_course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(course_id: int, session: AsyncSession = Depends(get_db)):
    deleted = await crud_courses.delete_course(session, course_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Course {course_id} not found")
    return None