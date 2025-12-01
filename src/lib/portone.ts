export interface PaymentData {
    orderName: string;
    totalAmount: number;
    currency: string;
    payMethod: string;
    customer: {
        email?: string;
        fullName?: string;
        phoneNumber?: string;
    };
}

export interface PaymentResponse {
    code?: string;
    paymentId?: string;
    message?: string;
}

declare global {
    interface Window {
        PortOne: any;
    }
}

export const requestPayment = async (data: PaymentData): Promise<PaymentResponse> => {
    if (!window.PortOne) {
        return { code: "SDK_NOT_LOADED", message: "PortOne SDK not loaded" };
    }

    try {
        const response = await window.PortOne.requestPayment({
            storeId: import.meta.env.VITE_PORTONE_STORE_ID,
            channelKey: import.meta.env.VITE_PORTONE_CHANNEL_KEY,
            paymentId: `payment-${crypto.randomUUID()}`,
            orderName: data.orderName,
            totalAmount: data.totalAmount,
            currency: data.currency,
            payMethod: data.payMethod,
            customer: data.customer,
        });

        if (response.code != null) {
            // Error occurred
            return { code: response.code, message: response.message };
        }

        return { paymentId: response.paymentId };
    } catch (error: any) {
        return { code: "EXCEPTION", message: error.message };
    }
};
