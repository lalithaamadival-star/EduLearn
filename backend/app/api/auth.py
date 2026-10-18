import hashlib
import uuid
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.core.security import get_current_user
from app.core.logging import logger

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str
    role_hint: Optional[str] = "STUDENT"

class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "STUDENT"
    organization: Optional[str] = "AccessEd Learning Community"

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

@router.post("/login")
async def login(req: LoginRequest):
    from app.repositories.store import data_store

    email_clean = req.email.strip().lower()
    pw_hash = hash_password(req.password)

    # 1. Query live database directly for authoritative record
    target_user = None
    stored_hash = None

    try:
        conn = data_store._get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, email, full_name, role, organization, password_hash
            FROM public.profiles
            WHERE LOWER(email) = %s;
        """, (email_clean,))
        row = cur.fetchone()
        cur.close()
        conn.close()

        if row:
            target_user = {
                "id": str(row[0]),
                "email": row[1],
                "full_name": row[2],
                "role": row[3],
                "organization": row[4] or "AccessEd Learning Community"
            }
            stored_hash = row[5]
    except Exception as e:
        logger.error(f"Error querying profile during login: {e}")

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials or create a new account."
        )

    # 2. Verify password
    if stored_hash and stored_hash != pw_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again."
        )

    # Update memory store
    data_store.profiles[target_user["id"]] = target_user

    token = f"bearer_{target_user['id']}"
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": target_user
    }

@router.post("/signup")
async def signup(req: SignupRequest):
    from app.repositories.store import data_store

    email_clean = req.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")

    if not req.password or len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    role = req.role.strip().upper()
    if role not in ["STUDENT", "TEACHER", "ADMIN"]:
        role = "STUDENT"

    pw_hash = hash_password(req.password)
    user_id = str(uuid.uuid4())
    org = req.organization or ("Department of Computing" if role == "TEACHER" else "AccessEd Learning Cohort")

    user = {
        "id": user_id,
        "email": email_clean,
        "full_name": req.full_name.strip(),
        "role": role,
        "organization": org
    }

    try:
        conn = data_store._get_connection()
        conn.autocommit = True
        cur = conn.cursor()

        # Check existing email
        cur.execute("SELECT id FROM public.profiles WHERE LOWER(email) = %s;", (email_clean,))
        if cur.fetchone():
            cur.close()
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists. Please sign in instead."
            )

        # Insert new profile
        cur.execute("""
            INSERT INTO public.profiles (id, email, full_name, role, organization, password_hash, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW());
        """, (user_id, email_clean, req.full_name.strip(), role, org, pw_hash))

        # Insert default accessibility preferences
        cur.execute("""
            INSERT INTO public.accessibility_preferences (user_id, auditory_orientation, updated_at)
            VALUES (%s, true, NOW())
            ON CONFLICT (user_id) DO NOTHING;
        """, (user_id,))

        cur.close()
        conn.close()

        data_store.profiles[user_id] = user
        logger.info(f"Registered real account in Supabase: {email_clean} ({role})")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to persist new profile to Supabase: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Database registration failed. Please retry.")

    token = f"bearer_{user_id}"
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {"user": current_user}
