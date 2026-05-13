import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Steps } from 'antd';
import { CheckCircleFilled, HomeOutlined, SyncOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const OrderSuccessPage = () => {
    const { orderId, restaurantSlug } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);

    // Mock polling status
    useEffect(() => {
        const timer1 = setTimeout(() => {
            setCurrentStep(1); // Đang chuẩn bị
        }, 5000); // 5s

        const timer2 = setTimeout(() => {
            setCurrentStep(2); // Hoàn thành
        }, 12000); // 12s

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] px-6 animate-fade-in bg-white">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircleFilled className="text-6xl text-green-500" />
            </div>
            
            <Title level={3} className="!mb-2 text-center text-gray-800">Đặt Món Thành Công!</Title>
            
            <div className="bg-gray-50 rounded-2xl p-4 my-6 w-full text-center border border-gray-100">
                <Text className="text-gray-500 text-sm block mb-1">Mã đơn hàng của bạn</Text>
                <Title level={4} className="!m-0 text-orange-600 font-bold tracking-wider">{orderId}</Title>
            </div>

            <Text className="text-center text-gray-500 mb-8 max-w-xs">
                Vui lòng giữ nguyên màn hình này hoặc nhớ mã đơn để đối chiếu với nhân viên nhé.
            </Text>

            <div className="w-full mb-10 text-left">
                <Title level={5} className="!mb-4">Trạng thái đơn hàng</Title>
                <Steps
                    direction="vertical"
                    current={currentStep}
                    items={[
                        {
                            title: 'Đã tiếp nhận',
                            description: 'Bếp đã nhận order của bạn.',
                        },
                        {
                            title: 'Đang chuẩn bị',
                            description: 'Món ăn đang được chế biến.',
                            icon: currentStep === 1 ? <SyncOutlined spin /> : undefined,
                        },
                        {
                            title: 'Hoàn thành',
                            description: 'Nhân viên đang mang món ra cho bạn.',
                        },
                    ]}
                />
            </div>

            <Button 
                type="default" 
                size="large" 
                icon={<HomeOutlined />}
                onClick={() => navigate(`/menu/${restaurantSlug}`)}
                className="w-full h-12 rounded-xl text-base font-medium"
            >
                Quay lại thực đơn
            </Button>
        </div>
    );
};
