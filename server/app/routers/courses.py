from typing import List
from fastapi import UploadFile, File, Form
from pathlib import Path
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from server.app import models
from server.app.dependenses.auth_dependenses import get_current_user
from server.app import schemas
from server.app.database import async_session_maker
from server.app.crud import course as crud_courses
from pathlib import Path
import os


STATIC_DIR = Path("static/images/courses")
STATIC_DIR.mkdir(parents=True, exist_ok=True)

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

@router.post("/my", response_model=schemas.Course)
async def create_my_course(
    title: str = Form(...),
    format: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    duration_hours: int = Form(...),
    category_id: int = Form(...),
    image: UploadFile = File(...),
    session: AsyncSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    filename = f"{uuid.uuid4()}_{image.filename}"
    file_path = STATIC_DIR / filename

    with open(file_path, "wb") as f:
        f.write(await image.read())

    course = models.Course(
        title=title,
        format=format,
        description=description,
        price=price,
        duration_hours=duration_hours,
        category_id=category_id,
        owner_id=user.id,
        image_url=f"/static/images/courses/{filename}",
    )

    session.add(course)
    await session.commit()
    await session.refresh(course)
    return course

@router.get("/my", response_model=list[schemas.Course])
async def get_my_courses(
    session: AsyncSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    result = await session.execute(
        select(models.Course).where(models.Course.owner_id == user.id)
    )
    return result.scalars().all()


@router.get("/by-category/{category_id}", response_model=schemas.Course)
async def read_course_by_category_id(category_id: int, session: AsyncSession = Depends(get_db)):
    db_course = await crud_courses. get_course_by_category(session, category_id=category_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail=f"Course {category_id} not found")
    return db_course

@router.get("/{course_id}", response_model=schemas.Course)
async def read_course(course_id: int, session: AsyncSession = Depends(get_db)):
    db_course = await crud_courses.get_course(session, course_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail=f"Course {course_id} not found")
    return db_course

@router.put("/my/{course_id}", response_model=schemas.Course)
async def update_my_course(
    course_id: int,
    data: schemas.CourseUpdate,
    session: AsyncSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    course = await session.get(models.Course, course_id)

    if not course or course.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    for k, v in data.model_dump().items():
        setattr(course, k, v)

    await session.commit()
    await session.refresh(course)
    return course

@router.delete("/my/{course_id}", status_code=204)
async def delete_my_course(
    course_id: int,
    session: AsyncSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    course = await session.get(models.Course, course_id)

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # удаляем картинку, если она не дефолтная
    if course.image_url and "default.png" not in course.image_url:
        file_path = Path(course.image_url.lstrip("/"))
        if file_path.exists():
            os.remove(file_path)

    await session.delete(course)
    await session.commit()


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