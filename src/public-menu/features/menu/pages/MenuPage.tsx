import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Button } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { formatCurrency } from '@/lib/formatters';

const { Title, Text } = Typography;

const MOCK_CATEGORIES = ['Nổi bật', 'Món chính', 'Đồ uống', 'Tráng miệng', 'Ăn vặt'];
const MOCK_ITEMS = [
    {
        id: 1,
        name: 'Phở Bò Đặc Biệt',
        description: 'Tái, nạm, gầu, gân, bò viên, trứng trần',
        price: 65000,
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&q=80',
        popular: true,
    },
    {
        id: 2,
        name: 'Bún Chả Hà Nội',
        description: 'Chả băm, chả miếng nướng than hoa',
        price: 55000,
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80',
        popular: false,
    },
    {
        id: 3,
        name: 'Gỏi Cuốn Tôm Thịt',
        description: 'Tôm tươi, thịt luộc, bún, rau thơm, tương đậu phộng',
        price: 30000,
        image: 'https://images.unsplash.com/photo-1536590158209-e9d615d525e4?w=500&q=80',
        popular: true,
    },
    {
        id: 4,
        name: 'Trà Sen Vàng',
        description: 'Trà ô long, hạt sen, củ năng, kem macchiato',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80',
        popular: false,
    }
];

export const MenuPage = () => {
    const { tableId } = useParams();
    const [activeCat, setActiveCat] = useState(0);

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-10">
            {/* Banner Section */}
            <div className="relative h-48 -mx-4 -mt-4 mb-2 overflow-hidden bg-gray-900">
                <img 
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80" 
                    alt="Banner" 
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex flex-col justify-end p-6 text-white">
                    <Title level={3} className="!text-white !m-0 !mb-1">Khám phá ẩm thực</Title>
                    <Text className="text-gray-300">Những món ngon được chọn lọc kỹ càng</Text>
                </div>
            </div>

            {/* Table Info Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between -mt-10 relative z-10 mx-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                        <img src="/qr-scan.svg" alt="QR" className="w-6 h-6 opacity-70" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <span className="text-xl">🍽️</span>
                    </div>
                    <div>
                        <Text className="text-gray-500 text-xs font-medium block uppercase tracking-wider">Vị trí của bạn</Text>
                        <Title level={5} className="!m-0 text-orange-600 font-bold">
                            {tableId ? `Bàn ${tableId}` : 'Khách mang đi'}
                        </Title>
                    </div>
                </div>
                <Button shape="circle" icon={<SearchOutlined />} size="large" className="bg-gray-50 border-none hover:bg-orange-50 hover:text-orange-600" />
            </div>

            {/* Sticky Categories */}
            <div className="sticky top-[64px] z-40 bg-gray-50/90 backdrop-blur-md -mx-4 px-4 py-3 border-b border-gray-200">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {MOCK_CATEGORIES.map((cat, idx) => (
                        <div 
                            key={idx}
                            onClick={() => setActiveCat(idx)}
                            className={`px-5 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all cursor-pointer shadow-sm
                                ${activeCat === idx 
                                    ? 'bg-orange-500 text-white font-bold transform scale-105' 
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}
                        >
                            {cat}
                        </div>
                    ))}
                </div>
            </div>

            {/* Menu Items List */}
            <div className="flex flex-col gap-5 px-4 md:px-0">
                <Title level={4} className="!m-0 text-gray-800">{MOCK_CATEGORIES[activeCat]}</Title>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_ITEMS.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl p-3 flex gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                {item.popular && (
                                    <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg">
                                        HOT
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="font-bold text-gray-800 text-base leading-tight mb-1">{item.name}</div>
                                    <div className="text-gray-500 text-xs line-clamp-2">{item.description}</div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="font-bold text-orange-600 text-base">{formatCurrency(item.price)}</div>
                                    <button className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                                        <PlusOutlined />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
