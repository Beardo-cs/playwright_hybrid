import { test, expect, Page } from "@playwright/test";
import Chance from "chance";
import * as OTPAuth from "otpauth";
import { SignupFragment } from "./fragments/signup.fragment";
import { LoginPage } from "../pages/login.page";
import { NEW_URL, PASSWORD } from "./constants/app.constant";
import { LoginFragment } from "./fragments/login.fragment";
import { LandingPage } from "../pages/landing.page";

test.describe("Signup and Login Tests", () => {
  // Declare variables at the test suite level
  let totpInstance: OTPAuth.TOTP;
  let secretKey: string;
  let email: string;
  let firstName: string;
  let lastName: string;
  let companyName: string;
  let loginFragment: LoginFragment;
  let landingPage: LandingPage;

  test.beforeAll(async ({ browser }) => {
    const chance = new Chance();
    email = chance.email();
    const name = chance.name().split(" ");
    firstName = name[0];
    lastName = name[name.length - 1];
    companyName = name[0];
  });

  // Helper function to generate TOTP code
  const generateTOTPCode = (): string => {
    if (!totpInstance) {
      throw new Error("TOTP instance not initialized yet. Secret key must be set first.");
    }
    return totpInstance.generate();
  };

  test("Verify that new signup flow works with required details", async ({ page }) => {
    const signupFragment = new SignupFragment(page);
    await signupFragment.signUp(email, "India", companyName, firstName, lastName);
    const signupText = await signupFragment.validateSignupText();
    expect(signupText).toContain("Your Company Domain is Ready! ");
  });

  test("Verify functionality of newly created tenant's sign-in and setup TOTP", async ({ page }) => {
    const signupFragment = new SignupFragment(page);
    const loginPage = new LoginPage(page);
    loginFragment = new LoginFragment(page); // Initialize and store at suite level
    
    console.log("Test: " + companyName);
    await signupFragment.tryUpToSSLCreated(page, email, companyName);
    await loginPage.login(email, "Test@123");
    
    let secretKeyLocator = await loginPage.changeManualCode();
    secretKey = await secretKeyLocator.textContent() || "";
    
    if (!secretKey) {
      throw new Error("Secret key could not be retrieved");
    }
    
    // Initialize TOTP instance with the secret key (at the suite level)
    totpInstance = new OTPAuth.TOTP({
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secretKey.trim(),
    });
    
    // Generate and use the current TOTP code
    const totpCode = generateTOTPCode();
    console.log("Generated TOTP code:", totpCode);
    
    await loginPage.enterOneTimeCode(totpCode);
    
    // Verify MFA setup completion
    const mfaSetupCompleteLocator = await loginPage.MFASetupComplete();
    expect(await mfaSetupCompleteLocator.textContent()).toBe("MFA setup complete!");

    await loginPage.continueToTrioButton();
  });

  test("Verify login with TOTP after setup", async ({ page }) => {
    const signupFragment = new SignupFragment(page);
    const loginPage = new LoginPage(page);
    const landingPage = new LandingPage(page);
    
    await signupFragment.tryUpToSSLCreated(page, email, companyName);
    await loginPage.login(email, "Test@123");
    
    // Generate a new TOTP code
    const totpCode = generateTOTPCode();
    console.log("Login with TOTP code:", totpCode);
    await loginPage.clickOnUseAuthenticator(totpCode);
    expect(await landingPage.validateDashboardText()).toBe("Dashboard"); //Validating the Dashboard page
    

  });
});