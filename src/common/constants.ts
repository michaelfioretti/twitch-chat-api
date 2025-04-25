// Validation
export const MAX_TIMEFRAME = 86400;

// Rate limiting
export const MAX_REQUEST_PER_IP = 25;
export const MAX_REQUEST_PER_IP_TTL_SECONDS = 60;

// Twitch
export const TWITCH_TV_URL = 'https://www.twitch.tv/';
export const TWITCH_USER_PROFILE_IMG_URL = 'https://api.twitch.tv/helix/users';
export const TWITCH_OAUTH_URL = 'https://id.twitch.tv/oauth2/token';
export const MAX_STREAMERS_PER_USER_REQUEST = 100;

// Redis keys
export const CACHE_TTL_SECONDS = 300;

// Top 10
export const TOP_TEN_STREAMERS_KEY = 'top_ten_streamers';
export const TOP_TEN_STREAMERS_KEY_TTL_SECONDS = 3600;

// Bits service
export const GET_BITS_KEY = 'bits';
export const GET_BITS_TTL_SECONDS = 300;

// Chat service
export const GET_CHAT_KEY = 'chat';
export const GET_CHAT_TTL_SECONDS = 300;

// Stats
export const TWITCH_CHAT_STATS_KEY = 'chat:stats';
