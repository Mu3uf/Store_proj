from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext

import models
import schemas

from database import engine, get_db


# Create database tables
models.Base.metadata.create_all(bind=engine)


app = FastAPI(title="Baharati API")


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Password Hashing
# =========================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# =========================
# Root
# =========================

@app.get("/")
def root():
    return {
        "message": "Baharati API is running"
    }


# =========================
# REGISTER
# =========================

@app.post("/register")
def register(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    existing_username = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="اسم المستخدم موجود مسبقاً"
        )

    existing_phone = db.query(models.User).filter(
        models.User.phone == user.phone
    ).first()

    if existing_phone:
        raise HTTPException(
            status_code=400,
            detail="رقم الهاتف موجود مسبقاً"
        )

    hashed_password = pwd_context.hash(user.password)

    new_user = models.User(
        username=user.username,
        phone=user.phone,
        shop_name=user.shop_name,
        hashed_password=hashed_password,
        role="client"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "تم إنشاء الحساب بنجاح",
        "user_id": new_user.id,
        "username": new_user.username,
        "phone": new_user.phone,
        "shop_name": new_user.shop_name,
        "role": new_user.role
    }


# =========================
# LOGIN
# =========================

@app.post("/login")
def login(
    user: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    db_user = db.query(models.User).filter(
        (models.User.username == user.username_or_phone)
        |
        (models.User.phone == user.username_or_phone)
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="اسم المستخدم أو رقم الهاتف غير صحيح"
        )

    if not pwd_context.verify(
        user.password,
        db_user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="كلمة المرور غير صحيحة"
        )

    return {
        "message": "تم تسجيل الدخول بنجاح",
        "user_id": db_user.id,
        "username": db_user.username,
        "phone": db_user.phone,
        "shop_name": db_user.shop_name,
        "role": db_user.role
    }


# =========================
# GET ITEMS
# =========================

@app.get("/items")
def get_items(
    db: Session = Depends(get_db)
):
    items = db.query(models.Item).all()

    results = []

    for item in items:

        category_name = None

        if item.category:
            category_name = item.category.name

        results.append({
            "id": item.id,
            "category_id": item.category_id,
            "category_name": category_name,
            "name": item.name,
            "image_url": item.image_url,
            "price_per_kg": item.price_per_kg,
            "available_sizes": item.available_sizes
        })

    return results


# =========================
# ADD ITEM - ADMIN
# =========================

@app.post("/admin/items")
def create_item(
    item: schemas.ItemCreate,
    db: Session = Depends(get_db)
):

    # Check category
    category = db.query(models.Category).filter(
        models.Category.id == item.category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="التصنيف غير موجود"
        )

    # Create new item
    new_item = models.Item(
        category_id=item.category_id,
        name=item.name,
        image_url=item.image_url,
        price_per_kg=item.price_per_kg,
        available_sizes=item.available_sizes
    )

    try:
        db.add(new_item)
        db.commit()
        db.refresh(new_item)

        return {
            "message": "تمت إضافة المنتج وحفظه في قاعدة البيانات",
            "item": {
                "id": new_item.id,
                "category_id": new_item.category_id,
                "category_name": category.name,
                "name": new_item.name,
                "image_url": new_item.image_url,
                "price_per_kg": new_item.price_per_kg,
                "available_sizes": new_item.available_sizes
            }
        }

    except Exception as e:
        db.rollback()

        print("ITEM CREATE ERROR:", str(e))

        raise HTTPException(
            status_code=400,
            detail=f"فشل حفظ المنتج: {str(e)}"
        )


# =========================
# UPDATE ITEM - ADMIN
# =========================

@app.put("/admin/items/{item_id}")
def update_item(
    item_id: int,
    item: schemas.ItemCreate,
    db: Session = Depends(get_db)
):

    # البحث عن المنتج
    existing_item = db.query(models.Item).filter(
        models.Item.id == item_id
    ).first()

    if not existing_item:
        raise HTTPException(
            status_code=404,
            detail="المنتج غير موجود"
        )

    # التأكد من وجود القسم
    category = db.query(models.Category).filter(
        models.Category.id == item.category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="التصنيف غير موجود"
        )

    try:

        # تحديث بيانات المنتج
        existing_item.category_id = item.category_id
        existing_item.name = item.name
        existing_item.image_url = item.image_url
        existing_item.price_per_kg = item.price_per_kg
        existing_item.available_sizes = item.available_sizes

        db.commit()
        db.refresh(existing_item)

        return {
            "message": "تم تعديل المنتج وحفظ التعديل في قاعدة البيانات",

            "item": {
                "id": existing_item.id,
                "category_id": existing_item.category_id,
                "category_name": category.name,
                "name": existing_item.name,
                "image_url": existing_item.image_url,
                "price_per_kg": existing_item.price_per_kg,
                "available_sizes": existing_item.available_sizes
            }
        }

    except Exception as e:

        db.rollback()

        print("ITEM UPDATE ERROR:", str(e))

        raise HTTPException(
            status_code=400,
            detail=f"فشل تعديل المنتج: {str(e)}"
        )


# =========================
# DELETE ITEM - ADMIN
# =========================

@app.delete("/admin/items/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db)
):

    item = db.query(models.Item).filter(
        models.Item.id == item_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="المنتج غير موجود"
        )

    try:

        db.delete(item)
        db.commit()

        return {
            "message": "تم حذف المنتج بنجاح"
        }

    except Exception as e:

        db.rollback()

        print("ITEM DELETE ERROR:", str(e))

        raise HTTPException(
            status_code=400,
            detail=f"فشل حذف المنتج: {str(e)}"
        )


# =========================
# CREATE ORDER
# =========================

@app.post("/orders")
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db)
):

    # التأكد أن العميل موجود
    user = db.query(models.User).filter(
        models.User.id == order.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="العميل غير موجود"
        )

    try:

        new_order = models.Order(
            user_id=user.id,
            items_details=order.items_details,
            total_price=order.total_price,
            status="قيد الانتظار"
        )

        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        return {
            "message": "تم إرسال طلبك بنجاح",
            "order_id": new_order.id
        }

    except Exception as e:

        db.rollback()

        print("CRITICAL ORDER ERROR:", str(e))

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =========================
# GET ORDERS - ADMIN
# =========================

@app.get("/admin/orders")
def get_admin_orders(
    db: Session = Depends(get_db)
):

    orders = db.query(models.Order).all()

    results = []

    for order in orders:

        user = db.query(models.User).filter(
            models.User.id == order.user_id
        ).first()

        results.append({

            "order_id": order.id,

            "username": (
                user.username
                if user and user.username
                else "عميل غير معروف"
            ),

            "phone": (
                user.phone
                if user and user.phone
                else "-"
            ),

            "shop_name": (
                user.shop_name
                if user and user.shop_name
                else "-"
            ),

            "items": order.items_details,

            "total_price": order.total_price,

            "status": order.status

        })

    return results


# =========================
# COMPLETE ORDER - ADMIN
# =========================

@app.put("/admin/orders/{order_id}/complete")
def complete_order(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = db.query(models.Order).filter(
        models.Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="الطلب غير موجود"
        )

    order.status = "تم التسليم"

    db.commit()
    db.refresh(order)

    return {
        "message": "تم تحديث حالة الطلب",
        "order_id": order.id,
        "status": order.status
    }