"use client"

import { motion } from "framer-motion"
import { CheckCircle, Users, Globe, Shield, ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Floating Elements */}
      <motion.div 
        className="absolute top-20 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-50"
        animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-16 h-16 bg-purple-100 rounded-full opacity-50"
        animate={{ y: [0, 20, 0], rotate: [360, 180, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Ship proposals fast
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6"
            >
              Do your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> ROM proposals in 5 minutes</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
            >
              Create rough order of magnitude proposals in minutes — gather scope, estimate costs, and share instantly.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-wrap justify-center lg:justify-start gap-8 mb-8"
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">10,000+ Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Global Coverage</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Enterprise Security</span>
              </div>
            </motion.div>


          </motion.div>

          {/* Right Content - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Dashboard */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200"
              >
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-500">SalesHub Dashboard</div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-green-50 p-4 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Uptime</p>
                        <p className="text-2xl font-bold text-green-800">99.98%</p>
                      </div>
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
                    className="bg-blue-50 p-4 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Response Time</p>
                        <p className="text-2xl font-bold text-blue-800">245ms</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Chart Area */}
                <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-end justify-between">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                      style={{ width: '6px' }}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.random() * 80 + 20}%` }}
                      transition={{ delay: i * 0.1, duration: 0.8 }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Floating Notification */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-xs"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">All Systems Operational</p>
                    <p className="text-xs text-gray-500">Last checked 2 minutes ago</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
