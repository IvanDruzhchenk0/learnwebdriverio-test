import { test, expect } from "@playwright/test";
import { createName, createEmail } from "../helpers/createName";

test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

test.describe("Authorization", () => {
  const email = createEmail("gmail.com");
  const name = createName();

  test("Sign Up", async ({ page }) => {
    await page.locator('//a[contains (@href,"/register")]').click();
    await page.locator('input[placeholder="Username"]').fill(name);
    await page.locator('input[placeholder="Email"]').fill(email);
    await page.locator('input[placeholder="Password"]').fill("Qwerty123@");
    await page.locator('//button[contains(text(), "Sign up")]').click();

    await page.getByRole("link", { name: `${name}` }).click();
    await expect(page.locator('//*[@data-qa-id="follow-toggle"]')).toBeVisible();
    await expect(page.locator('//*[@data-qa-id="profile-username"]')).toBeVisible();
  });

  test("Sigh In", async ({ page }) => {
    await page.locator('//a[contains (@href,"/login")]').click();
    await page.locator('input[placeholder="Email"]').fill(email);
    await page.locator('input[placeholder="Password"]').fill("Qwerty123@");
    await page.locator('//button[contains(text(), "Sign in")]').click();

    await page.getByRole("link", { name: `${name}` }).click();
    await expect(page.locator('//*[@data-qa-id="follow-toggle"]')).toBeVisible();
    await expect(page.locator('//*[@data-qa-id="profile-username"]')).toBeVisible();
  });

   test("Logout", async ({ page }) => {
    await page.locator('//a[contains (@href,"/login")]').click();
    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Password").fill("Qwerty123@");
    await page.locator('//button[contains(text(), "Sign in")]').click();
    await page.locator('//a[contains (@href,"/settings")]').click();
    await page.locator('//button[contains(text(), "click here to logout")]').click();

    await expect(page.getByRole("link", { name: `${name}` })).toBeHidden();
   });
});
