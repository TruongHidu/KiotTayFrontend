import { createBrowserRouter } from 'react-router-dom';
import { UserRole } from '@/types/auth';

// Layouts
import { PublicLayout } from '@/layouts/PublicLayout';
import { SuperAdminLayout } from '@/super-admin/layouts/SuperAdminLayout';
import { TenantLayout } from '@/tenant/layouts/TenantLayout';
import { MenuLayout } from '@/public-menu/layouts/MenuLayout';

// Auth
import { LoginPage } from '@/auth/pages/LoginPage';
import { ProtectedRoute } from '@/auth/pages/ProtectedRoute';

// Errors
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage';

// Public Landing
import { PublicHomePage } from '@/pages/PublicHomePage';

// Super Admin Zone
import { SuperAdminDashboard } from '@/super-admin/pages/SuperAdminDashboard';
import { RestaurantListPage } from '@/super-admin/features/restaurants/pages/RestaurantListPage';
import { RestaurantCreatePage } from '@/super-admin/features/restaurants/pages/RestaurantCreatePage';
import { RestaurantDetailPage } from '@/super-admin/features/restaurants/pages/RestaurantDetailPage';
import { RestaurantEditPage } from '@/super-admin/features/restaurants/pages/RestaurantEditPage';
import { FeatureListPage } from '@/super-admin/features/feature-flags/pages/FeatureListPage';
import { FeatureCreatePage } from '@/super-admin/features/feature-flags/pages/FeatureCreatePage';
import { FeatureEditPage } from '@/super-admin/features/feature-flags/pages/FeatureEditPage';
import { PackageListPage } from '@/super-admin/features/packages/pages/PackageListPage';
import { PackageCreatePage } from '@/super-admin/features/packages/pages/PackageCreatePage';
import { PackageDetailPage } from '@/super-admin/features/packages/pages/PackageDetailPage';
import { PackageEditPage } from '@/super-admin/features/packages/pages/PackageEditPage';

// Tenant Zone
import { TenantDashboard } from '@/tenant/pages/TenantDashboard';

// Public Menu Zone
import { MenuPage } from '@/public-menu/features/menu/pages/MenuPage';

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/unauthorized',
        element: <UnauthorizedPage />,
    },
    
    // --- SUPER ADMIN ZONE ---
    {
        path: '/super-admin',
        element: (
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <SuperAdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <SuperAdminDashboard />,
            },
            {
                path: 'restaurants',
                children: [
                    { index: true, element: <RestaurantListPage /> },
                    { path: 'new', element: <RestaurantCreatePage /> },
                    { path: ':id', element: <RestaurantDetailPage /> },
                    { path: ':id/edit', element: <RestaurantEditPage /> },
                ],
            },
            {
                path: 'features',
                children: [
                    { index: true, element: <FeatureListPage /> },
                    { path: 'new', element: <FeatureCreatePage /> },
                    { path: ':id/edit', element: <FeatureEditPage /> },
                ],
            },
            {
                path: 'packages',
                children: [
                    { index: true, element: <PackageListPage /> },
                    { path: 'new', element: <PackageCreatePage /> },
                    { path: ':id', element: <PackageDetailPage /> },
                    { path: ':id/edit', element: <PackageEditPage /> },
                ],
            },
        ],
    },

    // --- TENANT ZONE ---
    {
        path: '/portal',
        element: (
            <ProtectedRoute allowedRoles={[UserRole.OWNER, UserRole.MANAGER]}>
                <TenantLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <TenantDashboard />,
            },
            {
                path: 'menu',
                element: <div>Trang quản lý thực đơn (Coming soon)</div>,
            },
            {
                path: 'tables',
                element: <div>Trang quản lý bàn & QR (Coming soon)</div>,
            },
            {
                path: 'orders',
                element: <div>Trang quản lý đơn hàng (Coming soon)</div>,
            },
            {
                path: 'settings',
                element: <div>Trang cài đặt nhà hàng (Coming soon)</div>,
            },
        ],
    },

    // --- PUBLIC MENU ZONE ---
    {
        path: '/menu/:restaurantSlug',
        element: <MenuLayout />,
        children: [
            {
                index: true,
                element: <MenuPage />
            },
            {
                path: ':tableId',
                element: <MenuPage />
            }
        ]
    },

    // --- LANDING PAGE ---
    {
        path: '/',
        element: <PublicLayout />,
        children: [
            {
                index: true,
                element: <PublicHomePage />,
            },
        ],
    },

    // --- NOT FOUND ---
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);
