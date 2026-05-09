import { Table, Button, Space, Tag, Image, Popconfirm, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { Item, ItemGroup } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface ItemTableProps {
    items: Item[];
    itemGroups: ItemGroup[];
    isLoading: boolean;
    onAddItem: () => void;
    onEditItem: (item: Item) => void;
    onDeleteItem: (id: string) => void;
    selectedGroupName?: string;
}

export const ItemTable = ({
    items,
    itemGroups,
    isLoading,
    onAddItem,
    onEditItem,
    onDeleteItem,
    selectedGroupName
}: ItemTableProps) => {
    
    // Helper to get group name
    const getGroupName = (groupId: string) => {
        const group = itemGroups.find(g => g.id === groupId);
        return group ? group.name : 'Unknown';
    };

    const columns: ColumnsType<Item> = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image_url',
            key: 'image_url',
            width: 80,
            render: (url: string) => (
                url ? <Image src={url} width={50} height={50} className="object-cover rounded" fallback="https://via.placeholder.com/50?text=No+Image" /> : 
                <div className="w-[50px] h-[50px] bg-gray-100 flex items-center justify-center rounded text-gray-400 text-xs">No img</div>
            ),
        },
        {
            title: 'Tên món',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-gray-500">{getGroupName(record.item_group_id)}</div>
                </div>
            )
        },
        {
            title: 'Giá bán',
            dataIndex: 'sale_price',
            key: 'sale_price',
            render: (price: string) => (
                <Text strong className="text-blue-600">
                    {Number(price).toLocaleString('vi-VN')} đ
                </Text>
            ),
            sorter: (a, b) => Number(a.sale_price) - Number(b.sale_price),
        },
        {
            title: 'Đơn vị',
            dataIndex: 'unit',
            key: 'unit',
            width: 100,
        },
        {
            title: 'Trạng thái kho',
            dataIndex: 'availability_status',
            key: 'availability_status',
            render: (status: string) => {
                let color = 'default';
                let text = status;
                
                if (status === 'IN_STOCK') { color = 'success'; text = 'Còn hàng'; }
                else if (status === 'OUT_OF_STOCK') { color = 'error'; text = 'Hết hàng'; }
                else if (status === 'SUSPENDED') { color = 'warning'; text = 'Ngưng bán'; }
                
                return <Tag color={color}>{text}</Tag>;
            },
            filters: [
                { text: 'Còn hàng', value: 'IN_STOCK' },
                { text: 'Hết hàng', value: 'OUT_OF_STOCK' },
                { text: 'Ngưng bán', value: 'SUSPENDED' },
            ],
            onFilter: (value, record) => record.availability_status === value,
        },
        {
            title: 'Hiển thị',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'blue' : 'default'}>{isActive ? 'Đang bật' : 'Đang tắt'}</Tag>
            ),
            filters: [
                { text: 'Đang bật', value: true },
                { text: 'Đang tắt', value: false },
            ],
            onFilter: (value, record) => record.is_active === value,
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="default" 
                        icon={<EditOutlined />} 
                        onClick={() => onEditItem(record)}
                    />
                    <Popconfirm
                        title="Xóa món ăn"
                        description="Bạn có chắc chắn muốn xóa món này?"
                        onConfirm={() => onDeleteItem(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="bg-white p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                    {selectedGroupName ? `Danh sách món: ${selectedGroupName}` : 'Tất cả món ăn'}
                </h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={onAddItem}>
                    Thêm Món Mới
                </Button>
            </div>
            
            <div className="flex-1 overflow-auto">
                <Table
                    columns={columns}
                    dataSource={items}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ y: 'calc(100vh - 280px)' }}
                />
            </div>
        </div>
    );
};
