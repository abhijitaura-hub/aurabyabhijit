import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useSettings } from "../lib/settings";

export default function WhatsAppFloat() {
  const { whatsapp } = useSettings();
  const { pathname } = useLocation();
  if (!whatsapp || pathname.startsWith("/admin")) return null;
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    "Hi Abhijit, I found you through aurabyabhijit.com and would like to discuss a technology challenge."
  )}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Abhijit on WhatsApp"
      data-testid="whatsapp-float"
      className="group fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#121217]/90 shadow-lg shadow-black/40 backdrop-blur-md transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-crimson"
    >
      <MessageCircle className="h-5 w-5 text-zinc-300 transition-colors duration-300 group-hover:text-crimson" />
    </a>
  );
}
