from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr
    avatar_url: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    avatar_url: Optional[str] = None
    is_admin: Optional[bool] = None

class UserUpdatePartial(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    avatar_url: Optional[str] = None

class User(UserBase):
    id: int
    is_admin: bool = False

    class Config:
        from_attributes = True

# Остальные схемы остаются как были...

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryUpdatePartial(BaseModel):
    name: Optional[str] = None

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    format: str
    description: str
    price: float
    duration_hours: int
    rating: float
    category_id: int

class CourseCreate(CourseBase):
    pass

class CourseUpdate(CourseBase):
    pass

class CourseUpdatePartial(BaseModel):
    title: Optional[str] = None
    format: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_hours: Optional[int] = None
    rating: Optional[float] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None

class Course(CourseBase):
    id: int
    image_url: str
    owner_id: Optional[int] = None

    class Config:
        from_attributes = True

class CourseShort(BaseModel):
    id: int
    title: str
    price: int

    class Config:
        from_attributes = True

# ================== CART ==================

class CartCreate(BaseModel):
    course_id: int

class Cart(BaseModel):
    id: int
    course: CourseShort

    class Config:
        from_attributes = True

# ===================== BOUGHT COURSE =========================

class BoughtCourseBase(BaseModel):
    user_id: int
    course_id: int

class BoughtCourseCreate(BoughtCourseBase):
    pass

class BoughtCourseUpdate(BoughtCourseBase):
    pass

class BoughtCourseUpdatePartial(BaseModel):
    user_id: Optional[int] = None
    course_id: Optional[int] = None

class BoughtCourse(BoughtCourseBase):
    id: int

    class Config:
        from_attributes = True

# ======================= COMMENT =============================

class CommentBase(BaseModel):
    user_id: int
    course_id: int
    content: str
    rating: int

class CommentCreate(CommentBase):
    pass

class CommentUpdate(CommentBase):
    pass

class CommentUpdatePartial(BaseModel):
    user_id: Optional[int] = None
    course_id: Optional[int] = None
    content: Optional[str] = None
    rating: Optional[int] = None

class Comment(CommentBase):
    id: int

    class Config:
        from_attributes = True

# ======================= AUTH =============================

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    is_admin: bool = False

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

