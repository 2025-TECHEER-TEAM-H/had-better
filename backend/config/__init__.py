"""
config 패키지 초기화
Django가 시작될 때 Celery 앱이 로드되도록 함
"""

try:
    from .celery import app as celery_app

    __all__ = ("celery_app",)
except ImportError:
    # celery가 설치되지 않은 경우 (마이그레이션 등에서)
    pass
