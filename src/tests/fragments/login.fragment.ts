import { Page } from "@playwright/test";
import { LoginPage } from "../../pages/login.page";
import { APPLICATION_URL,NEW_URL, EMAIL, SECRET_TOKEN } from "../constants/app.constant";
import * as OTPAuth from "otpauth";

export class LoginFragment {
  private page: Page;
  private loginPage: LoginPage;
  private totpObject: { secret: string; digits: number; algorithm: string; period: number };

  constructor(page: Page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
    this.totpObject = {
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: SECRET_TOKEN,
    };
  }


  async login(email: string = EMAIL, password: string = "Test@123", applicationUrl: string = NEW_URL, companyName: string): Promise<void> {
    const tenantURL = applicationUrl.replace("companyName", companyName);
    await this.page.goto(tenantURL);
    await this.loginPage.login(email, password);
  }


  async getSecretKey(): Promise<string> {
    const secretKeyLocator = await this.loginPage.changeManualCode();
    const secretKeyText = await secretKeyLocator.textContent() || "";
    
    if (!secretKeyText || secretKeyText.trim() === "") {
      throw new Error("Secret key could not be retrieved from the page");
    }
    
    const secretKey = secretKeyText.trim();
    console.log("Retrieved secret key:", secretKey);
    
    // Update the totpObject with the new secret key
    this.totpObject.secret = secretKey;
    
    return secretKey;
  }


  async generateOTPCode(totpConfig: { secret: string; digits: number; algorithm: string; period: number } = this.totpObject): Promise<string> {
    // If secret key is not set or is SECRET_TOKEN placeholder, try to get it from the page
    if (!totpConfig.secret || totpConfig.secret === SECRET_TOKEN) {
      const secretKey = await this.getSecretKey();
      totpConfig = { ...totpConfig, secret: secretKey };
    }
    
    // Create TOTP instance and generate code
    const totp = new OTPAuth.TOTP({
      secret: totpConfig.secret,
      digits: totpConfig.digits,
      algorithm: totpConfig.algorithm as "SHA1" | "SHA256" | "SHA512", // Type assertion for OTPAuth
      period: totpConfig.period,
    });
    
    const code = totp.generate();
    console.log("Generated TOTP code:", code);
    return code;
  }

  /**
   * Enter MFA code during authentication
   */
  async enterMFA(): Promise<void> {
    const otpCode = await this.generateOTPCode();
    await this.loginPage.clickOnUseAuthenticator(otpCode);
  }

  /**
   * Set a known secret key (useful when running tests with an existing account)
   */
  setSecretKey(secretKey: string): void {
    this.totpObject.secret = secretKey;
    console.log("Secret key manually set to:", secretKey);
  }

  /**
   * Complete full MFA setup flow
   */
  async completeMFASetup(): Promise<string> {
    // Get the secret key
    const secretKey = await this.getSecretKey();
    
    // Generate and enter TOTP code
    const otpCode = await this.generateOTPCode();
    await this.loginPage.enterOneTimeCode(otpCode);
    
    // Verify MFA setup completion
    const mfaSetupCompleteLocator = await this.loginPage.MFASetupComplete();
    const mfaSetupText = await mfaSetupCompleteLocator.textContent();
    
    if (mfaSetupText !== "MFA setup complete!") {
      throw new Error(`MFA setup failed. Got text: ${mfaSetupText}`);
    }
    
    // Continue to application
    await this.loginPage.continueToTrioButton();
    
    return secretKey;
  }
}