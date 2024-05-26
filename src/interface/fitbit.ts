interface Oauth2AuthorizeRequestInterface {
  client_id: string;
  response_type: "code";
  scope: string;
  redirect_uri?: string;
  expires_in?: string;
  prompt?: string;
  state?: string;
  code_challenge: string;
  code_challenge_method: "S256" | "plain";
}

interface Oauth2TokenRequestInterface {
  code: string;
  grant_type: string;
  client_id: string;
  redirect_url: string;
  expires_in?: string;
  code_verifier: string;
}

interface Oauth2TokenResponsetInterface {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: "Bearer";
  user_id: string;
}
