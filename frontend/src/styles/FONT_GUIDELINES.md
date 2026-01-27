# HAD BETTER 폰트 가이드라인 (모바일 기준)

## 📋 폰트 패밀리

| 폰트 | 용도 | 사용법 |
|------|------|--------|
| **Pretendard** | 기본 폰트 (대부분의 텍스트) | `font-['Pretendard',sans-serif]` |
| **DNFBitBitv2** | 제목 | `font-['DNFBitBitv2',sans-serif]` |
| **FreesentationVF** | 버튼 (우선) | `font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif]` |

---

## 📏 글씨 크기 & Weight (모바일 기준)

| 용도 | 글꼴 | 크기 | Weight | Tailwind | 예시 |
|------|------|------|--------|----------|------|
| **페이지 제목** | DNFBitBitv2 | 16px | Bold | `font-bold` | "경로 선택" |
| **인사말** | FreesentationVF/Pretendard | 16px | Bold | `font-bold` | "이초람님, 어디로 레이싱 할까요?" |
| **경로 이름** | Pretendard | 16px | Bold | `font-bold` | "경로 1" |
| **교통수단** | Pretendard | 12px | Bold | `font-bold` | "(버스)" |
| **출발지/도착지** | Pretendard | 12px | Bold | `font-bold` | "명동역 1번출구" |
| **상세 정보** | Pretendard | 14px | Semibold | `font-semibold` | "16분", "3.9km" |
| **입력 필드** | FreesentationVF/Pretendard | 14px | Medium | `font-medium` | 검색 입력 |
| **본문** | Pretendard | 12px | Medium | `font-medium` | "유저", "봇1" |
| **섹션 제목** | FreesentationVF/Pretendard | 12px | Bold | `font-bold` | "자주 가는 곳" |
| **버튼** | FreesentationVF/Pretendard | 18px | Bold | `font-bold` | "이동 시작" |
| **태그** | Pretendard | 9px | Bold | `font-bold` | "최단시간" |

---

## ✅ 핵심 규칙

1. **모바일 기준**: 모든 크기는 모바일 기준 (데스크톱은 `md:`로 조정)
2. **Pretendard 기본**: 새 코드는 Pretendard 사용
3. **일관성**: 같은 용도는 같은 크기/weight 유지
4. **버튼**: FreesentationVF 우선, Pretendard 대체

---

## 💻 코드 예시

```tsx
// 제목
<h1 className="font-['DNFBitBitv2',sans-serif] text-[16px] font-bold">경로 선택</h1>

// 부제목
<p className="font-['Pretendard',sans-serif] text-[16px] font-bold">경로 1</p>

// 상세 정보
<p className="font-['Pretendard',sans-serif] text-[14px] font-semibold">16분</p>

// 버튼
<span className="font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] text-[18px] font-bold">이동 시작</span>

// 본문
<p className="font-['Pretendard',sans-serif] text-[12px] font-medium">유저</p>
```

---

## 🎯 Weight 계층

- **Bold (700)**: 제목, 부제목, 버튼, 태그
- **Semibold (600)**: 상세 정보
- **Medium (500)**: 본문, 입력 필드
