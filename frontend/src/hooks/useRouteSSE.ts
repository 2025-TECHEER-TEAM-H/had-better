/**
 * 경주 SSE(Server-Sent Events) 연결 및 이벤트 수신 hook
 *
 * 백엔드에서 실시간으로 봇 상태 업데이트를 수신합니다.
 * - bot_status_update: 5초(동적 15/30초) 주기로 봇 위치/상태 업데이트
 * - bot_boarding: 버스/지하철 탑승 시
 * - bot_alighting: 버스/지하철 하차 시
 * - participant_finished: 참가자 도착 시
 * - route_ended: 경주 종료 시
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type {
  SSEEvent,
  SSEEventType,
  BotStatusUpdateEvent,
  BotBoardingEvent,
  BotAlightingEvent,
  ParticipantFinishedEvent,
  RouteEndedEvent,
  ConnectedEvent,
} from '@/types/route';

// SSE 연결 상태
export type SSEConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'closed';

// 이벤트 핸들러 타입
export interface SSEEventHandlers {
  onConnected?: (data: ConnectedEvent) => void;
  onBotStatusUpdate?: (data: BotStatusUpdateEvent) => void;
  onBotBoarding?: (data: BotBoardingEvent) => void;
  onBotAlighting?: (data: BotAlightingEvent) => void;
  onParticipantFinished?: (data: ParticipantFinishedEvent) => void;
  onRouteEnded?: (data: RouteEndedEvent) => void;
  onError?: (error: Error) => void;
}

// hook 옵션
interface UseRouteSSEOptions {
  // 자동 재연결 여부 (기본 true)
  autoReconnect?: boolean;
  // 재연결 최대 횟수 (기본 5)
  maxRetries?: number;
  // 재연결 간격 (ms, 기본 3000)
  reconnectInterval?: number;
}

// hook 반환 타입
interface UseRouteSSEReturn {
  // 연결 상태
  status: SSEConnectionStatus;
  // 마지막 봇 상태 업데이트 (봇별로 저장)
  botStates: Map<number, BotStatusUpdateEvent>;
  // 수동 연결
  connect: () => void;
  // 수동 연결 해제
  disconnect: () => void;
  // 에러 메시지
  error: string | null;
}

// API 베이스 URL (SSE는 /api/v1 없이 직접 연결)
const SSE_BASE_URL = import.meta.env.VITE_SSE_BASE_URL || 'http://localhost:8000';

/**
 * 경주 SSE 연결 hook
 *
 * @param routeItineraryId - 경주 ID
 * @param handlers - 이벤트 핸들러
 * @param options - 옵션
 */
