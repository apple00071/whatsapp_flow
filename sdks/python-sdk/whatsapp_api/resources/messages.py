"""
WhatsApp API Platform - Python SDK
Messages resource
"""

from typing import Dict, Optional, Any


class Messages:
    """Messages resource for sending and managing messages"""

    def __init__(self, client):
        self.client = client

    def send_text(
        self,
        session_id: str,
        to: str,
        message: str,
    ) -> Dict[str, Any]:
        """
        Send text message
        
        Args:
            session_id: Session ID
            to: Recipient phone number
            message: Message text
            
        Returns:
            Sent message data
        """
        data = {
            "sessionId": session_id,
            "to": to,
            "message": message,
        }
        return self.client.post("/messages/send", data=data)

    def send_media(
        self,
        session_id: str,
        to: str,
        file_path: str,
        caption: Optional[str] = None,
        media_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Send media message
        
        Args:
            session_id: Session ID
            to: Recipient phone number
            file_path: Path to media file
            caption: Optional caption
            media_type: Media type (image, video, audio, document)
            
        Returns:
            Sent message data
        """
        with open(file_path, "rb") as f:
            files = {"file": f}
            data = {
                "sessionId": session_id,
                "to": to,
            }
            if caption:
                data["caption"] = caption
            if media_type:
                data["type"] = media_type

            # Note: For file uploads, we need to send as form data
            # This is a simplified version - actual implementation may vary
            return self.client.post("/messages/media", files=files)

    def send_location(
        self,
        session_id: str,
        to: str,
        latitude: float,
        longitude: float,
        name: Optional[str] = None,
        address: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Send location message
        
        Args:
            session_id: Session ID
            to: Recipient phone number
            latitude: Location latitude
            longitude: Location longitude
            name: Location name
            address: Location address
            
        Returns:
            Sent message data
        """
        data = {
            "sessionId": session_id,
            "to": to,
            "latitude": latitude,
            "longitude": longitude,
        }
        if name:
            data["name"] = name
        if address:
            data["address"] = address

        return self.client.post("/messages/location", data=data)

    def list(
        self,
        session_id: Optional[str] = None,
        phone: Optional[str] = None,
        page: int = 1,
        limit: int = 50,
    ) -> Dict[str, Any]:
        """
        List messages
        
        Args:
            session_id: Filter by session ID
            phone: Filter by phone number
            page: Page number
            limit: Items per page
            
        Returns:
            List of messages with pagination
        """
        params = {"page": page, "limit": limit}
        if session_id:
            params["sessionId"] = session_id
        if phone:
            params["phone"] = phone

        return self.client.get("/messages", params=params)

    def get(self, message_id: str) -> Dict[str, Any]:
        """
        Get message by ID
        
        Args:
            message_id: Message ID
            
        Returns:
            Message data
        """
        return self.client.get(f"/messages/{message_id}")

    def get_status(self, message_id: str) -> Dict[str, Any]:
        """
        Get message status
        
        Args:
            message_id: Message ID
            
        Returns:
            Message status data
        """
        return self.client.get(f"/messages/{message_id}/status")

