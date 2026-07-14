from django.db.models import Model
from rest_framework import serializers


class TaxonomyAssignmentMixin:
    """
    Provide reusable validation for slug-based taxonomy assignment.

    The serializer remains responsible for selecting the taxonomy model
    and providing user-facing validation messages.
    """

    def validate_taxonomy_slugs(
        self,
        slugs: list[str],
        *,
        model: type[Model],
        duplicate_error: str,
        invalid_error: str,
    ) -> list[Model]:
        """
        Validate taxonomy slugs and return matching active model instances.

        Args:
            slugs:
                Slugs supplied by the API client.

            model:
                Taxonomy model to query, such as Category or Tag.

            duplicate_error:
                Validation message returned when duplicate slugs are supplied.

            invalid_error:
                Validation message returned when one or more slugs do not
                identify an active taxonomy record.

        Returns:
            Active taxonomy model instances matching the submitted slugs.
        """

        if not slugs:
            return []

        if len(slugs) != len(set(slugs)):
            raise serializers.ValidationError(duplicate_error)

        objects = list(
            model.objects.filter(
                slug__in=slugs,
            )
        )

        if len(objects) != len(slugs):
            raise serializers.ValidationError(invalid_error)

        return objects