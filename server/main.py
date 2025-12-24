from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.app.routers.auth import router as auth_router
import uvicorn

from fastapi.staticfiles import StaticFiles
from server.app.routers.comments import router as comment_router
from server.app.routers.bought_courses import router as bought_courses_router
from server.app.routers.cart import router as cart_router
from server.app.routers.users import router as users_router
from server.app.routers.auth import router as auth_router
from server.app.routers.courses import router as courses_router
from server.app.routers.categories import router as categories_router

app = FastAPI()
app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories_router)
app.include_router(cart_router)
app.include_router(comment_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(bought_courses_router)


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)

