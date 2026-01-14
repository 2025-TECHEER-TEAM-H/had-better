"""
사용자 및 인증 관련 View
"""

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from config.responses import success_response

from .models import PlaceSearchHistory
from .serializers import (
    LoginSerializer,
    LogoutSerializer,
    PlaceSearchHistorySerializer,
    RegisterSerializer,
    TokenRefreshSerializer,
    UserSerializer,
    UserUpdateSerializer,
)


@extend_schema_view(
    post=extend_schema(
        summary='회원가입',
        description='새로운 사용자를 등록하고 JWT 토큰을 발급합니다.',
        tags=['인증'],
        request=RegisterSerializer,
        responses={201: None}
    )
)
class RegisterView(APIView):
    """
    회원가입 API

    POST /api/v1/auth/register
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        return success_response(
            data={
                'user': UserSerializer(result['user']).data,
                'tokens': result['tokens']
            },
            status=status.HTTP_201_CREATED
        )


@extend_schema_view(
    post=extend_schema(
        summary='로그인',
        description='유저 ID와 비밀번호로 로그인하고 JWT 토큰을 발급합니다.',
        tags=['인증'],
        request=LoginSerializer,
        responses={200: None}
    )
)
class LoginView(APIView):
    """
    로그인 API

    POST /api/v1/auth/login
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        return success_response(
            data={
                'user': UserSerializer(result['user']).data,
                'tokens': result['tokens']
            },
            status=status.HTTP_200_OK
        )


@extend_schema_view(
    post=extend_schema(
        summary='토큰 갱신',
        description='Refresh Token으로 새로운 Access Token을 발급합니다.',
        tags=['인증'],
        request=TokenRefreshSerializer,
        responses={200: None}
    )
)
class TokenRefreshView(APIView):
    """
    토큰 갱신 API

    POST /api/v1/auth/refresh
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return success_response(
            data={
                'access': serializer.validated_data['access']
            },
            status=status.HTTP_200_OK
        )


@extend_schema_view(
    post=extend_schema(
        summary='로그아웃',
        description='Refresh Token을 블랙리스트에 추가하여 무효화합니다.',
        tags=['인증'],
        request=LogoutSerializer,
        responses={200: None}
    )
)
class LogoutView(APIView):
    """
    로그아웃 API

    POST /api/v1/auth/logout
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return success_response(
            data={
                'message': '로그아웃 되었습니다.'
            },
            status=status.HTTP_200_OK
        )


