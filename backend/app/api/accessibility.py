from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.models.schemas import AccessibilityPreferencesSchema, AccessibilityPreferencesUpdate
from app.repositories.store import data_store
from app.core.security import get_current_user

router = APIRouter(prefix="/api/accessibility", tags=["Accessibility Engine"])

@router.get("/preferences", response_model=AccessibilityPreferencesSchema)
async def get_preferences(user: Dict[str, Any] = Depends(get_current_user)):
    user_id = user["id"]
    prefs = data_store.accessibility_preferences.get(user_id)
    if not prefs:
        prefs = AccessibilityPreferencesSchema().model_dump()
        data_store.accessibility_preferences[user_id] = prefs
    return prefs

@router.put("/preferences", response_model=AccessibilityPreferencesSchema)
async def update_preferences(
    updates: AccessibilityPreferencesUpdate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = user["id"]
    prefs = data_store.accessibility_preferences.get(user_id)
    if not prefs:
        prefs = AccessibilityPreferencesSchema().model_dump()

    update_dict = updates.model_dump(exclude_unset=True)
    prefs.update(update_dict)
    data_store.save_accessibility_preferences(user_id, prefs)

    return prefs
