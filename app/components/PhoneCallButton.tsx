'use client';

import { PhoneIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface PhoneCallButtonProps {
  phoneNumber: string;
  sellerName?: string;
  onClose?: () => void;
}

export default function PhoneCallButton({ phoneNumber, sellerName, onClose }: PhoneCallButtonProps) {
  const handleCall = () => {
    // Create tel: link to open phone app with the number
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-24 sm:bottom-32 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-indigo-500 dark:border-indigo-400 p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1">
            {sellerName && (
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1">
                {sellerName}
              </p>
            )}
            <p className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {phoneNumber}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <Button
          onClick={handleCall}
          className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <PhoneIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          Call Now
        </Button>

        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
          Tap to open your phone app
        </p>
      </div>
    </motion.div>
  );
}
