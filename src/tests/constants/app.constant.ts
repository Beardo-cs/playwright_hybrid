import path from "path";
import config from "../../../playwright.config";

export const APPLICATION_URL = config.appUrl;
export const API_BASE_URL = config.apiBaseUrl;
export const APPLICATION_SIGNUP_URL = config.signUpUrl;

export function loadJsonFile(filename: string): any {
  return require(path.resolve(config.testDataDir, filename));
}

let testData = loadJsonFile("testdata.json");

// Test Data From JSON File
export const EMAIL = testData.email;
export const PASSWORD = testData.password;
export const SECRET_TOKEN = testData.secret;
export const NEW_URL = testData.newURL;
export const TOKEN = "ouzm efve eczh yvpk";
// Toast Messages
export const LOGIN_ERROR =
  "Error: The password is invalid or the user does not have a password.";



