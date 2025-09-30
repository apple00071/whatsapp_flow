"""
WhatsApp API Platform - Python SDK
Main client module
"""

from .client import WhatsAppAPI
from .exceptions import (
    WhatsAppAPIError,
    AuthenticationError,
    ValidationError,
    RateLimitError,
    NotFoundError,
    ServerError,
)

__version__ = "1.0.0"
__all__ = [
    "WhatsAppAPI",
    "WhatsAppAPIError",
    "AuthenticationError",
    "ValidationError",
    "RateLimitError",
    "NotFoundError",
    "ServerError",
]

