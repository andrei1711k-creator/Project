from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from server.app import schemas
from server.app.database import async_session_maker
from server.app.crud import cart as crud_cart
from server.app.crud import bought_course as crud_bought_courses
from server.app.dependenses.auth_dependenses import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])


async def get_db():
    async with async_session_maker() as session:
        yield session


@router.post("/", response_model=schemas.Cart, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    cart_item: schemas.CartCreate,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    return await crud_cart.add_to_cart(
        session=session,
        user_id=current_user.id,
        course_id=cart_item.course_id,
    )


@router.get("/", response_model=List[schemas.Cart])
async def read_my_cart(
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    return await crud_cart.get_user_cart(session, current_user.id)


@router.delete("/{cart_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cart_item(
    cart_id: int,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    cart_item = await crud_cart.get_cart_item(session, cart_id)

    if not cart_item or cart_item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    await crud_cart.delete_cart_item(session, cart_id)


@router.post("/checkout", status_code=status.HTTP_200_OK)
async def checkout_cart(
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    # Получаем все курсы из корзины пользователя
    cart_items = await crud_cart.get_user_cart(session, current_user.id)
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    bought_courses = []
    
    try:
        # Создаем записи о покупке для каждого курса
        for item in cart_items:
            # Проверяем, не куплен ли уже этот курс
            bought_course_data = schemas.BoughtCourseCreate(
                user_id=current_user.id,
                course_id=item.course_id,
                bought_at=datetime.utcnow()
            )
            
            # Создаем запись о покупке
            bought_course = await crud_bought_courses.create_bought_course(
                session, 
                bought_course_data
            )
            bought_courses.append(bought_course)
        
        # Очищаем корзину
        await crud_cart.clear_user_cart(session, current_user.id)
        
        await session.commit()
        
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Checkout failed: {str(e)}")
    
    return {
        "message": "Checkout successful", 
        "courses_count": len(bought_courses),
        "bought_courses": bought_courses
    }


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    await crud_cart.clear_user_cart(session, current_user.id)