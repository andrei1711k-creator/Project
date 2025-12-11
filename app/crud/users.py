from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.engine import Result
from passlib.context import CryptContext
from app import models, schemas

pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")


# 🔹 Хэширование пароля
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# 🔹 CREATE
async def create_user(session: AsyncSession, user: schemas.UserCreate) -> models.User:
    """Создать нового пользователя"""
    hashed_password = get_password_hash(user.hashed_password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user


# 🔹 READ — один пользователь по ID
async def get_user(session: AsyncSession, user_id: int) -> models.User | None:
    stmt = select(models.User).where(models.User.id == user_id)
    result: Result = await session.execute(stmt)
    return result.scalar_one_or_none()


# 🔹 READ — по email
async def get_user_by_email(session: AsyncSession, email: str) -> models.User | None:
    stmt = select(models.User).where(models.User.email == email)
    result: Result = await session.execute(stmt)
    return result.scalar_one_or_none()


# 🔹 READ — по username
async def get_user_by_username(session: AsyncSession, username: str) -> models.User | None:
    stmt = select(models.User).where(models.User.username == username)
    result: Result = await session.execute(stmt)
    return result.scalar_one_or_none()


# 🔹 READ — все пользователи
async def get_users(session: AsyncSession) -> list[models.User]:
    stmt = select(models.User).order_by(models.User.id)
    result: Result = await session.execute(stmt)
    return list(result.scalars().all())


# 🔹 UPDATE
async def update_user(
    session: AsyncSession,
    user_id: int,
    user_update: schemas.UserUpdate | schemas.UserUpdatePartial,
    partial: bool = False
) -> models.User | None:
    """Обновить пользователя (полностью или частично)"""
    stmt = select(models.User).where(models.User.id == user_id)
    result: Result = await session.execute(stmt)
    db_user = result.scalar_one_or_none()

    if not db_user:
        return None

    update_data = user_update.model_dump(exclude_unset=partial)
    if "hashed_password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data["hashed_password"])

    for field, value in update_data.items():
        setattr(db_user, field, value)

    await session.commit()
    await session.refresh(db_user)
    return db_user


# 🔹 DELETE
async def delete_user(session: AsyncSession, user_id: int) -> bool:
    """Удалить пользователя"""
    stmt = delete(models.User).where(models.User.id == user_id)
    result = await session.execute(stmt)
    await session.commit()
    return result.rowcount > 0
