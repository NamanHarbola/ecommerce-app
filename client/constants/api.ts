import axios from "axios";
import { Platform } from "react-native";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || Platform.select({
    android: "http://192.168.1.21:3000/api/", // Added trailing slash
    ios: "http://192.168.1.21:3000/api/",
    default: "https://ecommerce-app-a41h.onrender.com/api/", 
});

const api = axios.create({ 
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;