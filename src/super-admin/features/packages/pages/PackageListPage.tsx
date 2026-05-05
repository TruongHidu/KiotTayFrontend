import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Table,
    Button,
    Space,
    Input,
    Switch,
    Row,
    Col,
    message,
    Tooltip,
    Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { usePackages, useTogglePackage } from '../services/package.hooks';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handlers';
import { LoadingState } from '@/lib/loading-state';
import type { Package, PackageListParams } from '@/types';

const { Search } = Input;

export const PackageListPage = () => {
    const navigate = useNavigate();
    const [params, setParams] = useState<PackageListParams>({
        per_page: 15,
        search: '',
    });

    const { data, isLoading, error } = usePackages(params);
    const { mutate: togglePackage } = useTogglePackage();

    const packages = data?.data || [];
    const pagination = data?.meta;

    const handleSearch = (value: string) => {
        setParams((prev) => ({ ...prev, search: value, page: 1 }));
    };

    const handleToggleActive = (record: Package) => {
        togglePackage(record.id, {
            onSuccess: () => {
                message.success(
                    `Gói dịch vụ đã ${record.is_active ? 'tắt' : 'bật'}`
                );
            },
            onError: (error) => {
                message.error(getErrorMessage(error));
            },
        });
    };

    const columns = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            width: 150,
        },
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            width: 100,
            render: (text: string) => <code>{text}</code>,
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price) => formatCurrency(price),
        },
        {
            title: 'Thời Hạn',
            dataIndex: 'duration_days',
            key: 'duration_days',
            width: 100,
            render: (days) => `${days} ngày`,
        },
        {
            title: 'Tính Năng',
            dataIndex: 'features',
            key: 'features',
            width: 200,
            render: (features: Array<{ id: string; name: string }>) => (
                <Space size={[0, 8]} wrap>
                    {features.slice(0, 2).map((f) => (
                        <Tag key={f.id}>{f.name}</Tag>
                    ))}
                    {features.length > 2 && (
                        <Tag>+{features.length - 2}</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 100,
            render: (isActive: boolean, record: Package) => (
                <Switch
                    checked={isActive}
                    onChange={() => handleToggleActive(record)}
                />
            ),
        },
        {
            title: 'Ngày Tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text: string) => formatDate(text),
            width: 120,
        },
        {
            title: 'Hành Động',
            key: 'actions',
            fixed: 'right' as const,
            width: 120,
            render: (_: unknown, record: Package) => (
                <Space size="small">
                    <Tooltip title="Chi tiết">
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/super-admin/packages/${record.id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/super-admin/packages/${record.id}/edit`)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="Quản Lý Gói Dịch Vụ"
            extra={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/super-admin/packages/new')}
                >
                    Thêm Mới
                </Button>
            }
        >
            <Row gutter={[16, 16]} className="mb-4">
                <Col xs={24} sm={12}>
                    <Search
                        placeholder="Tìm kiếm theo tên hoặc mã..."
                        onSearch={handleSearch}
                        allowClear
                    />
                </Col>
            </Row>

            <LoadingState
                isLoading={isLoading}
                isEmpty={packages.length === 0}
                error={error}
                emptyMessage="Không có gói dịch vụ nào"
            >
                <Table
                    dataSource={packages.map((p) => ({ ...p, key: p.id }))}
                    columns={columns}
                    pagination={{
                        current: pagination?.current_page || 1,
                        pageSize: pagination?.per_page || 15,
                        total: pagination?.total || 0,
                        onChange: (page) => {
                            setParams((prev) => ({ ...prev, page }));
                        },
                    }}
                    scroll={{ x: 1200 }}
                />
            </LoadingState>
        </Card>
    );
};
