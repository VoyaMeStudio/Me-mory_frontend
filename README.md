# Me-mory_frontend
Me-mory Frontend Repository



### 1️⃣ 디렉토리 구조

리액트 네이티브(Expo) 기반 프로젝트는 다음과 같이 구성한다.

    project-root
    ├─ app/                       # (Expo Router 사용 시) 라우팅 기준 화면
    │  ├─ (tabs)/, (stack)/ ...
    │  └─ [...etc].tsx
    ├─ src/
    │  ├─ app/                    # 전역 설정 (Provider, 네비게이션 등)
    │  ├─ components/             # 재사용 컴포넌트
    │  │  ├─ common/              # 버튼, 인풋, 카드 등 공통 UI
    │  │  └─ features/            # 기능(도메인)별 컴포넌트
    │  ├─ screens/                # 화면 단위 컴포넌트 (Expo Router 미사용 시)
    │  ├─ lib/                    # api, util, hooks 등 공용 로직
    │  │  ├─ apis/
    │  │  ├─ hooks/
    │  │  └─ utils/
    │  ├─ store/                  # 전역 상태 관리 (예: Zustand, Redux)
    │  ├─ contexts/               # React Context 관련 파일
    │  ├─ types/                  # 타입 정의 (types, dto 등)
    │  ├─ data/                   # 상수 데이터 (constant)
    │  ├─ mocks/                  # 목업 데이터
    │  └─ styles/                 # 전역 스타일, theme 등
    ├─ .env.development
    └─ .env.production

---

### 2️⃣ 파일 & 컴포넌트 네이밍

####  2-1. 디렉토리

- 모든 디렉토리는 **kebab-case** 를 사용한다.  
  예) `components`, `my-page`

####  2-2. React 컴포넌트 파일

- **파일명:** PascalCase  
- **컴포넌트명:** 파일명과 동일한 PascalCase  
- 화면 컴포넌트는 반드시 **`Screen` 접미사** 사용  
  - 예) `HomeScreen`, `SearchResultScreen`

####  2-3. Hooks

- 파일명 / 함수명은 **`use`로 시작하는 camelCase**  
  - 예) `useLocationPermission`

---

### 3️⃣ 함수 / 이벤트 핸들러 네이밍

####  3-1. 컴포넌트 & 로직 함수

- 기본적으로 **Named Function** 사용
- `map`, `filter` 등의 콜백은 **Arrow Function** 허용

####  3-2. 이벤트 핸들러

- **내부 핸들러:** `handle[동사/의도]` 형식  
  - 예) `handleSubmit`, `handleChangeKeyword`
- **props 핸들러:** `on[동사/의도]` 형식  

  
---

### 4️⃣ 상태 & 변수 네이밍

| 목적         | 접두사                     | 예시                             |
|--------------|----------------------------|----------------------------------|
| boolean      | is / has / can / should    | `isLoading`, `hasNextPage`      |
| 선택된 값    | selected                   | `selectedKeyword`, `selectedCategoryId` |
| 리스트       | 복수형                     |  `comments`, `keywords` |
| 스타일       | 직관적 이름                | `container`, `titleText`, `buttonText` |

    const styles = StyleSheet.create({
      container: {
        flex: 1,
      },
      titleText: {
        fontSize: 18,
        fontWeight: '600',
      },
    });

---

### 5️⃣ API 함수 & React Query 네이밍

- **조회(GET):** `get` 접두사  
 
- **변경(POST/PUT/PATCH/DELETE):** `mutate` 접두사  
  

**React Query 훅 네이밍 규칙**

- 쿼리 훅: `use[엔티티][행위]Query`  

- 뮤테이션 훅: `use[행위]Mutation`  
  

---

### 6️⃣ import 순서

1. React / React Native / Expo 관련  
2. 서드파티 라이브러리 (react-query, Zustand 등)  
3. 프로젝트 내부 절대 경로 (`@/`)  
4. 상대 경로 (`../components/...`)  
5. 스타일, 이미지  


---

## 🌿 Git 브랜치 전략

### 1️⃣ 기본 브랜치

| 브랜치     | 설명                                      |
|------------|-------------------------------------------|
| **main**   | 배포용. 항상 안정 버전만 유지             |
| **develop**| 통합 개발 브랜치. 기능 브랜치들이 머지되는 기본 브랜치 |

---

### 2️⃣ 브랜치 네이밍 규칙

> 형식: `Type/#issue-number-branch_name`

| 유형       | 예시                    |
|------------|-------------------------|
| 기능 개발  | `Feature/#10-login`     |
| 버그 수정  | `Bugfix/#11-navbar-bug` |
| 긴급 패치  | `Hotfix/#9-prod-crash`  |
| 설정/기타  | `Chore/#7-update-readme`|
| 문서 작업  | `Docs/#8-api-guide`     |
| 리팩토링   | `Refactor/#5-home-ui`   |

**브랜치 생성 예시**

    git switch develop
    git pull origin develop
    git switch -c Feature/#10-login

- 작업 완료 후 PR → 코드 리뷰 → `develop` 으로 머지  
- 배포 시점에 `develop` → `main` 머지 및 태그(선택)

---

### 3️⃣ 커밋 메시지 규칙

> 형식: `type:#issue_number 메시지`

**예시**

    feat:#15 로그인 화면 UI 구현
    bugfix:#21 키워드 리스트 중복 렌더링 수정
    refactor:#30 댓글 컴포넌트 구조 리팩토링
    design:#18 그림자 및 여백 조정
    chore:#5 eslint 설정 추가

| type      | 설명                                  |
|-----------|---------------------------------------|
| feat      | 새로운 기능 추가                      |
| bugfix    | 버그 수정                             |
| refactor  | 코드 리팩토링 (동작 변경 없음)        |
| design    | 스타일/레이아웃 변경                  |
| chore     | 설정, 패키지, 빌드 등 잡일 수정       |

> 하나의 커밋은 **하나의 의미 있는 변경**만 포함한다.

---

### 4️⃣ Pull Request 규칙

**PR 제목 예시**

    Feature/#10 로그인 화면 UI 구현
    Bugfix/#21 키워드 리스트 중복 렌더링 수정

**PR 템플릿 예시**

    🔗 관련 이슈
    - #10

    📝 작업 내용
    - 로그인 화면 UI 기본 구조 구현
    - 공통 Button 컴포넌트 연결

    🙋‍♀️ 리뷰 요청 사항
    - 버튼 컴포넌트 props 구조가 적절한지 확인 부탁드립니다.
    - 네이밍 괜찮은지도 같이 봐주세요.

    📸 미리보기 (선택)
    - (UI 변경 시 스크린샷 첨부)

- PR은 **최소 1인 이상 리뷰 후 머지**  
- `main` 직접 커밋/푸시 금지, 반드시 **PR을 통해 머지**  
- 긴급 Hotfix는 `Hotfix/...` 브랜치에서 작업 후 `main`, `develop` 양쪽에 머지한다.
