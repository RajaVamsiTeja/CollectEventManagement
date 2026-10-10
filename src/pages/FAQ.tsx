import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  { q: "How do I register for an event?", a: "Browse the Events page, click on any event to view details, then click the 'Register Now' button. You'll need to be signed in to complete registration. A unique QR ticket will be generated for you." },
  { q: "Is there a fee for events?", a: "Some events are free while others may have a registration fee. The fee amount is displayed on each event card and detail page. Paid events require payment confirmation before registration is complete." },
  { q: "What happens if an event is full?", a: "If an event reaches its maximum participant limit, you'll be automatically added to a waitlist. If someone cancels, the next person on the waitlist will be promoted and notified." },
  { q: "Can I cancel my registration?", a: "Yes, you can cancel your registration from the event detail page or your student dashboard. Simply click 'Cancel Registration' and your spot will be freed up for the next person on the waitlist." },
  { q: "How do I get my event ticket?", a: "After registering, click 'View Ticket' on the event page or go to your dashboard's 'My Tickets' section. Your ticket includes a QR code that can be printed or shown on your phone at the event entrance." },
  { q: "Can I organize an event?", a: "If you're a faculty member or club head, sign up as an organizer. You'll get access to the organizer dashboard where you can create events, manage registrations, upload photos, and mark attendance." },
  { q: "How are photos uploaded to the gallery?", a: "Organizers and admins can create albums and upload photos after events. Photos are stored and displayed in the gallery page for everyone to view. Students can like and browse photos." },
  { q: "How do I stay updated on new events?", a: "Check the homepage regularly for upcoming events and announcements. You can also bookmark events you're interested in and check your notifications for updates on events you've registered for." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 mb-3">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-500 dark:text-gray-400">Find answers to common questions about events and registration</p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
              <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform shrink-0", openIndex === i && "rotate-180")} />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
