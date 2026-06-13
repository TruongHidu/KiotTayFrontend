import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { getEcho } from '@/lib/echoClient';
import { antdNotification } from '@/lib/antdStatic';
import { ORDER_KEYS } from '../services/order.hooks';
import { useHighlightStore } from '../stores/highlight.store';
import type { Order, OrderItem } from '@/types';

export const useTenantOrdersSync = (restaurantId: string | undefined) => {
    const queryClient = useQueryClient();
    const { message, notification } = App.useApp();

    useEffect(() => {
        if (!restaurantId) return;

        const channelName = `restaurant.${restaurantId}.kitchen`;
        const cashierChannelName = `restaurant.${restaurantId}.cashier`;
        const echo = getEcho();
        const channel = echo.channel(channelName);
        const cashierChannel = echo.channel(cashierChannelName);

        // ── Cashier channel events ─────────────────────────────────────────────

        // Lắng nghe đơn QR mới cho Thu ngân (Cashier)
        cashierChannel.listen('.NewQrOrder', (payload: any) => {
            console.log('--- RAW EVENT .NewQrOrder ---', payload);

            const orderData: Order | undefined = payload?.order || (payload?.id ? payload : undefined);

            if (!orderData) {
                console.error('[WebSockets] Không tìm thấy dữ liệu order trong event .NewQrOrder', payload);
                return;
            }

            console.log('Có đơn QR mới từ khách:', orderData);

            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
            useHighlightStore.getState().addHighlight(orderData.id, 'NEW_ORDER');

            try {
                const audio = new Audio('/sounds/order-notify.mp3');
                audio.volume = 0.8;
                audio.play().catch((err) => {
                    console.log('Trình duyệt chặn autoplay audio, dùng fallback:', err);
                    try {
                        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                        if (AudioContextClass) {
                            const ctx = new AudioContextClass();
                            const osc = ctx.createOscillator();
                            osc.connect(ctx.destination);
                            osc.frequency.value = 660;
                            osc.start();
                            osc.stop(ctx.currentTime + 0.3);
                        }
                    } catch (fbErr) {
                        console.log('Fallback audio bị lỗi:', fbErr);
                    }
                });
            } catch (err) {}

            antdNotification.open({
                message: 'Đơn QR mới cần xác nhận!',
                description: `Khách hàng vừa đặt đơn ${orderData.order_code || 'Không rõ mã'}. Vui lòng kiểm tra và xác nhận!`,
                placement: 'topRight',
                duration: 10,
                type: 'info',
                style: { borderLeft: '4px solid #059669' },
            });
        });

        // Lắng nghe khách gọi thêm món qua QR — bắn từ cashier channel, payload có newItems
        cashierChannel.listen('.OrderItemsAdded', (e: { order: Order; newItems: OrderItem[] }) => {
            console.log('[WebSockets] .OrderItemsAdded (cashier):', e);

            // Cập nhật ngay cache detail của order đang mở (nếu có) — không cần chờ refetch
            queryClient.setQueryData(ORDER_KEYS.detail(e.order.id), (old: any) => {
                if (!old?.data) return old;
                const existingIds = new Set((old.data.items || []).map((i: OrderItem) => i.id));
                const brandNew = (e.newItems || []).filter(i => !existingIds.has(i.id));
                return {
                    ...old,
                    data: {
                        ...old.data,
                        ...e.order,
                        items: [...(old.data.items || []), ...brandNew],
                    },
                };
            });

            // Invalidate để đồng bộ list Kanban và reload detail sạch từ server
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(e.order.id) });

            useHighlightStore.getState().addHighlight(e.order.id, 'NEW_ITEM');

            const newCount = e.newItems?.length ?? 0;
            antdNotification.open({
                message: '🍽️ Khách vừa gọi thêm món!',
                description: `Đơn ${e.order.order_code} có ${newCount > 0 ? `${newCount} món mới` : 'món mới được thêm vào'}. Vui lòng chuẩn bị!`,
                placement: 'topRight',
                duration: 8,
                type: 'warning',
                style: { borderLeft: '4px solid #f97316' },
            });
        });

        // ── Kitchen channel events ─────────────────────────────────────────────

        // Lắng nghe đơn hàng mới (từ QR tĩnh hoặc khách hàng)
        channel.listen('.OrderPlaced', (e: { order: Order }) => {
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });

            if (e.order.source_channel === 'qr_static' || e.order.source_channel === 'qr_table') {
                useHighlightStore.getState().addHighlight(e.order.id, 'NEW_ORDER');
                notification.info({
                    message: 'Đơn hàng mới từ mã QR',
                    description: `Khách hàng vừa đặt đơn ${e.order.order_code}. Vui lòng kiểm tra!`,
                    placement: 'topRight',
                });
            }
        });

        // Lắng nghe thay đổi trạng thái (bao gồm cả auto lùi served → cooking khi gọi thêm)
        channel.listen('.OrderStatusTransitioned', (e: { order: Order; from: string; to: string }) => {
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(e.order.id) });

            // Thông báo khi backend tự lùi trạng thái do khách gọi thêm
            if (e.from === 'served' && e.to === 'cooking') {
                message.info(`Đơn ${e.order.order_code} tự động chuyển về "Đang nấu" do có món mới.`);
            }
        });

        return () => {
            channel.stopListening('.OrderPlaced');
            channel.stopListening('.OrderStatusTransitioned');
            echo.leave(channelName);

            cashierChannel.stopListening('.NewQrOrder');
            cashierChannel.stopListening('.OrderItemsAdded');
            echo.leave(cashierChannelName);
        };
    }, [restaurantId, queryClient, message, notification]);
};
