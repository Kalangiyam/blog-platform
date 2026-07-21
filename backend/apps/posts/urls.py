from rest_framework.routers import DefaultRouter
from django.urls import include, path

from .views import PostViewSet, PostSearchAPIView

app_name = "posts"

router = DefaultRouter()
router.register(
    r"",
    PostViewSet,
    basename="post",
)

urlpatterns = [
    path(
        "search/",
        PostSearchAPIView.as_view(),
        name="post-search",
    ),
    path(
        "",
        include(router.urls),
    ),
]