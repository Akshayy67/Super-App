import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { realTimeAuth } from '../utils/realTimeAuth';
import { verifyPayment } from '../services/paymentService';
import { createPremiumUser } from '../services/premiumUserService';
import { LoadingGlobe } from './ui/LoadingGlobe';

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [planType, setPlanType] = useState<'monthly' | 'yearly' | 'student' | null>(null);

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      try {
        // Get payment details from URL parameters
        const paymentId = searchParams.get('razorpay_payment_id');
        const orderId = searchParams.get('razorpay_order_id');
        const signature = searchParams.get('razorpay_signature');
        const plan = searchParams.get('plan') as 'monthly' | 'yearly' | 'student' | null;

        if (!paymentId || !orderId || !signature) {
          // Check if it's a failure
          const errorCode = searchParams.get('error_code');
          const errorDescription = searchParams.get('error_description');
          
          if (errorCode || errorDescription) {
            setStatus('failed');
            setError(errorDescription || 'Payment failed. Please try again.');
            return;
          }

          setStatus('failed');
          setError('Missing payment details. Please contact support if payment was deducted.');
          return;
        }

        setPlanType(plan || 'monthly');

        const user = realTimeAuth.getCurrentUser();
        if (!user) {
          setStatus('failed');
          setError('User not authenticated. Please log in again.');
          return;
        }

        // Check for pending discount code
        const pendingDiscountCode = sessionStorage.getItem('pendingDiscountCode');
        
        // Verify payment with Cloud Function
        const verified = await verifyPayment(
          paymentId,
          orderId,
          signature,
          plan || 'monthly',
          user.id
        );

        if (verified) {
          // Apply discount code if payment was successful and discount code was used
          if (pendingDiscountCode) {
            try {
              const { applyDiscountCode } = await import("../services/referralCodeService");
              await applyDiscountCode(pendingDiscountCode, user.id);
              console.log(`✅ Discount code ${pendingDiscountCode} applied after successful payment`);
              sessionStorage.removeItem('pendingDiscountCode');
            } catch (error) {
              console.error("Error applying discount code:", error);
              // Don't fail the payment if discount code application fails
            }
          }
          
          // Update premium status (Cloud Function should have done this, but ensure it)
          try {
            await createPremiumUser(
              user.id,
              user.email || '',
              plan || 'monthly',
              plan === 'student'
            );
            console.log('✅ Premium status updated successfully');
          } catch (error) {
            console.error('Error updating premium status:', error);
            // Don't fail - Cloud Function should have already handled this
          }

          setStatus('success');

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 3000);
        } else {
          setStatus('failed');
          setError('Payment verification failed. Please contact support if payment was deducted.');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setError(error.message || 'An error occurred while verifying payment. Please contact support.');
      }
    };

    verifyPaymentStatus();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center">
        {status === 'verifying' && (
          <>
            <LoadingGlobe size={64} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying Payment...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your payment.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Successful! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your premium subscription has been activated.
              </p>
              {planType && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white mb-4">
                  <p className="font-semibold">Premium {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan</p>
                  <p className="text-sm opacity-90">Access granted!</p>
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to dashboard...
              </p>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error || 'Payment could not be processed. Please try again.'}
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/payment', { replace: true })}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard', { replace: true })}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

