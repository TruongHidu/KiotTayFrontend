import { MOCK_TABLES } from '@/constants/mockTables';
import { useOrders } from '../services/order.hooks';
import type { Order } from '@/types';
import { Button, Tag, Spin } from 'antd';
import { usePosCartStore } from '@/store/posCartStore';
import { UserOutlined } from '@ant-design/icons';

interface Props {
    onSelectTable: (tableId: string) => void;
    onViewOrder: (order: Order) => void;
}

export const TableMap = ({ onSelectTable, onViewOrder }: Props) => {
    // Lấy các đơn hàng đang mở (chưa thanh toán/hoàn thành)
    const { data: orderData, isLoading } = useOrders({ page: 1, limit: 100 });
    const setServiceType = usePosCartStore(s => s.setServiceType);

    if (isLoading) {
        return <div className="flex justify-center p-10"><Spin /></div>;
    }

    const openOrders = orderData?.data.filter(o => {
        if (o.service_type !== 'DINE_IN') return false;
        if (o.status === 'CANCELLED' || o.status === 'cancelled') return false;
        
        // Hide if fully paid
        const totalPaid = (o.payments || []).reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const isFullyPaid = totalPaid >= parseFloat(o.final_amount) && totalPaid > 0;
        if (isFullyPaid) return false;

        // Still hide COMPLETED if backend specifically sets it when completely closed
        if (o.status === 'COMPLETED') return false;

        return true;
    }) || [];

    // Gắn order vào table
    const tablesWithOrders = MOCK_TABLES.map(t => {
        const order = openOrders.find(o => o.table_id === t.id);
        return {
            ...t,
            order,
            status: order ? 'occupied' : 'available'
        };
    });

    return (
        <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 overflow-y-auto">
            {tablesWithOrders.map(t => (
                <div
                    key={t.id}
                    onClick={() => {
                        if (t.order) {
                            onViewOrder(t.order);
                        } else {
                            setServiceType('DINE_IN');
                            onSelectTable(t.id);
                        }
                    }}
                    className={`
                        relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer
                        border-2 transition-all duration-200 aspect-square shadow-sm
                        ${t.order 
                            ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 hover:border-amber-400' 
                            : 'bg-white border-gray-200 hover:border-emerald-400 hover:shadow-md'}
                    `}
                >
                    <span className={`text-lg font-bold ${t.order ? 'text-amber-700' : 'text-gray-700'}`}>
                        {t.name}
                    </span>
                    {t.order ? (
                        <div className="flex flex-col items-center mt-2">
                            <Tag color="warning" className="m-0 mb-1 flex items-center gap-1">
                                <UserOutlined /> Có khách
                            </Tag>
                            <span className="text-xs text-amber-600 font-semibold truncate max-w-full px-1">
                                {t.order.order_code}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400 mt-2">Trống</span>
                    )}
                </div>
            ))}
        </div>
    );
};
