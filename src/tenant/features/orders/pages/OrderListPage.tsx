import { useState } from 'react';
import {
    Table, Tag, Button, Select, Input, Space, Card,
    Tooltip, Statistic, Row, Col, Empty, Dropdown, message, Modal
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    SearchOutlined,
    EyeOutlined,
    ReloadOutlined,
    FilterOutlined,
    ShoppingCartOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    MoreOutlined,
    ExclamationCircleFilled,
} from '@ant-design/icons';
import { useOrders, useUpdateOrderStatus } from '../services/order.hooks';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { POSDrawer } from '../components/POSDrawer';
import type {
    Order,
    OrderStatus,
    ServiceType,
    OrderListParams,
} from '@/types';
import {
    ORDER_STATUS_CONFIG,
    SERVICE_TYPE_CONFIG,
} from '@/types';

const fmt = (val: string | number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
        typeof val === 'string' ? parseFloat(val) : val
    );

const fmtDate = (s: string) =>
    new Date(s).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });

const STATUS_OPTIONS = [
    { value: '', label: 'Tất cả trạng thái' },
    ...Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => ({
        value: k as OrderStatus,
        label: v.label,
    })),
];

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
    // Backend mới
    open:      ['cooking', 'cancelled'],
    cooking:   ['served', 'cancelled'],
    served:    ['paid'],
    paid:      [],
    cancelled: [],

    // Legacy
    PENDING:   ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY:     ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
};

const SERVICE_OPTIONS = [
    { value: '', label: 'Tất cả loại đơn' },
    { value: 'TAKEAWAY' as ServiceType, label: '🛍️ Mang đi' },
    { value: 'DINE_IN'  as ServiceType, label: '🍽️ Tại bàn' },
    { value: 'DELIVERY' as ServiceType, label: '🚀 Giao hàng' },
];

