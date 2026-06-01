import axios from 'axios';
import type { PublicMenuResponse, PlaceOrderRequest, Order, QrType } from '@/types/public-menu';

// Public API client — không cần Bearer token
const publicApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    timeout: 30000,
});

/**
 * GET /public/menu?public_token={token}&type={type}
 */
export const fetchPublicMenu = async (
    public_token: string,
    type: QrType
): Promise<PublicMenuResponse> => {
    const { data } = await publicApi.get('/public/menu', {
        params: { public_token, type },
    });
    // Backend returns { success: true, data: [ ... ] } where data is the array of item groups.
    // Wrap it in our PublicMenuResponse interface.
    const itemGroups = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    return {
        item_groups: itemGroups
    };
};

/**
 * POST /public/orders
 */
export const placeOrder = async (payload: PlaceOrderRequest): Promise<Order> => {
    const { data } = await publicApi.post('/public/orders', payload);
    return data.data ?? data;
};

/**
 * GET /public/orders/{id}
 */
export const fetchOrderStatus = async (orderId: string): Promise<Order> => {
    const { data } = await publicApi.get(`/public/orders/${orderId}`);
    return data.data ?? data;
};

/**
 * POST /public/orders/{id}/items
 */
export const addOrderItems = async (
    orderId: string,
    payload: { items: { item_id: string; quantity: number; note: string }[] }
): Promise<Order> => {
    const { data } = await publicApi.post(`/public/orders/${orderId}/items`, payload);
    return data.data ?? data;
};
