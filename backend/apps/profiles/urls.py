from django.urls import path

from apps.profiles.views import (
    CurrentUserProfileAPIView,
    PublicProfileAPIView,
)


app_name = "profiles"


urlpatterns = [
    path(
        "profile/",
        CurrentUserProfileAPIView.as_view(),
        name="current-user-profile",
    ),
    path(
        "users/<str:username>/profile/",
        PublicProfileAPIView.as_view(),
        name="public-user-profile",
    ),
]