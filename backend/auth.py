"""DIP account registration and cookie-session authentication."""
from __future__ import annotations
import hashlib, hmac, os, secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import DateTime, ForeignKey, String, create_engine, select, delete
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

# Vercel functions have a read-only application directory. Use /tmp as a
# development fallback when DATABASE_URL is not configured. For durable
# accounts, set DATABASE_URL to a managed PostgreSQL connection string.
_default_db = "sqlite:////tmp/dip_auth.db" if os.getenv("VERCEL") else "sqlite:///./dip_auth.db"
DATABASE_URL = os.getenv("DATABASE_URL", _default_db)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

class Base(DeclarativeBase): pass
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
class LoginSession(Base):
    __tablename__ = "login_sessions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)

Base.metadata.create_all(engine)
router = APIRouter(prefix="/api/auth", tags=["authentication"])
COOKIE_NAME = "dip_session"
SESSION_DAYS = 14
PBKDF2_ROUNDS = 310_000

class SignupBody(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
class LoginBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

def _hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ROUNDS)
    return f"pbkdf2_sha256${PBKDF2_ROUNDS}${salt.hex()}${digest.hex()}"

def _verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, rounds, salt_hex, expected = encoded.split("$")
        if algorithm != "pbkdf2_sha256": return False
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), int(rounds)).hex()
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError): return False

def _new_session(db, user: User, response: Response, request: Request):
    raw = secrets.token_urlsafe(48)
    expires = datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)
    db.add(LoginSession(user_id=user.id, token_hash=hashlib.sha256(raw.encode()).hexdigest(), expires_at=expires))
    response.set_cookie(COOKIE_NAME, raw, max_age=SESSION_DAYS * 86400, httponly=True,
                        secure=request.url.scheme == "https", samesite="lax", path="/")

def _public_user(user: User):
    return {"id": user.id, "name": user.name, "email": user.email}

def _current_user(request: Request, db):
    raw = request.cookies.get(COOKIE_NAME)
    if not raw: return None
    digest = hashlib.sha256(raw.encode()).hexdigest()
    session = db.scalar(select(LoginSession).where(LoginSession.token_hash == digest))
    if not session: return None
    expiry = session.expires_at
    if expiry.tzinfo is None: expiry = expiry.replace(tzinfo=timezone.utc)
    if expiry <= datetime.now(timezone.utc):
        db.delete(session); db.commit(); return None
    return db.get(User, session.user_id)

@router.post("/signup", status_code=201)
def signup(body: SignupBody, request: Request, response: Response):
    email = str(body.email).strip().lower()
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.email == email)):
            raise HTTPException(status_code=409, detail="An account with this email already exists.")
        user = User(name=body.name.strip(), email=email, password_hash=_hash_password(body.password))
        db.add(user); db.flush(); _new_session(db, user, response, request); db.commit()
        return {"ok": True, "user": _public_user(user)}

@router.post("/login")
def login(body: LoginBody, request: Request, response: Response):
    email = str(body.email).strip().lower()
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == email))
        if not user or not _verify_password(body.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect email or password.")
        db.execute(delete(LoginSession).where(LoginSession.expires_at < datetime.now(timezone.utc)))
        _new_session(db, user, response, request); db.commit()
        return {"ok": True, "user": _public_user(user)}

@router.get("/me")
def me(request: Request):
    with SessionLocal() as db:
        user = _current_user(request, db)
        if not user: raise HTTPException(status_code=401, detail="You are not signed in.")
        return {"ok": True, "user": _public_user(user)}

@router.post("/logout")
def logout(request: Request, response: Response):
    raw = request.cookies.get(COOKIE_NAME)
    if raw:
        digest = hashlib.sha256(raw.encode()).hexdigest()
        with SessionLocal() as db:
            db.execute(delete(LoginSession).where(LoginSession.token_hash == digest)); db.commit()
    response.delete_cookie(COOKIE_NAME, path="/", httponly=True, samesite="lax")
    return {"ok": True}


def get_authenticated_user(request: Request):
    """Return the signed-in user's public profile, or None for an expired session."""
    with SessionLocal() as db:
        user = _current_user(request, db)
        return _public_user(user) if user else None
