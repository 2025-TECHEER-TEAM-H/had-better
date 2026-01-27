#!/bin/bash

# 백엔드 테스트 스크립트
# pytest를 사용하여 ASGI 환경에서 테스트 실행

set -e

echo "🧪 테스트 시작..."
echo ""

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "⚠️  .env 파일이 없습니다. .env.example을 복사해주세요."
    exit 1
fi

# pytest 실행
echo "📋 pytest 실행 중..."
pytest --verbose --cov=apps --cov-report=term-missing --cov-report=html

echo ""
echo "✅ 테스트 완료!"
echo ""
echo "📊 커버리지 리포트: htmlcov/index.html"
