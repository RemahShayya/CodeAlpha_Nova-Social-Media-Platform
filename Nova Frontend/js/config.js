const BASE_URL =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://nova-social-media-platform.onrender.com';
const API_URL = BASE_URL + '/api';
const TOKEN_KEY = 'nova_token';
const USER_KEY = 'nova_user';
