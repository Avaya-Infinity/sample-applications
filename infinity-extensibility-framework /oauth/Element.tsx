import React, { useEffect, useRef, useState } from "react";
import styles from "./Element.module.css";

interface OAuthDemoProps {
  "client-id"?: string;
  "redirect-uri"?: string;
}

interface UserProfile {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

const OAuthDemo: React.FC<OAuthDemoProps> = ({
  "client-id": clientId = "jashmore-web-component",
  "redirect-uri": redirectUriProp,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Store PKCE code verifier in memory (ref persists across renders)
  const codeVerifierRef = useRef<string | null>(null);
  // Store OAuth config in memory for responding to redirect.html
  const oauthConfigRef = useRef<{
    tokenEndpoint: string;
    clientId: string;
    redirectUri: string;
    authMethod: string;
  } | null>(null);

  // Keycloak Configuration
  const KEYCLOAK_CONFIG = {
    authorizationEndpoint:
      "https://core.avaya-ghu3.ec.avayacloud.com/auth/realms/avaya/protocol/openid-connect/auth",
    tokenEndpoint:
      "https://core.avaya-ghu3.ec.avayacloud.com/auth/realms/avaya/protocol/openid-connect/token",
    userInfoEndpoint:
      "https://core.avaya-ghu3.ec.avayacloud.com/auth/realms/avaya/protocol/openid-connect/userinfo",
  };

  const scopes = ["openid", "profile", "email"].join(" ");

  // Get redirect URI
  const getRedirectUri = () => {
    if (redirectUriProp) return redirectUriProp;
    // Default to localhost:3000/redirect.html
    return "http://localhost:3000/redirect.html";
  };

  const redirectUri = getRedirectUri();

  // Generate random string for state/nonce
  const generateRandomString = (length: number): string => {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let result = "";
    const values = new Uint8Array(length);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    return result;
  };

  // PKCE helper functions
  const base64URLEncode = (str: ArrayBuffer): string => {
    return btoa(String.fromCharCode(...new Uint8Array(str)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  };

  const sha256 = async (plain: string): Promise<ArrayBuffer> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return await window.crypto.subtle.digest("SHA-256", data);
  };

  // Fetch user profile
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(KEYCLOAK_CONFIG.userInfoEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch user profile");

      const profile = await response.json();
      setUserProfile({
        name: profile.name || profile.preferred_username || "Unknown User",
        email: profile.email || "",
        picture: profile.picture || "",
        sub: profile.sub || "",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching profile:", err);
      setError(`Failed to fetch profile: ${message}`);
    }
  };

  // Listen for messages from redirect.html
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // redirect.html requests OAuth config
      if (event.data.type === "oauth-config-request") {
        console.log("[OAuth Sample] redirect.html requested OAuth config");

        if (!codeVerifierRef.current || !oauthConfigRef.current) {
          console.error(
            "[OAuth Sample] No OAuth config/verifier stored - OAuth flow not in progress"
          );
          return;
        }

        // Respond with config and code verifier
        if (event.source) {
          (event.source as Window).postMessage(
            {
              type: "oauth-config-response",
              config: oauthConfigRef.current,
              codeVerifier: codeVerifierRef.current,
            },
            "*"
          );
          console.log("[OAuth Sample] Sent OAuth config to redirect.html");
        }
        return;
      }

      // redirect.html sends back tokens or error
      if (event.data.type === "oauth-callback") {
        const params = event.data.params || {};

        // Clear stored config after receiving callback
        codeVerifierRef.current = null;
        oauthConfigRef.current = null;

        if (params.error) {
          console.error(
            "[OAuth Sample] OAuth error:",
            params.error_description
          );
          setError(`${params.error}: ${params.error_description || ""}`);
          setLoading(false);
        } else if (params.access_token) {
          console.log(
            "[OAuth Sample] Received access token from redirect.html"
          );
          setAccessToken(params.access_token);
          setError(null);
          setLoading(false);
          await fetchUserProfile(params.access_token);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Sign in with Implicit Flow (not recommended, but supported)
  const signInImplicit = () => {
    const state = generateRandomString(16);
    const nonce = generateRandomString(16);

    const authUrl = new URL(KEYCLOAK_CONFIG.authorizationEndpoint);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "token");
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("nonce", nonce);

    const popup = window.open(
      authUrl.toString(),
      "oauth_popup",
      "width=500,height=600,left=100,top=100"
    );

    if (!popup) {
      setError("Popup blocked! Please allow popups for this site.");
    }
  };

  // Sign in with PKCE Flow (recommended)
  const signInPKCE = async () => {
    try {
      setError(null);
      setLoading(true);

      // Generate PKCE values
      const codeVerifier = generateRandomString(128);
      const hashed = await sha256(codeVerifier);
      const codeChallenge = base64URLEncode(hashed);

      // Store code verifier in memory (ref) - redirect.html will request it
      codeVerifierRef.current = codeVerifier;

      // Store OAuth config in memory - redirect.html will request it
      oauthConfigRef.current = {
        tokenEndpoint: KEYCLOAK_CONFIG.tokenEndpoint,
        clientId: clientId,
        redirectUri: redirectUri,
        authMethod: "none", // Keycloak public clients use "none" (client_id in body only)
      };

      const state = generateRandomString(16);

      // Build authorization URL
      const authUrl = new URL(KEYCLOAK_CONFIG.authorizationEndpoint);
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", scopes);
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("code_challenge", codeChallenge);
      authUrl.searchParams.set("code_challenge_method", "S256");

      console.log("[OAuth Sample] Opening OAuth popup");

      // Open popup directly - no need to go through parent window
      const popup = window.open(
        authUrl.toString(),
        "oauth_popup",
        "width=500,height=600,left=100,top=100"
      );

      if (!popup) {
        setError("Popup blocked! Please allow popups for this site.");
        setLoading(false);
        codeVerifierRef.current = null;
        oauthConfigRef.current = null;
      }
      // Loading state will be cleared when we receive the callback
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`PKCE setup failed: ${message}`);
      setLoading(false);
      codeVerifierRef.current = null;
      oauthConfigRef.current = null;
    }
  };

  // Sign out
  const signOut = () => {
    setAccessToken(null);
    setUserProfile(null);
    setError(null);
    codeVerifierRef.current = null;
    oauthConfigRef.current = null;
  };

  // Validate token
  const validateToken = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      await fetchUserProfile(accessToken);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Token validation failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Authentication */}
      {!accessToken && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>🔐 OAuth Authentication</h2>
          <p className={styles.description}>
            Choose an OAuth 2.0 flow to authenticate with Keycloak.
          </p>

          <div className={styles.buttonGroup}>
            <button
              onClick={signInImplicit}
              className={`${styles.button} ${styles.buttonPrimary}`}
              disabled={loading}
            >
              Sign in with Implicit Flow
            </button>
            <button
              onClick={signInPKCE}
              className={`${styles.button} ${styles.buttonSuccess}`}
              disabled={loading}
            >
              Sign in with PKCE Flow (Recommended)
            </button>
          </div>

          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Processing...</p>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}
        </div>
      )}

      {/* User Profile */}
      {accessToken && userProfile && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>✅ Authenticated</h2>

          <div className={styles.profileCard}>
            {userProfile.picture && (
              <img
                src={userProfile.picture}
                alt={userProfile.name}
                className={styles.profileImage}
              />
            )}
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>{userProfile.name}</div>
              <div className={styles.profileEmail}>{userProfile.email}</div>
              <div className={styles.profileId}>ID: {userProfile.sub}</div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              onClick={validateToken}
              className={`${styles.button} ${styles.buttonPrimary}`}
              disabled={loading}
            >
              Validate Token
            </button>
            <button
              onClick={signOut}
              className={`${styles.button} ${styles.buttonDanger}`}
            >
              Sign Out
            </button>
          </div>

          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Validating...</p>
            </div>
          )}

          <div className={styles.tokenDisplay}>
            <strong>Access Token:</strong> {accessToken.substring(0, 50)}...
          </div>
        </div>
      )}

      {/* Configuration */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>⚙️ Configuration</h2>

        <div className={styles.configItem}>
          <div className={styles.configLabel}>Client ID:</div>
          <div className={styles.configValue}>{clientId}</div>
        </div>

        <div className={styles.configItem}>
          <div className={styles.configLabel}>Redirect URI:</div>
          <div className={styles.configValue}>{redirectUri}</div>
        </div>

        <div className={styles.configItem}>
          <div className={styles.configLabel}>Keycloak Server:</div>
          <div className={styles.configValue}>
            https://core.avaya-ghu3.ec.avayacloud.com/auth
          </div>
        </div>

        <div className={styles.configItem}>
          <div className={styles.configLabel}>Realm:</div>
          <div className={styles.configValue}>avaya</div>
        </div>
      </div>
    </div>
  );
};

export default OAuthDemo;
