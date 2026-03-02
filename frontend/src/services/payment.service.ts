import api from '../api/axios';

export const paymentService = {
  async createOrder(courseId: string, amount: number, pointsToUse: number = 0) {
    const res = await api.post('/payments/create-order', {
      courseId,
      amount,
      pointsToUse,
    });
    return res.data;
  },

  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    courseId: string;
    studentId: string;
  }) {
    const res = await api.post('/payments/verify', data);
    return res.data;
  },
};