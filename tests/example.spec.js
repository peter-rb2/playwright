const { test, expect } = require("@playwright/test");
const { DEV } = require("../config.json");
const { setTimeout } = require("timers/promises");
const axios = require("axios");
test.beforeEach(async ({ page }) => {
  test.slow();
  await page.goto(DEV.WEBSITE_URL);
  await page.getByRole("button", { name: "profile" }).click();
  await page.locator("#login-email").click(DEV.USER_NAME);
  await page.locator("#login-email").fill(DEV.USER_NAME);
  await page.locator("#login-password").click(DEV.USER_PASSWORD);
  await page.locator("#login-password").fill(DEV.USER_PASSWORD);
  await page.getByRole("button", { name: "Inloggen", exact: true }).click();
});

test.describe("order", () => {
  test("Places a order with unprint products", async ({ page }) => {
    test.setTimeout(300000);
    await page.locator(".octa-grid a").first().click();
    await page.locator(".product-card.category").first().click();
    await setTimeout(5000);
    await page
      .locator(".product .options .options__button")
      .filter({ hasText: "Kies bedrukking" })
      .click();
    await page
      .locator(".print-options .print-option")
      .filter({ hasText: "Geen opdruk" })
      .click();
    await page.locator(".sidebar__submit button").click();
    await expect(page.locator(".product .options > div").nth(1)).toHaveText(
      /Geen opdruk/i
    );
    await page.locator(".add-basket button").click();
    await page
      .locator(".sf-modal__container .buttons .buttons__add button")
      .click();
    await page.locator(".cart-summary-wrapper button").click();
    await page.locator("#termsAndConditions").check();
    await page.locator(".cart-summary-wrapper .ld-over button").click();
    await page
      .locator(".cart-summary-wrapper .block-footer button")
      .filter({ hasText: /Naar Mijn Account/i })
      .click();
    await page.locator(".menu-item").first().click();
    const orderNumStr = await page
      .locator(".orders.open > div")
      .first()
      .locator("a")
      .textContent();
    const orderNum = orderNumStr.replace(/\s+/g, "").split("Ordernummer").pop();
    console.log(orderNum);
    await page
      .locator(".orders.open > div")
      .first()
      .locator(".order__content")
      .click();
    const lineItemPriceStr = await page
      .locator(".sf-table__data.item__column")
      .filter({ hasText: /PRIJS/i })
      .locator("div > div")
      .nth(1)
      .textContent();
    const lineItemPrice = Number(
      lineItemPriceStr.replace(/\s+/g, "").split("€").pop().replace(",", ".")
    );
    console.log(lineItemPrice);
    const subtotalStr = await page
      .locator(".resume__right .row")
      .filter({ hasText: /Totaal artikelen/i })
      .locator("span")
      .nth(1)
      .textContent();
    const subtotal = Number(
      subtotalStr.replace(/\s+/g, "").split("€").pop().replace(",", ".")
    );
    console.log(subtotal);
    const btwStr = await page
      .locator(".resume__right .row")
      .filter({ hasText: /BTW/i })
      .locator("span")
      .nth(1)
      .textContent();
    const btw = Number(
      btwStr.replace(/\s+/g, "").split("€").pop().replace(",", ".")
    );
    console.log(btw);
    const totalStr = await page
      .locator(".resume__right .row.total span")
      .nth(1)
      .textContent();
    const total = Number(
      totalStr.replace(/\s+/g, "").split("€").pop().replace(",", ".")
    );
    console.log(total);
    await setTimeout(60000);
    try {
      const {
        data: { token },
      } = await axios.get(
        "http://farmholding-dev-fe.azurewebsites.net/api/user/GetCrmToken",
        {
          headers: {
            Authorization:
              "Basic RHluYW1pY3MtYXBpQGFsbGdpZnRzLm5sOlVaUVJPTWgjSDd6e3lAYnlwV0c9Mj4zeDI=",
          },
        }
      );
      const {
        data: { value },
      } = await axios.get(
        "https://farm-ontw.crm4.dynamics.com/api/data/v9.0//salesorders?",
        {
          params: { $top: 1, $filter: `name eq '${orderNum}'` },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const {
        farm_bedragbtw,
        farm_totaalbedraginclusiefbtw,
        farm_totaalorderbedrag,
      } = value[0];
      console.log(
        farm_totaalorderbedrag,
        farm_bedragbtw,
        farm_totaalbedraginclusiefbtw
      );
      expect(subtotal).toBe(farm_totaalorderbedrag);
      expect(subtotal).toBe(farm_totaalorderbedrag);
      expect(total).toBe(farm_totaalbedraginclusiefbtw);
    } catch (error) {
      expect(() => {
        throw new Error(error);
      }).toThrow();
    }
  });
  //   test("Places a order with print products", async ({ page }) => {});
  //   test("Places a order with print and unprint products", async ({
  //     page,
  //   }) => {});
});
