from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from server.app import schemas
from server.app.database import async_session_maker
from server.app.crud import comment as crud_comments

router = APIRouter(prefix="/comments", tags=["Comments"])


async def get_db():
    async with async_session_maker() as session:
        yield session


@router.post("/", response_model=schemas.Comment, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment: schemas.CommentCreate,
    session: AsyncSession = Depends(get_db)

):
    return await crud_comments.create_comment(session, comment)


@router.get("/{comment_id}", response_model=schemas.Comment)
async def read_comment(comment_id: int, session: AsyncSession = Depends(get_db)):
    db_comment = await crud_comments.get_comment(session, comment_id)
    if db_comment is None:
        raise HTTPException(status_code=404, detail=f"Comment {comment_id} not found")
    return db_comment


@router.get("/course/{course_id}", response_model=List[schemas.Comment])
async def read_course_comments(
    course_id: int,
    session: AsyncSession = Depends(get_db)
):
    return await crud_comments.get_course_comments(session, course_id)


@router.put("/{comment_id}", response_model=schemas.Comment)
async def update_comment(
    comment_id: int,
    comment: schemas.CommentUpdate,
    session: AsyncSession = Depends(get_db)
):
    db_comment = await crud_comments.update_comment(session, comment_id, comment)
    if db_comment is None:
        raise HTTPException(status_code=404, detail=f"Comment {comment_id} not found")
    return db_comment


@router.patch("/{comment_id}", response_model=schemas.Comment)
async def update_comment_partial(
    comment_id: int,
    comment: schemas.CommentUpdatePartial,
    session: AsyncSession = Depends(get_db)
):
    db_comment = await crud_comments.update_comment(session, comment_id, comment, partial=True)
    if db_comment is None:
        raise HTTPException(status_code=404, detail=f"Comment {comment_id} not found")
    return db_comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(comment_id: int, session: AsyncSession = Depends(get_db)):
    deleted = await crud_comments.delete_comment(session, comment_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Comment {comment_id} not found")
    return None