from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app import crud, schemas
from app.database import async_session_maker
from app.crud import cart_items
router = APIRouter(prefix="/cart", tags=["Cart Items"])



async def get_db():
    async with async_session_maker() as session:
        yield session



@router.post("/", response_model=schemas.CartItem, status_code=status.HTTP_201_CREATED)
async def create_cart_item(
    new_cart_item: schemas.CartItemCreate,
    session: AsyncSession = Depends(get_db)
):
    return await cart_items.create_cart_item(session=session, new_cart_item=new_cart_item)


@router.get("/", response_model=list[schemas.CartItem])
async def get_cart_items(session: AsyncSession = Depends(get_db)):
    return await cart_items.get_cart_items(session=session)



@router.get("/{cart_item_id}", response_model=schemas.CartItem)
async def get_cart_item(cart_item_id: int, session: AsyncSession = Depends(get_db)):
    cart_item = await cart_items.get_cart_item(session=session, cart_item_id=cart_item_id)
    if cart_item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return cart_item



@router.put("/{cart_item_id}", response_model=schemas.CartItem)
async def update_cart_item(
    cart_item_id: int,
    cart_item_data: schemas.CartItemUpdate,
    session: AsyncSession = Depends(get_db)
):
    cart_item = await cart_items.get_cart_item(session=session, cart_item_id=cart_item_id)
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    return await cart_items.update_cart_item(
        session=session,
        cart_item=cart_item,
        cart_item_update=cart_item_data
    )


@router.patch("/{cart_item_id}", response_model=schemas.CartItem)
async def update_cart_item_partial(
    cart_item_id: int,
    cart_item_data: schemas.CartItemUpdatePartial,
    session: AsyncSession = Depends(get_db)
):
    cart_item = await cart_items.get_cart_item(session=session, cart_item_id=cart_item_id)
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    return await cart_items.update_cart_item(
        session=session,
        cart_item=cart_item,
        cart_item_update=cart_item_data,
        partial=True
    )



@router.delete("/{cart_item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cart_item(cart_item_id: int, session: AsyncSession = Depends(get_db)):
    cart_item = await cart_items.get_cart_item(session=session, cart_item_id=cart_item_id)
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    await cart_items.delete_cart_item(session=session, cart_item=cart_item)
