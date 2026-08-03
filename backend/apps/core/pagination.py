from rest_framework.pagination import PageNumberPagination


class StandardPageNumberPagination(PageNumberPagination):
    """
    Provide bounded page-number pagination for standard collection APIs.

    Clients may request a custom page size through the ``page_size`` query
    parameter, but the maximum remains capped to protect server resources and
    keep API responses predictable.
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100