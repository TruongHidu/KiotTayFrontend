import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Space, Button } from 'antd';
import {
    DashboardOutlined,
    ShopOutlined,
    QrcodeOutlined,
    SettingOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    OrderedListOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/auth/services/auth.hooks';
import { useFeatureFlag } from '@/auth/hooks/useFeatureFlag';
import { FeatureCode } from '@/types';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

export const TenantLayout = () => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const user = useAuthStore((state) => state.user);
    const { mutate: logout } = useLogout();

    const hasMenuManagement = useFeatureFlag(FeatureCode.MENU_MANAGEMENT);
    const hasTableManagement = useFeatureFlag(FeatureCode.TABLE_MANAGEMENT);

    const menuItems: MenuProps['items'] = [
        {
            key: '/portal',
            icon: <DashboardOutlined />,
            label: 'Tổng quan',
            onClick: () => navigate('/portal'),
        },
        hasMenuManagement ? {
            key: '/portal/menu',
            icon: <ShopOutlined />,
            label: 'Thực đơn',
            onClick: () => navigate('/portal/menu'),
        } : null,
        {
            key: '/portal/orders',
            icon: <OrderedListOutlined />,
            label: 'Đơn hàng',
            onClick: () => navigate('/portal/orders'),
        },
        hasTableManagement ? {
            key: '/portal/tables',
            icon: <QrcodeOutlined />,
            label: 'Bàn & QR',
            onClick: () => navigate('/portal/tables'),
        } : null,
        {
            key: '/portal/settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
            onClick: () => navigate('/portal/settings'),
        },
    ].filter(Boolean) as MenuProps['items'];

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: () => logout(),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                onBreakpoint={(broken) => {
                    if (broken) {
                        setCollapsed(true);
                    }
                }}
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                style={{ backgroundColor: '#064e3b', zIndex: 1000 }} // Emerald 900
            >
                <div
                    className="p-4 text-white text-lg font-bold"
                    style={{ height: '64px', display: 'flex', alignItems: 'center', backgroundColor: '#022c22' }} // Emerald 950
                >
                    {collapsed ? 'KT' : 'Portal Quản Lý'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    items={menuItems}
                    defaultSelectedKeys={['/portal']}
                    style={{ backgroundColor: '#064e3b' }}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        background: '#fff',
                        paddingLeft: 16,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        size="large"
                    />

                    <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                        <Space style={{ cursor: 'pointer' }}>
                            <Avatar size="large" style={{ backgroundColor: '#10b981' }}>
                                {user?.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <div className="hidden sm:block">
                                <div className="font-medium text-gray-800">{user?.name}</div>
                                <div className="text-xs text-gray-500">{user?.role_label || 'Quản lý'}</div>
                            </div>
                        </Space>
                    </Dropdown>
                </Header>

                <Content
                    style={{
                        margin: '16px',
                        padding: '24px',
                        background: '#f0f2f5',
                        borderRadius: '8px',
                        overflow: 'auto',
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};
