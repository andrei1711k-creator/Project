from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app import schemas
from app.database import async_session_maker
from app.crud import category as crud_categories

router = APIRouter(prefix="/categories", tags=["Categories"])


async def get_db():
    async with async_session_maker() as session:
        yield session


@router.post("/", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: schemas.CategoryCreate,
    session: AsyncSession = Depends(get_db)
):
    return await crud_categories.create_category(session, category)


@router.get("/", response_model=List[schemas.Category])
async def read_categories(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db)
):
    categories_list = await crud_categories.get_categories(session)
    return categories_list[skip:skip + limit]


@router.get("/{category_id}", response_model=schemas.Category)
async def read_category(category_id: int, session: AsyncSession = Depends(get_db)):
    db_category = await crud_categories.get_category(session, category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
    return db_category


@router.put("/{category_id}", response_model=schemas.Category)
async def update_category(
    category_id: int,
    category: schemas.CategoryUpdate,
    session: AsyncSession = Depends(get_db)
):
    db_category = await crud_categories.update_category(session, category_id, category)
    if db_category is None:
        raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
    return db_category


@router.patch("/{category_id}", response_model=schemas.Category)
async def update_category_partial(
    category_id: int,
    category: schemas.CategoryUpdatePartial,
    session: AsyncSession = Depends(get_db)
):
    db_category = await crud_categories.update_category(session, category_id, category, partial=True)
    if db_category is None:
        raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
    return db_category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int, session: AsyncSession = Depends(get_db)):
    deleted = await crud_categories.delete_category(session, category_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
    return None