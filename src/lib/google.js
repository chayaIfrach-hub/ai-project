import { decodeJwt } from "jose";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export const OAUTH_STATE_COOKIE = "google-oauth-state";

export function getGoogleConfiguration() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}

export function buildGoogleAuthUrl(config, state) {
  const url = new URL(GOOGLE_AUTH_URL);
  console.log(url);
  url.searchParams.set("client_id", config.clientId); //איזו אפליקציה מהרשימה בקונסול מבקשת מגוגל להתחבר
  url.searchParams.set("redirect_uri", config.redirectUri); //לאיזו כתובת לחזור אחרי האימות
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  return url.toString();

  // client_id=YOUR_CLIENT_ID
  // &redirect_uri=YOUR_REDIRECT_URI
  // &response_type=code
  // &scope=YOUR_SCOPES
  // &state=YOUR_STATE_VALUE
  // &access_type=offline
  // &prompt=consent
}

export async function exchangeCodeForProfile(config, code) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Google token exchange failed");
  }

  const { id_token: idToken } = await response.json();
  if (!idToken) throw new Error("Google response is missing id_token");

  const parseToken = decodeJwt(idToken);
  if (!parseToken.sub || !parseToken.email) {
    throw new Error("Google profile is missing");
  }

  return {
    googleId: parseToken.sub,
    email: parseToken.email,
    name: parseToken.name,
  };
}
