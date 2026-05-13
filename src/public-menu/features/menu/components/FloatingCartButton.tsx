import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useCartStore } from '../../../store/useCartStore';
import { formatCurrency } from '@/lib/formatters';

export const FloatingCartButton = () => {
    const navigate = useNavigate();
    const { restaurantSlug } = useParams();
    const totalItems = useCartStore((state) => state.getTotalItems());
    const totalPrice = useCartStore((state) => state.getTotalPrice());

    if (totalItems === 0) return null;

    const handleGoToCart = () => {
        navigate(`/menu/${restaurantSlug}/cart`);
    };

    return (
        <div className="fixed bottom-6 left-4 right-4 z-50 animate-fade-in">
            <button
                onClick={handleGoToCart}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98]"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <ShoppingCartOutlined className="text-2xl" />
                        <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                            {totalItems}
                        </span>
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-xs text-orange-100 font-medium">Tổng cộng</span>
                        <span className="text-base font-bold">{formatCurrency(totalPrice)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 font-medium">
                    Đặt ngay
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </button>
        </div>
    );
};
