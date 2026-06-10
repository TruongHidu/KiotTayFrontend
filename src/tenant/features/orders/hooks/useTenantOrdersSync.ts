import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { getEcho } from '@/lib/echoClient';
import { ORDER_KEYS } from '../services/order.hooks';
import { useHighlightStore } from '../stores/highlight.store';
import type { Order } from '@/types';

export const useTenantOrdersSync = (restaurantId: string | undefined) => {
    const queryClient = useQueryClient();
    const { message, notification } = App.useApp();

    useEffect(() => {
        if (!restaurantId) return;

        const channelName = `restaurant.${restaurantId}.kitchen`;
        const echo = getEcho();
        const channel = echo.channel(channelName);

        // Lắng nghe đơn hàng mới (từ QR tĩnh hoặc khách hàng)
        channel.listen('.OrderPlaced', (e: { order: Order }) => {
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
            
            // Chỉ thông báo nếu đơn đến từ QR
            if (e.order.source_channel === 'qr_static' || e.order.source_channel === 'qr_table') {
                useHighlightStore.getState().addHighlight(e.order.id, 'NEW_ORDER');
                notification.info({
                    message: 'Đơn hàng mới từ mã QR',
                    description: `Khách hàng vừa đặt đơn ${e.order.order_code}. Vui lòng kiểm tra!`,
                    placement: 'topRight',
                });
            }
        });

        // Lắng nghe thay đổi trạng thái
        channel.listen('.OrderStatusTransitioned', (e: { order: Order; from: string; to: string }) => {
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(e.order.id) });
            
            // Có thể bỏ dòng này nếu không muốn thông báo mỗi khi đổi trạng thái
            // message.info(`Đơn ${e.order.order_code} đã chuyển sang: ${e.to}`);
        });

        // Lắng nghe khách gọi thêm món
        channel.listen('.OrderItemsAdded', (e: { order: Order }) => {
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(e.order.id) });
            useHighlightStore.getState().addHighlight(e.order.id, 'NEW_ITEM');
            notification.info({
                message: 'Khách vừa gọi thêm món',
                description: `Đơn ${e.order.order_code} vừa có món mới được thêm vào!`,
                placement: 'topRight',
            });
        });

        return () => {
            channel.stopListening('.OrderPlaced');
            channel.stopListening('.OrderStatusTransitioned');
            channel.stopListening('.OrderItemsAdded');
            echo.leave(channelName);
        };
    }, [restaurantId, queryClient, message, notification]);
};
