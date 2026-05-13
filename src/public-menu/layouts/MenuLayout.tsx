import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Affix } from 'antd';
import { ShoppingCartOutlined, ShopOutlined } from '@ant-design/icons';
import { useCartStore } from '../store/useCartStore';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export const MenuLayout = () => {
    const { restaurantSlug } = useParams();
    const navigate = useNavigate();
    const totalItems = useCartStore((state) => state.getTotalItems());

    return (
        <Layout className="min-h-screen bg-gray-50 font-sans">
            <Affix>
                <Header className="bg-white/80 backdrop-blur-md px-4 flex items-center justify-between shadow-sm h-16 border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
                    <div 
                        className="flex items-center gap-3 cursor-pointer" 
                        onClick={() => navigate(`/menu/${restaurantSlug}`)}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center font-bold shadow-sm">
                            <ShopOutlined className="text-xl" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <Title level={5} className="!m-0 text-gray-800 font-bold tracking-tight">
                                {restaurantSlug?.toUpperCase() || 'NHÀ HÀNG'}
                            </Title>
                            <Text className="text-xs text-gray-500 font-medium">Thực đơn điện tử</Text>
                        </div>
                    </div>
                    
                    <div 
                        className="relative cursor-pointer bg-orange-50 p-2 rounded-full hover:bg-orange-100 transition-colors"
                        onClick={() => navigate(`/menu/${restaurantSlug}/cart`)}
                    >
                        <ShoppingCartOutlined className="text-2xl text-orange-600" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-sm border-2 border-white">
                                {totalItems}
                            </span>
                        )}
                    </div>
                </Header>
            </Affix>

            <Content className="pb-28 max-w-2xl mx-auto w-full min-h-[calc(100vh-64px)]">
                <Outlet />
            </Content>
        </Layout>
    );
};
