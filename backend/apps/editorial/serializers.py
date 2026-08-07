from django.utils.text import slugify
from rest_framework import serializers

from apps.categories.models import Category
from apps.comments.models import Comment
from apps.posts.choices import PostStatus
from apps.posts.models import Post
from apps.tags.models import Tag
from django.contrib.auth import get_user_model

User = get_user_model()


class EditorialUserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email")
        read_only_fields = fields


class EditorialPostFilterSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=PostStatus.choices,
        required=False,
        allow_null=True,
    )
    is_deleted = serializers.BooleanField(
        required=False,
        allow_null=True,
    )


class EditorialPostCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")


class EditorialPostTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name", "slug")


class EditorialPostListSerializer(serializers.ModelSerializer):
    author = EditorialUserSummarySerializer(read_only=True)
    categories = EditorialPostCategorySerializer(many=True, read_only=True)
    tags = EditorialPostTagSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "status",
            "is_deleted",
            "author",
            "categories",
            "tags",
            "published_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class CategoryManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "created_at", "updated_at")

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Category name cannot be blank.")

        qs = Category.all_objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError("A category with this name already exists.")

        return value

    def create(self, validated_data):
        validated_data["slug"] = slugify(validated_data["name"])
        return Category.objects.create(**validated_data)


class TagManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = (
            "id",
            "name",
            "slug",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "created_at", "updated_at")

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Tag name cannot be blank.")

        qs = Tag.all_objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError("A tag with this name already exists.")

        return value

    def create(self, validated_data):
        validated_data["slug"] = slugify(validated_data["name"])
        return Tag.objects.create(**validated_data)


class CommentModerationListSerializer(serializers.ModelSerializer):
    author = EditorialUserSummarySerializer(read_only=True)
    post_slug = serializers.CharField(source="post.slug", read_only=True)
    post_title = serializers.CharField(source="post.title", read_only=True)

    class Meta:
        model = Comment
        fields = (
            "id",
            "content",
            "author",
            "post_slug",
            "post_title",
            "is_deleted",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
