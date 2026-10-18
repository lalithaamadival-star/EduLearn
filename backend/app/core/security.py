from fastapi import Header, HTTPException, status, Depends
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.logging import logger

async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Validates bearer token against live Supabase database profiles.
    Returns authoritative profile for authenticated user.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing. Please sign in."
        )

    token = authorization.replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token empty. Please sign in."
        )

    from app.repositories.store import data_store

    # Extract user_id if token is bearer_{user_id} or raw UUID
    user_id = token.replace("bearer_", "").strip()

    # 1. Check in-memory store profiles
    if user_id in data_store.profiles:
        return data_store.profiles[user_id]

    # 2. Check live Supabase database directly
    try:
        conn = data_store._get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, email, full_name, role, organization FROM public.profiles WHERE id::text = %s OR email = %s;", (user_id, user_id))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            user_dict = {
                "id": str(row[0]),
                "email": row[1],
                "full_name": row[2],
                "role": row[3],
                "organization": row[4]
            }
            data_store.profiles[str(row[0])] = user_dict
            return user_dict
    except Exception as e:
        logger.error(f"Error querying profile from database: {e}")

    # 3. If Supabase Auth is enabled, verify with Supabase Auth endpoint
    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        import httpx
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{settings.SUPABASE_URL}/auth/v1/user",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "apikey": settings.SUPABASE_ANON_KEY
                    },
                    timeout=5.0
                )
                if resp.status_code == 200:
                    data = resp.json()
                    user_metadata = data.get("user_metadata", {})
                    profile = {
                        "id": data.get("id"),
                        "email": data.get("email"),
                        "full_name": user_metadata.get("full_name", data.get("email")),
                        "role": user_metadata.get("role", "STUDENT"),
                        "organization": user_metadata.get("organization", "AccessEd")
                    }
                    data_store.profiles[profile["id"]] = profile
                    return profile
        except Exception as e:
            logger.warning(f"Supabase auth verification failed: {e}")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired session. Please sign in again."
    )

def require_role(required_role: str):
    async def role_checker(user: Dict[str, Any] = Depends(get_current_user)):
        role = user.get("role", "STUDENT")
        if role != required_role and role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: {required_role} role required."
            )
        return user
    return role_checker
