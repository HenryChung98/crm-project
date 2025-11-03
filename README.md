# [Link](https://crm-project-eight-pi.vercel.app/)

### Libraries / Frameworks

- [Next.js](https://nextjs.org/docs/app/getting-started/installation)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Tailwind CSS](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [typed-countries](https://www.npmjs.com/package/typed-countries)
- [Tanstack Query + devtools](https://tanstack.com/query/v5/docs/framework/react/installation)
- [React Hot Toast](https://react-hot-toast.com/)

### OAuth Provider

- [Google](https://console.cloud.google.com/)

### BaaS

- [supabase](https://supabase.com/)

### Deploy

- [vercel](https://vercel.com/)

### etc

- [Resend](https://resend.com/)
- [dnd-kit](https://dndkit.com/) - npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
- [Mailtrap](https://mailtrap.io/)
  842910a9d7e3bf6cce75e11106cde7f3

### restricted service

- max invite user
- max add customer
- email sender
- customer status
- create link(instagram, facebook, ...)
- booking form(instagram, facebook, ... / premium only)
- create end point to save customer's action from external website(premium only)
- optimistic update(premium only)

<!--
need to setup after done

- resend
- admin email
- support team email
- SMTP(mailtrap)
- payment
- edge functions

-->

<!-- 핵심 기능:

정렬 (Sorting): 컬럼 헤더 클릭으로 오름차순/내림차순
페이지네이션: 데이터가 많을 때 필수
행 클릭 이벤트: 상세 페이지로 이동하거나 사이드바 열기
벌크 액션: 선택된 행들에 대한 일괄 작업 (삭제, 상태 변경 등)

편의 기능:

컬럼 너비 조절: 드래그로 조정
컬럼 숨기기/보이기: 사용자가 원하는 컬럼만 표시
Export: CSV/Excel 다운로드
인라인 편집: 셀 더블클릭으로 즉시 수정
필터 저장: 자주 쓰는 필터 조합 저장

UX 개선:

로딩 상태: 데이터 로드 중 스켈레톤/스피너
빈 상태: 데이터 없을 때 안내 메시지
행 hover 효과: 가독성 향상
고정 헤더: 스크롤 시 헤더 고정 -->

<!--
1. 미용실, 네일샵, 헤어샵
- 오프라인: 손님 방문
- 온라인: 인스타그램 예약, 카카오톡 예약
- 필요: 어느 채널로 재방문했는지 추적
피트니스센터, PT샵
- 인스타 광고 → 상담 신청 링크
- 이메일 프로모션 → 재등록 링크
- 필요: 마케팅 채널별 효과 측정
2. 로컬 비즈니스
카페, 레스토랑
- 인스타그램 메뉴 홍보
- 배달앱 리뷰 → 직영몰 유도
- 필요: 단골 고객 채널별 방문 패턴
부동산, 인테리어
- 네이버 블로그 → 상담 신청
- 인스타 → 포트폴리오 보기
- 필요: 고객별 관심 매물 추적
3. B2C 서비스 & 교육
어학원, 학원
- 블로그 글 → 체험 수업 신청
- 인스타 이벤트 → 등록 페이지
- 필요: 학생 모집 채널 분석
온라인 클래스, 코칭
- 유튜브 링크 → 수강 신청
- 이메일 세일즈 → 결제 페이지
- 필요: 퍼널별 전환율
4. 소규모 이커머스
수제품, 핸드메이드
- 인스타 스토리 → 스마트스토어
- 블로그 리뷰 → 자체몰
- 필요: VIP 고객 관리 + 채널 효과
로컬 식품, 농산물
- 카카오 채널 → 정기 구독
- 네이버 쇼핑 → 직영몰 유도
- 필요: 재구매 고객 추적
5. 전문 서비스
법무법인, 회계사무소
- 블로그 상담 → 계약 페이지
- 추천 링크 → 신규 고객
- 필요: 리드 소스 추적
병원, 한의원
- 네이버 예약 → 재진 예약
- 인스타 이벤트 → 시술 상담
- 필요: 환자 유입 경로 분석


1. 조직 멤버 조회 최적화
새로운 OrganizationContext 생성: 조직 관련 상태와 로직을 중앙화
캐싱 개선: TanStack Query의 staleTime: 5 * 60 * 1000 (5분) 설정으로 불필요한 재조회 방지
중복 로직 제거: src/app/(afterSignin)/layout.tsx에서 복잡한 조직 관리 로직을 컨텍스트로 이동
자동 리다이렉트: 유효하지 않은 조직 ID에 대한 자동 리다이렉트 로직을 컨텍스트에서 처리
2. 사이드바 상태 관리 중앙화
새로운 SidebarContext 생성: 사이드바 상태를 전역으로 관리
상태 분산 해결: 여러 컴포넌트에 분산되어 있던 사이드바 상태를 하나로 통합
Props drilling 제거: isCollapsed, toggleSidebar 등의 상태를 props로 전달할 필요 없음
3. Provider 구조 개선
중복 제거: src/app/layout.tsx에서 중복된 AuthProvider 제거
계층 구조 최적화: Providers.tsx에서 모든 컨텍스트를 적절한 순서로 배치
의존성 관리: 각 컨텍스트가 필요한 다른 컨텍스트에 올바르게 의존하도록 구성
4. 코드 간소화
src/app/(afterSignin)/layout.tsx: 126줄 → 59줄 (53% 감소)
복잡한 로직 제거: useEffect, useMemo, useCallback 등의 복잡한 로직을 컨텍스트로 이동
가독성 향상: 각 컴포넌트의 책임이 명확해짐
5. 성능 최적화
불필요한 리렌더링 방지: 컨텍스트를 통한 상태 관리로 불필요한 리렌더링 감소
캐싱 전략: 조직 데이터에 대한 적절한 캐싱으로 API 호출 최소화
메모이제이션: 컨텍스트에서 적절한 메모이제이션 적용

-->
