# PrimeRing

AI 기반 요약 및 하루 흐름 분석을 지원하는 스마트 캘린더 & 다이어리 데스크톱 애플리케이션

## 📋 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
  - [필수 요구사항](#필수-요구사항)
  - [설치 방법](#설치-방법)
  - [실행 방법](#실행-방법)
- [프로젝트 구조](#-프로젝트-구조)
- [빌드](#-빌드)
- [문제 해결](#-문제-해결)

## ✨ 주요 기능

- 📅 **스마트 캘린더**: 월간 뷰로 이벤트를 쉽게 관리
- 📝 **AI 다이어리**: 로컬 LLM(Llama 3.2)을 활용한 자동 요약, 하루 흐름 분석 및 조언 제공 (Privacy First)
- 🏷️ **카테고리 관리**: 커스텀 카테고리 생성 및 색상 설정
- 🌓 **테마 전환**: 라이트/다크 모드 지원
- 💾 **로컬 저장소**: Electron IPC를 통한 안전한 로컬 JSON 파일 데이터 저장
- 🖥️ **크로스 플랫폼**: Electron 기반 Windows/macOS/Linux 지원

## 🔧 기술 스택

- **프론트엔드**: React 19 + TypeScript
- **빌드 도구**: Vite
- **상태 관리**: Zustand
- **UI 라이브러리**: Framer Motion, React Hot Toast
- **데이터베이스**: 로컬 파일 시스템 (JSON)
- **AI**: WebLLM (@mlc-ai/web-llm) - Llama-3.2-3B-Instruct (WebGPU 기반 로컬 실행)
- **데스크톱**: Electron
- **스타일링**: CSS Modules

## 🚀 시작하기

### 필수 요구사항

프로젝트를 실행하기 전에 다음 항목들이 설치되어 있어야 합니다:

- **Node.js** (v18 이상 권장)
- **npm** 또는 **yarn**
- **Git**
- **WebGPU 지원 브라우저/환경** (AI 기능 사용 시 필요)

### 설치 방법

1. **저장소 클론**

```bash
git clone https://github.com/Siul49/prime-ring.git
cd prime-ring
```

2. **의존성 패키지 설치**

```bash
npm install
```

또는 yarn을 사용하는 경우:

```bash
yarn install
```

### 실행 방법

#### 개발 모드 (Electron 데스크톱 앱)

```bash
npm run dev
```

이 명령어는 다음을 동시에 실행합니다:
- Vite 개발 서버 (포트 5173)
- Electron 앱

앱이 자동으로 실행되며, 코드 변경 시 핫 리로드가 적용됩니다.

#### 웹 전용 개발 모드

Electron 없이 브라우저에서만 실행하려면:

```bash
npm run dev:vite
```

브라우저에서 `http://localhost:5173`에 접속합니다.
(주의: 웹 모드에서는 로컬 파일 시스템 접근 권한이 없어 데이터 저장이 동작하지 않을 수 있습니다. Electron 모드 사용을 권장합니다.)

## 📁 프로젝트 구조

```
prime-ring/
├── electron/              # Electron 메인 프로세스
│   ├── main.ts           # Electron 진입점 (IPC 핸들러 포함)
│   └── preload.ts        # Preload 스크립트
│
├── src/
│   ├── components/       # React 컴포넌트
│   │   ├── calendar/    # 캘린더 관련 컴포넌트
│   │   ├── diary/       # 다이어리 관련 컴포넌트 (AI 분석 포함)
│   │   ├── common/      # 공통 컴포넌트
│   │   ├── layout/      # 레이아웃 컴포넌트
│   │   ├── list/        # 리스트 뷰
│   │   ├── settings/    # 설정 모달
│   │   └── sidebar/     # 사이드바
│   │
│   ├── hooks/           # Custom React Hooks
│   │   ├── useDiaries.ts
│   │   ├── useEvents.ts
│   │   └── useTheme.ts
│   │
│   ├── services/        # 비즈니스 로직 서비스
│   │   ├── aiService.ts      # WebLLM 기반 로컬 AI 서비스
│   │   ├── diaryService.ts   # 다이어리 CRUD (JSON 파일)
│   │   └── eventService.ts   # 이벤트 CRUD (JSON 파일)
│   │
│   ├── stores/          # Zustand 상태 관리
│   │   ├── appStore.ts
│   │   ├── categoryStore.ts
│   │   ├── diaryStore.ts
│   │   ├── eventStore.ts
│   │   ├── modalStore.ts
│   │   └── themeStore.ts
│   │
│   ├── types/           # TypeScript 타입 정의
│   ├── lib/             # 라이브러리 및 유틸리티
│   │   └── utils.ts     # 유틸리티 함수
│   │
│   ├── constants/       # 전역 상수
│   ├── App.tsx          # 메인 App 컴포넌트
│   └── main.tsx         # React 진입점
│
├── public/              # 정적 파일
├── dist/                # Vite 빌드 출력
├── dist-electron/       # Electron 빌드 출력
└── dist-app/            # 최종 앱 패키지
```

## 🔨 빌드

### 프로덕션 빌드

```bash
npm run build
```

이 명령어는:
1. TypeScript 컴파일
2. Vite 프로덕션 빌드
3. Electron 컴파일
4. Electron Builder로 실행 파일 생성

빌드된 앱은 `dist-app/` 디렉토리에 생성됩니다.

### 린트 (코드 검사)

```bash
npm run lint
```

## 🐛 문제 해결

### 1. AI 모델 로딩 실패

**증상**: AI 기능 사용 시 모델 로딩이 멈추거나 오류 발생

**해결 방법**:
- WebGPU를 지원하는 환경인지 확인하세요.
- 최초 실행 시 모델 다운로드(약 2~3GB)가 필요하므로 인터넷 연결 상태를 확인하세요.
- 충분한 VRAM이 확보되었는지 확인하세요.

### 2. Electron 앱이 실행되지 않음

**증상**: Vite는 실행되지만 Electron 창이 열리지 않음

**해결 방법**:
```bash
# 캐시 삭제
rm -rf node_modules dist dist-electron
npm install
npm run dev
```

### 3. 데이터 저장 안됨

**증상**: 앱 재실행 후 데이터가 사라짐

**해결 방법**:
- `npm run dev:vite` (웹 모드)가 아닌 `npm run dev` (Electron 모드)로 실행했는지 확인하세요.
- 데이터는 사용자 문서 폴더의 `PrimeRing` 디렉토리에 저장됩니다. 해당 폴더 권한을 확인하세요.

### 4. TypeScript 컴파일 오류

**해결 방법**:
```bash
# TypeScript 캐시 삭제
rm -rf tsconfig.tsbuildinfo
npx tsc --build --clean
npm run dev
```

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여

프로젝트에 기여하고 싶으시다면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/amazing-feature`)
3. Commit your Changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the Branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📧 문의

프로젝트에 대한 문의사항이 있으시면 Issue를 생성해주세요.
