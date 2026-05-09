import { MessageCircle } from 'lucide-react';

export function FloatingWhatsApp() {
  const phoneNumber = "254722339377"; // 0722339377 in international format
  const message = "Hello Brighten Lighting, I would like to inquire about your products.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 animate-bounce hover:animate-none group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-dark text-sm font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
        Chat with us
      </span>
    </a>
  );
}
