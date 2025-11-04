"use client"

import { motion } from "framer-motion"
import { Users, Target, Award, Heart } from "lucide-react"

const values = [
  {
    icon: Target,
    title: "Mission Driven",
    description: "We're committed to helping businesses maintain perfect SalesHub and deliver exceptional user experiences."
  },
  {
    icon: Users,
    title: "Customer First",
    description: "Every feature we build and decision we make is centered around providing value to our customers."
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for excellence in everything we do, from our technology to our customer support."
  },
  {
    icon: Heart,
    title: "Community",
    description: "We believe in building strong relationships with our users and contributing to the developer community."
  }
]

const team = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-founder",
    bio: "Former engineering lead at Google with 10+ years in distributed systems.",
    image: "/api/placeholder/150/150"
  },
  {
    name: "Michael Rodriguez",
    role: "CTO & Co-founder", 
    bio: "Ex-Netflix architect specializing in large-scale monitoring infrastructure.",
    image: "/api/placeholder/150/150"
  },
  {
    name: "Emily Johnson",
    role: "Head of Product",
    bio: "Product leader with experience at Stripe and Datadog in developer tools.",
    image: "/api/placeholder/150/150"
  },
  {
    name: "David Kim",
    role: "Head of Engineering",
    bio: "Former principal engineer at Uber, expert in real-time data processing.",
    image: "/api/placeholder/150/150"
  }
]

export default function AboutSection() {
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
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
            <Heart className="w-4 h-4 mr-2" />
            About SalesHub
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Built by developers,
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> for developers</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We started SalesHub because we experienced the pain of unreliable monitoring tools firsthand. Our mission is to provide the most reliable, intuitive, and powerful monitoring platform for modern applications.
          </p>
        </motion.div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Founded in 2023 by a team of seasoned engineers from Google, Netflix, and Uber, SalesHub was born out of frustration with existing monitoring solutions that were either too complex, too expensive, or simply unreliable.
              </p>
              <p>
                We believe that monitoring shouldn't be an afterthought. It should be simple to set up, reliable to depend on, and powerful enough to grow with your business. That's why we built SalesHub from the ground up with these principles in mind.
              </p>
              <p>
                Today, we're proud to serve thousands of companies worldwide, from startups to Fortune 500 enterprises, helping them maintain perfect SalesHub and deliver exceptional user experiences.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">2023</div>
                  <div className="text-sm text-gray-600">Founded</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">10K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">99.99%</div>
                  <div className="text-sm text-gray-600">Platform SalesHub</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">50M+</div>
                  <div className="text-sm text-gray-600">Checks Daily</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h4>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative mb-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    {/* Placeholder for team member photos */}
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h4>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
