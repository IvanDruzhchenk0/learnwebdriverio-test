import { test, expect } from "@playwright/test";
import { createName, createEmail } from "../helpers/createName";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("Articles", () => {
  const email = createEmail("gmail.com");
  const name = createName();

  const emailField = 'input[placeholder="Email"]';
  const passwordField = 'input[placeholder="Password"]';
  const signInButton = '//button[contains(text(), "Sign in")]';

  test("Create Article", async ({ page }) => {
    await page.locator('//a[contains (@href,"/register")]').click();
    await page.locator('input[placeholder="Username"]').fill(name);
    await page.locator(emailField).fill(email);
    await page.locator(passwordField).fill("Qwerty123@");
    await page.locator('//button[contains(text(), "Sign up")]').click();

    await page.locator('//a[contains (@href,"/editor")]').click();
    await page
      .locator('[data-qa-id="editor-title"]')
      .fill("Test article Ivan");
    await page
      .locator('[data-qa-id="editor-description"]')
      .fill("This article is about creating article");
    await page
      .locator('//*[@class="form-group"]//textarea')
      .fill("I'd like to type some dummy text :)");
    await page.locator('[data-qa-id="editor-tags"]').fill("testing");
    await page.locator('button[data-qa-id="editor-publish"]').click();

    await expect(
      page.locator(
        '//*[@data-qa-id="article-title"][contains(text(), "Test article Ivan")]'
      )
    ).toBeVisible();
    await expect(
      await page.locator('//*[@class="banner"]//a[contains (@href,"/editor/")]')
    ).toBeVisible();
    await expect(
      page.locator('//*[@class="banner"]//button[@data-qa-id="article-delete"]')
    ).toBeVisible();
  });

  test("Add created article to favorite", async ({ page }) => {
    await page.locator('//a[contains (@href,"/login")]').click();
    await page.locator(emailField).fill(email);
    await page.locator(passwordField).fill("Qwerty123@");
    await page.locator(signInButton).click();
    await page
      .getByRole("link", { name: `${name}` })
      .first()
      .click();
    await page
      .locator('button[data-qa-type="article-favorite"]')
      .first()
      .click();
    await page.locator('//a[contains (@href,"/favorites")]').click();
    await expect(
      page.locator(
        '//*[@data-qa-type="preview-title"][contains(text(), "Test article")]'
      )
    ).toBeVisible();
    await page.locator('//li[@data-qa-type="feed-tab"]/a[contains(text(), "My Articles")]').click();
    await expect(
      page.locator(
        '//*[@data-qa-type="article-favorite-count"][contains(text(), "1")]'
      )
    ).toBeVisible();
  });

  test("Delete article from favorite", async ({ page }) => {
    await page.locator('//a[contains (@href,"/login")]').click();
    await page.locator(emailField).fill(email);
    await page.locator(passwordField).fill("Qwerty123@");
    await page.locator(signInButton).click();
    await page
      .getByRole("link", { name: `${name}` })
      .first()
      .click();

    await page.locator('//a[contains (@href,"/favorites")]').click();
    await page.locator('button[data-qa-type="article-favorite"]').click();
    await page.reload();
    await expect(
      page.locator(
        '//*[@data-qa-type="preview-title"][contains(text(), "Test article")]'
      )
    ).toBeHidden();
    await expect(
      page.locator(
        '//*[@data-qa-type="article-list"]//div[contains(text(), "No articles are here")]'
      )
    ).toBeVisible();
    await page.locator('//li[@data-qa-type="feed-tab"]/a[contains(text(), "My Articles")]').click();
    await expect(
      page.locator(
        '//*[@data-qa-type="article-favorite-count"][contains(text(), "0")]'
      )
    ).toBeVisible();
  });
});
