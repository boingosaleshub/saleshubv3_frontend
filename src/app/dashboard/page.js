"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent } from "@/components/ui/card";
import { CircularGauge } from "./components/CircularGauge";
import { RomsChart } from "./components/RomsChart";
import { LatestRomTable } from "./components/LatestRomTable";

export default function DashboardPage() {
  const { t } = useLanguage();

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50 dark:bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* KPI Gauges Section */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        {/* Lead Conversion Rate */}
        <Card className="border-0 shadow-md bg-white dark:bg-gray-900/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <CardContent className="p-6">
            <CircularGauge
              percentage={80}
              label="Lead Conversion Rate"
              value="15%"
              subValue="+3.96%"
              trend="+20.90%"
              color="green"
            />
          </CardContent>
        </Card>

        {/* ROM to Proposal Rate */}
        <Card className="border-0 shadow-md bg-white dark:bg-gray-900/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <CardContent className="p-6">
            <CircularGauge
              percentage={79}
              label="ROM to Proposal Rate"
              value="20%"
              subValue="+9.64%"
              trend="+20.90%"
              color="yellow"
            />
          </CardContent>
        </Card>

        {/* On-going Deals */}
        <Card className="border-0 shadow-md bg-white dark:bg-gray-900/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <CardContent className="p-6">
            <CircularGauge
              percentage={52}
              label="On-going Deals"
              value="10"
              subValue="+5.13%"
              trend="+20.90%"
              color="red"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* ROMs Requested Chart */}
      <RomsChart />

      {/* Latest ROM Requested Table */}
      <LatestRomTable />
    </motion.div>
  );
}
