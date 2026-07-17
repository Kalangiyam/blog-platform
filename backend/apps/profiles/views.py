from rest_framework.generics import RetrieveAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.profiles.models import Profile
from apps.profiles.serializers import (
    ProfileSerializer,
    ProfileUpdateSerializer,
    PublicProfileSerializer,
)


class CurrentUserProfileAPIView(RetrieveUpdateAPIView):
    """
    Retrieve or partially update the authenticated user's Profile.

    The Profile is selected from request.user, preventing clients from
    selecting or modifying another user's Profile.
    """

    permission_classes = (IsAuthenticated,)
    http_method_names = (
        "get",
        "patch",
        "head",
        "options",
    )

    def get_queryset(self):
        """
        Load the related User in the same database query.
        """
        return Profile.objects.select_related("user")

    def get_object(self):
        """
        Return the authenticated user's Profile.
        """
        return self.get_queryset().get(user=self.request.user)

    def get_serializer_class(self):
        """
        Use a dedicated serializer for Profile updates.
        """
        if self.request.method == "PATCH":
            return ProfileUpdateSerializer

        return ProfileSerializer

    def update(self, request, *args, **kwargs):
        """
        Update Profile fields and return the complete private representation.
        """
        profile = self.get_object()

        write_serializer = ProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=True,
            context=self.get_serializer_context(),
        )
        write_serializer.is_valid(raise_exception=True)
        write_serializer.save()

        read_serializer = ProfileSerializer(
            profile,
            context=self.get_serializer_context(),
        )
        return Response(read_serializer.data)


class PublicProfileAPIView(RetrieveAPIView):
    """
    Return the safe public Profile representation identified by username.
    """

    serializer_class = PublicProfileSerializer
    permission_classes = (AllowAny,)
    lookup_field = "user__username"
    lookup_url_kwarg = "username"

    def get_queryset(self):
        """
        Load the related User in the same database query.
        """
        return Profile.objects.select_related("user")