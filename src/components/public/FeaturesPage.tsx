import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Map, BarChart2, Layers, Users, Globe, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactModal from '../../shared/components/ContactModal';

export default function FeaturesPage() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
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
      icon: <Map className="h-8 w-8 text-blue-600" />,
      title: 'Territory Optimization',
      description: 'Define, adjust, and visualize territories with precision, enabling better resource allocation and decision-making.',
      color: 'from-blue-50 to-indigo-50'
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-purple-600" />,
      title: 'Data-Driven Insights',
      description: 'Access heatmaps and overlays to visualize key business data and spot trends that drive growth.',
      color: 'from-purple-50 to-pink-50'
    },
    {
      icon: <Layers className="h-8 w-8 text-indigo-600" />,
      title: 'Seamless Integration',
      description: 'Upload your business data directly into EffiMap to create actionable strategies.',
      color: 'from-indigo-50 to-blue-50'
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: 'Collaboration Ready',
      description: 'Share insights and align strategies across your organization with powerful team tools.',
      color: 'from-green-50 to-emerald-50'
    },
    {
      icon: <Globe className="h-8 w-8 text-cyan-600" />,
      title: 'Business-First Approach',
      description: 'Focus on enabling business decisions with clear, actionable insights.',
      color: 'from-cyan-50 to-blue-50'
    },
    {
      icon: <Lock className="h-8 w-8 text-rose-600" />,
      title: 'Enterprise Security',
      description: 'Role-based access control and secure data handling for enterprise needs.',
      color: 'from-rose-50 to-pink-50'
    },
  ];

  const showcaseFeatures = [
    {
      title: "Advanced Territory Mapping",
      description: "Visualize and manage territories with county and zip code boundary functionality for precise geographic control.",
      image: "/Images/Screenshot 2024-12-04 081119.png",
      alt: "Territory mapping with county and zip code boundaries"
    },
    {
      title: "Data Visualization",
      description: "Powerful heatmap functionality helps you identify trends and make data-driven decisions.",
      image: "/Images/Screenshot 2024-12-04 081354.png",
      alt: "Heatmap visualization of territory data"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center"
          >
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Features that Drive</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Business Growth
              </span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500 sm:max-w-3xl">
              EffiMap delivers powerful tools that help you make data-driven decisions about territory management and geographic strategy.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div ref={ref} className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className={`h-full rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${feature.color} p-8`}>
                  <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-white shadow-md group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Showcase Section */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              See EffiMap Pro in Action
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Powerful features designed for modern territory management
            </p>
          </div>
          <div className="space-y-24">
            {showcaseFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } items-center gap-12`}
              >
                <div className="lg:w-1/2">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-10 blur-lg"></div>
                    <img
                      src={feature.image}
                      alt={feature.alt}
                      className="relative rounded-2xl shadow-2xl w-full"
                    />
                  </div>
                </div>
                <div className="lg:w-1/2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold text-white mb-8">
              Ready to optimize your territory management?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedPlan('business');
                  setShowContactModal(true);
                }}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200"
              >
                Get Started
                <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
                >
                  View Pricing
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal
          onClose={() => setShowContactModal(false)}
          source={`features_${selectedPlan}`}
        />
      )}
    </div>
  );
}
