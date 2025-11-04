"use client"

import { motion } from "framer-motion"
import { Check, Star, Zap, Shield, Crown } from "lucide-react"

const plans = [
  {
    name: "Starter",
    description: "Perfect for small projects and personal websites",
    price: "Free",
    period: "forever",
    icon: Zap,
    color: "from-blue-500 to-blue-600",
    popular: false,
    features: [
      "Monitor up to 5 websites",
      "5-minute check intervals",
      "Email notifications",
      "Basic uptime reports",
      "Community support",
      "30-day data retention"
    ],
    limitations: [
      "Limited to 5 monitors",
      "Basic reporting only"
    ]
  },
  {
    name: "Professional",
    description: "Ideal for growing businesses and teams",
    price: "$29",
    period: "per month",
    icon: Shield,
    color: "from-purple-500 to-purple-600",
    popular: true,
    features: [
      "Monitor up to 50 websites",
      "1-minute check intervals",
      "SMS & Email notifications",
      "Advanced analytics",
      "Priority support",
      "1-year data retention",
      "Custom dashboards",
      "API access",
      "Team collaboration"
    ],
    limitations: []
  },
  {
    name: "Enterprise",
    description: "For large organizations with complex needs",
    price: "$99",
    period: "per month",
    icon: Crown,
    color: "from-gold-500 to-gold-600",
    popular: false,
    features: [
      "Unlimited monitors",
      "30-second check intervals",
      "Multi-channel notifications",
      "Custom integrations",
      "24/7 phone support",
      "Unlimited data retention",
      "White-label reports",
      "SLA guarantees",
      "Dedicated account manager",
      "Custom deployment options"
    ],
    limitations: []
  }
]

export default function PricingSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">
            <Crown className="w-4 h-4 mr-2" />
            Simple Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose the perfect plan
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> for your needs</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free and scale as you grow. All plans include our core monitoring features with no hidden fees or setup costs.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative ${plan.popular ? 'md:-mt-8 md:mb-8' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${plan.popular ? 'border-purple-200 scale-105' : 'border-gray-100'} h-full relative overflow-hidden`}>
                {/* Background Gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${plan.color} opacity-10 rounded-full transform translate-x-16 -translate-y-16`}></div>
                
                {/* Plan Header */}
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      {plan.price !== "Free" && <span className="text-gray-500 ml-2">/{plan.period}</span>}
                    </div>
                    {plan.price === "Free" && <span className="text-gray-500">{plan.period}</span>}
                  </div>

                  {/* Features List */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-3">What&apos;s included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: (index * 0.1) + (featureIndex * 0.05) }}
                          viewport={{ once: true }}
                          className="flex items-start space-x-3"
                        >
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need a custom solution?
            </h3>
            <p className="text-gray-600 mb-6">
              Contact our sales team to discuss enterprise features, custom integrations, and volume discounts for large organizations.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
