import { useState, useMemo } from 'react';
import { message } from 'antd';
import { ItemGroupSidebar } from '../components/ItemGroupSidebar';
import { ItemTable } from '../components/ItemTable';
import { ItemGroupModal } from '../components/ItemGroupModal';
import { ItemModal } from '../components/ItemModal';
import {
    useItemGroups,
    useCreateItemGroup,
    useUpdateItemGroup,
    useDeleteItemGroup,
    useItems,
    useCreateItem,
    useUpdateItem,
    useDeleteItem,
} from '../services/menu.hooks';
import type { ItemGroup, Item, CreateItemGroupRequest, CreateItemRequest } from '@/types';

export const MenuManagementPage = () => {
    // --- State ---
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ItemGroup | null>(null);

    const [isItemModalVisible, setIsItemModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);

    // --- Queries ---
    const { data: groupData, isLoading: isLoadingGroups } = useItemGroups();
    const { data: itemData, isLoading: isLoadingItems } = useItems();

    // --- Derived Data ---
    const itemGroups = useMemo(() => groupData?.data || [], [groupData?.data]);
    const allItems = useMemo(() => itemData?.data || [], [itemData?.data]);

    // --- Mutations ---
    const createGroupMutation = useCreateItemGroup();
    const updateGroupMutation = useUpdateItemGroup(editingGroup?.id || '');
    const deleteGroupMutation = useDeleteItemGroup();

    const createItemMutation = useCreateItem();
    const updateItemMutation = useUpdateItem(editingItem?.id || '');
    const deleteItemMutation = useDeleteItem();

    // --- Derived Data ---
    const filteredItems = useMemo(() => {
        if (!selectedGroupId) return allItems;
        return allItems.filter(item => item.item_group_id === selectedGroupId);
    }, [allItems, selectedGroupId]);

    const selectedGroupName = useMemo(() => {
        if (!selectedGroupId) return undefined;
        return itemGroups.find(g => g.id === selectedGroupId)?.name;
    }, [itemGroups, selectedGroupId]);

    // --- Handlers: Item Group ---
    const handleAddGroup = () => {
        setEditingGroup(null);
        setIsGroupModalVisible(true);
    };

    const handleEditGroup = (group: ItemGroup) => {
        setEditingGroup(group);
        setIsGroupModalVisible(true);
    };

    const handleDeleteGroup = (id: string) => {
        deleteGroupMutation.mutate(id, {
            onSuccess: () => {
                message.success('Đã xóa nhóm món ăn!');
                if (selectedGroupId === id) setSelectedGroupId(null);
            },
            onError: (error: unknown) => {
                message.error((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra khi xóa!');
            }
        });
    };

    const handleSubmitGroup = (values: Record<string, unknown>) => {
        if (editingGroup) {
            updateGroupMutation.mutate(values, {
                onSuccess: () => {
                    message.success('Cập nhật nhóm món thành công!');
                    setIsGroupModalVisible(false);
                },
                onError: (error: unknown) => {
                    message.error((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra!');
                }
            });
        } else {
            createGroupMutation.mutate(values as unknown as CreateItemGroupRequest, {
                onSuccess: () => {
                    message.success('Thêm nhóm món thành công!');
                    setIsGroupModalVisible(false);
                },
                onError: (error: unknown) => {
                    message.error((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra!');
                }
            });
        }
    };

    // --- Handlers: Item ---
    const handleAddItem = () => {
        setEditingItem(null);
        setIsItemModalVisible(true);
    };

    const handleEditItem = (item: Item) => {
        setEditingItem(item);
        setIsItemModalVisible(true);
    };

    const handleDeleteItem = (id: string) => {
        deleteItemMutation.mutate(id, {
            onSuccess: () => {
                message.success('Đã xóa món ăn!');
            },
            onError: (error: unknown) => {
                message.error((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra khi xóa!');
            }
        });
    };

    const handleSubmitItem = (values: Record<string, unknown>) => {
        if (editingItem) {
            updateItemMutation.mutate(values, {
                onSuccess: () => {
                    message.success('Cập nhật món ăn thành công!');
                    setIsItemModalVisible(false);
                },
                onError: (error: unknown) => {
                    message.error((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra!');
                }
            });
        } else {
            createItemMutation.mutate(values as unknown as CreateItemRequest, {
                onSuccess: () => {
                    message.success('Thêm món ăn thành công!');
                    setIsItemModalVisible(false);
                },
                onError: (error: unknown) => {
                    message.error((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Có lỗi xảy ra!');
                }
            });
        }
    };

    return (
        <div className="flex h-full bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
                <ItemGroupSidebar
                    itemGroups={itemGroups}
                    selectedGroupId={selectedGroupId}
                    onSelectGroup={setSelectedGroupId}
                    onAddGroup={handleAddGroup}
                    onEditGroup={handleEditGroup}
                    onDeleteGroup={handleDeleteGroup}
                    isLoading={isLoadingGroups}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <ItemTable
                    items={filteredItems}
                    itemGroups={itemGroups}
                    isLoading={isLoadingItems}
                    onAddItem={handleAddItem}
                    onEditItem={handleEditItem}
                    onDeleteItem={handleDeleteItem}
                    selectedGroupName={selectedGroupName}
                />
            </div>

            {/* Modals */}
            <ItemGroupModal
                visible={isGroupModalVisible}
                onClose={() => setIsGroupModalVisible(false)}
                onSubmit={handleSubmitGroup}
                initialData={editingGroup}
                isLoading={createGroupMutation.isPending || updateGroupMutation.isPending}
            />

            <ItemModal
                visible={isItemModalVisible}
                onClose={() => setIsItemModalVisible(false)}
                onSubmit={handleSubmitItem}
                initialData={editingItem}
                isLoading={createItemMutation.isPending || updateItemMutation.isPending}
                itemGroups={itemGroups}
                defaultGroupId={selectedGroupId || undefined}
            />
        </div>
    );
};
