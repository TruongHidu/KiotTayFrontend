import { AxiosError } from 'axios';

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        const message = error.response?.data?.message;
        if (typeof message === 'string') {
            return message;
        }

        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            const messages = Object.values(errors).flat();
            return typeof messages[0] === 'string' ? messages[0] : 'Có lỗi xảy ra';
        }

        return error.message || 'Có lỗi xảy ra';
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'Có lỗi xảy ra';
};

export const getFieldErrors = (
    error: unknown
): Record<string, string[]> | null => {
    if (error instanceof AxiosError) {
        return error.response?.data?.errors || null;
    }
    return null;
};
