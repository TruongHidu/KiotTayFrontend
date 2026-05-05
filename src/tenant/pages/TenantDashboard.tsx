import { Card, Row, Col, Statistic, Typography } from 'antd';
import { ShopOutlined, ShoppingCartOutlined, DollarOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';

const { Title } = Typography;

export const TenantDashboard = () => {
    const user = useAuthStore(state => state.user);

    return (
        <div>
            <div className="mb-6">
                <Title level={2}>Tổng quan Nhà hàng</Title>
                <p className="text-gray-500">Xin chào {user?.name}, đây là tình hình kinh doanh hôm nay.</p>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu hôm nay"
                            value={0}
                            prefix={<DollarOutlined className="text-emerald-500" />}
                            suffix="VNĐ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đơn hàng mới"
                            value={0}
                            prefix={<ShoppingCartOutlined className="text-blue-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Khách ghé thăm"
                            value={0}
                            prefix={<TeamOutlined className="text-orange-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Món đang bán"
                            value={0}
                            prefix={<ShopOutlined className="text-purple-500" />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* TODO: Add Charts and Recent Orders */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center">
                <p className="text-gray-400">Biểu đồ doanh thu sẽ hiển thị ở đây</p>
            </div>
        </div>
    );
};
