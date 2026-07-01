from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()

class EmailBackend(ModelBackend):

    def authenticate(self, request, username=None, password=None, **kwargs):

        email = kwargs.get("email",username)

        user = User.objects.filter(email__iexact=email).first()

        if user is None:
            return None

        if user and user.check_password(password):
            if self.user_can_authenticate(user):
                return user
        return None