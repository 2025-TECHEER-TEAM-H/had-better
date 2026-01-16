"""
RabbitMQ 클라이언트 (SSE Pub/Sub)

역할:
- Fanout Exchange를 통한 SSE 이벤트 발행
- SSE View에서 이벤트 구독 (Generator)
- 메시지 유실 없이 모든 클라이언트에게 전달
"""

import json
from contextlib import contextmanager
from typing import Generator, Optional

import pika
from pika.exceptions import AMQPConnectionError
from django.conf import settings


class RabbitMQClient:
    """RabbitMQ 클라이언트 (SSE Pub/Sub)"""

    def __init__(self):
        self.host = settings.RABBITMQ_HOST
        self.port = settings.RABBITMQ_PORT
        self.user = settings.RABBITMQ_USER
        self.password = settings.RABBITMQ_PASSWORD

    def _get_connection_parameters(self) -> pika.ConnectionParameters:
        """RabbitMQ 연결 파라미터 생성"""
        credentials = pika.PlainCredentials(self.user, self.password)
        return pika.ConnectionParameters(
            host=self.host,
            port=self.port,
            credentials=credentials,
            heartbeat=600,
            blocked_connection_timeout=300,
        )

    @contextmanager
    def get_connection(self) -> Generator[pika.BlockingConnection, None, None]:
        """
        RabbitMQ 연결 컨텍스트 매니저

        Usage:
            with rabbitmq_client.get_connection() as connection:
                channel = connection.channel()
                # ... 작업 수행
        """
        connection = pika.BlockingConnection(self._get_connection_parameters())
        try:
            yield connection
        finally:
            if connection.is_open:
                connection.close()

    def _get_exchange_name(self, route_itinerary_id: int) -> str:
        """
        SSE용 Exchange 이름 생성

        같은 경주(route_itinerary)의 모든 참가자가 같은 Exchange 사용

        Args:
            route_itinerary_id: 경로 탐색 결과 ID

        Returns:
            Exchange 이름 (예: sse_events_101)
        """
        return f"sse_events_{route_itinerary_id}"

    # =========================================================================
    # 이벤트 발행 (Publisher)
    # =========================================================================

    def publish(
        self, route_itinerary_id: int, event_type: str, data: dict
    ) -> bool:
        """
        SSE 이벤트 발행

        Args:
            route_itinerary_id: 경로 탐색 결과 ID
            event_type: 이벤트 타입 (bot_status_update, bot_boarding 등)
            data: 이벤트 데이터

        Returns:
            발행 성공 여부
        """
        try:
            with self.get_connection() as connection:
                channel = connection.channel()

                exchange_name = self._get_exchange_name(route_itinerary_id)

                # Fanout Exchange 선언
                channel.exchange_declare(
                    exchange=exchange_name,
                    exchange_type="fanout",
                    durable=False,
                    auto_delete=True,  # 모든 Queue가 삭제되면 Exchange도 삭제
                )

                message = {"event": event_type, "data": data}

                channel.basic_publish(
                    exchange=exchange_name,
                    routing_key="",  # fanout은 routing_key 무시
                    body=json.dumps(message, ensure_ascii=False),
                )

                return True

        except AMQPConnectionError:
            return False

    # =========================================================================
    # 이벤트 구독 (Subscriber)
    # =========================================================================

    def subscribe(
        self, route_itinerary_id: int, timeout: int = 30
    ) -> Generator[Optional[dict], None, None]:
        """
        SSE 이벤트 구독 (Generator)

        Args:
            route_itinerary_id: 경로 탐색 결과 ID
            timeout: 메시지 대기 타임아웃 (초, heartbeat용)

        Yields:
            이벤트 딕셔너리 { "event": str, "data": dict } 또는 None (heartbeat)

        Usage:
            for event in rabbitmq_client.subscribe(route_itinerary_id):
                if event is None:
                    yield "event: heartbeat\\ndata: {}\\n\\n"
                else:
                    event_type = event['event']
                    data = event['data']
                    yield f"event: {event_type}\\ndata: {json.dumps(data)}\\n\\n"
        """
        try:
            with self.get_connection() as connection:
                channel = connection.channel()

                exchange_name = self._get_exchange_name(route_itinerary_id)

                # Exchange 선언
                channel.exchange_declare(
                    exchange=exchange_name,
                    exchange_type="fanout",
                    durable=False,
                    auto_delete=True,
                )

                # 임시 Queue 생성 (클라이언트별 독립)
                # exclusive=True: 이 연결에서만 사용, 연결 끊기면 Queue 삭제
                result = channel.queue_declare(queue="", exclusive=True)
                queue_name = result.method.queue

                # Exchange에 바인딩
                channel.queue_bind(exchange=exchange_name, queue=queue_name)

                # 메시지 수신
                for method, properties, body in channel.consume(
                    queue_name, inactivity_timeout=timeout
                ):
                    if body:
                        message = json.loads(body)
                        yield message

                        # 경주 종료 시 구독 종료
                        if message.get("event") == "route_ended":
                            break
                    else:
                        # Heartbeat (타임아웃 시 None 반환)
                        yield None

        except AMQPConnectionError:
            # 연결 오류 시 에러 이벤트 반환 후 종료
            yield {"event": "error", "data": {"message": "RabbitMQ 연결 실패"}}

    # =========================================================================
    # Exchange 관리
    # =========================================================================

    def delete_exchange(self, route_itinerary_id: int) -> bool:
        """
        Exchange 삭제 (경주 종료 시)

        Args:
            route_itinerary_id: 경로 탐색 결과 ID

        Returns:
            삭제 성공 여부
        """
        try:
            with self.get_connection() as connection:
                channel = connection.channel()
                exchange_name = self._get_exchange_name(route_itinerary_id)
                channel.exchange_delete(exchange=exchange_name)
                return True
        except AMQPConnectionError:
            return False

    # =========================================================================
    # 연결 테스트
    # =========================================================================

    def ping(self) -> bool:
        """RabbitMQ 연결 테스트"""
        try:
            with self.get_connection() as connection:
                return connection.is_open
        except AMQPConnectionError:
            return False


# 싱글톤 인스턴스
rabbitmq_client = RabbitMQClient()
