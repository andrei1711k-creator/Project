from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.engine import Result

from passlib.context import CryptContext

from server.app import models, schemas

pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def create_user(session: AsyncSession, user: schemas.UserCreate) -> models.User:


    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        avatar_url=None
    )

    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)

    return db_user
async def get_user(session: AsyncSession, user_id: int) -> models.User | None:
    stmt = select(models.User).where(models.User.id == user_id)
    result: Result = await session.execute(stmt)
    return result.scalar_one_or_none()

async def get_user_by_email(session: AsyncSession, email: str) -> models.User | None:
    stmt = select(models.User).where(models.User.email == email)
    result: Result = await session.execute(stmt)
    return result.scalar_one_or_none()

async def get_user_by_username(session: AsyncSession, username: str) -> models.User | None:
    stmt = select(models.User).where(models.User.username == username)
    result: Result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def get_users(session: AsyncSession) -> list[models.User]:
    stmt = select(models.User).order_by(models.User.id)
    result: Result = await session.execute(stmt)
    return list(result.scalars().all())




async def update_user(
    session: AsyncSession,
    user_id: int,
    user_update: schemas.UserUpdate | schemas.UserUpdatePartial,
    partial: bool = False
) -> models.User | None:


    stmt = select(models.User).where(models.User.id == user_id)
    result: Result = await session.execute(stmt)
    db_user = result.scalar_one_or_none()

    if not db_user:
        return None


    update_data = user_update.model_dump(exclude_unset=partial)


    if "password" in update_data:
        update_data["hashed_password"] = hash_password(update_data.pop("password"))


    for field, value in update_data.items():
        setattr(db_user, field, value)

    await session.commit()
    await session.refresh(db_user)
    return db_user


async def delete_user(session: AsyncSession, user_id: int) -> bool:

    stmt = delete(models.User).where(models.User.id == user_id)
    result = await session.execute(stmt)
    await session.commit()

    return result.rowcount > 0
