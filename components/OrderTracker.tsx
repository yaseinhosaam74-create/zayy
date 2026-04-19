'use client';

import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';

type OrderStatus = 'placed' | 'processing' | 'shipped' | 'delivered';

type OrderTrackerProps = {
  status: OrderStatus;
  orderId: string;
  date: string;
};

export default function OrderTracker({
  status,
  orderId,
  date,
}: OrderTrackerProps) {
  const { language } = useStore();
  const isRTL = language === 'ar';

  const steps = [
    {
      id: 'placed',
      en: 'Order Placed',
      ar: 'تم الطلب',
      icon: 'fa-bag-shopping',
    },
    {
      id: 'processing',
      en: 'Processing',
      ar: 'جاري التجهيز',
      icon: 'fa-gear',
    },
    {
      id: 'shipped',
      en: 'Shipped',
      ar: 'تم الشحن',
      icon: 'fa-truck',
    },
    {
      id: 'delivered',
      en: 'Delivered',
      ar: 'تم التسليم',
      icon: 'fa-circle-check',
    },
  ];

  const currentIndex = steps.findIndex((s) => s.id === status);

  return (
    <div className="flex flex-col gap-6 p-6 border border-ink/10 rounded-sm">

      {/* Order Info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink/40 uppercase tracking-wider mb-1">
            {isRTL ? 'رقم الطلب' : 'Order ID'}
          </p>
          <p className="text-sm font-bold text-ink">{orderId}</p>
        </div>
        <div className="text-end">
          <p className="text-xs text-ink/40 uppercase tracking-wider mb-1">
            {isRTL ? 'التاريخ' : 'Date'}
          </p>
          <p className="text-sm font-medium text-ink">{date}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">

        {/* Background Line */}
        <div className="absolute top-5 start-0 end-0 h-px bg-ink/10 mx-8" />

        {/* Active Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: currentIndex / (steps.length - 1) }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ transformOrigin: isRTL ? 'right' : 'left' }}
          className="absolute top-5 start-0 end-0 h-px bg-ink mx-8"
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center gap-3"
              >
                {/* Circle */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isCurrent ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-ink text-paper'
                      : 'bg-paper border-2 border-ink/20 text-ink/20'
                  } ${isCurrent ? 'ring-4 ring-ink/10' : ''}`}
                >
                  <i className={`fa-solid ${step.icon} text-xs`} />
                </motion.div>

                {/* Label */}
                <p
                  className={`text-xs font-medium text-center max-w-16 leading-tight ${
                    isCompleted ? 'text-ink' : 'text-ink/30'
                  }`}
                >
                  {isRTL ? step.ar : step.en}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Status Message */}
      <div className="bg-ink/5 rounded-sm px-4 py-3">
        <p className="text-xs text-ink/60 text-center">
          {status === 'placed' &&
            (isRTL
              ? 'تم استلام طلبك بنجاح وسيتم تجهيزه قريباً'
              : 'Your order has been received and will be processed soon')}
          {status === 'processing' &&
            (isRTL
              ? 'طلبك قيد التجهيز وسيتم شحنه قريباً'
              : 'Your order is being prepared and will be shipped soon')}
          {status === 'shipped' &&
            (isRTL
              ? 'طلبك في الطريق إليك'
              : 'Your order is on its way to you')}
          {status === 'delivered' &&
            (isRTL
              ? 'تم تسليم طلبك بنجاح. نتمنى أن تستمتع بمشترياتك!'
              : 'Your order has been delivered. Enjoy your purchase!')}
        </p>
      </div>
    </div>
  );
}