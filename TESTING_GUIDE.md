# 업무 대시보드 테스트 가이드

## 개요

이 프로젝트는 [Playwright](https://playwright.dev/)를 사용하여 E2E (End-to-End) 테스트를 수행합니다.

## 테스트 환경 설정

### 1. 필수 요구사항
- Node.js (v16 이상)
- npm 또는 yarn

### 2. 의존성 설치
```bash
npm install
```

Playwright 브라우저가 설치되지 않은 경우:
```bash
npx playwright install
```

## 테스트 실행 명령어

### 기본 테스트 실행
```bash
# 모든 테스트 실행 (모든 브라우저)
npm test

# Chromium 브라우저만 실행
npx playwright test --project=chromium

# Firefox 브라우저만 실행
npx playwright test --project=firefox

# WebKit 브라우저만 실행
npx playwright test --project=webkit
```

### UI 모드로 테스트 실행
```bash
# 인터랙티브 UI 모드
npm run test:ui
```

### 헤드 모드로 테스트 실행 (브라우저 표시)
```bash
# 브라우저를 화면에 띄워서 실행
npm run test:headed
```

### 특정 테스트 파일만 실행
```bash
# 종합 테스트만 실행
npx playwright test tests/comprehensive.spec.js

# 기본 기능 테스트만 실행
npx playwright test tests/basic-functionality.spec.js

# 카드 관리 테스트만 실행
npx playwright test tests/card-management.spec.js

# 북마크 관리 테스트만 실행
npx playwright test tests/bookmark-manager.spec.js
```

### 디버그 모드
```bash
# 특정 테스트 디버깅
npx playwright test --debug tests/comprehensive.spec.js

# 특정 테스트 케이스만 디버깅 (grep 사용)
npx playwright test --grep "메모장 전체 기능 테스트"
```

### 테스트 결과 리포트 보기
```bash
# HTML 리포트 열기
npx playwright show-report
```

## 테스트 파일 구조

```
tests/
├── basic-functionality.spec.js      # 기본 기능 테스트
├── card-management.spec.js          # 카드 관리 시스템 테스트
├── bookmark-manager.spec.js         # 북마크 관리 테스트
├── comprehensive.spec.js            # 종합 기능 테스트
└── advanced-cards.spec.js           # 고급 카드 기능 테스트
```

## 주요 테스트 범위

### 1. basic-functionality.spec.js
- 페이지 로드 및 기본 구조
- 기본 카드 표시
- 설정 모달 작동
- 메모장 기능
- 계산기 기능
- 할 일 추가 기능
- 날씨 카드 기본 요소

### 2. card-management.spec.js
- 모든 카드 카테고리 표시
- 카테고리 접기/펴기
- 카드 표시/숨김 토글
- localStorage 지속성
- 여러 카드 동시 제어
- 모든 데이터 지우기

### 3. bookmark-manager.spec.js
- 북마크 추가/삭제
- 북마크 검색
- 카테고리 필터링
- 북마크 편집
- URL 프로토콜 자동 추가
- 전체 북마크 삭제

### 4. comprehensive.spec.js
- 전체 페이지 로드
- 모든 기본 카드 테스트
- 설정 모달 전체 기능
- 메모장, 계산기, 할 일 전체 기능
- TTS 스케줄러
- 카드 표시/숨김
- localStorage 데이터 지속성
- 출퇴근 기능
- 뽀모도로 타이머
- 월간 출퇴근 요약

## 테스트 작성 가이드

### 테스트 템플릿
```javascript
import { test, expect } from '@playwright/test';

test.describe('기능 그룹명', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('테스트 케이스 설명', async ({ page }) => {
    // 테스트 코드
    await page.click('#button-id');
    await expect(page.locator('#element-id')).toBeVisible();
  });
});
```

### 주요 Playwright API

#### Locator (요소 선택)
```javascript
// ID로 선택
page.locator('#element-id')

// 클래스로 선택
page.locator('.class-name')

// 텍스트로 선택
page.locator('text=버튼 텍스트')

// 첫 번째 요소
page.locator('.item').first()

// 필터링
page.locator('#todo-list .complete-btn')
```

#### Actions (동작)
```javascript
// 클릭
await page.click('#button-id')

// 입력
await page.fill('#input-id', '텍스트')

// 선택 (select)
await page.selectOption('#select-id', 'option-value')

// 체크/해제
await page.check('#checkbox-id')
await page.uncheck('#checkbox-id')
```

#### Assertions (검증)
```javascript
// 표시 여부
await expect(element).toBeVisible()
await expect(element).toBeHidden()

// 텍스트 포함
await expect(element).toContainText('텍스트')

// 정확한 텍스트
await expect(element).toHaveText('정확한 텍스트')

// 속성 확인
await expect(element).toHaveAttribute('href', 'url')

// 체크 상태
await expect(checkbox).toBeChecked()
await expect(checkbox).not.toBeChecked()

// 개수 확인
const count = await page.locator('.item').count()
expect(count).toBe(5)
```

#### 대기 (Wait)
```javascript
// 페이지 로드 대기
await page.waitForLoadState('networkidle')

// 요소 대기
await page.waitForSelector('#element-id')

// 시간 대기 (최후의 수단)
await page.waitForTimeout(1000)

// 함수 조건 대기
await page.waitForFunction(() => {
  return document.querySelector('#element-id').innerText === '원하는 텍스트'
})
```

#### Dialog 처리
```javascript
// 확인 다이얼로그
page.on('dialog', dialog => dialog.accept())

// 취소 다이얼로그
page.on('dialog', dialog => dialog.dismiss())

// 입력 다이얼로그
page.on('dialog', dialog => dialog.accept('입력 텍스트'))
```

## 트러블슈팅

### 문제: 테스트 타임아웃
**해결**: timeout 값을 증가시키거나, 더 구체적인 대기 조건 사용
```javascript
test('테스트', async ({ page }) => {
  // 특정 테스트의 타임아웃 설정
  test.setTimeout(60000); // 60초

  // 또는 더 구체적인 대기
  await page.waitForSelector('#element', { state: 'visible' })
});
```

### 문제: 요소를 찾을 수 없음
**해결**: 페이지 로드 완료 확인, 올바른 셀렉터 사용
```javascript
await page.waitForLoadState('networkidle')
await page.waitForSelector('#element-id', { state: 'visible' })
```

### 문제: Dialog 처리 안됨
**해결**: 이벤트 리스너를 액션 전에 등록
```javascript
// 올바른 방법
page.once('dialog', dialog => dialog.accept())
await page.click('#button')

// 잘못된 방법
await page.click('#button')
page.once('dialog', dialog => dialog.accept()) // 너무 늦음
```

### 문제: localStorage 초기화 안됨
**해결**: 각 테스트 전에 명시적으로 초기화
```javascript
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});
```

## CI/CD 통합

### GitHub Actions 예제
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Playwright 베스트 프랙티스](https://playwright.dev/docs/best-practices)
- [Playwright API 레퍼런스](https://playwright.dev/docs/api/class-playwright)

## 주의사항

1. **병렬 실행**: 기본적으로 병렬 실행되므로, 테스트 간 독립성 유지
2. **localStorage**: 각 테스트는 깨끗한 상태에서 시작하도록 초기화
3. **비동기**: 모든 Playwright API는 비동기이므로 `await` 필수
4. **타임아웃**: 네트워크 상황에 따라 타임아웃 조정 필요
5. **스크린샷**: 실패 시 자동으로 스크린샷과 비디오가 저장됨

## 테스트 품질 체크리스트

- [ ] 각 테스트는 독립적으로 실행 가능한가?
- [ ] beforeEach에서 깨끗한 상태로 초기화하는가?
- [ ] 하드코딩된 timeout 대신 조건부 대기를 사용하는가?
- [ ] 의미있는 테스트 설명을 작성했는가?
- [ ] 테스트 실패 시 원인을 쉽게 파악할 수 있는가?
- [ ] 불필요한 대기 시간이 없는가?
- [ ] Dialog 이벤트를 올바르게 처리하는가?

---

**작성일**: 2025-10-09
**버전**: 1.0.0
**프레임워크**: Playwright v1.55.0
