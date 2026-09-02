from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, auth
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="بهاراتي")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        (models.User.username == user.username) | (models.User.phone == user.phone)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="اسم المستخدم أو رقم الهاتف مستخدم بالفعل")
    
    hashed_pwd = auth.get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        phone=user.phone,
        shop_name=user.shop_name,
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    return {"message": "تم إنشاء الحساب بنجاح"}

@app.post("/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        (models.User.username == user_credentials.username_or_phone) | 
        (models.User.phone == user_credentials.username_or_phone)
    ).first()
    
    if not user or not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="بيانات الدخول غير صحيحة")
        
    return {
        "user_id": user.id,
        "username": user.username,
        "shop_name": user.shop_name,
        "role": user.role
    }

@app.get("/items")
def get_items(db: Session = Depends(get_db)):
    return db.query(models.Item).all()

@app.post("/admin/items")
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    new_item = models.Item(**item.model_dump())
    db.add(new_item)
    db.commit()
    return {"message": "تم إضافة العنصر بنجاح"}

@app.delete("/admin/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="العنصر غير موجود")
    db.delete(item)
    db.commit()
    return {"message": "تم حذف العنصر بنجاح"}

@app.post("/orders")
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    try:
        new_order = models.Order(
            user_id=order.user_id,
            items_details=order.items_details,
            total_price=order.total_price,
            status="قيد الانتظار"
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return {"message": "تم إرسال طلبك بنجاح"}
    except Exception as e:
        print("CRITICAL ORDER ERROR:", str(e))
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/admin/orders")
def get_admin_orders(db: Session = Depends(get_db)):
    orders = db.query(models.Order).all()
    results = []
    for o in orders:
        user = db.query(models.User).filter(models.User.id == o.user_id).first()
        results.append({
            "order_id": o.id,
            "username": user.username if user else "غير معروف",
            "phone": user.phone if user else "-",
            "shop_name": user.shop_name if user else "-",
            "items": o.items_details,
            "total_price": o.total_price,
            "status": o.status
        })
    return results

@app.put("/admin/orders/{order_id}/complete")
def complete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    order.status = "مكتمل"
    db.commit()
    return {"message": "تم إنهاء الطلب بنجاح"}