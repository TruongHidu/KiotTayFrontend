/**
 * useOrderRealtimeListener.ts
 * Custom Hook lắng nghe event "order.created" realtime từ Backend
 * qua kênh Laravel Echo: `restaurant.{restaurant_id}`
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getEcho } from '@/lib/echoClient';
import { antdNotification } from '@/lib/antdStatic';
import { useNotificationStore, type OrderNotificationPayload } from '@/store/useNotificationStore';
import { ORDER_KEYS } from '@/tenant/features/orders/services/order.hooks';

// ─── Sound helper ─────────────────────────────────────────────────────────────

const playNotificationSound = (level: 'default' | 'loud') => {
    try {
        const soundFile = level === 'loud'
            ? '/sounds/order-loud.mp3'
            : '/sounds/order-notify.mp3';

        const audio = new Audio(soundFile);
        audio.volume = level === 'loud' ? 1.0 : 0.6;
        audio.play().catch(() => {
            playBeepFallback(level);
        });
    } catch {
        playBeepFallback(level);
    }
};

const playBeepFallback = (level: 'default' | 'loud') => {
    try {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode   = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type            = 'sine';
        oscillator.frequency.value = level === 'loud' ? 880 : 660;
        gainNode.gain.value        = level === 'loud' ? 0.8 : 0.4;
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.3);
    } catch {
        // Thiết bị không hỗ trợ → bỏ qua
    }
};

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseOrderRealtimeListenerOptions {
    restaurantId: string | null | undefined;
    enabled?: boolean;
}

export const useOrderRealtimeListener = ({
    restaurantId,
    enabled = true,
}: UseOrderRealtimeListenerOptions) => {
    const queryClient = useQueryClient();

    // FIX: Dùng useRef để giữ stable reference đến store actions
    // → tránh useEffect chạy lại mỗi render khi Zustand trả về function mới
    const storeRef = useRef(useNotificationStore.getState());

    // Sync storeRef mỗi khi store cập nhật
    useEffect(() => {
        const unsub = useNotificationStore.subscribe((state) => {
            storeRef.current = state;
        });
        return unsub;
    }, []);

    useEffect(() => {
        if (!enabled || !restaurantId) {
            console.warn('[Realtime] Không subscribe: enabled=', enabled, 'restaurantId=', restaurantId);
            return;
        }

        const channelName = `restaurant.${restaurantId}`;
        const echo = getEcho();

        console.info('[Realtime] Đang subscribe channel:', channelName);

        // ── Subscribe channel ───────────────────────────────────────────────
        // FIX: Thử dùng channel() (Public) trước.
        // Nếu backend dùng Private Channel → đổi thành echo.private(channelName)
        // Lưu ý: Private Channel yêu cầu route /broadcasting/auth trên backend
        const channel = echo.channel(channelName);

        // Log trạng thái kết nối Pusher để debug
        const pusher = echo.connector?.pusher;
        if (pusher) {
            pusher.connection.bind('connected', () => {
                console.info('[Realtime] ✅ WebSocket connected!');
            });
            pusher.connection.bind('error', (err: unknown) => {
                console.error('[Realtime] ❌ WebSocket error:', err);
            });
            pusher.connection.bind('state_change', (states: { previous: string; current: string }) => {
                console.info('[Realtime] WS state:', states.previous, '→', states.current);
            });
        }

        // ── Lắng nghe event ─────────────────────────────────────────────────
        // FIX: Tên event KHÔNG có dấu chấm ở đầu khi dùng Public Channel.
        // - Public Channel:  channel.listen('OrderCreated', ...)  hoặc '.order.created'
        // - Private Channel: channel.listen('.order.created', ...)
        //
        // Backend Laravel broadcastAs() = 'order.created' → Frontend dùng '.order.created'
        // Nếu broadcastAs() không được định nghĩa → dùng tên class: 'App\\Events\\OrderCreated'
        channel.listen('.order.created', (payload: OrderNotificationPayload) => {
            console.info('[Realtime] 📦 Nhận event order.created:', payload);

            const { incrementBadge, markProcessed, isProcessed, setLastNotification } =
                storeRef.current;

            const idempotencyKey = payload?.meta?.idempotency_key;

            // Chống trùng lặp
            if (!idempotencyKey || isProcessed(idempotencyKey)) {
                console.info('[Realtime] Event bị bỏ qua (đã xử lý):', idempotencyKey);
                return;
            }
            markProcessed(idempotencyKey);

            const { notification, order_summary } = payload;

            // Phát âm thanh
            if (notification?.sound) {
                playNotificationSound(notification.sound_level ?? 'default');
            }

            // Hiển thị Toast
            antdNotification.open({
                message: notification?.title ?? 'Đơn hàng mới!',
                description: notification?.body ?? `Mã đơn: ${order_summary?.order_code}`,
                placement: 'topRight',
                duration: 8,
                type: notification?.priority === 'high' ? 'warning' : 'info',
                style: {
                    borderLeft: '4px solid #059669',
                },
            });

            // Tăng badge
            incrementBadge(notification?.badge_delta ?? 1);

            // Lưu notification mới nhất
            setLastNotification(payload);

            // Trigger refresh danh sách đơn hàng
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
        });

        // Cleanup khi unmount hoặc restaurantId thay đổi
        return () => {
            console.info('[Realtime] Unsubscribe channel:', channelName);
            echo.leave(channelName);
        };

    // FIX: Dependency array chỉ có restaurantId + enabled + queryClient
    // → KHÔNG đưa Zustand actions vào dep array (chúng không stable)
    }, [restaurantId, enabled, queryClient]);
};