# ============================================
# Claude Code 구현 - 내 정보 조회/수정 API
# ============================================
# [학습 포인트]
# 1. APIView: DRF의 클래스 기반 뷰 (GET, POST, PATCH 등 HTTP 메서드별로 함수 정의)
# 2. permission_classes = [IsAuthenticated]: JWT 토큰 필수 (로그인한 사용자만 접근)
# 3. request.user: JWT 토큰에서 자동으로 추출된 현재 로그인 사용자 객체
# 4. partial=True: PATCH 요청 시 일부 필드만 수정 가능하게 함
# 5. extend_schema_view: Swagger 문서 자동 생성용 데코레이터
# ============================================
@extend_schema_view(
    get=extend_schema(
        summary='내 정보 조회',
        description='현재 로그인한 사용자의 정보를 조회합니다.',
        tags=['사용자'],
        responses={200: UserSerializer}
    ),
    patch=extend_schema(
        summary='내 정보 수정',
        description='현재 로그인한 사용자의 정보를 수정합니다.',
        tags=['사용자'],
        request=UserUpdateSerializer,
        responses={200: UserSerializer}
    )
)
class UserMeView(APIView):
    """
    내 정보 조회/수정 API

    GET /api/v1/users - 내 정보 조회
    PATCH /api/v1/users - 내 정보 수정
    """

    # JWT 토큰이 있어야만 접근 가능
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        내 정보 조회

        request.user: JWT 토큰에서 자동 추출된 User 객체
        """
        serializer = UserSerializer(request.user)
        return success_response(
            data=serializer.data,
            status=status.HTTP_200_OK
        )

    def patch(self, request):
        """
        내 정보 수정

        partial=True: 일부 필드만 전송해도 유효성 검사 통과
        (nickname만 보내도 OK)
        """
        serializer = UserUpdateSerializer(
            request.user,  # 수정할 대상 객체
            data=request.data,  # 클라이언트가 보낸 데이터
            partial=True  # 일부 필드만 수정 허용
        )
        serializer.is_valid(raise_exception=True)  # 유효성 검사 실패 시 400 에러
        serializer.save()  # DB에 저장

        # 수정된 사용자 정보 반환
        return success_response(
            data=UserSerializer(request.user).data,
            status=status.HTTP_200_OK
        )


# ============================================
# Claude Code 구현 - 장소 검색 기록 API
# ============================================
# [학습 포인트]
# 1. request.query_params: URL 쿼리 파라미터 (?limit=5)
# 2. filter(user=request.user): 현재 사용자의 데이터만 조회 (보안상 중요!)
# 3. [:limit]: 슬라이싱으로 결과 개수 제한
# 4. many=True: 여러 개의 객체를 직렬화할 때 필수
# 5. .delete(): QuerySet 전체 삭제
# ============================================
@extend_schema_view(
    get=extend_schema(
        summary='장소 검색 기록 조회',
        description='현재 로그인한 사용자의 장소 검색 기록을 조회합니다.',
        tags=['사용자'],
        responses={200: PlaceSearchHistorySerializer(many=True)}
    ),
    delete=extend_schema(
        summary='장소 검색 기록 전체 삭제',
        description='현재 로그인한 사용자의 장소 검색 기록을 전체 삭제합니다.',
        tags=['사용자'],
        responses={204: None}
    )
)
class PlaceHistoryListView(APIView):
    """
    장소 검색 기록 조회/전체 삭제 API

    GET /api/v1/users/place-history - 장소 검색 기록 조회
    DELETE /api/v1/users/place-history - 장소 검색 기록 전체 삭제
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        장소 검색 기록 조회

        쿼리 파라미터:
        - limit: 조회할 개수 (기본값: 10)

        예시: GET /api/v1/users/place-history?limit=5
        """
        # URL에서 limit 파라미터 가져오기 (?limit=5)
        limit = request.query_params.get('limit', 10)
        try:
            limit = int(limit)
        except ValueError:
            limit = 10

        # 현재 사용자의 검색 기록만 조회 (다른 사용자 데이터 접근 불가)
        histories = PlaceSearchHistory.objects.filter(
            user=request.user  # 보안: 본인 데이터만!
        )[:limit]  # 슬라이싱으로 개수 제한

        # many=True: 여러 객체를 리스트로 직렬화
        serializer = PlaceSearchHistorySerializer(histories, many=True)
        return success_response(
            data=serializer.data,
            status=status.HTTP_200_OK
        )

    def delete(self, request):
        """
        장소 검색 기록 전체 삭제

        현재 사용자의 모든 검색 기록 삭제
        """
        # 현재 사용자의 모든 검색 기록 삭제
        PlaceSearchHistory.objects.filter(user=request.user).delete()
        return success_response(
            data=None,
            status=status.HTTP_204_NO_CONTENT  # 204: 삭제 성공, 본문 없음
        )


# ============================================
# [학습 포인트]
# 1. pk: URL에서 전달받는 기본키 (place-history/5 → pk=5)
# 2. .get(pk=pk, user=request.user): 본인 데이터만 삭제 가능 (보안)
# 3. DoesNotExist 예외: 데이터가 없을 때 발생
# 4. 404 응답: 리소스를 찾을 수 없음
# ============================================
@extend_schema_view(
    delete=extend_schema(
        summary='장소 검색 기록 개별 삭제',
        description='특정 장소 검색 기록을 삭제합니다.',
        tags=['사용자'],
        responses={204: None}
    )
)
class PlaceHistoryDetailView(APIView):
    """
    장소 검색 기록 개별 삭제 API

    DELETE /api/v1/users/place-history/{id} - 장소 검색 기록 개별 삭제
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        """
        장소 검색 기록 개별 삭제

        pk: URL에서 전달받은 검색 기록 ID
        예시: DELETE /api/v1/users/place-history/5
        """
        try:
            # pk와 user 둘 다 일치하는 레코드만 조회 (보안)
            history = PlaceSearchHistory.objects.get(
                pk=pk,
                user=request.user  # 본인 데이터만 삭제 가능
            )
            history.delete()
            return success_response(
                data=None,
                status=status.HTTP_204_NO_CONTENT
            )
        except PlaceSearchHistory.DoesNotExist:
            # 데이터가 없거나 다른 사용자의 데이터인 경우
            return success_response(
                data={'detail': '검색 기록을 찾을 수 없습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
