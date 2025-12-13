from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta, datetime
from jose import jwt
from sqlalchemy import select
from server.app.models import User, pwd_context

import server.app.db_helper as db_helper
from server.app.schemas import UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = "super_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30




async def authenticate_user(session: AsyncSession, username: str, password: str):
    result = await session.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user or not user.verify_password(password):
        return None
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)



@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserLogin,
    session: AsyncSession = Depends(db_helper.db_helper.session_dependency)
):

    result = await session.execute(select(User).where(User.username == user_data.username))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = pwd_context.hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=f"{user_data.username}@example.com",  # временно, пока не добавим email в форму
        hashed_password=hashed_password
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    return new_user


# ---------- Роут логина ----------

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(db_helper.db_helper.session_dependency)
):
    user = await authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}
