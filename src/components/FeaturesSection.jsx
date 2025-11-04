"use client"

import { motion } from "framer-motion"
import { Monitor, Shield, BarChart3, Bell, Globe, Zap, Users, Clock } from "lucide-react"

const features = [
  {
    icon: Monitor,
    title: "Real-time Monitoring",
    description: "Monitor your applications 24/7 with instant notifications when issues arise. Get detailed insights into performance metrics and system health.",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Shield,
    title: "Advanced Security",
    description: "Comprehensive security monitoring with threat detection, vulnerability scanning, and compliance reporting for enterprise-grade protection.",
    color: "from-green-500 to-green-600"
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Powerful analytics dashboard with customizable reports, trend analysis, and actionable insights to optimize your infrastructure.",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Intelligent alerting system that reduces noise and focuses on what matters. Configure custom thresholds and notification channels.",
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Monitor from multiple geographic locations worldwide. Ensure optimal performance for users across different regions and time zones.",
    color: "from-teal-500 to-teal-600"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Sub-second response times and instant data processing. Our optimized infrastructure ensures minimal latency and maximum reliability.",
    color: "from-yellow-500 to-yellow-600"
  }
]

const stats = [
  { number: "99.99%", label: "Uptime Guarantee", icon: Clock },
  { number: "10K+", label: "Active Users", icon: Users },
  { number: "50M+", label: "Checks Daily", icon: BarChart3 },
  { number: "24/7", label: "Support", icon: Shield }
]

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            <Zap className="w-4 h-4 mr-2" />
            Powerful Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything you need to
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> monitor & scale</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive monitoring platform provides all the tools and insights you need to keep your applications running smoothly and your users happy.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 h-full">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 text-center"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by thousands of companies worldwide
          </h3>
          <p className="text-gray-300 text-lg mb-12 max-w-2xl mx-auto">
            Join the growing community of developers and businesses who rely on UptimeX for their monitoring needs.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
