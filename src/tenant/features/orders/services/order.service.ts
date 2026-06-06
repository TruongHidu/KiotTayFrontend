import apiClient from '@/api/http';
import type {
    Order,
    Payment,
    CreateOrderRequest,
    UpdateOrderStatusRequest,
    CreatePaymentRequest,
    PaginatedOrdersResponse,
    OrderListParams,
} from '@/types';

// ---- Response wrappers ----

export interface OrderApiResponse {
    message: string;
    data: Order;
}

export interface PaymentApiResponse {
    message: string;
    data: Payment;
}

export interface StatusApiResponse {
    message: string;
    data: Order;
}

// ---- Service ----

export const orderService = {
    /**
     * GET /api/tenant/orders
     * Lấy danh sách đơn hàng (có phân trang + filter)
     */
    getOrders: (params?: OrderListParams): Promise<PaginatedOrdersResponse> =>
        apiClient
            .get<PaginatedOrdersResponse>('/tenant/orders', { params })
            .then((res) => res.data),

    /**
     * GET /api/tenant/orders/{id}
     * Lấy chi tiết đơn hàng (kèm items và payments)
     */
    getOrder: (id: string): Promise<{ data: Order }> =>
        apiClient
            .get<{ data: Order }>(`/tenant/orders/${id}`)
            .then((res) => res.data),

    /**
     * POST /api/tenant/orders
     * Tạo đơn hàng mới
     */
    createOrder: (data: CreateOrderRequest): Promise<OrderApiResponse> =>
        apiClient
            .post<OrderApiResponse>('/tenant/orders', data)
            .then((res) => res.data),

    /**
     * PATCH /api/tenant/orders/{id}/status
     * Cập nhật trạng thái đơn hàng
     */
    updateOrderStatus: (
        id: string,
        data: UpdateOrderStatusRequest
    ): Promise<StatusApiResponse> =>
        apiClient
            .patch<StatusApiResponse>(`/tenant/orders/${id}/status`, data)
            .then((res) => res.data),

    /**
     * POST /api/tenant/orders/{id}/payments
     * Ghi nhận thanh toán cho đơn hàng
     */
    createPayment: (
        orderId: string,
        data: CreatePaymentRequest
    ): Promise<PaymentApiResponse> =>
        apiClient
            .post<PaymentApiResponse>(`/tenant/orders/${orderId}/payments`, data)
            .then((res) => res.data),
};
