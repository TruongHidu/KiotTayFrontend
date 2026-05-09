import type { Feature } from './feature';

export interface Package {
    id: string;
    code: string;
    name: string;
    description: string | null;
    price: number | string;
    duration_days: number;
    is_active: boolean;
    features: Feature[];
    created_at: string | null;
    updated_at: string | null;
}

export interface CreatePackageRequest {
    code: string;
    name: string;
    price: number;
    duration_days?: number;
    description?: string | null;
    is_active?: boolean;
    feature_ids?: string[];
}

export interface UpdatePackageRequest {
    code?: string;
    name?: string;
    price?: number;
    duration_days?: number;
    description?: string | null;
    is_active?: boolean;
}

export interface PackageListParams {
    is_active?: boolean | string | number;
    search?: string;
    per_page?: number;
    page?: number;
}

export interface TogglePackageResponse {
    message: string;
    package: Package;
}

export interface SyncPackageFeaturesRequest {
    feature_ids: string[];
}

export interface SyncPackageFeaturesResponse {
    message: string;
    package: Package;
}
