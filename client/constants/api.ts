import axios from "axios";
import { Platform } from "react-native";

// Use the environment variable if available (for production/Vercel)
// Fallback to local IP for mobile development
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || Platform.select({
    android: "http://192.168.1.21:3000/api",
    ios: "http://192.168.1.21:3000/api",
    default: "http://localhost:3000/api", 
});

const api = axios.create({ 
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;