export const OrderListPage = () => {
    const [posOpen, setPosOpen] = useState(false);

    const [params, setParams] = useState<OrderListParams>({
        page: 1,
        per_page: 20,
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
    const meta   = data?.meta;

    const handleStatusChange = (orderId: string, status: OrderStatus) => {
        if (status === 'CANCELLED' || status === 'cancelled') {
            Modal.confirm({
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

    // Quick stats
    const pending   = orders.filter(o => o.status === 'PENDING' || o.status === 'open').length;
    const preparing = orders.filter(o => ['PREPARING', 'CONFIRMED', 'cooking'].includes(o.status)).length;
    const ready     = orders.filter(o => o.status === 'READY' || o.status === 'served').length;
    const cancelled = orders.filter(o => o.status === 'CANCELLED' || o.status === 'cancelled').length;

    const columns: ColumnsType<Order> = [
        {
            title: 'Mã đơn',
            dataIndex: 'order_code',
            width: 130,
            render: (code: string) => (
                <span className="font-mono font-bold text-emerald-700">{code}</span>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'service_type',
            width: 110,
            render: (type: ServiceType) => {
                const cfg = SERVICE_TYPE_CONFIG[type];
                return (
                    <Tag className="rounded-full text-xs">
                        {cfg?.icon} {cfg?.label ?? type}
                    </Tag>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 130,
            render: (status: OrderStatus) => {
                const cfg = ORDER_STATUS_CONFIG[status];
                if (!cfg) {
                    return (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                            {status}
                        </span>
                    );
                }
                return (
                    <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{ color: cfg.color, backgroundColor: cfg.bg }}
                    >
                        {cfg.label}
                    </span>
                );
            },
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, r) => (
                <div>
                    <div className="font-medium text-gray-800">
                        {r.customer_name || <span className="text-gray-400 italic">Khách vãng lai</span>}
                    </div>
                    {r.customer_phone && (
                        <div className="text-xs text-gray-400">{r.customer_phone}</div>
                    )}
                    {r.customer_reference && (
                        <div className="text-xs text-blue-500">📍 {r.customer_reference}</div>
                    )}
                </div>
            ),
        },
        {
            title: 'Số món',
            key: 'items_count',
            width: 80,
            align: 'center',
            render: (_, r) => (
                <span className="font-bold text-gray-700">
                    {r.items.reduce((s, i) => s + i.quantity, 0)}
                </span>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'final_amount',
            width: 130,
            align: 'right',
            render: (amt: string) => (
                <span className="font-bold text-emerald-600">{fmt(amt)}</span>
            ),
        },
        {
            title: 'Thanh toán',
            key: 'payment_status',
            width: 110,
            align: 'center',
            render: (_, r) => {
                const paid = r.payments.reduce((s, p) => s + parseFloat(p.amount), 0);
                const total = parseFloat(r.final_amount);
                if (paid >= total && total > 0) {
                    return <CheckCircleOutlined className="text-emerald-500 text-lg" />;
                }
                if (paid > 0) {
                    return <span className="text-xs text-yellow-600 font-medium">Một phần</span>;
                }
                return <ClockCircleOutlined className="text-gray-400 text-lg" />;
            },
        },
        {
            title: 'Thời gian',
            dataIndex: 'created_at',
            width: 120,
            render: (d: string) => (
                <span className="text-xs text-gray-500">{fmtDate(d)}</span>
            ),
        },
        {
            title: '',
            key: 'action',
            width: 80,
            align: 'center',
            fixed: 'right',
            render: (_, r) => {
                const nextStatuses = NEXT_STATUSES[r.status] || [];
                const menuItems: MenuProps['items'] = nextStatuses.map(s => {
                    const cfg = ORDER_STATUS_CONFIG[s];
                    return {
                        key: s,
                        label: (s === 'CANCELLED' || s === 'cancelled') ? <span className="text-red-500 font-medium">Huỷ đơn</span> : `Chuyển sang ${cfg?.label}`,
                        icon: (s === 'CANCELLED' || s === 'cancelled') ? <CloseCircleOutlined className="text-red-500" /> : <CheckCircleOutlined style={{ color: cfg?.color }} />,
                        onClick: ({ domEvent }) => {
                            domEvent.stopPropagation(); // Ngăn sự kiện click row
                            handleStatusChange(r.id, s);
                        }
                    };
                });

                return (
                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Xem chi tiết">
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                className="text-emerald-600 hover:text-emerald-700"
                                onClick={() => setSelectedOrderId(r.id)}
                            />
                        </Tooltip>
                        {menuItems.length > 0 && (
                            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                                <Button type="text" icon={<MoreOutlined />} className="text-gray-500 hover:text-gray-700" />
                            </Dropdown>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 m-0">Quản lý đơn hàng</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {meta ? `Tổng ${meta.total} đơn` : 'Danh sách đơn hàng của nhà hàng'}
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

            {/* Quick stats */}
            <Row gutter={16}>
                {[
                    { label: 'Chờ xác nhận', value: pending,   icon: <ClockCircleOutlined />, color: '#d97706' },
                    { label: 'Đang xử lý',   value: preparing, icon: <FilterOutlined />,      color: '#7c3aed' },
                    { label: 'Sẵn sàng',      value: ready,    icon: <CheckCircleOutlined />, color: '#059669' },
                    { label: 'Đã huỷ',        value: cancelled, icon: <CloseCircleOutlined />, color: '#dc2626' },
                ].map(({ label, value, icon, color }) => (
                    <Col key={label} xs={12} sm={6}>
                        <Card size="small" className="rounded-xl shadow-sm border-0"
                            style={{ borderLeft: `4px solid ${color}` }}>
                            <Statistic
                                title={<span className="text-xs text-gray-500">{label}</span>}
                                value={value}
                                prefix={<span style={{ color, fontSize: 14 }}>{icon}</span>}
                                valueStyle={{ color, fontSize: 20, fontWeight: 700 }}
                                suffix={<span className="text-xs text-gray-400 ml-1">đơn</span>}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Filters */}
            <Card size="small" className="rounded-xl shadow-sm">
                <div className="flex flex-wrap gap-3 items-center">
                    <Input
                        prefix={<SearchOutlined className="text-gray-400" />}
                        placeholder="Tìm mã đơn, tên khách..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setParams(p => ({ ...p, page: 1 }));
                        }}
                        allowClear
                        className="rounded-lg"
                        style={{ width: 240 }}
                    />
                    <Select
                        options={STATUS_OPTIONS}
                        value={params.status ?? ''}
                        onChange={(v) => setParams(p => ({ ...p, status: v, page: 1 }))}
                        style={{ width: 180 }}
                        className="rounded-lg"
                    />
                    <Select
                        options={SERVICE_OPTIONS}
                        value={params.service_type ?? ''}
                        onChange={(v) => setParams(p => ({ ...p, service_type: v, page: 1 }))}
                        style={{ width: 160 }}
                        className="rounded-lg"
                    />
                    <Button
                        onClick={() => {
                            setSearch('');
                            setParams({ page: 1, per_page: 20, status: '', service_type: '' });
                        }}
                    >
                        Xoá bộ lọc
                    </Button>
                </div>
            </Card>

            {/* Table */}
            <Card size="small" className="rounded-xl shadow-sm overflow-hidden">
                <Table
                    dataSource={orders}
                    columns={columns}
                    rowKey="id"
                    loading={isLoading || isFetching}
                    scroll={{ x: 900 }}
                    size="middle"
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Không có đơn hàng nào"
                            />
                        ),
                    }}
                    pagination={{
                        current: meta?.current_page ?? 1,
                        pageSize: meta?.per_page ?? 20,
                        total: meta?.total ?? 0,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} / ${total} đơn`,
                        onChange: (page, pageSize) =>
                            setParams(p => ({ ...p, page, per_page: pageSize })),
                        pageSizeOptions: ['10', '20', '50'],
                    }}
                    onRow={(record) => ({
                        onClick: () => setSelectedOrderId(record.id),
                        className: 'cursor-pointer hover:bg-emerald-50 transition-colors',
                    })}
                />
            </Card>

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
