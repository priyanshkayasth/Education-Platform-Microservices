import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/payment.service';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = () => {
  const { user,refetchUser } = useAuth();

  const initiatePayment = async (
    courseId: string,
    amount: number,
    pointsToUse: number = 0,
    onSuccess: () => void,
  ) => {
    try {
      // Create order
      const order = await paymentService.createOrder(courseId, amount, pointsToUse);

      // Open Razorpay checkout
      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: 'INR',
        name: 'EduPlatform',
        description: 'Course Purchase',
        order_id: order.orderId,
        handler: async (response: any) => {
          // Verify payment
          await paymentService.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            courseId,
            studentId: user!.id,
          });
          await refetchUser()
          onSuccess();
        },
        prefill: {
          name: user?.name,
        },
        theme: {
          color: '#6419E6',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };

  return { initiatePayment };
};