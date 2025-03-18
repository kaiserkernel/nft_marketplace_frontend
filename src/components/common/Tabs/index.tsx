import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TabsItemType = {
  label: string;
  content: ReactNode;
};

interface TabsProps {
  items: TabsItemType[];
}

const Tabs: FC<TabsProps> = ({ items }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);

  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    function setTabPosition() {
      const currentTab = tabsRef.current[activeTabIndex];
      setTabUnderlineLeft(currentTab?.offsetLeft ?? 0);
      setTabUnderlineWidth(currentTab?.clientWidth ?? 0);
    }

    setTabPosition();
    window.addEventListener("resize", setTabPosition);
    return () => window.removeEventListener("resize", setTabPosition);
  }, [activeTabIndex]);

  return (
    <div>
      {/* Tabs Navigation */}
      <div className="relative">
        <div className="flex border-b border-slate-500">
          {items.map((tab, idx) => (
            <button
              key={idx}
              ref={(el) => (tabsRef.current[idx] = el)}
              className={`px-8 pt-2 pb-3 transition-colors duration-300 font-semibold ${
                activeTabIndex === idx ? "text-white" : "text-slate-500"
              }`}
              onClick={() => setActiveTabIndex(idx)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Animated Underline */}
        <motion.span
          className="absolute bottom-0 block h-1 bg-white rounded-lg"
          animate={{ left: tabUnderlineLeft, width: tabUnderlineWidth }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Tab Content with Animation */}
      <div className="py-4">
        <AnimatePresence>
          <motion.div
            key={activeTabIndex} // Ensures a re-render on tab change
            initial={{ opacity: 0, y: 20 }} // Start position (bottom)
            animate={{ opacity: 1, y: 0 }} // Animate to normal position
            exit={{ opacity: 0, y: -20 }} // Exit animation (goes up)
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {items[activeTabIndex].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tabs;
