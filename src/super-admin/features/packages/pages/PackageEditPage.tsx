import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Button, Space, message, Checkbox, InputNumber, Select, Spin, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { usePackage, useUpdatePackage } from '../services/package.hooks';
import { useFeatures } from '@/super-admin/features/feature-flags/services/feature.hooks';
import { getErrorMessage, getFieldErrors } from '@/lib/error-handlers';
import type { UpdatePackageRequest } from '@/types';

export const PackageEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { data: pkg, isLoading, error } = usePackage(id);
    const { data: featuresData, isLoading: featuresLoading } = useFeatures({
        per_page: 100,
        is_active: true,
    });
    const { mutate: updatePackage, isPending } = useUpdatePackage(id!);

    const handleSubmit = (values: UpdatePackageRequest) => {
        updatePackage(values, {
            onSuccess: () => {
                message.success('Cập nhật gói dịch vụ thành công');
                navigate(`/super-admin/packages/${id}`);
            },
            onError: (error) => {
                const fieldErrors = getFieldErrors(error);
                if (fieldErrors) {
                    const errorFields = Object.entries(fieldErrors).map(([field, errors]) => ({
                        name: field,
                        errors: errors,
                    }));
                    form.setFields(errorFields);
                } else {
                    message.error(getErrorMessage(error));
                }
            },
        });
    };

    if (isLoading || featuresLoading) {
        return <Spin />;
    }

    if (error) {
        return <Alert message="Không tìm thấy gói dịch vụ" type="error" />;
    }

    const features = featuresData?.data || [];

    return (
        <div>
            <Space className="mb-4">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(`/super-admin/packages/${id}`)}
                >
                    Quay lại
                </Button>
            </Space>

            <Card title={`Sửa: ${pkg?.name}`}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        ...pkg,
                        feature_ids: pkg?.features.map((f) => f.id),
                    }}
                    autoComplete="off"
                    style={{ maxWidth: 600 }}
                >
                    <Form.Item
                        label="Mã (Ký Tự Hoa Và Gạch Dưới)"
                        name="code"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã gói' },
                            {
                                pattern: /^[A-Z0-9_]+$/,
                                message: 'Mã chỉ được chứa chữ hoa, số và gạch dưới',
                            },
                        ]}
                    >
                        <Input placeholder="VD: PACKAGE_NAME" />
                    </Form.Item>

                    <Form.Item
                        label="Tên"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên gói' }]}
                    >
                        <Input placeholder="Nhập tên gói" />
                    </Form.Item>

                    <Form.Item
                        label="Giá (VNĐ)"
                        name="price"
                        rules={[
                            { required: true, message: 'Vui lòng nhập giá' },
                            {
                                type: 'number',
                                min: 0,
                                message: 'Giá phải lớn hơn hoặc bằng 0',
                            },
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Thời Hạn (Ngày)"
                        name="duration_days"
                        rules={[
                            { required: true, message: 'Vui lòng nhập thời hạn' },
                            {
                                type: 'number',
                                min: 1,
                                message: 'Thời hạn phải lớn hơn 0',
                            },
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Mô Tả"
                        name="description"
                    >
                        <Input.TextArea placeholder="Nhập mô tả gói" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        valuePropName="checked"
                    >
                        <Checkbox>Kích hoạt</Checkbox>
                    </Form.Item>

                    <Form.Item
                        label="Tính Năng"
                        name="feature_ids"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn tính năng"
                            options={features.map((f) => ({
                                label: f.name,
                                value: f.id,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={isPending}>
                                Cập Nhật
                            </Button>
                            <Button onClick={() => navigate(`/super-admin/packages/${id}`)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};
