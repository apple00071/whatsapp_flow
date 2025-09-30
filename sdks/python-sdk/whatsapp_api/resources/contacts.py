"""
WhatsApp API Platform - Python SDK
Contacts resource
"""

from typing import Dict, List, Optional, Any


class Contacts:
    """Contacts resource for managing contacts"""

    def __init__(self, client):
        self.client = client

    def list(
        self,
        session_id: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 50,
    ) -> Dict[str, Any]:
        """List contacts"""
        params = {"page": page, "limit": limit}
        if session_id:
            params["sessionId"] = session_id
        if search:
            params["search"] = search

        return self.client.get("/contacts", params=params)

    def create(
        self,
        session_id: str,
        phone: str,
        name: str,
        email: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create contact"""
        data = {
            "sessionId": session_id,
            "phone": phone,
            "name": name,
        }
        if email:
            data["email"] = email

        return self.client.post("/contacts", data=data)

    def get(self, contact_id: str) -> Dict[str, Any]:
        """Get contact by ID"""
        return self.client.get(f"/contacts/{contact_id}")

    def update(
        self,
        contact_id: str,
        name: Optional[str] = None,
        email: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update contact"""
        data = {}
        if name:
            data["name"] = name
        if email:
            data["email"] = email

        return self.client.put(f"/contacts/{contact_id}", data=data)

    def delete(self, contact_id: str) -> Dict[str, Any]:
        """Delete contact"""
        return self.client.delete(f"/contacts/{contact_id}")

    def sync(self, session_id: str) -> Dict[str, Any]:
        """Sync contacts from WhatsApp"""
        return self.client.post("/contacts/sync", data={"sessionId": session_id})

