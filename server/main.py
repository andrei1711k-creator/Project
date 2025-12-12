from fastapi import FastAPI
import uvicorn


from app.routers.comments import router as comment_router
from app.routers.bought_courses import router as bought_courses_router
from app.routers.cart import router as cart_router
from app.routers.users import router as users_router
from app.routers.auth import router as auth_router
from app.routers.courses import router as courses_router
from app.routers.categories import router as categories_router
app = FastAPI()

app.include_router(categories_router)
app.include_router(cart_router)
app.include_router(comment_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(bought_courses_router)


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)

