import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-4">
        {icon ?? <Inbox className="w-8 h-8" />}
      </div>
      <h3 className="font-display font-semibold text-lg text-gray-700 dark:text-gray-200">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
