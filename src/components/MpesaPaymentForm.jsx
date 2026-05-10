import { useState } from 'react';
import { Phone, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { initiateMpesaPayment, isValidMpesaPhoneNumber, formatPhoneNumber } from '../lib/mpesaService';
import { paymentsService } from '../lib/supabase';
import toast from 'react-hot-toast';

export function MpesaPaymentForm({ 
  product, 
  amount = null, 
  onSuccess, 
  onError,
  showInlineForm = true,
}) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submittedPhone, setSubmittedPhone] = useState('');

  const paymentAmount = amount || product?.price;
  const flowSteps = [
    'Tap Pay with M-Pesa',
    'Enter your phone number',
    'Approve the prompt on your phone',
    'Receive confirmation',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate phone number
    if (!isValidMpesaPhoneNumber(phoneNumber)) {
      setError('Please enter a valid M-Pesa phone number (e.g., 0712345678 or 254712345678)');
      return;
    }

    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const description = product 
        ? `Payment for ${product.name}` 
        : 'Payment for Brighten Lighting';

      // Initiate M-Pesa payment
      const response = await initiateMpesaPayment({
        phoneNumber: formattedPhone,
        amount: paymentAmount,
        description,
      });

      // Create payment record
      const payment = await paymentsService.create({
        phone_number: formattedPhone,
        amount: paymentAmount,
        product_id: product?.id || null,
        status: 'pending',
        transaction_ref: response.CheckoutRequestID,
      });

      setSubmittedPhone(formattedPhone);
      setSuccess(true);
      toast.success('Payment prompt sent. Check your phone and enter your M-Pesa PIN.');
      
      if (onSuccess) {
        onSuccess(payment);
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        setPhoneNumber('');
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Payment error:', err);
      const errorMsg = err.message || 'Failed to initiate payment. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {success ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h4 className="text-green-400 font-medium mb-2">Payment Initiated</h4>
          <p className="text-green-300 text-sm">Prompt sent to {submittedPhone || 'your phone'}. Approve it, then wait for confirmation.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Flow guide */}
          <div className="bg-dark-lighter border border-white/5 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-200 mb-3">M-Pesa payment flow</p>
            <ol className="space-y-2 text-sm text-gray-400">
              {flowSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-gold/15 text-gold flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Payment Amount Display */}
          <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Amount to Pay</p>
            <p className="text-2xl font-bold text-gold">KES {paymentAmount?.toLocaleString()}</p>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              M-Pesa Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0712345678 or 254712345678"
                className="w-full bg-dark-lighter border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <p className="text-xs text-gray-500">
              Format: 07XXXXXXXXX or 254XXXXXXXXX
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !phoneNumber}
            className="w-full bg-gold hover:bg-gold-light text-dark font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Sending prompt...
              </>
            ) : (
              <>
                <Phone className="w-5 h-5" />
                Send M-Pesa Prompt
              </>
            )}
          </button>

          {/* Info Box */}
          <div className="bg-dark-lighter border border-white/5 rounded-lg p-4 text-xs text-gray-400 space-y-2">
            <p className="font-medium text-gray-300">What happens next:</p>
            <p>1. We send the STK prompt to the phone number you enter.</p>
            <p>2. You approve the request on your phone and enter your M-Pesa PIN.</p>
            <p>3. You receive confirmation when the payment succeeds.</p>
          </div>
        </form>
      )}
    </div>
  );
}

/**
 * Standalone M-Pesa payment button
 */
export function MpesaPayButton({ 
  product, 
  amount,
  onSuccess,
  onError,
  className = '',
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className={`bg-gold hover:bg-gold-light text-dark font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 ${className}`}
      >
        <Phone className="w-5 h-5" />
        Pay with M-Pesa
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-lighter border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif text-white">M-Pesa Payment</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <MpesaPaymentForm
              product={product}
              amount={amount}
              onSuccess={(payment) => {
                setShowForm(false);
                if (onSuccess) onSuccess(payment);
              }}
              onError={onError}
            />
          </div>
        </div>
      )}
    </>
  );
}
