from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.users.serializers import (
    LoginSerializer,
    LogoutSerializer,
    UserSerializer,
)


class LoginAPIView(generics.GenericAPIView):
    """
    Authenticate a user and return JWT access and refresh tokens.
    """

    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """
        Validate credentials and return authentication tokens.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        tokens = serializer.get_tokens(user)

        return Response(
            {
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            },
            status=status.HTTP_200_OK,
        )


class UserAPIView(generics.RetrieveAPIView):
    """
    Return the currently authenticated user's account information.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """
        Return the user resolved by JWT authentication.
        """
        return self.request.user


class LogoutAPIView(generics.GenericAPIView):
    """
    Blacklist a submitted JWT refresh token.
    """

    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Validate and blacklist the submitted refresh token.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(
            {
                "detail": "Successfully logged out.",
            },
            status=status.HTTP_200_OK,
        )