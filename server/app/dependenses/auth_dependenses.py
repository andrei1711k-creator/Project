from fastapi import Depends, HTTPException, status, Cookie
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from server.app.security import SECRET_KEY, ALGORITHM
from server.app.database import async_session_maker
from server.app.crud import users as crud_users

async def get_db():
    async with async_session_maker() as session:
        yield session
        
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    
    return db_user
