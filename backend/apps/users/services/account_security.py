from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework.exceptions import ValidationError

from apps.users.tokens import email_verification_token_generator

User = get_user_model()


def revoke_user_outstanding_tokens(user):
    """
    Blacklist all outstanding Simple JWT refresh tokens for the given user.
    """
    try:
        from rest_framework_simplejwt.token_blacklist.models import (
            BlacklistedToken,
            OutstandingToken,
        )
        tokens = OutstandingToken.objects.filter(user=user)
        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)
    except Exception:
        # Simple JWT token_blacklist app may not be in INSTALLED_APPS or table empty
        pass


def change_user_password(user, current_password, new_password):
    """
    Validate current password, set new password, and revoke user sessions.
    """
    if not user.check_password(current_password):
        raise ValidationError({"current_password": ["Incorrect current password."]})

    user.set_password(new_password)
    user.save()
    revoke_user_outstanding_tokens(user)


def request_password_reset(email):
    """
    Generate and dispatch a password reset email if active user exists with email.
    Always returns generic success to prevent account enumeration.
    """
    email = email.strip().lower()
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return

    # Do not send password-reset links to inactive users
    if not user.is_active:
        return

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    frontend_url = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")
    reset_link = f"{frontend_url}/reset-password/{uid}/{token}"

    subject = "Password Reset Instructions - Blog Platform"
    message = (
        f"Hello {user.username},\n\n"
        f"You requested a password reset for your account.\n"
        f"Please click the link below to set a new password:\n\n"
        f"{reset_link}\n\n"
        f"If you did not request this change, please ignore this email.\n"
    )
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@blogplatform.local")

    send_mail(
        subject=subject,
        message=message,
        from_email=from_email,
        recipient_list=[user.email],
        fail_silently=False,
    )


def confirm_password_reset(uidb64, token, new_password):
    """
    Verify password reset token and update user password if valid.
    """
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        raise ValidationError({"token": ["Invalid or expired password reset token."]})

    if not user.is_active:
        raise ValidationError({"token": ["Account is inactive."]})

    if not default_token_generator.check_token(user, token):
        raise ValidationError({"token": ["Invalid or expired password reset token."]})

    user.set_password(new_password)
    user.save()
    revoke_user_outstanding_tokens(user)


def send_email_verification(user):
    """
    Dispatch an email verification link to an authenticated user.
    """
    if user.is_email_verified:
        return

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_verification_token_generator.make_token(user)

    frontend_url = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")
    verification_link = f"{frontend_url}/verify-email/{uid}/{token}"

    subject = "Verify Your Email Address - Blog Platform"
    message = (
        f"Hello {user.username},\n\n"
        f"Please click the link below to verify your email address:\n\n"
        f"{verification_link}\n\n"
        f"If you did not create this account, please ignore this email.\n"
    )
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@blogplatform.local")

    send_mail(
        subject=subject,
        message=message,
        from_email=from_email,
        recipient_list=[user.email],
        fail_silently=False,
    )


def confirm_email_verification(uidb64, token):
    """
    Validate email verification token and update is_email_verified state.
    """
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        raise ValidationError({"token": ["Invalid or expired verification token."]})

    if user.is_email_verified:
        return user

    if not email_verification_token_generator.check_token(user, token):
        raise ValidationError({"token": ["Invalid or expired verification token."]})

    user.is_email_verified = True
    user.save(update_fields=["is_email_verified"])
    return user
