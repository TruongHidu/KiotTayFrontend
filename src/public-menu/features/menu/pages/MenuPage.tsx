import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MenuItemCard } from '../components/MenuItemCard';
import { FloatingCartButton } from '../components/FloatingCartButton';
import { useCartStore } from '../../../store/useCartStore';

const { Title, Text } = Typography;

// Mock Data grouped by Category
const MOCK_MENU_DATA = [
    {
        category: 'Nổi bật',
        items: [
            { id: 1, name: 'Phở Bò Đặc Biệt', description: 'Tái, nạm, gầu, gân, bò viên', price: 65000, image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&q=80', popular: true, status: 'AVAILABLE' },
            { id: 5, name: 'Trà Đá', description: 'Trà đá mát lạnh', price: 5000, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80', popular: true, status: 'OUT_OF_STOCK' },
        ]
    },
    {
        category: 'Món chính',
        items: [
            { id: 2, name: 'Bún Chả Hà Nội', description: 'Chả băm, chả miếng nướng than hoa', price: 55000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80', popular: false, status: 'AVAILABLE' },
            { id: 6, name: 'Cơm Tấm Sườn Bì Chả', description: 'Cơm tấm dẻo, sườn nướng mỡ hành', price: 60000, image: 'https://images.unsplash.com/photo-1626804475297-4160cb2586cd?w=500&q=80', popular: false, status: 'AVAILABLE' },
        ]
    },
    {
        category: 'Ăn vặt',
        items: [
            { id: 3, name: 'Gỏi Cuốn Tôm Thịt', description: 'Tôm tươi, thịt luộc, bún, rau thơm', price: 30000, image: 'https://images.unsplash.com/photo-1536590158209-e9d615d525e4?w=500&q=80', popular: true, status: 'AVAILABLE' },
        ]
    },
    {
        category: 'Đồ uống',
        items: [
            { id: 4, name: 'Trà Sen Vàng', description: 'Trà ô long, hạt sen, củ năng', price: 45000, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80', popular: false, status: 'AVAILABLE' },
        ]
    }
];

export const MenuPage = () => {
    const { tableId, restaurantSlug } = useParams();
    const [activeCat, setActiveCat] = useState(0);
    const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
    const setRestaurantInfo = useCartStore((state) => state.setRestaurantInfo);

    useEffect(() => {
        if (restaurantSlug) {
            setRestaurantInfo(restaurantSlug, tableId);
        }
    }, [restaurantSlug, tableId, setRestaurantInfo]);

    // Scroll-Spy Logic
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px -60% 0px',
            threshold: 0
        };

        const observerCallback: IntersectionObserverCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = categoryRefs.current.findIndex(ref => ref === entry.target);
                    if (index !== -1) {
                        setActiveCat(index);
                        // Auto-scroll the horizontal category nav
                        const navItem = document.getElementById(`nav-cat-${index}`);
                        if (navItem) {
                            navItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                        }
                    }
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        categoryRefs.current.forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToCategory = (index: number) => {
        setActiveCat(index);
        const yOffset = -90; // offset for sticky header
        const element = categoryRefs.current[index];
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-24">
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

            {/* Sticky Categories Navigation */}
            <div className="sticky top-[0px] z-40 bg-gray-50/90 backdrop-blur-md -mx-4 px-4 py-3 border-b border-gray-200">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {MOCK_MENU_DATA.map((group, idx) => (
                        <div 
                            key={idx}
                            id={`nav-cat-${idx}`}
                            onClick={() => scrollToCategory(idx)}
                            className={`px-5 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all cursor-pointer shadow-sm select-none
                                ${activeCat === idx 
                                    ? 'bg-orange-500 text-white font-bold transform scale-105' 
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}
                        >
                            {group.category}
                        </div>
                    ))}
                </div>
            </div>

            {/* Menu Items List */}
            <div className="flex flex-col gap-8 px-4 md:px-0">
                {MOCK_MENU_DATA.map((group, groupIdx) => (
                    <div 
                        key={groupIdx} 
                        ref={(el) => { categoryRefs.current[groupIdx] = el; }}
                        className="scroll-mt-[100px]"
                    >
                        <Title level={4} className="!m-0 text-gray-800 mb-4">{group.category}</Title>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {group.items.map((item) => (
                                <MenuItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <FloatingCartButton />
        </div>
    );
};
