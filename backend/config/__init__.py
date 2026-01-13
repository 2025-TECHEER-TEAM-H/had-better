"""
config 패키지 초기화
Django가 시작될 때 Celery 앱이 로드되도록 함
"""

from .celery import app as celery_app

__all__ = ('celery_app',)
