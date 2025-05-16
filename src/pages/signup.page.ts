import { Page, Locator } from "@playwright/test";

export class SignUpPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly countryInput: Locator;
  readonly companyNameInput: Locator;
  readonly submitButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly privacyCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('//*[@name="email"]');
    this.countryInput = page.locator('//*[@placeholder="Select HQ location"]');
    this.companyNameInput = page.locator('//*[@placeholder="Enter your company name"]');
    this.submitButton = page.locator('//*[@type="submit"]');
    this.firstNameInput = page.locator("//*[@name='firstName']");
    this.lastNameInput = page.locator("//*[@name='lastName']");
    this.passwordInput = page.locator("//*[@name='password']");
    this.confirmPasswordInput = page.locator("//*[@name='confirmPassword']");
    this.privacyCheckbox = page.locator('//*[@id="privacy"]');
  }

  async signup(email: string, country: string, companyName: string, firstName: string, lastName: string) {
    await this.emailInput.fill(email);
    await this.countryInput.fill(country);
    await this.page.click('//*[text()="India"]');
    await this.companyNameInput.fill(companyName);
    await this.submitButton.click();

    const otpPromise = new Promise<string>((resolve, reject) => {
      this.page.on('response', async (response) => {
        if (response.url().includes('v2/auth/send-signup-verification-email')) { 
          try {
            const jsonResponse = await response.json();
            console.log('API Response:', jsonResponse);
            if (jsonResponse && jsonResponse.code) {
              console.log('Captured OTP:', jsonResponse.code);
              resolve(jsonResponse.code.toString());
            } else {
              reject(new Error('OTP not found in response'));
            }
          } catch (error) {
            reject(error);
          }
        }
      });
    });

    const otp = await otpPromise;
    console.log('Using OTP:', otp);
    for (let i = 0; i < otp.length; i++) {
      await this.page.locator('//*[@class="flex space-x-3"]').locator('//input[@type="text"]').nth(i).fill(otp[i]);
    }

    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.passwordInput.fill("Test@123");
    await this.confirmPasswordInput.fill("Test@123");
    await this.privacyCheckbox.click();
    await this.submitButton.click();
  }

  async ValidateSignupText() {
    return await this.page.getByText('Your Company Domain is Ready! ').textContent();
  }
}
