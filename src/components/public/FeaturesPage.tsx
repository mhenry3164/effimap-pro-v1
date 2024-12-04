import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Map, BarChart2, Layers, Users, Globe, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactModal from '../../shared/components/ContactModal';

export default function FeaturesPage() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const features = [
    {
      icon: <Map className="h-6 w-6 text-[#003f88]" />,
      title: 'Territory Optimization',
      description: 'Define, adjust, and visualize territories with precision, enabling better resource allocation and decision-making.',
    },
    {
      icon: <BarChart2 className="h-6 w-6 text-[#003f88]" />,
      title: 'Data-Driven Insights',
      description: 'Access heatmaps and overlays to visualize key business data and spot trends that drive growth.',
    },
    {
      icon: <Layers className="h-6 w-6 text-[#003f88]" />,
      title: 'Seamless Integration',
      description: 'Upload your business data directly into EffiMap to create actionable strategies.',
    },
    {
      icon: <Users className="h-6 w-6 text-[#003f88]" />,
      title: 'Collaboration Ready',
      description: 'Share insights and align strategies across your organization with powerful team tools.',
    },
    {
      icon: <Globe className="h-6 w-6 text-[#003f88]" />,
      title: 'Business-First Approach',
      description: 'Focus on enabling business decisions with clear, actionable insights.',
    },
    {
      icon: <Lock className="h-6 w-6 text-[#003f88]" />,
      title: 'Enterprise Security',
      description: 'Role-based access control and secure data handling for enterprise needs.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Features that Drive</span>
              <span className="block text-[#003f88]">Business Growth</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              EffiMap delivers powerful tools that help you make data-driven decisions about territory management and geographic strategy.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div ref={ref} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col"
              >
                <div>
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold text-gray-900">
              Ready to optimize your territory management?
            </h2>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Get Started
                </button>
              </div>
              <div className="ml-3 inline-flex">
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal
          onClose={() => setShowContactModal(false)}
          source="features_page"
        />
      )}
    </div>
  );
}
