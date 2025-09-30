"""
WhatsApp API Platform - Python SDK
Sessions resource
"""

from typing import Dict, List, Optional, Any


class Sessions:
    """Sessions resource for managing WhatsApp sessions"""

    def __init__(self, client):
        self.client = client

    def list(self, page: int = 1, limit: int = 20, status: Optional[str] = None) -> Dict[str, Any]:
        """
        List all sessions
        
        Args:
            page: Page number
            limit: Items per page
            status: Filter by status (connected, disconnected, etc.)
            
        Returns:
            List of sessions with pagination
        """
        params = {"page": page, "limit": limit}
        if status:
            params["status"] = status

        return self.client.get("/sessions", params=params)

    def create(self, name: str, webhook_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a new session
        
        Args:
            name: Session name
            webhook_url: Optional webhook URL for events
            
        Returns:
            Created session data
        """
        data = {"name": name}
        if webhook_url:
            data["webhookUrl"] = webhook_url

        return self.client.post("/sessions", data=data)

    def get(self, session_id: str) -> Dict[str, Any]:
        """
        Get session by ID
        
        Args:
            session_id: Session ID
            
        Returns:
            Session data
        """
        return self.client.get(f"/sessions/{session_id}")

    def update(self, session_id: str, name: Optional[str] = None, webhook_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Update session
        
        Args:
            session_id: Session ID
            name: New session name
            webhook_url: New webhook URL
            
        Returns:
            Updated session data
        """
        data = {}
        if name:
            data["name"] = name
        if webhook_url:
            data["webhookUrl"] = webhook_url

        return self.client.put(f"/sessions/{session_id}", data=data)

    def delete(self, session_id: str) -> Dict[str, Any]:
        """
        Delete session
        
        Args:
            session_id: Session ID
            
        Returns:
            Success message
        """
        return self.client.delete(f"/sessions/{session_id}")

    def get_qr_code(self, session_id: str) -> Dict[str, Any]:
        """
        Get QR code for session
        
        Args:
            session_id: Session ID
            
        Returns:
            QR code data
        """
        return self.client.get(f"/sessions/{session_id}/qr")

    def reconnect(self, session_id: str) -> Dict[str, Any]:
        """
        Reconnect session
        
        Args:
            session_id: Session ID
            
        Returns:
            Session data
        """
        return self.client.post(f"/sessions/{session_id}/reconnect")

