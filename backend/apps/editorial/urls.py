from rest_framework.routers import DefaultRouter

from apps.editorial.views import (
    EditorialCategoryViewSet,
    EditorialCommentViewSet,
    EditorialPostViewSet,
    EditorialTagViewSet,
)

app_name = "editorial"

router = DefaultRouter()
router.register(r"posts", EditorialPostViewSet, basename="editorial-post")
router.register(r"categories", EditorialCategoryViewSet, basename="editorial-category")
router.register(r"tags", EditorialTagViewSet, basename="editorial-tag")
router.register(r"comments", EditorialCommentViewSet, basename="editorial-comment")

urlpatterns = router.urls
