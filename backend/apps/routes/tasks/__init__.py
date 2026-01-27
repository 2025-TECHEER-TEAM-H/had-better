"""
routes 앱 Celery Task 모듈

- bot_simulation: 봇 위치 업데이트 Task (v3 - 동적 주기)
- bus_positions: 버스 실시간 위치 캐싱 Task
"""

from .bot_simulation import update_bot_position
from .bus_positions import fetch_all_bus_positions, get_cached_bus_positions

__all__ = [
    "update_bot_position",
    "fetch_all_bus_positions",
    "get_cached_bus_positions",
]
