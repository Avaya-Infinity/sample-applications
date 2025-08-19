/******************************************************************************
 * Avaya Token Service.
 * Handles OAuth token management for Avaya Infinity API.
 * Manages access token retrieval, refresh, and expiration.
 *****************************************************************************/

import { config } from "../config/environment.js";
import jwt from 'jsonwebtoken';

const TOKEN_REFRESH_MARGIN_MILLIS = 60000;
const DEFAULT_TOKEN_REFRESH_INTERVAL = 60000;

// Avaya Infinity OAuth Token Management Service
let tokenUrl = null;
let currentClientId = null;
let currentClientSecret = null;
let currentAccessToken = null;
let refreshTimeout = 0;
let refreshIntervalTime = DEFAULT_TOKEN_REFRESH_INTERVAL;

/**
 * Initializes the Avaya Infinity token service.
 * @param {*} baseUrl 
 * @param {*} clientId 
 * @param {*} clientSecret 
 */
export async function initializeTokenService(baseUrl, clientId, clientSecret) {
    console.info('Initializing Avaya Infinity token service...');

    stopTokenRefresh();

    // Set base URL and token URL from environment variables
    tokenUrl = `${baseUrl}/auth/realms/avaya/protocol/openid-connect/token`;
    currentClientId = clientId;
    currentClientSecret = clientSecret;

    // Get the access token. This method will set the currentAccessToken and refreshInterval
    try {
        await fetchAccessToken();
        console.info('Avaya Infinity token service initialized successfully');

        // Start a timer that will refresh the access token periodically
        startTokenRefresh();
    } catch (error) {
        console.error('Failed to initialize Avaya Infinity token service:', error);
        throw error;
    }
}

// Start periodic refresh of the access token
function startTokenRefresh() {
    stopTokenRefresh();
    
    console.info('Refreshing Avaya Infinity access token...');
    refreshTimeout = setTimeout(async () => {
        try {
            await fetchAccessToken();
            console.info('Access token refreshed successfully');
            // Restart the refresh timer
            startTokenRefresh();
        } catch (error) {
            console.error('Failed to refresh access token:', error);
        }
    }, refreshIntervalTime);
}

function stopTokenRefresh() {
    if (refreshTimeout) {
        clearTimeout(refreshTimeout);
        refreshTimeout = 0;
        console.debug('Cleared Avaya Infinity access token refresh timer');
    }
}

/**
 * Fetches a new access token from the Avaya Infinity API.
 * @returns {Promise<void>}
 * @throws {Error} If the access token retrieval fails.
 */

async function fetchAccessToken() {

    const postData = new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': currentClientId,
        'client_secret': currentClientSecret
    }).toString();

    console.debug('Fetching access token from Avaya Infinity:', {
        url: tokenUrl,
        postData: postData
    });

    //TO DO: remove the mock mode for Avaya Infinity
    if (config.avaya.isMockMode) {
        console.warn('Avaya Infinity running in mock mode: Skipping access token retrieval');
        currentAccessToken = 'mock_access_token';
        refreshIntervalTime = DEFAULT_TOKEN_REFRESH_INTERVAL;
        return;
    }
    

    const response = await fetch(tokenUrl, {
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

    console.info(`Access token obtained successfully`);

    const data = await response.json();
    currentAccessToken = data.access_token;
    const currentAccessTokenData = getAccessTokenData();
    const tokenExpirationMillis = currentAccessTokenData.exp * 1000;
    refreshIntervalTime = tokenExpirationMillis - Date.now() - TOKEN_REFRESH_MARGIN_MILLIS;
    if (refreshIntervalTime <= 0) {
        console.warn('Access token is already expired or will expire immediately. Setting refresh interval to 1 minute.');
        refreshIntervalTime = DEFAULT_TOKEN_REFRESH_INTERVAL;
    }
    console.info(`Access token expiration at ${new Date(tokenExpirationMillis).toISOString()} will be refreshed in ${refreshIntervalTime / 1000} seconds`);
    console.debug('Access Token Data:', currentAccessTokenData);
}

/**
 * Gets the current access token.
 * @returns {string} The current access token.
 */
export function getAccessToken() {
    if (!currentAccessToken) {
        throw new Error('Access token is not initialized. Call initializeTokenService() first.');
    }
    return currentAccessToken;
}


/**
 * Decode the JWT access token to get its payload.
 * @param {string} accessToken - The JWT access token.
 * @returns {Object} The decoded token payload
 */
function getAccessTokenData(accessToken = currentAccessToken) {
    try {
        const decodedToken = jwt.decode(accessToken);
        if (!decodedToken) {
            throw new Error('Invalid access token: Unable to decode.');
        }
        return decodedToken;
    } catch (error) {
        throw new Error(`Failed to decode access token: ${error.message}`);
    }
}



