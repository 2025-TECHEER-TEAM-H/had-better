#!/bin/bash

# 백엔드 자동 포매팅 스크립트
# 코드를 자동으로 포맷팅합니다.

set -e

echo "✨ 코드 포매팅 시작..."
echo ""

# isort로 import 정렬
echo "📦 isort로 import 정렬 중..."
isort .
echo "✅ isort 완료"
echo ""

# Black으로 코드 포매팅
echo "📝 Black으로 코드 포매팅 중..."
black .
echo "✅ Black 완료"
echo ""

echo "🎉 코드 포매팅이 완료되었습니다!"
