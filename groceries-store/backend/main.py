from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, auth
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)
from database import SessionLocal # تأكد من استيراد SessionLocal إذا لم تكن موجودة
import auth

models.Base.metadata.create_all(bind=engine)

# دالة لإنشاء حساب أدمن افتراضي تلقائياً عند عدم وجوده لضمان عدم ضياعه
def create_default_admin():
    db = SessionLocal()
    try:
        # ابحث عن حساب الأدمن الثابت (مثلاً باسم admin أو رقم محدد)
        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin_user:
            hashed_pwd = auth.get_password_hash("admin1234") # كلمة السر الافتراضية للأدمن
            new_admin = models.User(
                username="admin",
                phone="0700000000",
                shop_name="مدير المتجر الرئيسي",
                hashed_password=hashed_pwd,
                role="admin" # تحديد الصلاحية أدمن
            )
            db.add(new_admin)
            db.commit()
            print("تم إنشاء حساب الأدمن الافتراضي بنجاح!")
    except Exception as e:
        print(f"خطأ أثناء إنشاء الأدمن الافتراضي: {e}")
    finally:
        db.close()

# تنفيذ الدالة عند تشغيل السيرفر
create_default_admin()

app = FastAPI(title="متجر البقوليات والبهارات")

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
    db.refresh(new_item)
    return {"message": "تم إضافة العنصر بنجاح", "item": new_item}

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
    new_order = models.Order(**order.model_dump())
    db.add(new_order)
    db.commit()
    return {"message": "تم إرسال طلبك بنجاح"}

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