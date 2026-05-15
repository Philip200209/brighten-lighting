import axios from 'axios';

function getSiteOrigin() {
  const configuredUrl = import.meta.env.VITE_APP_URL || import.meta.env.VITE_APP_DOMAIN;

  if (configuredUrl) {
    return configuredUrl.startsWith('http://') || configuredUrl.startsWith('https://')
      ? configuredUrl
      : `https://${configuredUrl}`;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'https://brighten-lighting.pages.dev';
}

function getSiteLabel() {
  return getSiteOrigin().replace(/^https?:\/\//, '');
}

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || import.meta.env.VITE_RECIPIENT_EMAIL;
const BUSINESS_FROM_EMAIL = import.meta.env.VITE_BUSINESS_FROM_EMAIL || 'Brighten Lighting <noreply@resend.dev>';

/**
 * Send an email using Resend API
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.from - Sender email (default: noreply@resend.dev)
 */
export async function sendEmail({ to, subject, html, from = BUSINESS_FROM_EMAIL }) {
  if (!RESEND_API_KEY) {
    console.warn('Resend API key not configured. Email not sent.');
    return null;
  }

  try {
    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from,
        to,
        subject,
        html,
      },
      {
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(error.response?.data?.message || 'Failed to send email');
  }
}

/**
 * Send an inquiry notification email to the admin
 */
export async function sendInquiryNotification(inquiry) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F59E0B; margin-bottom: 20px;">New Inquiry Received</h2>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>Customer Name:</strong> ${inquiry.name}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Phone:</strong> ${inquiry.phone}</p>
        <p><strong>Date:</strong> ${new Date(inquiry.created_at).toLocaleString()}</p>
      </div>

      <h3 style="color: #333; margin-top: 20px;">Message:</h3>
      <div style="background: #f9fafb; padding: 20px; border-left: 4px solid #F59E0B; border-radius: 4px;">
        <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${inquiry.message}</p>
      </div>

      ${inquiry.product_name ? `
        <div style="margin-top: 20px;">
          <p><strong>Product Interest:</strong> ${inquiry.product_name}</p>
        </div>
      ` : ''}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px;">
        <p>This is an automated message from Brighten Lighting</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Inquiry: ${inquiry.name} - ${inquiry.subject || 'General Inquiry'}`,
    html,
    from: BUSINESS_FROM_EMAIL,
  });
}

/**
 * Send a confirmation email to the customer
 */
export async function sendInquiryConfirmation(inquiry) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F59E0B; margin-bottom: 20px;">Thank You for Your Inquiry</h2>
      
      <p style="color: #666; line-height: 1.6;">Hi ${inquiry.name},</p>
      
      <p style="color: #666; line-height: 1.6;">
        Thank you for reaching out to Brighten Lighting. We have received your inquiry and will get back to you as soon as possible.
      </p>

      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #666;"><strong>Inquiry Reference:</strong> #${inquiry.id}</p>
        <p style="color: #666;"><strong>Date Submitted:</strong> ${new Date(inquiry.created_at).toLocaleString()}</p>
      </div>

      <p style="color: #666; line-height: 1.6;">
        Our team typically responds within 24 hours during business days. If you need urgent assistance, please call us at <strong>0722339377</strong>.
      </p>

      <h3 style="color: #333; margin-top: 30px;">Your Message:</h3>
      <div style="background: #f9fafb; padding: 20px; border-left: 4px solid #F59E0B; border-radius: 4px;">
        <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${inquiry.message}</p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; line-height: 1.6;">
          Best regards,<br/>
          <strong style="color: #F59E0B;">Brighten Lighting Team</strong><br/>
          Light Up Every Moment
        </p>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        <p>
          Eldoret City, Kenya | 0722339377<br/>
          <a href="${getSiteOrigin()}" style="color: #F59E0B; text-decoration: none;">${getSiteLabel()}</a>
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: inquiry.email,
    subject: 'Thank You for Contacting Brighten Lighting',
    html,
    from: BUSINESS_FROM_EMAIL,
  });
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmation(payment, customerEmail) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F59E0B; margin-bottom: 20px;">Payment Confirmed</h2>
      
      <p style="color: #666; line-height: 1.6;">Thank you for your payment!</p>

      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #666;"><strong>Transaction ID:</strong> ${payment.id}</p>
        <p style="color: #666;"><strong>Amount:</strong> KES ${payment.amount}</p>
        <p style="color: #666;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">COMPLETED</span></p>
        <p style="color: #666;"><strong>Date:</strong> ${new Date(payment.created_at).toLocaleString()}</p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; line-height: 1.6;">
          Your payment has been processed successfully. Your order is now being prepared for shipment.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Payment Confirmed - Transaction #${payment.id}`,
    html,
    from: BUSINESS_FROM_EMAIL,
  });
}
