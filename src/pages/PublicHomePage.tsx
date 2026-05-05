import { Card, Space, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export const PublicHomePage = () => {
    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <Card style={{ maxWidth: 720, width: '100%' }}>
                <Title level={2} style={{ marginTop: 0 }}>
                    KiotTay
                </Title>
                <Paragraph>
                    Đây là khu vực người dùng (public). Khu vực quản trị dành cho{' '}
                    <strong>SUPER_ADMIN</strong> nằm tại <code>/admin</code>.
                </Paragraph>
                <Space>
                    <Button type="primary">
                        <Link to="/login">Đăng nhập Admin</Link>
                    </Button>
                    <Button>
                        <Link to="/admin">Đi tới Admin</Link>
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

