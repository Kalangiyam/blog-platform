from rest_framework.routers import DefaultRouter

from .views import TagViewSet

app_name = "tags"
router = DefaultRouter()

router.register(r"", TagViewSet, basename="tag")

urlpatterns = router.urls
