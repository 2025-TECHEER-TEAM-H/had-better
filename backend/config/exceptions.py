"""
커스텀 예외 핸들러
API 응답 형식을 통일하기 위한 예외 처리
"""

from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    API 명세에 맞는 에러 응답 형식으로 변환
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_response = {
            "status": "error",
            "error": {
                "code": get_error_code(exc, response.status_code),
                "message": get_error_message(exc, response),
                "details": (
                    response.data
                    if isinstance(response.data, dict)
                    else {"detail": response.data}
                ),
            },
        }
        response.data = error_response

    return response


def get_error_code(exc, status_code):
    """
    HTTP 상태 코드와 예외 타입에 따른 에러 코드 반환
    """
    error_codes = {
        400: "VALIDATION_FAILED",
        401: "AUTH_REQUIRED",
        403: "RESOURCE_FORBIDDEN",
        404: "RESOURCE_NOT_FOUND",
        409: "RESOURCE_CONFLICT",
        422: "VALIDATION_FAILED",
        429: "RATE_LIMIT_EXCEEDED",
        500: "SERVER_ERROR",
    }

    # 예외 클래스명에서 코드 추출 시도
    if hasattr(exc, "default_code"):
        return str(exc.default_code).upper()

    return error_codes.get(status_code, "UNKNOWN_ERROR")


def get_error_message(exc, response):
    """
    사용자 친화적 에러 메시지 반환
    """
    if hasattr(exc, "detail"):
        if isinstance(exc.detail, str):
            return exc.detail
        elif isinstance(exc.detail, dict):
            # 첫 번째 에러 메시지 반환
            for _key, value in exc.detail.items():
                if isinstance(value, list):
                    return str(value[0])
                return str(value)

    default_messages = {
        400: "잘못된 요청입니다.",
        401: "인증이 필요합니다.",
        403: "접근 권한이 없습니다.",
        404: "요청한 리소스를 찾을 수 없습니다.",
        409: "리소스 충돌이 발생했습니다.",
        422: "유효성 검사에 실패했습니다.",
        429: "요청 횟수가 초과되었습니다.",
        500: "서버 오류가 발생했습니다.",
    }

    return default_messages.get(response.status_code, "알 수 없는 오류가 발생했습니다.")
