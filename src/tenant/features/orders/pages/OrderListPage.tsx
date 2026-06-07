import { useState, useMemo } from 'react';
import {
    Button, Select, Input, Card, App,
    Tooltip, Badge, Dropdown, Modal, Row, Col, Typography, Empty, Space
} from 'antd';
import type { MenuProps } from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    ReloadOutlined,
    ShoppingCartOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    MoreOutlined,
    ExclamationCircleFilled,
    FireFilled,
} from '@ant-design/icons';
import { useOrders, useUpdateOrderStatus } from '../services/order.hooks';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { POSDrawer } from '../components/POSDrawer';
import { useAuthStore } from '@/store/auth.store';
import { useTenantOrdersSync } from '../hooks/useTenantOrdersSync';
import { useHighlightStore } from '../stores/highlight.store';
import type { Order, OrderStatus, ServiceType, OrderListParams } from '@/types';
import { ORDER_STATUS_CONFIG, SERVICE_TYPE_CONFIG } from '@/types';

const fmt = (val: string | number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
        typeof val === 'string' ? parseFloat(val) : val
    );

const STATUS_OPTIONS = [
    { value: '', label: 'Tất cả trạng thái' },
    ...Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => ({
        value: k as OrderStatus,
        label: v.label,
    })),
];

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
    open: ['cooking', 'cancelled'],
    cooking: ['served', 'cancelled'],
    served: ['paid'],
    paid: [],
    cancelled: [],
    // Legacy
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
};

const SERVICE_OPTIONS = [
    { value: '', label: 'Tất cả loại đơn' },
    { value: 'TAKEAWAY' as ServiceType, label: '🛍️ Mang đi' },
    { value: 'DINE_IN' as ServiceType, label: '🍽️ Tại bàn' },
    { value: 'DELIVERY' as ServiceType, label: '🚀 Giao hàng' },
];

const KANBAN_COLUMNS: { id: OrderStatus; title: string; color: string; bg: string }[] = [
    { id: 'open', title: 'Chờ xác nhận', color: '#d97706', bg: '#fef3c7' },
    { id: 'cooking', title: 'Đang nấu', color: '#ea580c', bg: '#ffedd5' },
    { id: 'served', title: 'Sẵn sàng', color: '#059669', bg: '#d1fae5' },
    { id: 'paid', title: 'Hoàn thành', color: '#4f46e5', bg: '#e0e7ff' },
];

