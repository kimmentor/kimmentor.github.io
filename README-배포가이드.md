# 📘 멘토 김부장 블로그 — 사용 & 배포 가이드

**저자 브랜드형 블로그**입니다. 홈은 "멘토 김부장" 소개이고,
책은 각각 별도 페이지로 있어서 **새 책이 나올 때마다 페이지 하나만 추가**하면 됩니다.
코딩을 몰라도 아래 순서만 따라 하면 돼요.

---

## 📂 폴더 구성

| 파일 | 설명 |
|------|------|
| `index.html` | **멘토 김부장 홈** — 저자 소개 + 책 목록 + 블로그 글 목록 |
| `book-saju-making.html` | 📕 1권 상세 페이지 「사주앱 만들기」 |
| `book-saju-advanced.html` | 📗 2권 상세 페이지 「사주앱 고도화하기」 (출간 예정) |
| `tech.html` | 💻 **기술 블로그** (우아한형제들 기술블로그 스타일 — 카테고리·검색·태그) |
| `post-launch.html` | 글(출간후기): 출간 후기 |
| `post-how-i-built.html` | 글(제작기): AI로 앱 만든 5단계 |
| `post-is-it-possible.html` | 글(가이드): 자주 묻는 질문 5가지 |
| `post-ai-coding-tools.html` | 기술(AI도구): ChatGPT·Claude·Copilot·Codex 4대장 |
| `post-ai-agent.html` | 기술(에이전트): AI 에이전트가 뭐길래 |
| `post-agent-skills.html` | 기술(에이전트): 스킬(Skills)이 뭐길래 |
| `post-loop-engineering.html` | 기술(에이전트): 하네스와 루프 엔지니어링 |
| `post-vibe-coding.html` | 기술(트렌드): 바이브 코딩이 뭐길래 |
| `post-ai-tools-2026.html` | 기술(AI도구): AI 앱 만들기 도구 5가지 |
| `post-ai-cautions.html` | 기술(보안·실전): AI 앱 만들 때 주의점 3가지 |
| `style.css` | 사이트 전체 디자인 (건드릴 필요 없음) |
| `assets/cover.jpg` | 1권 표지 |
| `assets/cover-advanced.jpg` | 2권 표지 |
| `assets/cover-saju.jpg` | 「이것만 알고 사주 보러 가자」 표지 |
| `assets/cover-tarot.jpg` | 「이것만 알고 타로 보러 가자」 표지 (출간 예정) |

> 💡 미리 보기: `index.html`을 더블클릭하면 브라우저에서 바로 열립니다.

### 구매처 링크 (사이트 곳곳에 이미 연결돼 있음)

**1권 「코딩 몰라도 AI로 사주앱 만들기」**
- 교보 eBook: https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000013355696
- YES24: https://www.yes24.com/product/goods/194527043
- 알라딘: https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=399796054
- 리디북스: https://ridibooks.com/books/5273014977
- 북큐브: https://www.bookcube.com/detail.asp?series_num=926058874

**「이것만 알고 사주 보러 가자」 (「알고 보러 가자」 시리즈 제1권)**
- 교보 eBook: https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000013426880
- YES24: https://www.yes24.com/product/goods/195145257
- 알라딘: https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=400552567
- 리디북스: https://ridibooks.com/books/5273015195
- 북큐브: https://www.bookcube.com/detail.asp?series_num=926061789

---

## 🚀 GitHub Pages로 인터넷에 올리기 (무료, 10분)

1. **가입** — https://github.com → Sign up
2. **저장소 생성** — 오른쪽 위 **+** → **New repository** → 이름 입력(예: `mentor-kim`) → **Public** → **Create**
3. **업로드** — **Add file → Upload files** → 이 폴더의 **모든 파일 + `assets` 폴더**를 드래그 → **Commit changes**
   - ⚠️ `assets` 폴더를 꼭 함께 올려야 표지가 보입니다
4. **Pages 켜기** — **Settings → Pages** → Branch `main` 선택 → **Save**
5. 1~2분 뒤 주소 완성: `https://(내아이디).github.io/mentor-kim/`

이 주소가 당신의 블로그 링크입니다. 어디든 공유하세요! 🎉

---

## 📗 새 책을 추가하는 법 (핵심!)

책이 새로 나오면 **딱 3가지**만 하면 됩니다.

### ① 표지 넣기
새 책 표지를 `assets/` 폴더에 넣습니다. (예: `assets/cover-book3.jpg`)

