from django.conf import settings
from django.core.signing import BadSignature, SignatureExpired, TimestampSigner
from django.utils.crypto import constant_time_compare


class EmailVerificationTokenGenerator:
    """
    Strategy for generating and validating dedicated, purpose-specific
    one-time email verification tokens. Uses TimestampSigner with a distinct salt.
    """

    salt = "apps.users.tokens.EmailVerificationTokenGenerator"

    def make_token(self, user):
        """
        Generate a signed email verification token encoding user id and email state.
        """
        if not user or not user.pk:
            return ""
        
        signer = TimestampSigner(salt=self.salt)
        value = f"{user.pk}:{user.email}:{user.is_email_verified}:{user.password[:10]}"
        return signer.sign(value)

    def check_token(self, user, token):
        """
        Validate signed token against the user state and EMAIL_VERIFICATION_TIMEOUT.
        Returns True if valid, False if expired, malformed, or state modified.
        """
        if not user or not user.pk or not token:
            return False

        signer = TimestampSigner(salt=self.salt)
        max_age = getattr(settings, "EMAIL_VERIFICATION_TIMEOUT", 86400)

        try:
            unsigned_value = signer.unsign(token, max_age=max_age)
        except (SignatureExpired, BadSignature):
            return False

        expected_value = f"{user.pk}:{user.email}:{user.is_email_verified}:{user.password[:10]}"
        return constant_time_compare(unsigned_value, expected_value)


email_verification_token_generator = EmailVerificationTokenGenerator()
