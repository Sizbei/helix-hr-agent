/**
 * Application configuration settings
 */

// API-related settings
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",

  // Timeout in milliseconds for API requests
  TIMEOUT: 15000,

  // Whether to use WebSockets for real-time updates
  USE_WEBSOCKETS: process.env.NEXT_PUBLIC_USE_WEBSOCKETS === "true",

  // WebSocket endpoint (if enabled)
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:5000",
};

// Feature flags - for gradual feature rollout
export const FEATURES = {
  // Enable/disable multiple sequence support
  MULTI_SEQUENCE: true,

  // Enable/disable different step types (email, LinkedIn)
  LINKEDIN_STEPS: true,

  // Enable/disable sequence management (adding/removing steps)
  SEQUENCE_MANAGEMENT: true,
};

// App settings
export const APP_CONFIG = {
  // Default theme (light/dark)
  DEFAULT_THEME: "dark",

  // Local storage key for persisting app state
  STORAGE_KEY: "helix_hr_state",

  // Session TTL in milliseconds (24 hours)
  SESSION_TTL: 24 * 60 * 60 * 1000,
};

// Default messages
export const DEFAULT_MESSAGES = {
  WELCOME:
    "Hi, I'm Helix! I'll help you create recruiting outreach sequences. What role are you hiring for?",
  ERROR: "Sorry, there was an error processing your request. Please try again.",
  EMPTY_SEQUENCE:
    "No steps in this sequence yet. Add your first step to get started.",
};
