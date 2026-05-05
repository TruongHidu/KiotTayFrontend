import { Outlet, useParams } from 'react-router-dom';
import { Layout, Typography, Affix } from 'antd';
import { ShoppingCartOutlined, ShopOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export const MenuLayout = () => {
    const { restaurantSlug } = useParams();

    return (
        <Layout className="min-h-screen bg-gray-50 font-sans">
            <Affix>
                <Header className="bg-white/80 backdrop-blur-md px-4 flex items-center justify-between shadow-sm h-16 border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
                    <div className="flex items-center gap-3">
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
                    
                    <div className="relative cursor-pointer bg-orange-50 p-2 rounded-full hover:bg-orange-100 transition-colors">
                        <ShoppingCartOutlined className="text-2xl text-orange-600" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-sm border-2 border-white">
                            3
                        </span>
                    </div>
                </Header>
            </Affix>

            <Content className="pb-28 max-w-2xl mx-auto w-full min-h-[calc(100vh-64px)]">
                <Outlet />
            </Content>
            
            {/* Floating Bottom Bar for Mobile App Feel */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none z-40">
                <div className="max-w-2xl mx-auto flex justify-center pointer-events-auto">
                    <div className="bg-gray-900 text-white rounded-full px-6 py-3 shadow-xl flex items-center gap-4 w-[90%] md:w-auto hover:bg-gray-800 transition-all cursor-pointer transform hover:scale-[1.02]">
                        <div className="bg-white/20 p-2 rounded-full">
                            <ShoppingCartOutlined className="text-xl" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold">3 món</div>
                            <div className="text-xs text-gray-300">125.000 ₫</div>
                        </div>
                        <div className="font-bold text-orange-400">Xem giỏ hàng →</div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
