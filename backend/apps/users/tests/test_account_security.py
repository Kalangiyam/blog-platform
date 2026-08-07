from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import TestCase
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APIClient

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