export const OrderListPage = () => {
    const user = useAuthStore(state => state.user);
    useTenantOrdersSync(user?.restaurant_id ?? undefined);

    const highlightedOrders = useHighlightStore(state => state.highlightedOrders);
    const removeHighlight = useHighlightStore(state => state.removeHighlight);

    const { message, modal } = App.useApp();
    const [posOpen, setPosOpen] = useState(false);

    // Dùng limit lớn hơn cho Kanban
    const [params, setParams] = useState<OrderListParams>({
        page: 1,
        per_page: 100,
        status: '',
        service_type: '',
    });
    const [search, setSearch] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const { data, isLoading, refetch, isFetching } = useOrders({
        ...params,
        search: search || undefined,
    });

    const { mutate: updateStatus } = useUpdateOrderStatus();

    const orders = data?.data ?? [];
    const meta = data?.meta;

    const handleStatusChange = (orderId: string, status: OrderStatus) => {
        if (status === 'CANCELLED' || status === 'cancelled') {
            modal.confirm({
                title: 'Xác nhận huỷ đơn hàng',
                icon: <ExclamationCircleFilled className="text-red-500" />,
                content: 'Bạn có chắc chắn muốn huỷ đơn hàng này không? Thao tác này không thể hoàn tác.',
                okText: 'Huỷ đơn',
                okType: 'danger',
                cancelText: 'Bỏ qua',
                onOk: () => {
                    updateStatus(
                        { id: orderId, data: { status } },
                        {
                            onSuccess: () => message.success('Huỷ đơn hàng thành công'),
                            onError: () => message.error('Huỷ đơn hàng thất bại'),
                        }
                    );
                }
            });
        } else {
            updateStatus(
                { id: orderId, data: { status } },
                {
                    onSuccess: () => message.success('Cập nhật trạng thái thành công'),
                    onError: () => message.error('Cập nhật thất bại'),
                }
            );
        }
    };

    const handleOpenDetail = (id: string) => {
        setSelectedOrderId(id);
        if (highlightedOrders[id]) {
            removeHighlight(id);
        }
    };

    // Phân nhóm đơn hàng theo status
    const groupedOrders = useMemo(() => {
        const groups: Record<string, Order[]> = {
            open: [], cooking: [], served: [], paid: [], cancelled: [],
            // Legacy fallbacks mapping
            PENDING: [], CONFIRMED: [], PREPARING: [], READY: [], COMPLETED: [], CANCELLED: []
        };

        orders.forEach(o => {
            if (groups[o.status]) {
                groups[o.status].push(o);
            } else {
                groups[o.status] = [o];
            }
        });

        // Sắp xếp: đơn được highlight (mới/gọi thêm) lên đầu, sau đó theo thời gian mới nhất
        const sortGroup = (list: Order[]) =>
            [...list].sort((a, b) => {
                const aH = highlightedOrders[a.id] ? 1 : 0;
                const bH = highlightedOrders[b.id] ? 1 : 0;
                if (bH !== aH) return bH - aH;
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            });

        // Hợp nhất legacy vào backend mới nếu cần
        return {
            open:    sortGroup([...groups.open, ...groups.PENDING]),
            cooking: sortGroup([...groups.cooking, ...groups.CONFIRMED, ...groups.PREPARING]),
            served:  sortGroup([...groups.served, ...groups.READY]),
            paid:    sortGroup([...groups.paid, ...groups.COMPLETED]),
        };
    }, [orders, highlightedOrders]);

    return (
        <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 m-0">Quản lý đơn hàng</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {meta ? `Tổng ${meta.total} đơn` : 'Đang tải...'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        icon={<ReloadOutlined spin={isFetching} />}
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        Làm mới
                    </Button>
                    <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        className="!bg-emerald-600 hover:!bg-emerald-700 !border-emerald-600"
                        onClick={() => setPosOpen(true)}
                    >
                        Bán hàng (POS)
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card size="small" className="rounded-xl shadow-sm shrink-0">
                <div className="flex flex-wrap gap-3 items-center">
                    <Input
                        prefix={<SearchOutlined className="text-gray-400" />}
                        placeholder="Tìm mã đơn, tên khách, số điện thoại..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setParams(p => ({ ...p, page: 1 }));
                        }}
                        allowClear
                        className="rounded-lg"
                        style={{ width: 280 }}
                    />
                    <Select
                        options={SERVICE_OPTIONS}
                        value={params.service_type ?? ''}
                        onChange={(v) => setParams(p => ({ ...p, service_type: v, page: 1 }))}
                        style={{ width: 160 }}
                        className="rounded-lg"
                    />
                    <Select
                        options={STATUS_OPTIONS}
                        value={params.status ?? ''}
                        onChange={(v) => setParams(p => ({ ...p, status: v, page: 1 }))}
                        style={{ width: 180 }}
                        className="rounded-lg"
                    />
                    <Button
                        onClick={() => {
                            setSearch('');
                            setParams({ page: 1, per_page: 100, status: '', service_type: '' });
                        }}
                    >
                        Xoá bộ lọc
                    </Button>
                </div>
            </Card>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex gap-4 h-full min-w-max">
                    {KANBAN_COLUMNS.map(col => {
                        const colOrders = groupedOrders[col.id as keyof typeof groupedOrders] || [];

                        return (
                            <div key={col.id} className="w-[320px] flex flex-col bg-gray-50/50 rounded-2xl border border-gray-100 h-full">
                                <div className="p-3 border-b border-gray-200 shrink-0 flex justify-between items-center" style={{ backgroundColor: col.bg }}>
                                    <h3 className="m-0 font-bold" style={{ color: col.color }}>{col.title}</h3>
                                    <Badge count={colOrders.length} style={{ backgroundColor: col.color }} />
                                </div>

                                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                    {colOrders.length === 0 ? (
                                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Trống" />
                                    ) : (
                                        colOrders.map(order => {
                                            const nextStatuses = NEXT_STATUSES[order.status] || [];
                                            const isHighlighted = highlightedOrders[order.id];
                                            const itemsCount = order.items.reduce((s, i) => s + i.quantity, 0);
                                            const svcCfg = SERVICE_TYPE_CONFIG[order.service_type];

                                            // Menu actions
                                            const menuItems: MenuProps['items'] = nextStatuses.map(s => {
                                                const cfg = ORDER_STATUS_CONFIG[s];
                                                return {
                                                    key: s,
                                                    label: (s === 'CANCELLED' || s === 'cancelled') ? <span className="text-red-500 font-medium">Huỷ đơn</span> : `Chuyển sang ${cfg?.label}`,
                                                    icon: (s === 'CANCELLED' || s === 'cancelled') ? <CloseCircleOutlined className="text-red-500" /> : <CheckCircleOutlined style={{ color: cfg?.color }} />,
                                                };
                                            });

                                            return (
                                                <div
                                                    key={order.id}
                                                    className={`bg-white rounded-xl p-3 shadow-sm border-2 cursor-pointer transition-all hover:shadow-md relative
                                                        ${isHighlighted ? 'border-orange-500 animate-pulse' : 'border-transparent hover:border-emerald-200'}`}
                                                    onClick={() => handleOpenDetail(order.id)}
                                                >
                                                    {isHighlighted && (
                                                        <div className={`absolute -top-3 -right-2 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 z-10 animate-bounce
                                                            ${isHighlighted === 'NEW_ORDER' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}
                                                        `}>
                                                            <FireFilled /> {isHighlighted === 'NEW_ORDER' ? 'ĐƠN MỚI' : 'GỌI THÊM'}
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="font-mono font-bold text-emerald-700">
                                                            #{order.order_code}
                                                        </div>
                                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                                            <ClockCircleOutlined />
                                                            {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>

                                                    <div className="mb-2">
                                                        <div className="font-medium text-gray-800 truncate">
                                                            {order.customer_name || 'Khách vãng lai'}
                                                        </div>
                                                        <div className="flex gap-2 mt-1">
                                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                                {svcCfg?.icon} {svcCfg?.label || order.service_type}
                                                            </span>
                                                            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-medium">
                                                                {itemsCount} món
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-end mt-3 pt-3 border-t border-gray-100">
                                                        <div className="font-bold text-gray-800">
                                                            {fmt(order.final_amount)}
                                                        </div>
                                                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                            <Tooltip title="Xem">
                                                                <Button
                                                                    size="small"
                                                                    type="text"
                                                                    icon={<EyeOutlined />}
                                                                    onClick={() => handleOpenDetail(order.id)}
                                                                />
                                                            </Tooltip>
                                                            {menuItems.length > 0 && (
                                                                <Dropdown 
                                                                    menu={{ 
                                                                        items: menuItems,
                                                                        onClick: (info) => {
                                                                            handleStatusChange(order.id, info.key as OrderStatus);
                                                                        }
                                                                    }} 
                                                                    trigger={['click']} 
                                                                    placement="bottomRight"
                                                                >
                                                                    <Button size="small" type="primary" ghost icon={<CheckCircleOutlined />} className="text-emerald-600 border-emerald-300">
                                                                        Xử lý
                                                                    </Button>
                                                                </Dropdown>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detail modal */}
            {selectedOrderId && (
                <OrderDetailModal
                    orderId={selectedOrderId}
                    open={!!selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                />
            )}

            {/* POS Drawer */}
            <POSDrawer open={posOpen} onClose={() => setPosOpen(false)} />
        </div>
    );
};
