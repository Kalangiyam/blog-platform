class PostFeaturedImageRepresentationMixin:
    """
    Provide shared featured-image URL generation.
    """

    def get_featured_image_url(self, obj):
        """
        Return an absolute featured-image URL or None.
        """

        if not obj.featured_image:
            return None

        request = self.context.get("request")

        if request is None:
            return obj.featured_image.url

        return request.build_absolute_uri(
            obj.featured_image.url
        )