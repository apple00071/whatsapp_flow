"""
WhatsApp API Platform - Python SDK
Groups resource
"""

from typing import Dict, List, Optional, Any


class Groups:
    """Groups resource for managing WhatsApp groups"""

    def __init__(self, client):
        self.client = client

    def list(
        self,
        session_id: Optional[str] = None,
        page: int = 1,
        limit: int = 50,
    ) -> Dict[str, Any]:
        """List groups"""
        params = {"page": page, "limit": limit}
        if session_id:
            params["sessionId"] = session_id

        return self.client.get("/groups", params=params)

    def create(
        self,
        session_id: str,
        name: str,
        participants: List[str],
    ) -> Dict[str, Any]:
        """Create group"""
        data = {
            "sessionId": session_id,
            "name": name,
            "participants": participants,
        }
        return self.client.post("/groups", data=data)

    def get(self, group_id: str) -> Dict[str, Any]:
        """Get group by ID"""
        return self.client.get(f"/groups/{group_id}")

    def update(self, group_id: str, name: str) -> Dict[str, Any]:
        """Update group"""
        return self.client.put(f"/groups/{group_id}", data={"name": name})

    def sync(self, session_id: str) -> Dict[str, Any]:
        """Sync groups from WhatsApp"""
        return self.client.post("/groups/sync", data={"sessionId": session_id})

    def add_participants(
        self,
        group_id: str,
        participants: List[str],
    ) -> Dict[str, Any]:
        """Add participants to group"""
        return self.client.post(
            f"/groups/{group_id}/participants",
            data={"participants": participants},
        )

    def remove_participants(
        self,
        group_id: str,
        participants: List[str],
    ) -> Dict[str, Any]:
        """Remove participants from group"""
        return self.client.delete(
            f"/groups/{group_id}/participants",
            data={"participants": participants},
        )

    def leave(self, group_id: str) -> Dict[str, Any]:
        """Leave group"""
        return self.client.post(f"/groups/{group_id}/leave")

