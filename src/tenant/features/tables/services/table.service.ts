import apiClient from '@/api/http';
import type {
    TableArea,
    CreateTableAreaRequest,
    UpdateTableAreaRequest,
    RestaurantTable,
    CreateRestaurantTableRequest,
    UpdateRestaurantTableRequest,
    RestaurantTableListParams,
} from '@/types';
import type { ApiResponse, PaginatedResponse } from '@/types';

export const tableService = {
    // --- Table Areas ---

    getTableAreas: () =>
        apiClient
            .get<ApiResponse<TableArea[]>>('/tenant/table-areas')
            .then((res) => res.data),

    getTableArea: (id: string) =>
        apiClient
            .get<ApiResponse<TableArea>>(`/tenant/table-areas/${id}`)
            .then((res) => res.data),

    createTableArea: (data: CreateTableAreaRequest) =>
        apiClient
            .post<ApiResponse<TableArea>>('/tenant/table-areas', data)
            .then((res) => res.data),

    updateTableArea: (id: string, data: UpdateTableAreaRequest) =>
        apiClient
            .patch<ApiResponse<TableArea>>(`/tenant/table-areas/${id}`, data)
            .then((res) => res.data),

    deleteTableArea: (id: string) =>
        apiClient
            .delete<ApiResponse<null>>(`/tenant/table-areas/${id}`)
            .then((res) => res.data),

    // --- Restaurant Tables ---

    getRestaurantTables: (params?: RestaurantTableListParams) =>
        apiClient
            .get<PaginatedResponse<RestaurantTable>>('/tenant/restaurant-tables', { params })
            .then((res) => res.data),

    getRestaurantTable: (id: string) =>
        apiClient
            .get<ApiResponse<RestaurantTable>>(`/tenant/restaurant-tables/${id}`)
            .then((res) => res.data),

    createRestaurantTable: (data: CreateRestaurantTableRequest) =>
        apiClient
            .post<ApiResponse<RestaurantTable>>('/tenant/restaurant-tables', data)
            .then((res) => res.data),

    updateRestaurantTable: (id: string, data: UpdateRestaurantTableRequest) =>
        apiClient
            .patch<ApiResponse<RestaurantTable>>(`/tenant/restaurant-tables/${id}`, data)
            .then((res) => res.data),

    deleteRestaurantTable: (id: string) =>
        apiClient
            .delete<ApiResponse<null>>(`/tenant/restaurant-tables/${id}`)
            .then((res) => res.data),
};
