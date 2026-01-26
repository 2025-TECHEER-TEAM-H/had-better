#!/bin/bash

# 백엔드 린트 스크립트
# CI와 동일한 검사를 로컬에서 실행합니다.

set -e

echo "🔍 린트 검사 시작..."
echo ""

# Black 포매팅 검사
echo "📝 Black 포매팅 검사 중..."
black --check --diff .
echo "✅ Black 통과"
echo ""

# isort import 정렬 검사
echo "📦 isort import 정렬 검사 중..."
isort --check-only --diff .
echo "✅ isort 통과"
echo ""

# flake8 린트 검사
echo "🔎 flake8 린트 검사 중..."
flake8 .
echo "✅ flake8 통과"
echo ""

echo "✨ 모든 린트 검사를 통과했습니다!"
