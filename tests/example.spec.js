// @ts-check
const { test, expect } = require("@playwright/test");

test("login", async ({ page }) => {
  await page.goto("http://farmholding-dev-fe.azurewebsites.net/");
  await page.getByRole("button", { name: "profile" }).click();
  await page.getByLabel("E-mailadres").click();
  await page.getByLabel("E-mailadres").fill("peter@rb2.nl");
  await page.getByLabel("Wachtwoord").click();
  await page.getByLabel("Wachtwoord").fill("12345678");
  await page.getByRole("button", { name: "Inloggen", exact: true }).click();
  await page.getByRole("button", { name: "profile" }).click();
  await expect(page).toHaveTitle(/Persoonlijke gegevens/i);
});
