import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    note: string;
    image?: string;
    status?: string;
}

interface CartState {
    items: CartItem[];
    restaurantSlug: string | null;
    tableId: string | null;
    customerName: string;
    
    addItem: (item: Omit<CartItem, 'quantity' | 'note'>) => void;
    removeItem: (id: number) => void;
    decreaseQuantity: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    updateNote: (id: number, note: string) => void;
    clearCart: () => void;
    setRestaurantInfo: (slug: string, tableId?: string) => void;
    setCustomerName: (name: string) => void;
    
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            restaurantSlug: null,
            tableId: null,
            customerName: '',

            addItem: (newItem) => {
                set((state) => {
                    const existingItem = state.items.find((i) => i.id === newItem.id);
                    if (existingItem) {
                        return {
                            items: state.items.map((i) =>
                                i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
                            ),
                        };
                    }
                    return {
                        items: [...state.items, { ...newItem, quantity: 1, note: '' }],
                    };
                });
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                }));
            },

            decreaseQuantity: (id) => {
                 set((state) => {
                    const existingItem = state.items.find((i) => i.id === id);
                    if (existingItem && existingItem.quantity === 1) {
                        return { items: state.items.filter((i) => i.id !== id) };
                    }
                    return {
                        items: state.items.map((i) =>
                            i.id === id ? { ...i, quantity: i.quantity - 1 } : i
                        ),
                    };
                });
            },

            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, quantity } : i
                    ),
                }));
            },

            updateNote: (id, note) => {
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, note } : i
                    ),
                }));
            },

            clearCart: () => {
                set({ items: [] });
            },

            setRestaurantInfo: (slug, tableId) => {
                set((state) => {
                    if (state.restaurantSlug && state.restaurantSlug !== slug) {
                        return { restaurantSlug: slug, tableId: tableId || null, items: [] };
                    }
                    return { restaurantSlug: slug, tableId: tableId || state.tableId };
                });
            },

            setCustomerName: (name) => {
                set({ customerName: name });
            },

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },
        }),
        {
            name: 'kiottay-cart-storage',
        }
    )
);
