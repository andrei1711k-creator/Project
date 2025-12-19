# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt, JWTError

from app import schemas
from app.database import async_session_maker
from app.crud import users as crud_users

SECRET_KEY = "super_secret_key"
ALGORITHM = "HS256"

router = APIRouter(prefix="/users", tags=["Users"])

# ---------- Dependency для работы с БД ----------
async def get_db():
    async with async_session_maker() as session:
        yield session

# ---------- Dependency для текущего пользователя ----------
async def get_current_user(
    access_token: str = Cookie(None),
    session: AsyncSession = Depends(get_db)
):
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    db_user = await crud_users.get_user(session, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return db_user

# ---------- CRUD роуты ----------

@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
async def create_user(user: schemas.UserCreate, session: AsyncSession = Depends(get_db)):
    db_user = await crud_users.get_user_by_email(session, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = await crud_users.get_user_by_username(session, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    return await crud_users.create_user(session=session, user=user)


@router.get("/", response_model=list[schemas.User])
async def read_users(
        skip: int = 0,
        limit: int = 100,
        session: AsyncSession = Depends(get_db)
):
    users_list = await crud_users.get_users(session)
    return users_list[skip:skip + limit]

# ---------- Новый маршрут /me ----------
@router.get("/me", response_model=schemas.User)
async def read_current_user(current_user=Depends(get_current_user)):
    return current_user


@router.get("/{user_id}", response_model=schemas.User)
async def read_user(user_id: int, session: AsyncSession = Depends(get_db)):
    db_user = await crud_users.get_user(session, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return db_user


@router.get("/email/{email}", response_model=schemas.User)
async def read_user_by_email(email: str, session: AsyncSession = Depends(get_db)):
    db_user = await crud_users.get_user_by_email(session, email=email)
    if db_user is None:
        raise HTTPException(status_code=404, detail=f"User with email {email} not found")
    return db_user


@router.get("/username/{username}", response_model=schemas.User)
async def read_user_by_username(username: str, session: AsyncSession = Depends(get_db)):
    db_user = await crud_users.get_user_by_username(session, username=username)
    if db_user is None:
        raise HTTPException(status_code=404, detail=f"User {username} not found")
    return db_user


@router.put("/{user_id}", response_model=schemas.User)
async def update_user(
        user_id: int,
        user: schemas.UserUpdate,
        session: AsyncSession = Depends(get_db)
):
    db_user = await crud_users.update_user(session, user_id, user)
    if db_user is None:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return db_user


@router.patch("/{user_id}", response_model=schemas.User)
async def update_user_partial(
        user_id: int,
        user: schemas.UserUpdatePartial,
        session: AsyncSession = Depends(get_db)
):
    db_user = await crud_users.update_user(session, user_id, user, partial=True)
    if db_user is None:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return db_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, session: AsyncSession = Depends(get_db)):
    deleted = await crud_users.delete_user(session, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return None

