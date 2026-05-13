import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Input, Button, Form, Alert } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useCartStore } from '../../../store/useCartStore';
import { formatCurrency } from '@/lib/formatters';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CheckoutForm {
    customerName: string;
    tableId: string;
}

export const CartPage = () => {
    const navigate = useNavigate();
    const { restaurantSlug } = useParams();
    const [form] = Form.useForm<CheckoutForm>();
    
    const { items, tableId, customerName, removeItem, updateQuantity, updateNote, decreaseQuantity, addItem, clearCart, setCustomerName } = useCartStore();
    const totalPrice = useCartStore((state) => state.getTotalPrice());

    const handleBack = () => {
        navigate(-1);
    };

    const handleSubmit = (values: CheckoutForm) => {
        // Mock submit order
        setCustomerName(values.customerName);
        console.log('Submitting order:', {
            restaurantSlug,
            tableId: values.tableId,
            customerName: values.customerName,
            items
        });
        
        // Mock API call success
        clearCart();
        const mockOrderId = `KT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;
        navigate(`/menu/${restaurantSlug}/success/${mockOrderId}`, { replace: true });
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-6xl">🛒</span>
                </div>
                <Title level={4}>Giỏ hàng trống</Title>
                <Text className="text-gray-500 text-center mb-8">Bạn chưa chọn món nào. Vui lòng quay lại thực đơn để chọn món nhé.</Text>
                <Button type="primary" size="large" onClick={handleBack} className="bg-orange-600 w-full h-12 rounded-xl text-base font-medium">
                    Quay lại thực đơn
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col animate-fade-in pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} className="!px-2" />
                <Title level={4} className="!m-0 text-gray-800 flex-1">Giỏ hàng của bạn</Title>
            </div>

            {/* Cart Items List */}
            <div className="px-4 py-4 flex flex-col gap-4 bg-gray-50/50">
                {items.map((item) => (
                    <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                        <div className="flex gap-3">
                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="font-bold text-gray-800 text-base">{item.name}</div>
                                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(item.id)} className="!px-2 !py-0 -mt-1 -mr-2" />
                                </div>
                                <div className="font-bold text-orange-600 text-base">{formatCurrency(item.price)}</div>
                            </div>
                        </div>

                        {/* Quantity and Note Controls */}
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                            <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                                <button onClick={() => decreaseQuantity(item.id)} className="w-8 h-8 rounded-full text-orange-600 flex items-center justify-center hover:bg-orange-100">
                                    <MinusOutlined className="text-xs" />
                                </button>
                                <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                                <button onClick={() => addItem(item as any)} className="w-8 h-8 rounded-full text-orange-600 flex items-center justify-center hover:bg-orange-100">
                                    <PlusOutlined className="text-xs" />
                                </button>
                            </div>
                            <Input 
                                placeholder="Ghi chú (ít đá, không hành...)" 
                                value={item.note}
                                onChange={(e) => updateNote(item.id, e.target.value)}
                                className="flex-1 rounded-xl bg-gray-50 border-gray-200"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Checkout Form */}
            <div className="px-4 py-6 bg-white border-t border-gray-100 mt-2">
                <Title level={5} className="!mb-4">Thông tin đặt món</Title>
                <Alert 
                    message="Lưu ý quan trọng" 
                    description="Vui lòng nhập chính xác số bàn của bạn để nhân viên có thể phục vụ đúng vị trí." 
                    type="warning" 
                    showIcon 
                    className="mb-4 rounded-xl"
                />
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleSubmit}
                    initialValues={{
                        customerName: customerName,
                        tableId: tableId || ''
                    }}
                >
                    <Form.Item 
                        label="Tên của bạn" 
                        name="customerName"
                        rules={[{ required: true, message: 'Vui lòng nhập tên của bạn' }]}
                    >
                        <Input size="large" placeholder="Ví dụ: Anh Tú" className="rounded-xl" />
                    </Form.Item>

                    <Form.Item 
                        label="Số bàn đang ngồi" 
                        name="tableId"
                        rules={[{ required: true, message: 'Vui lòng nhập số bàn' }]}
                    >
                        <Input size="large" placeholder="Ví dụ: Bàn 5" className="rounded-xl" />
                    </Form.Item>

                    {/* Fixed Bottom Bar */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-6 z-50">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-600 font-medium text-sm">Tổng thanh toán</span>
                            <span className="text-xl font-bold text-orange-600">{formatCurrency(totalPrice)}</span>
                        </div>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            size="large" 
                            className="w-full h-12 bg-orange-600 hover:bg-orange-700 rounded-2xl text-base font-bold shadow-lg shadow-orange-500/30"
                        >
                            Xác Nhận Đặt Món
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};
