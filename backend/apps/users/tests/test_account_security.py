from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.db import DatabaseError
from django.test import TestCase
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch

from apps.users.tokens import email_verification_token_generator

User = get_user_model()


class AccountSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="OldPassword123!",
            is_email_verified=False,
        )
        self.inactive_user = User.objects.create_user(
            username="inactiveuser",
            email="inactive@example.com",
            password="Password123!",
            is_active=False,
        )

    def test_password_change_success(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("users:password_change")
        response = self.client.post(
            url,
            {
                "current_password": "OldPassword123!",
                "new_password": "NewPassword123!",
                "confirm_password": "NewPassword123!",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewPassword123!"))

    def test_password_change_incorrect_current_password(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("users:password_change")
        response = self.client.post(
            url,
            {
                "current_password": "WrongPassword123!",
                "new_password": "NewPassword123!",
                "confirm_password": "NewPassword123!",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("current_password", response.data)

    def test_password_reset_request_generic_response(self):
        url = reverse("users:password_reset_request")
        response = self.client.post(url, {"email": "test@example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

    def test_password_reset_request_inactive_user_does_not_send_email(self):
        url = reverse("users:password_reset_request")
        response = self.client.post(url, {"email": "inactive@example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_password_reset_confirm_success(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        url = reverse("users:password_reset_confirm")
        response = self.client.post(
            url,
            {
                "uid": uid,
                "token": token,
                "new_password": "ResetPassword123!",
                "confirm_password": "ResetPassword123!",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("ResetPassword123!"))

    def test_email_verification_send_and_confirm(self):
        self.client.force_authenticate(user=self.user)
        send_url = reverse("users:email_verify_send")
        response = self.client.post(send_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = email_verification_token_generator.make_token(self.user)
        self.client.logout()

        confirm_url = reverse("users:email_verify_confirm")
        confirm_resp = self.client.post(confirm_url, {"uid": uid, "token": token})
        self.assertEqual(confirm_resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_email_verified)

    def test_cross_purpose_token_rejection(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        pw_token = default_token_generator.make_token(self.user)
        confirm_url = reverse("users:email_verify_confirm")
        response = self.client.post(confirm_url, {"uid": uid, "token": pw_token})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("token", response.data)

    def test_password_change_blacklists_multiple_refresh_tokens_and_old_refreshes_fail(self):
        old_refreshes = [str(RefreshToken.for_user(self.user)) for _ in range(2)]
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            reverse("users:password_change"),
            {
                "current_password": "OldPassword123!",
                "new_password": "NewPassword123!",
                "confirm_password": "NewPassword123!",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        outstanding = OutstandingToken.objects.filter(user=self.user)
        self.assertEqual(outstanding.count(), 2)
        self.assertEqual(
            BlacklistedToken.objects.filter(token__in=outstanding).count(),
            2,
        )

        refresh_url = reverse("users:token_refresh")
        for refresh in old_refreshes:
            with self.subTest(refresh=refresh[-8:]):
                refresh_response = APIClient().post(
                    refresh_url,
                    {"refresh": refresh},
                )
                self.assertEqual(
                    refresh_response.status_code,
                    status.HTTP_401_UNAUTHORIZED,
                )

        login_response = APIClient().post(
            reverse("users:login"),
            {"email": self.user.email, "password": "NewPassword123!"},
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

    def test_password_reset_blacklists_outstanding_refresh_token(self):
        old_refresh = str(RefreshToken.for_user(self.user))
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post(
            reverse("users:password_reset_confirm"),
            {
                "uid": uid,
                "token": token,
                "new_password": "ResetPassword123!",
                "confirm_password": "ResetPassword123!",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        outstanding = OutstandingToken.objects.get(user=self.user)
        self.assertTrue(
            BlacklistedToken.objects.filter(token=outstanding).exists()
        )
        refresh_response = APIClient().post(
            reverse("users:token_refresh"),
            {"refresh": old_refresh},
        )
        self.assertEqual(
            refresh_response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_partial_revocation_failure_rolls_back_password_and_all_blacklists(self):
        RefreshToken.for_user(self.user)
        RefreshToken.for_user(self.user)
        original_get_or_create = BlacklistedToken.objects.get_or_create
        calls = 0

        def fail_second_blacklist(*args, **kwargs):
            nonlocal calls
            calls += 1
            if calls == 2:
                raise DatabaseError("simulated blacklist write failure")
            return original_get_or_create(*args, **kwargs)

        self.client.force_authenticate(user=self.user)
        with self.assertLogs(
            "apps.users.services.account_security",
            level="ERROR",
        ) as logs, patch(
            "apps.users.services.account_security.BlacklistedToken.objects.get_or_create",
            side_effect=fail_second_blacklist,
        ):
            response = self.client.post(
                reverse("users:password_change"),
                {
                    "current_password": "OldPassword123!",
                    "new_password": "NewPassword123!",
                    "confirm_password": "NewPassword123!",
                },
            )

        self.assertEqual(
            response.status_code,
            status.HTTP_503_SERVICE_UNAVAILABLE,
        )
        self.assertEqual(
            response.data,
            {"detail": "Unable to complete the security update. Please try again."},
        )
        self.assertNotIn("simulated blacklist", str(response.data))
        self.assertTrue(
            any(
                "session_revocation_failed operation=password_change"
                in message
                for message in logs.output
            )
        )
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("OldPassword123!"))
        self.assertFalse(self.user.check_password("NewPassword123!"))
        self.assertEqual(
            BlacklistedToken.objects.filter(token__user=self.user).count(),
            0,
        )

    def test_password_reset_revocation_failure_rolls_back_and_same_token_can_retry(self):
        RefreshToken.for_user(self.user)
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        payload = {
            "uid": uid,
            "token": token,
            "new_password": "ResetPassword123!",
            "confirm_password": "ResetPassword123!",
        }

        with patch(
            "apps.users.services.account_security.BlacklistedToken.objects.get_or_create",
            side_effect=DatabaseError("simulated reset revocation failure"),
        ):
            failed_response = self.client.post(
                reverse("users:password_reset_confirm"),
                payload,
            )

        self.assertEqual(
            failed_response.status_code,
            status.HTTP_503_SERVICE_UNAVAILABLE,
        )
        self.assertNotIn("simulated", str(failed_response.data))
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("OldPassword123!"))
        self.assertEqual(
            BlacklistedToken.objects.filter(token__user=self.user).count(),
            0,
        )

        retry_response = self.client.post(
            reverse("users:password_reset_confirm"),
            payload,
        )
        self.assertEqual(retry_response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("ResetPassword123!"))
        self.assertEqual(
            BlacklistedToken.objects.filter(token__user=self.user).count(),
            1,
        )

    def test_existing_access_token_remains_valid_until_expiry_after_password_change(self):
        token_pair = RefreshToken.for_user(self.user)
        access_token = str(token_pair.access_token)
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            reverse("users:password_change"),
            {
                "current_password": "OldPassword123!",
                "new_password": "NewPassword123!",
                "confirm_password": "NewPassword123!",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        access_client = APIClient()
        access_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        me_response = access_client.get(reverse("users:me"))
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
