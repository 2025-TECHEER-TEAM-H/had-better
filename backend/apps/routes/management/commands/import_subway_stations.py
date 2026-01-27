"""
지하철 역 데이터 임포트 커맨드

사용법:
    python manage.py import_subway_stations

CSV 파일 위치:
    backend/docs/서울교통공사_역명_지하철역_검색.csv
"""

import csv
import re
from pathlib import Path

from django.core.management.base import BaseCommand

from apps.routes.models import SubwayStation


class Command(BaseCommand):
    help = "CSV 파일에서 지하철 역 데이터를 DB에 임포트합니다."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="기존 데이터를 삭제하고 새로 임포트합니다.",
        )

    def handle(self, *args, **options):
        # CSV 파일 경로
        csv_path = (
            Path(__file__).resolve().parent.parent.parent.parent.parent
            / "docs"
            / "서울교통공사_역명_지하철역_검색.csv"
        )

        if not csv_path.exists():
            self.stderr.write(
                self.style.ERROR(f"CSV 파일을 찾을 수 없습니다: {csv_path}")
            )
            return

        # 기존 데이터 삭제 옵션
        if options["clear"]:
            deleted_count = SubwayStation.objects.all().delete()[0]
            self.stdout.write(f"기존 데이터 {deleted_count}개 삭제됨")

        # CSV 파일 읽기
        stations_to_create = []
        with open(csv_path, encoding="cp949") as f:
            reader = csv.DictReader(f)

            for row in reader:
                station_code = row.get("전철역코드", "").strip()
                station_name = row.get("전철역명", "").strip()
                line = row.get("호선", "").strip()
                external_code = row.get("외부코드", "").strip()

                if not station_name or not line:
                    continue

                # 호선 번호 추출
                line_numbers = re.findall(r"\d+", line)
                line_num = int(line_numbers[0]) if line_numbers else 0

                # 외부코드 숫자 추출
                ext_numbers = re.findall(r"\d+", external_code)
                external_code_num = int(ext_numbers[0]) if ext_numbers else None

                stations_to_create.append(
                    SubwayStation(
                        station_code=station_code,
                        station_name=station_name,
                        line=line,
                        line_num=line_num,
                        external_code=external_code,
                        external_code_num=external_code_num,
                    )
                )

        # 벌크 생성
        if stations_to_create:
            SubwayStation.objects.bulk_create(stations_to_create, ignore_conflicts=True)
            self.stdout.write(
                self.style.SUCCESS(f"지하철 역 {len(stations_to_create)}개 임포트 완료")
            )

            # 통계 출력
            total = SubwayStation.objects.count()
            lines = SubwayStation.objects.values("line").distinct().count()
            self.stdout.write(f"총 {total}개 역, {lines}개 호선")
        else:
            self.stdout.write(self.style.WARNING("임포트할 데이터가 없습니다."))
