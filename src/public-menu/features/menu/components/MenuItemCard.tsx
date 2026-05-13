import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { formatCurrency } from '@/lib/formatters';
import { useCartStore } from '../../../store/useCartStore';

interface MenuItemCardProps {
    item: {
        id: number;
        name: string;
        description: string;
        price: number;
        image: string;
        popular?: boolean;
        status?: string;
    };
}

export const MenuItemCard = ({ item }: MenuItemCardProps) => {
    const cartItems = useCartStore((state) => state.items);
    const addItem = useCartStore((state) => state.addItem);
    const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

    const cartItem = cartItems.find((i) => i.id === item.id);
    const quantity = cartItem?.quantity || 0;
    
    const isOutOfStock = item.status === 'OUT_OF_STOCK';

    const handleAdd = () => {
        if (isOutOfStock) return;
        addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            status: item.status,
        });
    };

    const handleDecrease = () => {
        decreaseQuantity(item.id);
    };

    return (
        <div className={`bg-white rounded-2xl p-3 flex gap-4 shadow-sm border border-gray-100 transition-all ${isOutOfStock ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-md'}`}>
            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                {item.popular && !isOutOfStock && (
                    <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg">
                        HOT
                    </div>
                )}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-bold px-2 py-1 bg-black/60 rounded">HẾT MÓN</span>
                    </div>
                )}
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <div className="font-bold text-gray-800 text-base leading-tight mb-1">{item.name}</div>
                    <div className="text-gray-500 text-xs line-clamp-2">{item.description}</div>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <div className={`font-bold text-base ${isOutOfStock ? 'text-gray-500' : 'text-orange-600'}`}>
                        {formatCurrency(item.price)}
                    </div>
                    
                    {!isOutOfStock && (
                        <div className="flex items-center">
                            {quantity > 0 ? (
                                <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                                    <button 
                                        onClick={handleDecrease}
                                        className="w-8 h-8 rounded-full text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-colors"
                                    >
                                        <MinusOutlined className="text-xs" />
                                    </button>
                                    <span className="w-6 text-center font-semibold text-sm">{quantity}</span>
                                    <button 
                                        onClick={handleAdd}
                                        className="w-8 h-8 rounded-full text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-colors"
                                    >
                                        <PlusOutlined className="text-xs" />
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleAdd}
                                    className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors"
                                >
                                    <PlusOutlined />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
