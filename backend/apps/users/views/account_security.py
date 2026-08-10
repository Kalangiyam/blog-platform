from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

from apps.users.serializers.account_security import (
    EmailVerifyConfirmSerializer,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
)
from apps.users.services.account_security import (
    SessionRevocationError,
    change_user_password,
    confirm_email_verification,
    confirm_password_reset,
    request_password_reset,
    send_email_verification,
)


SECURITY_UPDATE_UNAVAILABLE_DETAIL = (
    "Unable to complete the security update. Please try again."
)


def security_update_unavailable_response():
    """Return the safe HTTP representation of a revocation-layer failure."""
    return Response(
        {"detail": SECURITY_UPDATE_UNAVAILABLE_DETAIL},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )


class PasswordResetRateThrottle(AnonRateThrottle):
    scope = "password_reset"


class EmailVerifySendRateThrottle(UserRateThrottle):
    scope = "email_verify_send"


class PasswordChangeAPIView(generics.GenericAPIView):
    serializer_class = PasswordChangeSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            change_user_password(
                user=request.user,
                current_password=serializer.validated_data["current_password"],
                new_password=serializer.validated_data["new_password"],
            )
        except SessionRevocationError:
            return security_update_unavailable_response()

        return Response(
            {"detail": "Password updated successfully. Please log in with your new password."},
            status=status.HTTP_200_OK,
        )


class PasswordResetRequestAPIView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        request_password_reset(email=serializer.validated_data["email"])

        return Response(
            {
                "detail": "If an active account with that email exists, password reset instructions have been sent."
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmAPIView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            confirm_password_reset(
                uidb64=serializer.validated_data["uid"],
                token=serializer.validated_data["token"],
                new_password=serializer.validated_data["new_password"],
            )
        except SessionRevocationError:
            return security_update_unavailable_response()

        return Response(
            {"detail": "Password has been reset successfully. Please log in with your new password."},
            status=status.HTTP_200_OK,
        )


class EmailVerifySendAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [EmailVerifySendRateThrottle]

    def post(self, request, *args, **kwargs):
        if request.user.is_email_verified:
            return Response(
                {"detail": "Email address is already verified."},
                status=status.HTTP_200_OK,
            )

        send_email_verification(user=request.user)

        return Response(
            {"detail": "Verification email has been sent successfully."},
            status=status.HTTP_200_OK,
        )


class EmailVerifyConfirmAPIView(generics.GenericAPIView):
    serializer_class = EmailVerifyConfirmSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = confirm_email_verification(
            uidb64=serializer.validated_data["uid"],
            token=serializer.validated_data["token"],
        )

        return Response(
            {
                "detail": "Email address verified successfully.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_email_verified": user.is_email_verified,
                },
            },
            status=status.HTTP_200_OK,
        )
