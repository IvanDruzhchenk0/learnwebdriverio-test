import { test, expect } from "@playwright/test";
//import { createName, createEmail } from "../helpers/createName";

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
    await page.locator('[data-qa-id="editor-title"]').fill("Test article Ivan");
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
    await page
      .locator(
        '//li[@data-qa-type="feed-tab"]/a[contains(text(), "My Articles")]'
      )
      .click();
    await expect(
      page.locator(
        '//*[@data-qa-type="article-favorite-count"][contains(text(), "1")]'
      )
    ).toBeVisible();
  });

  test("Add articles from Global Feed to favorite", async ({ page }) => {
    await page.locator('//a[contains (@href,"/login")]').click();
    await page.locator(emailField).fill(email);
    await page.locator(passwordField).fill("Qwerty123@");
    await page.locator(signInButton).click();
    await page.waitForTimeout(1500);

    const favoriteButton = page.locator('[data-qa-type="article-favorite"]');
    const countButtons = await favoriteButton.count();
    console.log(countButtons);

    // Break cycle because if number of articles > 5 they are splitted into different pages on User page
    for (let i = 0; i < countButtons; i++) {
      if (i === 6) {
        break;
      }
      let listItem = favoriteButton.locator("nth=" + i);
      await listItem.click();
    }

    await page
      .getByRole("link", { name: `${name}` })
      .first()
      .click();
    await page.locator('//a[contains (@href,"/favorites")]').click();
    await page.waitForTimeout(1500);

    const favoritedArticles = page.locator('[data-qa-type="article-preview"]');
    const countArticles = await favoritedArticles.count();
    console.log(countArticles);

    //Conditions that are needed for now to be able to work with the limitation of current realization
    if (countButtons >= 5) {
      expect(countArticles).toEqual(5);
    } else {
      expect(countArticles).toEqual(countButtons);
    }
  });

  test("Delete articles from favorite", async ({ page }) => {
    await page.locator('//a[contains (@href,"/login")]').click();
    await page.locator(emailField).fill(email);
    await page.locator(passwordField).fill("Qwerty123@");
    await page.locator(signInButton).click();
    await page
      .getByRole("link", { name: `${name}` })
      .first()
      .click();

    await page.locator('//a[contains (@href,"/favorites")]').click();
    await page.waitForTimeout(1500);

    const favoriteButton = page.locator('[data-qa-type="article-favorite"]');
    const countButtons = await favoriteButton.count();
    console.log(countButtons);

    //TODO: find solution to work with all articles if they are divided on several pages
    for (let i = 0; i < countButtons; i++) {
      let listItem = favoriteButton.locator("nth=" + i);
      await listItem.click();
    }
    await page.reload();

    await expect(
      page.locator(
        '//*[@data-qa-type="article-list"]//div[contains(text(), "No articles are here")]'
      )
    ).toBeVisible();
    await page
      .locator(
        '//li[@data-qa-type="feed-tab"]/a[contains(text(), "My Articles")]'
      )
      .click();
    await expect(
      page.locator(
        '//*[@data-qa-type="article-favorite-count"][contains(text(), "0")]'
      )
    ).toBeVisible();
  });
});
