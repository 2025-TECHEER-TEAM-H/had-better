"""
Celery 설정
"""

import os

from celery import Celery

# Django 설정 모듈 지정
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Celery 앱 생성
app = Celery("hadbetter")

# Django 설정에서 Celery 관련 설정 로드
app.config_from_object("django.conf:settings", namespace="CELERY")

# 등록된 앱에서 tasks.py 자동 검색
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """디버그용 태스크"""
    print(f"Request: {self.request!r}")
