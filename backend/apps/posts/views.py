from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response

from apps.posts.models import Post
from apps.posts.serializers import PostCreateSerializer, PostDetailSerializer


class PostViewSet(
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for Post APIs.

    Currently supports:
    - Create Post
    """

    queryset = Post.objects.all()

    serializer_class = PostCreateSerializer

    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        """
        Return the appropriate serializer for the current action.
        """

        if self.action == "create":
            return PostCreateSerializer

        return PostDetailSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create a post and return its detailed representation.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        post = serializer.save()

        response_serializer = PostDetailSerializer(
            post,
            context=self.get_serializer_context(),
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )