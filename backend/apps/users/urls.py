from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)

from apps.users.views import (
    LoginAPIView,
    LogoutAPIView,
    UserAPIView,
)
from apps.users.views.account_security import (
    EmailVerifyConfirmAPIView,
    EmailVerifySendAPIView,
    PasswordChangeAPIView,
    PasswordResetConfirmAPIView,
    PasswordResetRequestAPIView,
)

app_name = "users"

urlpatterns = [
    path(
        "login/",
        LoginAPIView.as_view(),
        name="login",
    ),
    path(
        "me/",
        UserAPIView.as_view(),
        name="me",
    ),
    path(
        "logout/",
        LogoutAPIView.as_view(),
        name="logout",
    ),
    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path(
        "token/verify/",
        TokenVerifyView.as_view(),
        name="token_verify",
    ),
    path(
        "password/change/",
        PasswordChangeAPIView.as_view(),
        name="password_change",
    ),
    path(
        "password/reset/",
        PasswordResetRequestAPIView.as_view(),
        name="password_reset_request",
    ),
    path(
        "password/reset/confirm/",
        PasswordResetConfirmAPIView.as_view(),
        name="password_reset_confirm",
    ),
    path(
        "email/verify/send/",
        EmailVerifySendAPIView.as_view(),
        name="email_verify_send",
    ),
    path(
        "email/verify/confirm/",
        EmailVerifyConfirmAPIView.as_view(),
        name="email_verify_confirm",
    ),
]
