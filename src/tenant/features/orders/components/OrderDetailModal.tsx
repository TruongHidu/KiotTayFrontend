import { useState } from 'react';
import {
    Modal, Spin, Divider, Tag, Button, Descriptions, Table,
    message, Space,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import { useOrder, useUpdateOrderStatus, useCreatePayment } from '../services/order.hooks';
import { PaymentModal } from './PaymentModal';
import type {
    OrderItem,
    OrderStatus,
    Payment,
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
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

// Which statuses can this order transition to?
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

interface Props {
    orderId: string;
    open: boolean;
    onClose: () => void;
}

export const OrderDetailModal = ({ orderId, open, onClose }: Props) => {
    const { data, isLoading } = useOrder(orderId, open);
    const { mutate: updateStatus, isPending: updatingStatus } = useUpdateOrderStatus();
    const [payModalOpen, setPayModalOpen] = useState(false);

    const order = data?.data;

    const handleStatusChange = (status: OrderStatus) => {
        updateStatus(
            { id: orderId, data: { status } },
            {
                onSuccess: () => message.success('Cập nhật trạng thái thành công'),
                onError:   () => message.error('Cập nhật thất bại'),
            }
        );
    };

    // Item columns
    const itemCols: ColumnsType<OrderItem> = [
        {
            title: 'Món', dataIndex: 'item_name',
            render: (name: string, r) => {
                const isNew = order && new Date(r.created_at).getTime() - new Date(order.created_at).getTime() > 5000;
                return (
                    <div>
                        <div className="font-medium text-gray-800 flex items-center gap-2">
                            {name}
                            {isNew && <Tag color="blue" className="!m-0 text-[10px] leading-3 px-1.5 py-0.5">Mới gọi thêm</Tag>}
                        </div>
                        {r.note && <div className="text-xs text-gray-400 italic mt-0.5">📝 {r.note}</div>}
                    </div>
                );
            },
        },
        { title: 'SL', dataIndex: 'quantity', width: 60, align: 'center',
          render: (q: number) => <span className="font-bold">{q}</span> },
        { title: 'Đơn giá', dataIndex: 'unit_price', width: 120, align: 'right',
          render: (p: string) => fmt(p) },
        { title: 'Thành tiền', dataIndex: 'line_total', width: 130, align: 'right',
          render: (s: string) => <span className="font-bold text-emerald-600">{fmt(s)}</span> },
    ];

    // Payment columns
    const paymentCols: ColumnsType<Payment> = [
        { title: 'Phương thức', dataIndex: 'method',
          render: (m: string) => {
              const map: Record<string, string> = {
                  CASH: '💵 Tiền mặt', BANK_TRANSFER: '🏦 Chuyển khoản',
                  CARD: '💳 Thẻ', OTHER: '🔄 Khác',
              };
              return map[m] ?? m;
          }},
        { title: 'Số tiền', dataIndex: 'amount', align: 'right',
          render: (a: string) => <span className="font-bold text-emerald-600">{fmt(a)}</span> },
        { title: 'Thời gian', dataIndex: 'created_at',
          render: (d: string) => fmtDate(d) },
    ];

    const statusCfg = order ? ORDER_STATUS_CONFIG[order.status] : null;
    const svcCfg = order ? SERVICE_TYPE_CONFIG[order.service_type] : null;
    const nextStatuses = order ? (NEXT_STATUSES[order.status] || []) : [];
    const payments = order?.payments || [];
    const isPaid = payments.some(p => p.status === 'PAID');
    const totalPaid = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
    const remaining = order ? parseFloat(order.final_amount) - totalPaid : 0;

    return (
        <>
            <Modal
                open={open}
                onCancel={onClose}
                footer={null}
                width={780}
                title={
                    order ? (
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-800 text-lg">
                                Đơn #{order.order_code}
                            </span>
                            {statusCfg && (
                                <span
                                    className="text-xs font-bold px-2 py-1 rounded-full"
                                    style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}
                                >
                                    {statusCfg.label}
                                </span>
                            )}
                            {svcCfg && (
                                <Tag className="rounded-full text-xs">
                                    {svcCfg.icon} {svcCfg.label}
                                </Tag>
                            )}
                        </div>
                    ) : (
                        'Chi tiết đơn hàng'
                    )
                }
                centered
                destroyOnClose
            >
                {isLoading || !order ? (
                    <div className="flex justify-center py-16">
                        <Spin size="large" tip="Đang tải..." />
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Info grid */}
                        <Descriptions size="small" bordered column={2}>
                            <Descriptions.Item label="Mã đơn">
                                <span className="font-mono font-bold">{order.order_code}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tạo lúc">
                                {fmtDate(order.created_at)}
                            </Descriptions.Item>
                            {order.customer_name && (
                                <Descriptions.Item label="Khách hàng">
                                    👤 {order.customer_name}
                                </Descriptions.Item>
                            )}
                            {order.customer_phone && (
                                <Descriptions.Item label="Số điện thoại">
                                    📞 {order.customer_phone}
                                </Descriptions.Item>
                            )}
                            {order.customer_reference && (
                                <Descriptions.Item label="Bàn/Tham chiếu">
                                    {order.customer_reference}
                                </Descriptions.Item>
                            )}
                            {order.note && (
                                <Descriptions.Item label="Ghi chú tổng" span={2}>
                                    📝 <span className="italic text-gray-600">{order.note}</span>
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {/* Items */}
                        <div>
                            <h3 className="font-bold text-gray-700 mb-2">🍽️ Danh sách món</h3>
                            <Table
                                dataSource={[...order.items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())}
                                columns={itemCols}
                                rowKey="id"
                                pagination={false}
                                size="small"
                                bordered
                            />
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tạm tính</span>
                                <span>{fmt(order.subtotal_amount)}</span>
                            </div>
                            {parseFloat(order.discount_amount) > 0 && (
                                <div className="flex justify-between text-sm text-red-500">
                                    <span>Giảm giá</span>
                                    <span>- {fmt(order.discount_amount)}</span>
                                </div>
                            )}
                            {parseFloat(order.tax_amount) > 0 && (
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Thuế</span>
                                    <span>{fmt(order.tax_amount)}</span>
                                </div>
                            )}
                            <Divider className="!my-2" />
                            <div className="flex justify-between font-bold text-base">
                                <span>Tổng cộng</span>
                                <span className="text-emerald-600">{fmt(order.final_amount)}</span>
                            </div>
                            {totalPaid > 0 && (
                                <>
                                    <div className="flex justify-between text-sm text-blue-600">
                                        <span>Đã thanh toán</span>
                                        <span>{fmt(totalPaid)}</span>
                                    </div>
                                    {remaining > 0 && (
                                        <div className="flex justify-between text-sm font-bold text-red-600">
                                            <span>Còn lại</span>
                                            <span>{fmt(remaining)}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Payments history */}
                        {payments.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-700 mb-2">💳 Lịch sử thanh toán</h3>
                                <Table
                                    dataSource={order.payments}
                                    columns={paymentCols}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                    bordered
                                />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                            {/* Status transition */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Chuyển sang:</span>
                                <Space.Compact>
                                    {nextStatuses.map((s) => {
                                        const cfg = ORDER_STATUS_CONFIG[s];
                                        if (!cfg) return null;
                                        const icon = (s === 'CANCELLED' || s === 'cancelled')
                                            ? <CloseCircleOutlined />
                                            : (s === 'COMPLETED' || s === 'paid')
                                            ? <CheckCircleOutlined />
                                            : <ClockCircleOutlined />;
                                        return (
                                            <Button
                                                key={s}
                                                size="small"
                                                icon={icon}
                                                loading={updatingStatus}
                                                danger={s === 'CANCELLED' || s === 'cancelled'}
                                                onClick={() => handleStatusChange(s)}
                                                style={
                                                    (s !== 'CANCELLED' && s !== 'cancelled')
                                                        ? { borderColor: cfg?.color, color: cfg?.color }
                                                        : undefined
                                                }
                                            >
                                                {cfg?.label}
                                            </Button>
                                        );
                                    })}
                                </Space.Compact>
                            </div>

                            {/* Pay button */}
                            {remaining > 0 && (
                                <Button
                                    type="primary"
                                    icon={<DollarOutlined />}
                                    className="!bg-emerald-600 hover:!bg-emerald-700 !border-emerald-600"
                                    onClick={() => setPayModalOpen(true)}
                                >
                                    Thanh toán ({fmt(remaining)})
                                </Button>
                            )}
                            {remaining <= 0 && (order.status !== 'CANCELLED' && order.status !== 'cancelled') && (
                                <Tag color="success" className="px-3 py-1 text-sm font-medium">
                                    ✅ Đã thanh toán đủ
                                </Tag>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Payment sub-modal */}
            {order && (
                <PaymentModal
                    open={payModalOpen}
                    orderId={order.id}
                    orderCode={order.order_code}
                    finalAmount={remaining > 0 ? remaining : parseFloat(order.final_amount)}
                    onSuccess={() => setPayModalOpen(false)}
                    onCancel={() => setPayModalOpen(false)}
                />
            )}
        </>
    );
};
