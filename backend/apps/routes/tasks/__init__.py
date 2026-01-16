"""
routes 앱 Celery Task 모듈

- bot_simulation: 봇 위치 업데이트 Task (v3 - 동적 주기)
"""

from .bot_simulation import update_bot_position

__all__ = [
    "update_bot_position",
]
