import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactModal from '../../shared/components/ContactModal';

export default function PricingPage() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const plans = [
    {
      name: 'Freemium',
      price: 0,
      description: 'Perfect for startups and small teams',
      features: [
        'Up to 5 active territories',
        'Basic territory mapping',
        'Standard analytics',
        'Community support',
        'CSV data import',
      ],
      popular: false,
    },
    {
      name: 'Business',
      price: 49,
      description: 'Designed for growing businesses',
      features: [
        'Unlimited territories',
        'Advanced territory mapping',
        'Advanced analytics',
        'Priority email support',
        'API integrations',
        'Custom reports',
        'Team collaboration tools',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: null,
      description: 'Custom pricing for large-scale businesses',
      features: [
        'Custom territory hierarchies',
        'Advanced security features',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantees',
        'On-premise deployment option',
        'Advanced user permissions',
        'White-label options',
      ],
      popular: false,
    },
  ];

  const handleContactClick = (planName: string) => {
    setSelectedPlan(planName);
    setShowContactModal(true);
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 py-16">
      <div className="text-center">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
        >
          Simple, Transparent Pricing
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-xl text-gray-600 max-w-2xl mx-auto mb-12"
        >
          Choose the plan that best fits your business needs
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl shadow-xl bg-white overflow-hidden transform transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl
                ${plan.popular ? 'ring-2 ring-[#003f88]' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-[#003f88] text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-8">
                  {plan.price === null ? (
                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-6 w-6 text-[#003f88] flex-shrink-0" />
                      <span className="ml-3 text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.price === null ? (
                  <button
                    onClick={() => handleContactClick(plan.name)}
                    className="w-full py-3 px-6 rounded-lg bg-[#003f88] text-white font-medium hover:bg-[#002855] transition-colors duration-200"
                  >
                    Contact Sales
                  </button>
                ) : (
                  <Link
                    to="/signup"
                    className="block w-full text-center py-3 px-6 rounded-lg bg-[#003f88] text-white font-medium hover:bg-[#002855] transition-colors duration-200"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I switch plans later?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and offer invoice-based payment for Enterprise plans.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes, all paid plans come with a 14-day free trial. No credit card required for the Freemium plan.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for all paid plans if you're not satisfied with our service.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {showContactModal && (
        <ContactModal
          onClose={() => setShowContactModal(false)}
          source={`pricing_${selectedPlan?.toLowerCase()}`}
        />
      )}
    </div>
  );
}
