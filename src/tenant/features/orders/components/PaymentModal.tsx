import { useState } from 'react';
import { Modal, Button, Radio, Divider, message, Spin } from 'antd';
import {
    BankOutlined,
    WalletOutlined,
    CheckCircleFilled,
} from '@ant-design/icons';
import { useCreatePayment } from '../services/order.hooks';
import { usePosCartStore } from '@/store/posCartStore';
import type { PaymentMethod } from '@/types';
import bankQrMock from '@/assets/bank-qr-mock.png';

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

interface PaymentModalProps {
    open: boolean;
    orderId: string;
    orderCode: string;
    finalAmount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export const PaymentModal = ({
    open,
    orderId,
    orderCode,
    finalAmount,
    onSuccess,
    onCancel,
}: PaymentModalProps) => {
    const [method, setMethod] = useState<PaymentMethod>('CASH');
    const [paid, setPaid] = useState(false);
    const clearCart = usePosCartStore((s) => s.clearCart);

    const { mutate: createPayment, isPending } = useCreatePayment();

    const handleConfirm = () => {
        createPayment(
            {
                orderId,
                data: {
                    method,
                    amount: finalAmount,
                    note: `Thanh toán ${method === 'CASH' ? 'tiền mặt' : 'chuyển khoản'} - ${orderCode}`,
                },
            },
            {
                onSuccess: () => {
                    setPaid(true);
                    message.success('Thanh toán thành công! 🎉');
                    setTimeout(() => {
                        setPaid(false);
                        clearCart();
                        onSuccess();
                    }, 1800);
                },
                onError: () => {
                    message.error('Ghi nhận thanh toán thất bại. Vui lòng thử lại.');
                },
            }
        );
    };

    const handleClose = () => {
        if (!isPending) onCancel();
    };

    return (
        <Modal
            open={open}
            onCancel={handleClose}
            footer={null}
            title={
                <div className="flex items-center gap-2">
                    <WalletOutlined className="text-emerald-600" />
                    <span className="font-bold text-gray-800">Thanh toán đơn hàng</span>
                </div>
            }
            width={460}
            centered
            maskClosable={!isPending}
        >
            {paid ? (
                /* ✅ Success State */
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <CheckCircleFilled className="text-6xl text-emerald-500" />
                    <p className="text-xl font-bold text-gray-800">Thanh toán thành công!</p>
                    <p className="text-gray-500 text-sm">Đơn hàng #{orderCode} đã được ghi nhận.</p>
                </div>
            ) : (
                <>
                    {/* Order summary */}
                    <div className="bg-emerald-50 rounded-xl p-4 mb-5 border border-emerald-100">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Mã đơn:</span>
                            <span className="font-bold text-gray-800">#{orderCode}</span>
                        </div>
                        <Divider className="my-2" />
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">Tổng cộng:</span>
                            <span className="text-2xl font-extrabold text-emerald-600">
                                {formatCurrency(finalAmount)}
                            </span>
                        </div>
                    </div>

                    {/* Payment method selection */}
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                        Chọn phương thức thanh toán:
                    </p>
                    <Radio.Group
                        value={method}
                        onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                        className="w-full"
                    >
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            <label
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    method === 'CASH'
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-gray-200 hover:border-emerald-300'
                                }`}
                                onClick={() => setMethod('CASH')}
                            >
                                <span className="text-3xl">💵</span>
                                <span className="font-semibold text-sm text-gray-700">Tiền mặt</span>
                                <Radio value="CASH" className="mt-1" />
                            </label>

                            <label
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    method === 'BANK_TRANSFER'
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-gray-200 hover:border-emerald-300'
                                }`}
                                onClick={() => setMethod('BANK_TRANSFER')}
                            >
                                <BankOutlined className="text-3xl text-blue-500" />
                                <span className="font-semibold text-sm text-gray-700">Chuyển khoản</span>
                                <Radio value="BANK_TRANSFER" className="mt-1" />
                            </label>
                        </div>
                    </Radio.Group>

                    {/* Cash instructions */}
                    {method === 'CASH' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5 text-center">
                            <p className="text-yellow-800 text-sm font-medium">
                                💵 Thu tiền mặt từ khách hàng
                            </p>
                            <p className="text-yellow-700 text-2xl font-extrabold mt-1">
                                {formatCurrency(finalAmount)}
                            </p>
                            <p className="text-yellow-600 text-xs mt-1">
                                Nhấn "Xác nhận thanh toán" sau khi đã thu tiền.
                            </p>
                        </div>
                    )}

                    {/* Bank transfer QR */}
                    {method === 'BANK_TRANSFER' && (
                        <div className="flex flex-col items-center mb-5 gap-3">
                            <img
                                src={bankQrMock}
                                alt="Mã QR chuyển khoản"
                                className="w-52 h-52 object-contain rounded-xl border border-gray-200 shadow-sm"
                            />
                            <p className="text-xs text-gray-500 text-center">
                                Yêu cầu khách quét mã QR để chuyển khoản.<br />
                                Nhấn "Hoàn thành" sau khi nhận được tiền.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            block
                            size="large"
                            onClick={handleClose}
                            disabled={isPending}
                        >
                            Huỷ
                        </Button>
                        <Button
                            block
                            type="primary"
                            size="large"
                            className="!bg-emerald-600 hover:!bg-emerald-700 !border-emerald-600 font-bold"
                            onClick={handleConfirm}
                            loading={isPending}
                            icon={isPending ? <Spin size="small" /> : undefined}
                        >
                            {method === 'CASH' ? 'Xác nhận thanh toán' : 'Hoàn thành'}
                        </Button>
                    </div>
                </>
            )}
        </Modal>
    );
};
