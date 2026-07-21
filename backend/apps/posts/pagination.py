from rest_framework.pagination import PageNumberPagination


class PostSearchPagination(PageNumberPagination):
    """
    Pagination policy for public Post search results.
    """

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50