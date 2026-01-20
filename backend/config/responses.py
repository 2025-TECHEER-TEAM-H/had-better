"""
공통 API 응답 형식
API 명세서의 응답 형식을 통일하기 위한 유틸리티
"""

from django.utils import timezone
from rest_framework.response import Response


def success_response(data=None, status=200, meta=None):
    """
    성공 응답 형식

    {
        "status": "success",
        "data": { ... },
        "meta": {
            "timestamp": "2026-01-12T19:00:00+09:00"
        }
    }
    """
    response_data = {
        'status': 'success',
        'data': data,
        'meta': {
            'timestamp': timezone.localtime(timezone.now()).isoformat(),
            **(meta or {})
        }
    }
    return Response(response_data, status=status)


def paginated_response(data, page, limit, total_count):
    """
    페이지네이션 응답 형식

    {
        "status": "success",
        "data": [ ... ],
        "meta": {
            "pagination": {
                "page": 1,
                "limit": 20,
                "total_count": 100,
                "total_pages": 5,
                "has_next": true,
                "has_prev": false
            }
        }
    }
    """
    total_pages = (total_count + limit - 1) // limit if limit > 0 else 0

    return success_response(
        data=data,
        meta={
            'pagination': {
                'page': page,
                'limit': limit,
                'total_count': total_count,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            }
        }
    )
