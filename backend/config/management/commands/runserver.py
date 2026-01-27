"""
커스텀 runserver 명령어
python manage.py runserver 실행 시 uvicorn으로 ASGI 서버 자동 시작
"""

import sys

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Uvicorn ASGI 서버 실행 (SSE 지원)"

    def add_arguments(self, parser):
        parser.add_argument(
            "addrport",
            nargs="?",
            default="127.0.0.1:8000",
            help="호스트:포트 (기본값: 127.0.0.1:8000)",
        )
        parser.add_argument(
            "--noreload",
            action="store_false",
            dest="use_reloader",
            default=True,
            help="자동 재시작 비활성화",
        )

    def handle(self, *args, **options):
        addrport = options["addrport"]
        use_reloader = options["use_reloader"]

        # 호스트:포트 파싱
        if ":" in addrport:
            host, port = addrport.split(":")
        else:
            host = "127.0.0.1"
            port = addrport

        self.stdout.write(
            self.style.SUCCESS(
                f"Starting HAD BETTER Backend Server with Uvicorn...\n"
                f"Server: http://{host}:{port}\n"
                f"Swagger: http://{host}:{port}/api/docs/\n"
            )
        )

        # uvicorn 실행
        try:
            import uvicorn
        except ImportError:
            self.stdout.write(
                self.style.ERROR(
                    "uvicorn이 설치되지 않았습니다. 'pip install uvicorn' 실행 필요"
                )
            )
            sys.exit(1)

        uvicorn.run(
            "config.asgi:application",
            host=host,
            port=int(port),
            reload=use_reloader,
            log_level="info",
        )
