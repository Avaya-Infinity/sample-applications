/**
 * Token Service for Avaya Infinity API
 * Handles OAuth token management including retrieval, refresh, and expiration
 */

import jwt from 'jsonwebtoken';

// Constants
const TOKEN_REFRESH_MARGIN_MILLIS = 60000; // 1 minute margin before token expiry
const DEFAULT_TOKEN_REFRESH_INTERVAL = 60000; // 1 minute default refresh interval

/**
 * Token Service class that manages OAuth tokens for Avaya Infinity API
 */
export class TokenService {
  private tokenUrl: string | null = null;
  private currentClientId: string | null = null;
  private currentClientSecret: string | null = null;
  private currentAccessToken: string | null = null;
  private refreshTimeout: NodeJS.Timeout | number = 0;
  private refreshIntervalTime = DEFAULT_TOKEN_REFRESH_INTERVAL;
  private isInitialized = false;
  private tokenAccountId: string | null = null;
  private tokenConnectorId: string | null = null;

  /**
   * Initializes the token service with the provided credentials
   * @param baseUrl Base URL of the Avaya Infinity API
   * @param clientId Client ID for OAuth authentication
   * @param clientSecret Client secret for OAuth authentication
   */
  public async initialize(baseUrl: string, clientId: string, clientSecret: string): Promise<void> {
    console.info('Initializing Avaya Infinity token service...');

    this.stopTokenRefresh();

    // Set token URL and credentials
    this.tokenUrl = `${baseUrl}/auth/realms/avaya/protocol/openid-connect/token`;
    this.currentClientId = clientId;
    this.currentClientSecret = clientSecret;

    try {
      // Get the access token
      await this.fetchAccessToken();
      this.isInitialized = true;
      console.info('Avaya Infinity token service initialized successfully');

      // Start a timer that will refresh the access token periodically
      this.startTokenRefresh();
    } catch (error) {
      console.error('Failed to initialize Avaya Infinity token service:', error);
      throw error;
    }
  }

  /**
   * Starts periodic refresh of the access token
   */
  private startTokenRefresh(): void {
    this.stopTokenRefresh();
    
    console.info('Refreshing Avaya Infinity access token...');
    this.refreshTimeout = setTimeout(async () => {
      try {
        await this.fetchAccessToken();
        console.info('Access token refreshed successfully');
        // Restart the refresh timer
        this.startTokenRefresh();
      } catch (error) {
        console.error('Failed to refresh access token:', error);
      }
    }, this.refreshIntervalTime);
  }

  /**
   * Stops the token refresh timer
   */
  private stopTokenRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout as NodeJS.Timeout);
      this.refreshTimeout = 0;
      console.debug('Cleared Avaya Infinity access token refresh timer');
    }
  }

  /**
   * Fetches a new access token from Avaya Infinity API
   */
  private async fetchAccessToken(): Promise<void> {
    if (!this.tokenUrl || !this.currentClientId || !this.currentClientSecret) {
      throw new Error('Token service not properly initialized');
    }

    const postData = new URLSearchParams({
      'grant_type': 'client_credentials',
      'client_id': this.currentClientId,
      'client_secret': this.currentClientSecret
    }).toString();

    console.debug('Fetching access token from Avaya Infinity:', {
      url: this.tokenUrl
    });

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      body: postData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      keepalive: true
    });

    if (response.status !== 200) {
      console.error(`Failed to obtain access token. Error status: ${response.status}. Error: ${await response.text()}`);
      throw new Error(`Failed to obtain access token: ${response.status} ${response.statusText}`);
    }

    console.info('Access token obtained successfully');

    const data = await response.json();
    this.currentAccessToken = data.access_token;
    
    const currentAccessTokenData = this.getAccessTokenData();
    const tokenExpirationMillis = (currentAccessTokenData.exp as number) * 1000;
    
    this.refreshIntervalTime = tokenExpirationMillis - Date.now() - TOKEN_REFRESH_MARGIN_MILLIS;
    
    if (this.refreshIntervalTime <= 0) {
      console.warn('Access token is already expired or will expire immediately. Setting refresh interval to 1 minute.');
      this.refreshIntervalTime = DEFAULT_TOKEN_REFRESH_INTERVAL;
    }

    this.tokenAccountId = currentAccessTokenData.organization[0] as string;
    this.tokenConnectorId = currentAccessTokenData.owner[0] as string;

    console.info(`Access token expiration at ${new Date(tokenExpirationMillis).toISOString()} will be refreshed in ${this.refreshIntervalTime / 1000} seconds`);
  }

  /**
   * Gets the current access token
   * @returns The current access token
   * @throws Error if token service is not initialized
   */
  public getAccessToken(): string {
    if (!this.currentAccessToken) {
      throw new Error('Access token is not initialized. Call initialize() first.');
    }
    return this.currentAccessToken;
  }

  /**
   * Gets the account ID from the token
   * @returns The account ID or null if not available
   */
  public getTokenAccountId(): string | null {
    return this.tokenAccountId;
  }

  /**
   * Gets the connector ID from the token
   * @returns The connector ID or null if not available
   */
  public getTokenConnectorId(): string | null {
    return this.tokenConnectorId;
  }

  /**
   * Checks if the token service is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitializedStatus(): boolean {
    return this.isInitialized;
  }

  /**
   * Decode the JWT access token to get its payload
   * @param accessToken Optional access token to decode (uses current token by default)
   * @returns The decoded token payload
   */
  private getAccessTokenData(accessToken: string = this.currentAccessToken): any {
    try {
      const decodedToken = jwt.decode(accessToken);
      if (!decodedToken) {
        throw new Error('Invalid access token: Unable to decode.');
      }
      return decodedToken;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to decode access token: ${error.message}`);
      } else {
        throw new Error('Failed to decode access token: Unknown error');
      }
    }
  }

  /**
   * Cleans up resources when the token service is no longer needed
   */
  public dispose(): void {
    this.stopTokenRefresh();
    this.currentAccessToken = null;
    this.isInitialized = false;
  }
}
