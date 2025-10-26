// 북마크 관리 카드 테스트
import { test, expect } from '@playwright/test';

test.describe('북마크 관리 카드', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 북마크 관리 카드 표시
    await page.click('#settings-icon');
    await page.click('[data-category="tools"]');
    await page.check('#toggle-bookmark-manager-card');
    await page.click('#settings-modal .close-button');
    await expect(page.locator('#bookmark-manager-card')).toBeVisible();
    
    // 카드가 표시된 후 이벤트 리스너 초기화를 위해 잠시 대기
    await page.waitForTimeout(1000);
  });

  test('북마크 추가 기능이 작동하는지 확인', async ({ page }) => {
    // 북마크 추가 폼 요소들이 존재하는지 확인
    await expect(page.locator('#bookmark-form')).toBeVisible();
    await expect(page.locator('#bookmark-title')).toBeVisible();
    await expect(page.locator('#bookmark-url')).toBeVisible();
    await expect(page.locator('#bookmark-category')).toBeVisible();
    
    // 새 북마크 추가
    await page.fill('#bookmark-title', 'Google');
    await page.fill('#bookmark-url', 'https://www.google.com');
    await page.selectOption('#bookmark-category', 'tools');
    await page.fill('#bookmark-description', '구글 검색 엔진');
    
    // 폼 제출
    await page.evaluate(() => {
      const form = document.getElementById('bookmark-form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    });
    
    // 북마크가 목록에 추가되었는지 확인
    await expect(page.locator('#bookmarks-list')).toContainText('Google');
    await expect(page.locator('#bookmarks-list')).toContainText('https://www.google.com');
    await expect(page.locator('#bookmarks-list')).toContainText('구글 검색 엔진');

    // 통계 업데이트 확인
    await expect(page.locator('#bookmark-stats')).toContainText('북마크 1개');
  });

  test('북마크 검색 기능이 작동하는지 확인', async ({ page }) => {
    // 여러 북마크 추가
    const bookmarks = [
      { title: 'GitHub', url: 'https://github.com', category: 'development' },
      { title: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'development' },
      { title: 'Google', url: 'https://google.com', category: 'tools' }
    ];
    
    for (const bookmark of bookmarks) {
      await page.fill('#bookmark-title', bookmark.title);
      await page.fill('#bookmark-url', bookmark.url);
      await page.selectOption('#bookmark-category', bookmark.category);
      // 폼 제출
    await page.evaluate(() => {
      const form = document.getElementById('bookmark-form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    });
    }
    
    // 검색 기능 테스트
    await page.fill('#bookmark-search', 'GitHub');
    
    // GitHub만 표시되는지 확인
    await expect(page.locator('#bookmarks-list')).toContainText('GitHub');
    await expect(page.locator('#bookmarks-list')).not.toContainText('Stack Overflow');
    await expect(page.locator('#bookmarks-list')).not.toContainText('Google');
    
    // 검색어 지우기
    await page.fill('#bookmark-search', '');
    
    // 모든 북마크가 다시 표시되는지 확인
    await expect(page.locator('#bookmarks-list')).toContainText('GitHub');
    await expect(page.locator('#bookmarks-list')).toContainText('Stack Overflow');
    await expect(page.locator('#bookmarks-list')).toContainText('Google');
  });

  test('카테고리 필터 기능이 작동하는지 확인', async ({ page }) => {
    // 다른 카테고리의 북마크들 추가
    const bookmarks = [
      { title: 'VS Code', url: 'https://code.visualstudio.com', category: 'development' },
      { title: 'Figma', url: 'https://figma.com', category: 'design' },
      { title: 'Notion', url: 'https://notion.so', category: 'documentation' }
    ];
    
    for (const bookmark of bookmarks) {
      await page.fill('#bookmark-title', bookmark.title);
      await page.fill('#bookmark-url', bookmark.url);
      await page.selectOption('#bookmark-category', bookmark.category);
      // 폼 제출
    await page.evaluate(() => {
      const form = document.getElementById('bookmark-form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    });
    }
    
    // 개발 카테고리 필터 적용
    await page.selectOption('#category-filter', 'development');
    
    // 개발 카테고리 북마크만 표시되는지 확인
    await expect(page.locator('#bookmarks-list')).toContainText('VS Code');
    await expect(page.locator('#bookmarks-list')).not.toContainText('Figma');
    await expect(page.locator('#bookmarks-list')).not.toContainText('Notion');
    
    // 전체 카테고리로 변경
    await page.selectOption('#category-filter', 'all');
    
    // 모든 북마크가 다시 표시되는지 확인
    await expect(page.locator('#bookmarks-list')).toContainText('VS Code');
    await expect(page.locator('#bookmarks-list')).toContainText('Figma');
    await expect(page.locator('#bookmarks-list')).toContainText('Notion');
  });

  test('북마크 편집 기능이 작동하는지 확인', async ({ page }) => {
    // 북마크 추가
    await page.fill('#bookmark-title', 'Example Site');
    await page.fill('#bookmark-url', 'https://example.com');
    await page.selectOption('#bookmark-category', 'other');
    // 폼 제출
    await page.evaluate(() => {
      const form = document.getElementById('bookmark-form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    });
    
    // 편집 버튼 클릭 처리 (prompt 처리)
    page.on('dialog', dialog => {
      if (dialog.message().includes('제목을 수정하세요')) {
        dialog.accept('Updated Example Site');
      } else if (dialog.message().includes('URL을 수정하세요')) {
        dialog.accept('https://updated-example.com');
      } else if (dialog.message().includes('설명을 수정하세요')) {
        dialog.accept('Updated description');
      } else {
        dialog.accept();
      }
    });
    
    await page.click('.edit-bookmark-btn');
    
    // 수정된 내용이 반영되었는지 확인
    await expect(page.locator('#bookmarks-list')).toContainText('Updated Example Site');
    await expect(page.locator('#bookmarks-list')).toContainText('https://updated-example.com');
  });

  test('북마크 삭제 기능이 작동하는지 확인', async ({ page }) => {
    // 북마크 추가
    await page.fill('#bookmark-title', 'To Delete');
    await page.fill('#bookmark-url', 'https://to-delete.com');
    // 폼 제출
    await page.evaluate(() => {
      const form = document.getElementById('bookmark-form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    });
    
    // 삭제 확인 대화상자 처리
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('삭제하시겠습니까?');
      dialog.accept();
    });
    
    await page.click('.delete-bookmark-btn');
    
    // 북마크가 삭제되었는지 확인
    await expect(page.locator('#bookmarks-list')).not.toContainText('To Delete');
    await expect(page.locator('#bookmarks-list')).toContainText('저장된 북마크가 없습니다');
  });

  test('북마크 링크 클릭 시 새 탭에서 열리는지 확인', async ({ page }) => {
    // 북마크 추가
    await page.fill('#bookmark-title', 'External Link');
    await page.fill('#bookmark-url', 'https://example.com');
    // 폼 제출
    await page.evaluate(() => {
      const form = document.getElementById('bookmark-form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    });
    
    // 새 탭에서 열리는지 확인 (target="_blank" 속성)
    const bookmarkLink = page.locator('.bookmark-title a');
    await expect(bookmarkLink).toHaveAttribute('target', '_blank');
    await expect(bookmarkLink).toHaveAttribute('href', 'https://example.com');
  });

  test('URL 프로토콜 자동 추가 기능이 작동하는지 확인', async ({ page }) => {
    // 프로토콜 없는 URL 입력
    await page.fill('#bookmark-title', 'No Protocol');
    await page.fill('#bookmark-url', 'example.com');
    // 폼 제출
    await page.evaluate(() => {
      const form = document.getElementById('bookmark-form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    });
    
    // https://가 자동으로 추가되었는지 확인
    await expect(page.locator('#bookmarks-list')).toContainText('https://example.com');
  });

  test('북마크 전체 삭제 기능이 작동하는지 확인', async ({ page }) => {
    // 여러 북마크 추가
    const bookmarks = ['Site 1', 'Site 2', 'Site 3'];
    
    for (let i = 0; i < bookmarks.length; i++) {
      await page.fill('#bookmark-title', bookmarks[i]);
      await page.fill('#bookmark-url', `https://site${i + 1}.com`);
      // 폼 제출
    await page.evaluate(() => {
      const form = document.getElementById('bookmark-form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    });
    }
    
    // 전체 삭제 확인 대화상자 처리
    page.on('dialog', dialog => {
      if (dialog.message().includes('정말로 모든 북마크')) {
        dialog.accept();
      } else if (dialog.message().includes('모든 북마크가 삭제되었습니다')) {
        dialog.accept();
      }
    });
    
    await page.click('#clear-all-bookmarks-btn');
    
    // 모든 북마크가 삭제되었는지 확인
    await expect(page.locator('#bookmarks-list')).toContainText('저장된 북마크가 없습니다');
    await expect(page.locator('#bookmark-stats')).toContainText('북마크 0개');
  });
});