### ② 책 상세 페이지 만들기
`book-saju-making.html`을 **복사**해 새 이름으로 저장합니다. (예: `book-book3.html`)
그리고 안에서 아래만 바꾸면 됩니다:
- 제목(`<title>`, `<h1>`), 설명 문구
- 표지 경로 `assets/cover.jpg` → `assets/cover-book3.jpg`
- 가격·쪽수, 구매 링크(교보/YES24/알라딘/리디북스/북큐브 주소)
- 커리큘럼(목차) 카드 내용

### ③ 홈에 카드 한 장 추가
`index.html`을 열면 이런 표시가 있습니다:

```
<!-- ▼▼▼ [책 카드] 시작 — 1권 ▼▼▼ -->
   ... 카드 내용 ...
<!-- ▲▲▲ [책 카드] 끝 — 1권 ▲▲▲ -->
```

이 **[책 카드] 블록 하나를 통째로 복사**해서 표지·제목·설명·링크를
새 책 것으로 바꾸고, `href`를 새로 만든 상세 페이지(`book-book3.html`)로 연결하면 끝입니다.

> 💡 AI에게 "이 HTML 형식 그대로 새 책 페이지를 만들어줘"라고 부탁하면 훨씬 빨라요. 책에서 배운 그 방식 그대로요.

---

## ✍️ 새 블로그 글을 추가하는 법
1. 비슷한 글 파일을 복사해 새 이름으로 저장 (예: `post-4.html`)
2. 제목·내용만 바꾸기
3. `index.html`의 **블로그 글 목록**(`<div class="posts-grid">`)에 글 카드 하나를 복사해 새 파일로 연결
4. 다시 업로드 → 끝

### 🏷️ 카테고리(분류)에 대해
블로그 글은 **전체 / 기술 / 제작기 / 가이드 / 출간후기**로 나뉘고, 홈에서 버튼으로 걸러 볼 수 있습니다.
글 카드에 `data-cat="..."` 값으로 분류가 정해집니다:

| 분류 | data-cat 값 |
|------|------------|
| 기술 | `tech` |
| 제작기 | `making` |
| 가이드 | `guide` |
| 출간후기 | `review` |

새 글 카드를 추가할 때 이 `data-cat` 값만 맞춰주면 필터에 자동으로 잡힙니다.
(예: 기술 글이면 `<a class="post-card" data-cat="tech" ...>`)

#### 기술 블로그(`tech.html`)의 세부 분류
기술 블로그는 홈보다 더 잘게 나눕니다 — 전체 / **AI도구**(`tool`) / **에이전트**(`agent`) / **트렌드**(`trend`) / **보안·실전**(`safe`).
각 글 행은 `<article class="trow" data-cat="agent" data-kw="검색 키워드들 ...">` 형태예요.
`data-kw`에 넣은 단어(예: chatgpt, codex, 스킬, 하네스)는 상단 검색창에서 걸립니다 — 사람들이 검색해 들어오게 하려면 이 키워드를 넉넉히 넣어 주세요.
새 기술 글을 추가할 땐 ① 글 HTML 파일 하나 만들고 ② `tech.html`의 `#trows` 안에 `.trow` 블록을 복사해 붙이면 됩니다.

---

## 📣 링크를 뿌릴 채널 (추천 순서)
1. **네이버 블로그 / 카페** — 검색 유입이 가장 큼
2. **스레드 / 인스타그램** — 짧은 후킹 문구 + 표지 + 링크
3. **오픈채팅 / 커뮤니티** — 개발·사이드프로젝트·N잡 방
4. **카카오톡 프로필** — 지인 유입

### 바로 쓰는 공유 문구
> 코딩 한 줄 몰라도 AI로 '사주앱'을 진짜로 만들 수 있을까? 🤔
> 기획부터 배포까지 담은 책을 냈습니다. 제작기도 블로그에 올려뒀어요 👇
> (블로그 링크)

---

궁금하거나 막히는 부분이 있으면 언제든 다시 불러주세요!

---

## 📕 「알고 보러 가자」 시리즈 현황

| 권 | 제목 | 상세 페이지 | 상태 |
|---|---|---|---|
| 제1권 | 이것만 알고 사주 보러 가자 | `book-saju-reading.html` | 판매 중 (5개 서점) |
| 제2권 | 이것만 알고 타로 보러 가자 | `book-tarot-reading.html` | 출간 예정 (집필 중) |

출간되면 `book-tarot-reading.html`과 `index.html` 책 카드에서
`출간 예정` → `판매 중`으로 바꾸고 구매처 링크를 넣으면 됩니다.
