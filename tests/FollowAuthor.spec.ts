import { test, expect } from "@playwright/test";
import { createName, createEmail } from "../helpers/createName";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("Follow authors from Global Feed", () => {
  const email = createEmail("gmail.com");
  const name = createName();

  const emailField = 'input[placeholder="Email"]';
  const passwordField = 'input[placeholder="Password"]';
  const signInButton = '//button[contains(text(), "Sign in")]';

  test("Follow authors from Global Feed", async ({ page }) => {
    await page.locator('//a[contains (@href,"/register")]').click();
    await page.locator('input[placeholder="Username"]').fill(name);
    await page.locator(emailField).fill(email);
    await page.locator(passwordField).fill("Qwerty123@");
    await page.locator('//button[contains(text(), "Sign up")]').click();
    await page.waitForTimeout(1500);

    // Get list of all articles presented on Global Feed page. Iterate by 'author-name' because it was easier solution.
    const articlesList = page.locator('[data-qa-type="author-name"]');
    const countArticles = await articlesList.count();
    let clickCounter = 0;

    for (let i = 0; i < countArticles; i++) {
      let listItem = articlesList.locator("nth=" + i);
      await listItem.click();
      await page.waitForTimeout(1500);

      // If 'Follow' button is visible - click. If 'Unfollow' button is visible - skip click.
      if (
        await page
          .locator(
            '//*[@data-qa-id="follow-toggle"][contains(text(), "Follow")]'
          )
          .isVisible()
      ) {
        await page.locator('//*[@data-qa-id="follow-toggle"]').click();
        clickCounter++;
        await page.goBack();
      } else if (
        await page
          .locator(
            '//*[@data-qa-id="follow-toggle"][contains(text(), "Follow")]'
          )
          .isHidden()
      ) {
        await page.goBack();
      }
    }

    // Count articles in 'My Feed' section.
    await page.locator('//a[contains (@href,"/my-feed")]').click();
    await page.waitForTimeout(1500);
    const myFeedArticles = page.locator('[data-qa-type="article-preview"]');
    const countMyFeedArticles = await myFeedArticles.count();
    // Assert that at least one author is added to 'My Feed'
    expect(countMyFeedArticles).toBeGreaterThan(0);

    // Check that number of articles in 'My Feed' section equals or have higher number than number of authors on 'Global Feed' tab
    expect(countMyFeedArticles).toBeGreaterThanOrEqual(clickCounter);
  });

  test("Unfollow authors from My Feed", async ({ page }) => {
    await page.locator('//a[contains (@href,"/login")]').click();
    await page.locator(emailField).fill(email);
    await page.locator(passwordField).fill("Qwerty123@");
    await page.locator(signInButton).click();

    await page.locator('//a[contains (@href,"/my-feed")]').click();
    await page.waitForTimeout(1500);

    // Get list of all articles presented on My Feed page.
    const articlesList = page.locator('[data-qa-type="author-name"]');
    const countArticles = await articlesList.count();

    for (let i = 0; i < countArticles; i++) {
      let listItem = articlesList.locator("nth=" + i);
      await page.waitForTimeout(1000);
      // Condition that checks that there are still some authors followed
      if (
        await page
          .locator(
            '//*[@data-qa-type="article-list"]//div[contains(text(), "No articles are here")]'
          )
          .isHidden()
      ) {
        await listItem.click();
        await page.waitForTimeout(1000);
        await page.locator('//*[@data-qa-id="follow-toggle"]').click();
        await page.goBack();
      }
      // Condition that breaks the cycle if all authors were unfollowed
      else if (
        await page
          .locator(
            '//*[@data-qa-type="article-list"]//div[contains(text(), "No articles are here")]'
          )
          .isVisible()
      ) {
        break;
      }
    }

    // Additional assertion
    await expect(page.locator('[data-qa-type="author-name"]')).toBeHidden();
  });
});
