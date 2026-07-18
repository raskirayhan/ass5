import Stripe from "stripe";
import prisma from "../../prisma";
import { ApiError } from "../../utils/ApiError";
import { config } from "../../config";
import { CreatePaymentInput } from "./payment.validation";
import { PaginationParams } from "../../interfaces";

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: "2024-12-18.acacia" as any,
});

const createPayment = async (userId: string, dto: CreatePaymentInput) => {
  const booking = await prisma.booking.findUnique({
    where: { id: dto.bookingId },
    include: { service: true, payment: true },
  });

  if (!booking) throw ApiError.notFound("Booking not found");
  if (booking.customerId !== userId) throw ApiError.forbidden("Not your booking");
  if (booking.status !== "ACCEPTED") {
    throw ApiError.badRequest("Payment can only be made for accepted bookings");
  }

  if (booking.payment && booking.payment.status === "COMPLETED") {
    throw ApiError.badRequest("Booking already paid");
  }

  if (dto.provider === "STRIPE") {
    let paymentIntentId = `sim_pi_${Date.now()}`;
    let clientSecret = `sim_secret_${Date.now()}`;

    if (!dto.simulate) {
      let paymentIntent: any;
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(booking.service.price * 100),
          currency: "usd",
          metadata: {
            bookingId: booking.id,
            userId,
            serviceTitle: booking.service.title,
          },
        });
        paymentIntentId = paymentIntent.id;
        clientSecret = paymentIntent.client_secret!;
      } catch (stripeError: any) {
        throw ApiError.badRequest(`Stripe error: ${stripeError.message}`);
      }
    }

    let payment;
    if (booking.payment) {
      payment = await prisma.payment.update({
        where: { id: booking.payment.id },
        data: {
          stripePaymentIntentId: paymentIntentId,
          amount: booking.service.price,
        },
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          userId,
          amount: booking.service.price,
          provider: "STRIPE",
          stripePaymentIntentId: paymentIntentId,
          status: "PENDING",
        },
      });
    }

    return {
      paymentId: payment.id,
      clientSecret,
      amount: booking.service.price,
      currency: "usd",
    };
  } else {
    const transactionId = `SSLC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let payment;
    if (booking.payment) {
      payment = await prisma.payment.update({
        where: { id: booking.payment.id },
        data: { transactionId, amount: booking.service.price },
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          userId,
          amount: booking.service.price,
          provider: "SSLCOMMERZ",
          transactionId,
          status: "PENDING",
        },
      });
    }

    return {
      paymentId: payment.id,
      transactionId,
      redirectUrl: `https://sandbox.sslcommerz.com/gwprocess/v4/?tran_id=${transactionId}`,
      amount: booking.service.price,
    };
  }
};

const confirmPayment = async (
  bookingId: string,
  sessionId: string,
  simulate?: boolean,
) => {
  const payment = await prisma.payment.findFirst({
    where: { bookingId },
  });
  if (!payment) throw ApiError.notFound("Payment record not found");

  if (payment.provider === "STRIPE") {
    if (simulate) {
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
          stripePaymentIntentId: sessionId,
        },
      });

      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "PAID" },
      });

      return updatedPayment;
    }

    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(sessionId);
    } catch (err: any) {
      throw ApiError.badRequest(`Stripe error: ${err.message}`);
    }

    if (paymentIntent.status === "succeeded") {
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
          stripePaymentIntentId: sessionId,
        },
      });

      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "PAID" },
      });

      return updatedPayment;
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      throw ApiError.badRequest(`Payment not successful. Status: ${paymentIntent.status}`);
    }
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED", paidAt: new Date(), transactionId: sessionId },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "PAID" },
    });

    return prisma.payment.findUnique({ where: { id: payment.id } });
  }
};

const handleStripeWebhook = async (event: Stripe.Event) => {
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const bookingId = paymentIntent.metadata.bookingId;

    if (bookingId) {
      const payment = await prisma.payment.findFirst({
        where: { bookingId },
      });

      if (payment && payment.status !== "COMPLETED") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "COMPLETED", paidAt: new Date() },
        });

        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: "PAID" },
        });
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const bookingId = paymentIntent.metadata.bookingId;

    if (bookingId) {
      const payment = await prisma.payment.findFirst({
        where: { bookingId },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        });
      }
    }
  }
};

const getPaymentHistory = async (userId: string, pagination: PaginationParams) => {
  const where = { userId };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          include: {
            service: true,
            technician: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return { payments, total };
};

const getPaymentById = async (paymentId: string, userId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          service: true,
          technician: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          customer: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!payment) throw ApiError.notFound("Payment not found");

  const isAdmin = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (payment.userId !== userId && isAdmin?.role !== "ADMIN") {
    throw ApiError.forbidden("Not your payment");
  }

  return payment;
};

export const paymentService = {
  createPayment,
  confirmPayment,
  handleStripeWebhook,
  getPaymentHistory,
  getPaymentById,
};
