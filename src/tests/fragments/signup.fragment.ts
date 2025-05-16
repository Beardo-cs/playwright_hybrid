import { Page,expect } from "@playwright/test";
import { LandingPage } from "../../pages/landing.page";
import { LoginPage } from "../../pages/login.page";
import { SignUpPage } from "../../pages/signup.page";

import { APPLICATION_URL,APPLICATION_SIGNUP_URL,NEW_URL } from "../constants/app.constant";

export class SignupFragment {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async signUp(email: string, country: string, companyName: string, firstName: string, lastName: string  ) {
    await this.page.goto(APPLICATION_SIGNUP_URL);
    const signUpPage = new SignUpPage(this.page);
    await signUpPage.signup(email, country, companyName, firstName, lastName);
  }

  async validateSignupText(){
    //wait 
    const signUpPage = new SignUpPage(this.page);
    return await signUpPage.ValidateSignupText();
  }


 async tryUpToSSLCreated( page ,email, companyName) {
      const loginPage = new LoginPage(page);
      const maxRetries = 25; // Maximum number of retries
      const retryDelay = 3500; // Delay between retries in milliseconds
      let success = false;
    
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Attempt ${attempt}: Navigating to tenant URL...`);
          const tenantURL = NEW_URL.replace("companyName", companyName);
          const response = await page.goto(tenantURL);
    
          // Check if the response is valid and not a 404
          if (response && response.status() === 404) {
            throw new Error("404 Not Found");
          }
    
          success = true;
          break; // Exit the loop if navigation is successful
        } catch (error) {
          console.error(`Attempt ${attempt} failed:`, error.message);
          if (attempt === maxRetries) {
            throw new Error("Failed to navigate to tenant URL after multiple attempts.");
          }
          console.log(`Retrying in ${retryDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before retrying
        }
      }
    
      if (success) {
        try {
          console.log("Navigation successful. Proceeding to login...");
        } catch (error) {
          console.error("Login flow failed:", error);
          throw error;
        }
      }
    };

}