export function useRouteSSE(
  routeItineraryId: number | null,
  handlers: SSEEventHandlers = {},
  options: UseRouteSSEOptions = {}
): UseRouteSSEReturn {
  const {
    autoReconnect = true,
    maxRetries = 5,
    reconnectInterval = 3000,
  } = options;

  const [status, setStatus] = useState<SSEConnectionStatus>('disconnected');
  const [botStates, setBotStates] = useState<Map<number, BotStatusUpdateEvent>>(
    new Map()
  );
  const [error, setError] = useState<string | null>(null);

  // refs (핸들러 변경에 따른 재연결 방지)
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  // SSE 메시지 파싱
  const parseSSEData = useCallback((eventType: string, data: string): SSEEvent | null => {
    try {
      const parsedData = JSON.parse(data);
      return { event: eventType as SSEEventType, data: parsedData } as SSEEvent;
    } catch (e) {
      console.error('❌ SSE 데이터 파싱 실패:', e);
      return null;
    }
  }, []);

  // 이벤트 처리
  const handleEvent = useCallback((event: SSEEvent) => {
    const h = handlersRef.current;

    switch (event.event) {
      case 'connected':
        console.log('✅ SSE 연결됨:', event.data.message);
        h.onConnected?.(event.data);
        break;

      case 'bot_status_update':
        console.log(`🤖 봇 ${event.data.bot_id} 상태 업데이트:`, event.data.status);
        setBotStates((prev) => {
          const next = new Map(prev);
          next.set(event.data.bot_id, event.data);
          return next;
        });
        h.onBotStatusUpdate?.(event.data);
        break;

      case 'bot_boarding':
        console.log(`🚌 봇 ${event.data.bot_id} 탑승:`, event.data.station_name);
        h.onBotBoarding?.(event.data);
        break;

      case 'bot_alighting':
        console.log(`🚶 봇 ${event.data.bot_id} 하차:`, event.data.station_name);
        h.onBotAlighting?.(event.data);
        break;

      case 'participant_finished':
        console.log(`🏁 참가자 도착:`, event.data.participant, `순위: ${event.data.rank}`);
        h.onParticipantFinished?.(event.data);
        break;

      case 'route_ended':
        console.log('🎉 경주 종료:', event.data.reason);
        h.onRouteEnded?.(event.data);
        break;

      // [추가됨] 유저 버스 도착 정보 (백엔드에서 실시간 전송)
      case 'user_bus_arrival':
        console.log('🚍 유저 탑승 버스 정보:', event.data);
        // 필요한 경우 여기에 상태 업데이트 로직 추가
        break;

      case 'heartbeat':
        // heartbeat는 로그 생략 (30초마다 발생)
        break;

      case 'error':
        console.error('❌ SSE 에러:', event.data.message);
        setError(event.data.message);
        h.onError?.(new Error(event.data.message));
        break;
    }
  }, []);

  // 연결 함수
  const connect = useCallback(() => {
    if (!routeItineraryId) {
      console.warn('⚠️ routeItineraryId가 없어서 SSE 연결 불가');
      return;
    }

    // 기존 연결 정리
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStatus('connecting');
    setError(null);

    // TODO: 실제 배포 시 인증 처리 필요
    // EventSource는 커스텀 헤더를 지원하지 않으므로 쿼리 파라미터로 토큰 전달
    // 방법 1: 쿼리 파라미터로 토큰 전달 (백엔드에서 token 파라미터 처리 필요)
    // const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    // const sseUrl = `${SSE_BASE_URL}/api/v1/sse/routes/${routeItineraryId}?token=${token}`;
    //
    // 방법 2: 쿠키 기반 인증 (withCredentials 사용)
    // const eventSource = new EventSource(sseUrl, { withCredentials: true });
    //
    // 현재: 테스트용 (백엔드에서 인증 해제 상태)
    const sseUrl = `${SSE_BASE_URL}/api/v1/sse/routes/${routeItineraryId}`;
    console.log('🔗 SSE 연결 시도:', sseUrl);

    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    // 연결 성공
    eventSource.onopen = () => {
      console.log('✅ SSE 연결 열림');
      setStatus('connected');
      retryCountRef.current = 0;
    };

    // 일반 메시지 (이벤트 타입 없음)
    eventSource.onmessage = (e) => {
      const event = parseSSEData('connected', e.data);
      if (event) handleEvent(event);
    };

    // 각 이벤트 타입별 리스너 등록
    const eventTypes: SSEEventType[] = [
      'connected',
      'bot_status_update',
      'bot_boarding',
      'bot_alighting',
      'participant_finished',
      'route_ended',
      'user_bus_arrival', // [추가됨] 이벤트 리스너 등록
      'heartbeat',
      'error',
    ];

    eventTypes.forEach((eventType) => {
      eventSource.addEventListener(eventType, (e: MessageEvent) => {
        const event = parseSSEData(eventType, e.data);
        if (event) handleEvent(event);

        // route_ended 시 연결 종료
        if (eventType === 'route_ended') {
          setStatus('closed');
          eventSource.close();
        }
      });
    });

    // 에러 처리
    eventSource.onerror = (e) => {
      console.error('❌ SSE 연결 에러:', e);
      setStatus('error');

      eventSource.close();
      eventSourceRef.current = null;

      // 자동 재연결
      if (autoReconnect && retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        const delay = reconnectInterval * retryCountRef.current;
        console.log(`🔄 ${retryCountRef.current}/${maxRetries} 재연결 시도 (${delay}ms 후)`);

        setTimeout(() => {
          connect();
        }, delay);
      } else if (retryCountRef.current >= maxRetries) {
        setError('최대 재연결 횟수 초과');
        handlersRef.current.onError?.(new Error('최대 재연결 횟수 초과'));
      }
    };
  }, [routeItineraryId, autoReconnect, maxRetries, reconnectInterval, parseSSEData, handleEvent]);

  // 연결 해제 함수
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('🔌 SSE 연결 해제');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus('disconnected');
    retryCountRef.current = 0;
  }, []);

  // routeItineraryId가 변경되면 자동 연결
  useEffect(() => {
    if (routeItineraryId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [routeItineraryId]); // connect, disconnect는 의도적으로 제외

  return {
    status,
    botStates,
    connect,
    disconnect,
    error,
  };
}
