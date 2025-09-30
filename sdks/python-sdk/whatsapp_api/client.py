"""
WhatsApp API Platform - Python SDK
Main client class
"""

import time
import requests
from typing import Optional, Dict, Any
from .exceptions import (
    WhatsAppAPIError,
    AuthenticationError,
    ValidationError,
    RateLimitError,
    NotFoundError,
    ServerError,
)
from .resources import Sessions, Messages, Contacts, Groups, Webhooks


class WhatsAppAPI:
    """
    WhatsApp API Platform Client
    
    Args:
        api_key: Your API key
        base_url: Base URL of the API (default: http://localhost:3000/api/v1)
        timeout: Request timeout in seconds (default: 30)
        max_retries: Maximum number of retries (default: 3)
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = "http://localhost:3000/api/v1",
        timeout: int = 30,
        max_retries: int = 3,
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries

        # Initialize resource modules
        self.sessions = Sessions(self)
        self.messages = Messages(self)
        self.contacts = Contacts(self)
        self.groups = Groups(self)
        self.webhooks = Webhooks(self)

    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with API key"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "WhatsApp-API-Python-SDK/1.0.0",
        }

    def _handle_response(self, response: requests.Response) -> Dict[str, Any]:
        """Handle API response and raise appropriate exceptions"""
        try:
            data = response.json()
        except ValueError:
            data = {"error": "Invalid JSON response"}

        if response.status_code == 200 or response.status_code == 201:
            return data

        error_message = data.get("error", "Unknown error")

        if response.status_code == 401:
            raise AuthenticationError(error_message, response.status_code, data)
        elif response.status_code == 400:
            raise ValidationError(error_message, response.status_code, data)
        elif response.status_code == 429:
            raise RateLimitError(error_message, response.status_code, data)
        elif response.status_code == 404:
            raise NotFoundError(error_message, response.status_code, data)
        elif response.status_code >= 500:
            raise ServerError(error_message, response.status_code, data)
        else:
            raise WhatsAppAPIError(error_message, response.status_code, data)

    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        files: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Make HTTP request with retry logic
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint
            data: Request body data
            params: Query parameters
            files: Files to upload
            
        Returns:
            Response data
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = self._get_headers()

        # Remove Content-Type for file uploads
        if files:
            headers.pop("Content-Type", None)

        for attempt in range(self.max_retries):
            try:
                response = requests.request(
                    method=method,
                    url=url,
                    json=data if not files else None,
                    params=params,
                    files=files,
                    headers=headers,
                    timeout=self.timeout,
                )

                return self._handle_response(response)

            except (requests.ConnectionError, requests.Timeout) as e:
                if attempt == self.max_retries - 1:
                    raise WhatsAppAPIError(f"Connection error: {str(e)}")
                
                # Exponential backoff
                time.sleep(2 ** attempt)

            except RateLimitError as e:
                if attempt == self.max_retries - 1:
                    raise
                
                # Wait before retrying on rate limit
                time.sleep(5 * (attempt + 1))

    def get(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Make GET request"""
        return self._request("GET", endpoint, params=params)

    def post(
        self,
        endpoint: str,
        data: Optional[Dict] = None,
        files: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Make POST request"""
        return self._request("POST", endpoint, data=data, files=files)

    def put(self, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Make PUT request"""
        return self._request("PUT", endpoint, data=data)

    def delete(self, endpoint: str) -> Dict[str, Any]:
        """Make DELETE request"""
        return self._request("DELETE", endpoint)

