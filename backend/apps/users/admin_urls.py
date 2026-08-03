from rest_framework.routers import SimpleRouter

from apps.users.views import UserAdministrationViewSet

app_name = "user_administration"

router = SimpleRouter()
router.register(
    "",
    UserAdministrationViewSet,
    basename="admin-user",
)

urlpatterns = router.urls