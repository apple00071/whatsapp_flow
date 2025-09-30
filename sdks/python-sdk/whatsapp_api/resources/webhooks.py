"""
WhatsApp API Platform - Python SDK
Webhooks resource
"""

from typing import Dict, List, Optional, Any


class Webhooks:
    """Webhooks resource for managing webhooks"""

    def __init__(self, client):
        self.client = client

    def list(self) -> Dict[str, Any]:
        """List webhooks"""
        return self.client.get("/webhooks")

    def create(
        self,
        url: str,
        events: List[str],
        active: bool = True,
    ) -> Dict[str, Any]:
        """Create webhook"""
        data = {
            "url": url,
            "events": events,
            "active": active,
        }
        return self.client.post("/webhooks", data=data)

    def get(self, webhook_id: str) -> Dict[str, Any]:
        """Get webhook by ID"""
        return self.client.get(f"/webhooks/{webhook_id}")

    def update(
        self,
        webhook_id: str,
        url: Optional[str] = None,
        events: Optional[List[str]] = None,
        active: Optional[bool] = None,
    ) -> Dict[str, Any]:
        """Update webhook"""
        data = {}
        if url:
            data["url"] = url
        if events:
            data["events"] = events
        if active is not None:
            data["active"] = active

        return self.client.put(f"/webhooks/{webhook_id}", data=data)

    def delete(self, webhook_id: str) -> Dict[str, Any]:
        """Delete webhook"""
        return self.client.delete(f"/webhooks/{webhook_id}")

    def test(self, webhook_id: str) -> Dict[str, Any]:
        """Test webhook"""
        return self.client.post(f"/webhooks/{webhook_id}/test")

    def regenerate_secret(self, webhook_id: str) -> Dict[str, Any]:
        """Regenerate webhook secret"""
        return self.client.post(f"/webhooks/{webhook_id}/regenerate-secret")

    def get_logs(
        self,
        webhook_id: str,
        page: int = 1,
        limit: int = 50,
    ) -> Dict[str, Any]:
        """Get webhook logs"""
        params = {"page": page, "limit": limit}
        return self.client.get(f"/webhooks/{webhook_id}/logs", params=params)

