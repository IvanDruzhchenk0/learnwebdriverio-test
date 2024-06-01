import { test, expect } from "@playwright/test";
import { createName, createEmail } from "../helpers/createName";

test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

test.describe("Authorization", () => {
  const email = createEmail("gmail.com");
  const name = createName();

  const emailField = 'input[placeholder="Email"]';
  const passwordField = 'input[placeholder="Password"]';
  const signInButton = '//button[contains(text(), "Sign in")]';
  const editProfileButton = '//*[@data-qa-id="follow-toggle"]';
  const profileUserName = '//*[@data-qa-id="profile-username"]';

  test("Sign Up", async ({ page }) => {
    await page.locator('//a[contains (@href,"/register")]').click();
    await page.locator('input[placeholder="Username"]').fill(name);
    await page.locator(emailField).fill(email);
    await page.locator(passwordField).fill("Qwerty123@");
    await page.locator('//button[contains(text(), "Sign up")]').click();

    await page.getByRole("link", { name: `${name}` }).click();
    await expect(page.locator(editProfileButton)).toBeVisible();
    await expect(page.locator(profileUserName)).toBeVisible();
  });

  test("Sigh In", async ({ page }) => {
    await page.locator('//a[contains (@href,"/login")]').click();
    await page.locator(emailField).fill(email);
    await page.locator(passwordField).fill("Qwerty123@");
    await page.locator(signInButton).click();

    await page.getByRole("link", { name: `${name}` }).click();
    await expect(page.locator(editProfileButton)).toBeVisible();
    await expect(page.locator(profileUserName)).toBeVisible();
  });

   test("Logout", async ({ page }) => {
    await page.locator('//a[contains (@href,"/login")]').click();
    await page.locator(emailField).fill(email);
    await page.locator(passwordField).fill("Qwerty123@");
    await page.locator(signInButton).click();
    await page.locator('//a[contains (@href,"/settings")]').click();
    await page.locator('//button[contains(text(), "click here to logout")]').click();

    await expect(page.getByRole("link", { name: `${name}` })).toBeHidden();
   });
});
