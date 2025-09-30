"""
WhatsApp API Platform - Python SDK
Exception classes
"""


class WhatsAppAPIError(Exception):
    """Base exception for WhatsApp API errors"""

    def __init__(self, message, status_code=None, response=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.response = response


class AuthenticationError(WhatsAppAPIError):
    """Raised when authentication fails"""

    pass


class ValidationError(WhatsAppAPIError):
    """Raised when request validation fails"""

    pass


class RateLimitError(WhatsAppAPIError):
    """Raised when rate limit is exceeded"""

    pass


class NotFoundError(WhatsAppAPIError):
    """Raised when resource is not found"""

    pass


class ServerError(WhatsAppAPIError):
    """Raised when server error occurs"""

    pass

