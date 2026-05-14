import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { inquiriesService } from '../../lib/supabase';
import { sendInquiryNotification, sendInquiryConfirmation } from '../../lib/emailService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export function Contact() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Only prefill when an authenticated customer (not admin) is present
    if (user?.email && profile?.role === 'customer') {
      setFormData(prev => ({
        ...prev,
        email: prev.email || user.email,
        name: prev.name || user.user_metadata?.full_name || '',
      }));
    }
  }, [user, profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create inquiry in Supabase
      const inquiry = await inquiriesService.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        subject: formData.subject,
        product_id: null,
        status: 'new',
      });

      // Send notification email to admin
      try {
        await sendInquiryNotification({
          ...inquiry,
          subject: formData.subject,
        });
      } catch (emailError) {
        console.error('Error sending admin notification:', emailError);
        // Don't fail the entire submission if email fails
      }

      // Send confirmation email to customer
      try {
        await sendInquiryConfirmation(inquiry);
      } catch (emailError) {
        console.error('Error sending customer confirmation:', emailError);
        // Don't fail the entire submission if email fails
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      toast.success('Inquiry sent successfully!');
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error(error.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Get in Touch</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have a question about a product or need help with a large project? Our lighting experts are here to help you light up every moment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-12">
            <div className="glass-dark p-8 rounded-2xl border border-white/5">
              <h3 className="text-2xl font-serif mb-8 text-white">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Our Showroom</h4>
                    <p className="text-gray-400">Eldoret City, Kenya</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Phone Number</h4>
                    <p className="text-gray-400">0722339377</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Email Address</h4>
                    <p className="text-gray-400">Info@brightenlighting.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-dark p-8 rounded-2xl border border-white/5">
              <h3 className="text-2xl font-serif mb-4 text-white">Business Hours</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex justify-between"><span>Monday - Friday</span> <span>8:00 AM - 6:00 PM</span></li>
                <li className="flex justify-between"><span>Saturday</span> <span>9:00 AM - 4:00 PM</span></li>
                <li className="flex justify-between text-gold"><span>Sunday</span> <span>Closed</span></li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass p-8 md:p-10 rounded-2xl">
            <h3 className="text-2xl font-serif mb-6 text-white">Send us a Message</h3>
            
            {submitted ? (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-xl text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-xl font-medium mb-2">Message Sent Successfully!</h4>
                <p>Thank you for reaching out. Our team will get back to you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-gold hover:text-gold-light border-b border-gold pb-1 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Your Name</label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-dark-lighter border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email Address</label>
                    <input 
                      required
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-dark-lighter border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-dark-lighter border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                      placeholder="+254 700 000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Subject</label>
                    <input 
                      required
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-dark-lighter border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                      placeholder="Product Inquiry"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Message</label>
                  <textarea 
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full bg-dark-lighter border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors resize-none"
                    placeholder="How can we help you today?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gold hover:bg-gold-light text-dark font-bold tracking-wider uppercase py-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
