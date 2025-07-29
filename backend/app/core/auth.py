"""
Authentication Middleware
Firebase token validation and user authentication

This module provides authentication middleware for:
- Firebase ID token validation
- User authentication and authorization
- Protected route access control
"""

import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin.exceptions import FirebaseError

from app.services.firebase_service import firebase_service

logger = logging.getLogger(__name__)

# Security scheme for Bearer token authentication
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Validate Firebase ID token and return current user information.

    Args:
        credentials: HTTP Bearer token credentials

    Returns:
        Dict containing user information

    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        # Extract token from Bearer header
        token = credentials.credentials

        # Verify Firebase ID token
        user_info = await firebase_service.verify_id_token(token)

        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get additional user information from Firebase Auth
        user_record = await firebase_service.get_user_by_uid(user_info["uid"])

        if not user_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check if user account is disabled
        if user_record.get("disabled", False):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is disabled",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Return complete user information
        return {
            "uid": user_info["uid"],
            "email": user_info.get("email"),
            "email_verified": user_info.get("email_verified", False),
            "display_name": user_record.get("display_name"),
            "photo_url": user_record.get("photo_url"),
            "disabled": user_record.get("disabled", False),
        }

    except FirebaseError as e:
        logger.error(f"Firebase authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error",
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[dict]:
    """
    Validate Firebase ID token and return current user information (optional).

    This function allows endpoints to work with or without authentication.

    Args:
        credentials: HTTP Bearer token credentials (optional)

    Returns:
        Dict containing user information or None if no token provided
    """
    if not credentials:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


async def require_email_verification(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Require email verification for protected endpoints.

    Args:
        current_user: Current authenticated user

    Returns:
        User information if email is verified

    Raises:
        HTTPException: If email is not verified
    """
    if not current_user.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required",
        )

    return current_user


async def require_active_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Require active user account for protected endpoints.

    Args:
        current_user: Current authenticated user

    Returns:
        User information if account is active

    Raises:
        HTTPException: If account is disabled
    """
    if current_user.get("disabled", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )

    return current_user


def get_user_uid(current_user: dict = Depends(get_current_user)) -> str:
    """
    Extract user UID from current user.

    Args:
        current_user: Current authenticated user

    Returns:
        User UID
    """
    return current_user["uid"]


def get_user_email(
    current_user: dict = Depends(get_current_user),
) -> Optional[str]:
    """
    Extract user email from current user.

    Args:
        current_user: Current authenticated user

    Returns:
        User email or None
    """
    return current_user.get("email")


# Dependency aliases for common use cases
CurrentUser = Depends(get_current_user)
OptionalUser = Depends(get_current_user_optional)
VerifiedUser = Depends(require_email_verification)
ActiveUser = Depends(require_active_user)
UserUID = Depends(get_user_uid)
UserEmail = Depends(get_user_email)
