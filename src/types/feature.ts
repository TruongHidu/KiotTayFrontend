export interface Feature {
    id: string;
    code: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface CreateFeatureRequest {
    code: string;
    name: string;
    description?: string | null;
    is_active?: boolean;
}

export interface UpdateFeatureRequest {
    code: string;
    name: string;
    description?: string | null;
    is_active?: boolean;
}

export interface FeatureListParams {
    is_active?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
}

export interface ToggleFeatureResponse {
    message: string;
    feature: Feature;
}
