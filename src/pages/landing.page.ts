import { Page, Locator } from "@playwright/test";

export class LandingPage {
  readonly page: Page;
  readonly dashboardText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardText = page.getByText('Dashboard');
  }

  async validateDashboardText() {
    return await this.dashboardText.first().textContent();
  }
}
