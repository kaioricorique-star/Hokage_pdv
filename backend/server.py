from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from pathlib import Path
from dotenv import load_dotenv
import os, uuid, logging, jwt, bcrypt, asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(dotenv_path="env.env")

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "hokage_db")
JWT_SECRET = os.environ.get("JWT_SECRET", "uma_chave_super_secreta")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_HOURS = int(os.environ.get("JWT_EXPIRE_HOURS", 24))
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hokage")

app = FastAPI(title="Hokage PDV SaaS API 2026")
api = APIRouter(prefix="/api")

# =============== UTILS ===============
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def new_id() -> str:
    return str(uuid.uuid4())

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_token(user_id: str, tenant_id: Optional[str], role: str) -> str:
    payload = {
        "uid": user_id,
        "tid": tenant_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": payload["uid"]}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return user

def require_admin(user = Depends(get_current_user)):
    if user["role"] not in ("admin", "super_admin"):
        raise HTTPException(403, "Admin only")
    return user

# =============== MODELS ===============
class TenantCreate(BaseModel):
    name: str
    slug: str
    plan: str = "starter"

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    tenant_name: str
    tenant_slug: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProductIn(BaseModel):
    name: str
    description: Optional[str] = ""
    category: str = "Pratos"
    price: float
    cost: float = 0.0
    image_url: Optional[str] = ""
    available: bool = True
    prep_time_min: int = 10

class ProductPatch(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    image_url: Optional[str] = None
    available: Optional[bool] = None
    prep_time_min: Optional[int] = None

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    notes: Optional[str] = ""

class OrderIn(BaseModel):
    type: str = "balcao"  # balcao | mesa | delivery | takeaway
    table_number: Optional[int] = None
    customer_name: Optional[str] = ""
    customer_phone: Optional[str] = ""
    customer_address: Optional[str] = ""
    items: List[OrderItem]
    payment_method: str = "dinheiro"  # dinheiro | cartao | pix
    discount: float = 0.0
    notes: Optional[str] = ""

class OrderStatus(BaseModel):
    status: str  # pendente | preparando | pronto | entregue | cancelado

class DeliveryPersonIn(BaseModel):
    name: str
    phone: str
    vehicle: str = "moto"

class TableIn(BaseModel):
    number: int
    capacity: int = 4

class TableStatus(BaseModel):
    status: str  # livre | ocupada | reservada

class FinanceEntryIn(BaseModel):
    type: str  # receita | despesa
    category: str
    amount: float
    description: str
    date: Optional[str] = None

class TicketIn(BaseModel):
    subject: str
    description: str
    priority: str = "media"  # baixa | media | alta

class IAQuery(BaseModel):
    prompt: str
    context: Optional[str] = ""  # menu | sales | general

# =============== AUTH ===============
@api.post("/auth/register")
async def register(data: UserRegister):
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(400, "Email já cadastrado")
    if await db.tenants.find_one({"slug": data.tenant_slug}):
        raise HTTPException(400, "Slug de empresa já em uso")
    tenant_id = new_id()
    user_id = new_id()
    await db.tenants.insert_one({
        "id": tenant_id, "name": data.tenant_name, "slug": data.tenant_slug,
        "plan": "starter", "owner_id": user_id, "created_at": now_iso(), "active": True,
    })
    await db.users.insert_one({
        "id": user_id, "email": data.email, "name": data.name,
        "password": hash_password(data.password), "role": "admin",
        "tenant_id": tenant_id, "created_at": now_iso(),
    })
    token = create_token(user_id, tenant_id, "admin")
    return {"token": token, "user": {"id": user_id, "email": data.email, "name": data.name, "role": "admin", "tenant_id": tenant_id}}

@api.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(401, "Credenciais inválidas")
    token = create_token(user["id"], user.get("tenant_id"), user["role"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"], "tenant_id": user.get("tenant_id")}}

@api.get("/auth/me")
async def me(user = Depends(get_current_user)):
    tenant = None
    if user.get("tenant_id"):
        tenant = await db.tenants.find_one({"id": user["tenant_id"]}, {"_id": 0})
    return {"user": user, "tenant": tenant}

@api.post("/auth/seed")
async def seed():
    """Idempotent demo seed."""
    if not await db.tenants.find_one({"slug": "hokage-demo"}):
        tenant_id = new_id()
        owner_id = new_id()
        await db.tenants.insert_one({
            "id": tenant_id, "name": "Restaurante Hokage Demo", "slug": "hokage-demo",
            "plan": "pro", "owner_id": owner_id, "created_at": now_iso(), "active": True,
        })
        await db.users.insert_one({
            "id": owner_id, "email": "admin@hokage.com", "name": "Admin Hokage",
            "password": hash_password("admin123"), "role": "admin",
            "tenant_id": tenant_id, "created_at": now_iso(),
        })
        # Seed products
        cats = [
            ("Hambúrgueres", [("Cheese Bacon", 32.90, "Hambúrguer artesanal 180g, cheddar e bacon", 12),
                              ("Smash Duplo", 38.50, "Duplo smash com queijo e cebola caramelizada", 12),
                              ("Veggie Burger", 28.00, "Burger de grão de bico com queijo", 14)]),
            ("Bebidas", [("Coca-Cola 350ml", 7.00, "Lata gelada", 1),
                         ("Suco Natural Laranja", 9.50, "300ml feito na hora", 3),
                         ("Água Mineral", 4.00, "500ml", 1)]),
            ("Acompanhamentos", [("Batata Frita", 18.90, "Porção 300g", 7),
                                 ("Onion Rings", 21.00, "Cebola empanada", 8)]),
            ("Sobremesas", [("Brownie", 14.00, "Com sorvete de baunilha", 5),
                            ("Petit Gateau", 22.00, "Bolo de chocolate quente", 10)]),
        ]
        sample_imgs = [
            "https://images.pexels.com/photos/34491414/pexels-photo-34491414.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "https://images.pexels.com/photos/5179783/pexels-photo-5179783.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        ]
        i = 0
        for cat, items in cats:
            for n, price, desc, prep in items:
                await db.products.insert_one({
                    "id": new_id(), "tenant_id": tenant_id, "name": n, "description": desc,
                    "category": cat, "price": price, "cost": round(price*0.4, 2),
                    "image_url": sample_imgs[i % len(sample_imgs)],
                    "available": True, "prep_time_min": prep, "created_at": now_iso(),
                })
                i += 1
        # Seed tables
        for n in range(1, 11):
            await db.tables.insert_one({
                "id": new_id(), "tenant_id": tenant_id, "number": n, "capacity": 4,
                "status": "livre", "created_at": now_iso(),
            })
        # Seed delivery person
        await db.delivery_people.insert_one({
            "id": new_id(), "tenant_id": tenant_id, "name": "Carlos Silva",
            "phone": "(11) 99999-1234", "vehicle": "moto", "active": True, "created_at": now_iso(),
        })
    # Super admin
    if not await db.users.find_one({"email": "super@hokage.com"}):
        await db.users.insert_one({
            "id": new_id(), "email": "super@hokage.com", "name": "Super Admin",
            "password": hash_password("super123"), "role": "super_admin",
            "tenant_id": None, "created_at": now_iso(),
        })
    return {"ok": True, "message": "Seed concluído"}

# =============== TENANTS ===============
@api.get("/tenants/current")
async def current_tenant(user = Depends(get_current_user)):
    if not user.get("tenant_id"):
        return None
    t = await db.tenants.find_one({"id": user["tenant_id"]}, {"_id": 0})
    return t

# =============== PRODUCTS ===============
@api.get("/pdv/products")
async def list_products(user = Depends(get_current_user)):
    cur = db.products.find({"tenant_id": user["tenant_id"]}, {"_id": 0}).sort("category", 1)
    return await cur.to_list(1000)

@api.post("/pdv/products")
async def create_product(p: ProductIn, user = Depends(require_admin)):
    doc = {**p.model_dump(), "id": new_id(), "tenant_id": user["tenant_id"], "created_at": now_iso()}
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.patch("/pdv/products/{pid}")
async def update_product(pid: str, p: ProductPatch, user = Depends(require_admin)):
    update = {k: v for k, v in p.model_dump().items() if v is not None}
    res = await db.products.update_one({"id": pid, "tenant_id": user["tenant_id"]}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Produto não encontrado")
    return await db.products.find_one({"id": pid}, {"_id": 0})

@api.delete("/pdv/products/{pid}")
async def delete_product(pid: str, user = Depends(require_admin)):
    await db.products.delete_one({"id": pid, "tenant_id": user["tenant_id"]})
    return {"ok": True}

# =============== ORDERS / PEDIDOS ===============
async def _next_order_number(tenant_id: str) -> int:
    last = await db.orders.find({"tenant_id": tenant_id}, {"order_number": 1}).sort("order_number", -1).limit(1).to_list(1)
    return (last[0]["order_number"] + 1) if last else 1001

@api.post("/pdv/orders")
async def create_order(order: OrderIn, user = Depends(get_current_user)):
    subtotal = sum(i.price * i.quantity for i in order.items)
    total = max(0.0, subtotal - order.discount)
    doc = {
        "id": new_id(), "tenant_id": user["tenant_id"], "order_number": await _next_order_number(user["tenant_id"]),
        "type": order.type, "table_number": order.table_number,
        "customer_name": order.customer_name, "customer_phone": order.customer_phone, "customer_address": order.customer_address,
        "items": [i.model_dump() for i in order.items],
        "payment_method": order.payment_method, "subtotal": subtotal, "discount": order.discount, "total": total,
        "notes": order.notes, "status": "pendente", "created_by": user["id"],
        "delivery_person_id": None, "created_at": now_iso(), "updated_at": now_iso(),
    }
    await db.orders.insert_one(doc)
    if order.type == "mesa" and order.table_number:
        await db.tables.update_one({"tenant_id": user["tenant_id"], "number": order.table_number}, {"$set": {"status": "ocupada"}})
    doc.pop("_id", None)
    return doc

@api.get("/pdv/orders")
async def list_orders(status_f: Optional[str] = None, type_f: Optional[str] = None, user = Depends(get_current_user)):
    q = {"tenant_id": user["tenant_id"]}
    if status_f: q["status"] = status_f
    if type_f: q["type"] = type_f
    return await db.orders.find(q, {"_id": 0}).sort("created_at", -1).limit(200).to_list(200)

@api.patch("/pdv/orders/{oid}/status")
async def update_status(oid: str, s: OrderStatus, user = Depends(get_current_user)):
    res = await db.orders.update_one({"id": oid, "tenant_id": user["tenant_id"]}, {"$set": {"status": s.status, "updated_at": now_iso()}})
    if res.matched_count == 0:
        raise HTTPException(404, "Pedido não encontrado")
    o = await db.orders.find_one({"id": oid}, {"_id": 0})
    # Free table if dine-in finished
    if s.status in ("entregue", "cancelado") and o and o.get("type") == "mesa" and o.get("table_number"):
        await db.tables.update_one({"tenant_id": user["tenant_id"], "number": o["table_number"]}, {"$set": {"status": "livre"}})
    # If entregue, register sale
    if s.status == "entregue" and o:
        await db.sales.insert_one({
            "id": new_id(), "tenant_id": user["tenant_id"], "order_id": oid,
            "total": o["total"], "payment_method": o["payment_method"],
            "type": o["type"], "items_count": sum(i["quantity"] for i in o["items"]),
            "created_at": now_iso(),
        })
    return o

# =============== KDS ===============
@api.get("/kds")
async def kds_board(user = Depends(get_current_user)):
    orders = await db.orders.find({"tenant_id": user["tenant_id"], "status": {"$in": ["pendente", "preparando", "pronto"]}}, {"_id": 0}).sort("created_at", 1).to_list(200)
    return orders

# =============== TABLES / ATENDIMENTO ===============
@api.get("/pdv/tables")
async def list_tables(user = Depends(get_current_user)):
    return await db.tables.find({"tenant_id": user["tenant_id"]}, {"_id": 0}).sort("number", 1).to_list(200)

@api.post("/pdv/tables")
async def create_table(t: TableIn, user = Depends(require_admin)):
    if await db.tables.find_one({"tenant_id": user["tenant_id"], "number": t.number}):
        raise HTTPException(400, "Mesa já existe")
    doc = {"id": new_id(), "tenant_id": user["tenant_id"], "number": t.number, "capacity": t.capacity, "status": "livre", "created_at": now_iso()}
    await db.tables.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.patch("/pdv/tables/{mid}/status")
async def table_status(mid: str, s: TableStatus, user = Depends(get_current_user)):
    res = await db.tables.update_one({"id": mid, "tenant_id": user["tenant_id"]}, {"$set": {"status": s.status}})
    if res.matched_count == 0:
        raise HTTPException(404, "Mesa não encontrada")
    return await db.tables.find_one({"id": mid}, {"_id": 0})

# =============== DASHBOARD / METRICS ===============
@api.get("/metrics")
async def dashboard_stats(user = Depends(get_current_user)):
    tid = user["tenant_id"]
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    sales_today = await db.sales.find({"tenant_id": tid, "created_at": {"$gte": today_start}}, {"_id": 0}).to_list(10000)
    all_sales = await db.sales.find({"tenant_id": tid}, {"_id": 0}).to_list(10000)
    active_orders = await db.orders.count_documents({"tenant_id": tid, "status": {"$in": ["pendente", "preparando", "pronto"]}})
    products_count = await db.products.count_documents({"tenant_id": tid})
    tables_busy = await db.tables.count_documents({"tenant_id": tid, "status": "ocupada"})

    # Top products
    pipeline = [
        {"$match": {"tenant_id": tid}},
        {"$unwind": "$items"},
        {"$group": {"_id": "$items.name", "qty": {"$sum": "$items.quantity"}, "revenue": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}}}},
        {"$sort": {"qty": -1}},
        {"$limit": 5},
    ]
    top_products = await db.orders.aggregate(pipeline).to_list(10)

    # Daily sales last 7 days
    daily = {}
    for s in all_sales:
        d = s["created_at"][:10]
        daily[d] = daily.get(d, 0) + s["total"]
    series = sorted([{"date": k, "total": round(v, 2)} for k, v in daily.items()])[-7:]

    return {
        "vendas_hoje": round(sum(s["total"] for s in sales_today), 2),
        "pedidos_hoje": len(sales_today),
        "ticket_medio": round(sum(s["total"] for s in sales_today) / len(sales_today), 2) if sales_today else 0,
        "vendas_total": round(sum(s["total"] for s in all_sales), 2),
        "pedidos_ativos": active_orders,
        "produtos_cadastrados": products_count,
        "mesas_ocupadas": tables_busy,
        "top_produtos": [{"name": t["_id"], "qty": t["qty"], "revenue": round(t["revenue"], 2)} for t in top_products],
        "vendas_diarias": series,
    }

# =============== HEALTH ===============
@api.get("/")
async def root():
    return {"name": "Hokage PDV SaaS API", "version": "2026.1", "status": "ok"}

# =============== MOUNT ===============
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # Auto-seed demo data
    try:
        await seed()
        logger.info("Seed executado com sucesso")
    except Exception as e:
        logger.warning(f"Seed falhou: {e}")

@app.on_event("shutdown")
async def shutdown():
    client.close()