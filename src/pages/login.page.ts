import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly authenticator_App: Locator;
  readonly otpInput: Locator;
  readonly nextStep: Locator;
  readonly changeManual: Locator;
  readonly secretKeyContent: Locator;
  readonly OTOP: Locator;
  readonly continueButton: Locator;
  readonly MFAComplete: Locator;
  readonly continueTRIO: Locator;



  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('//*[@placeholder="username, Email or phone"]');
    this.passwordInput = page.locator('//*[@placeholder="Password"]');
    this.loginButton = page.locator('//button[@type="submit"]');
    this.authenticator_App = page.getByText('Use Authenticator App');
    this.otpInput = page.getByPlaceholder("Passcode");
    this.nextStep = page.locator('//button[@type="submit"]');
    this.changeManual = page.getByText("Change to manual code");
    this.secretKeyContent = page.locator("[class='text-gray-900 text-[24px] leading-8']");
    this.OTOP = page.locator("[type='text']");
    this.continueButton = page.getByText("Continue");
    this.MFAComplete = page.getByText("MFA setup complete!");
    this.continueTRIO = page.getByText("Continue to Trio");


    
  }


  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async changeManualCode(){
    await this.changeManual.click();
    let secretKeyContent = this.secretKeyContent;
    await secretKeyContent.waitFor({ state: 'visible', timeout: 5000 }) 
    return secretKeyContent;
  }


  async enterOneTimeCode(secretKeyContent){
    await this.OTOP.pressSequentially(secretKeyContent);
    await this.continueButton.click();
  }

  async MFASetupComplete(){
   return  this.MFAComplete;
  }

  async continueToTrioButton(){
    return  this.continueTRIO.click;
   }

  async clickOnUseAuthenticator(otp){
    await this.otpInput.fill(otp);
    await this.nextStep.click();
  }
}
