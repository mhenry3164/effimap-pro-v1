import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Gauge, Users, Lightbulb, ArrowRight, Workflow, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const milestones = [
    {
      year: '2023',
      title: 'EffiMap Launch',
      description: 'Introduced our territory mapping solution to empower field operations with intelligent tools.',
      color: 'from-blue-400 to-blue-600'
    },
    {
      year: '2023',
      title: 'AI Integration',
      description: 'Enhanced our platform with AI-driven insights for smarter territory management.',
      color: 'from-indigo-400 to-indigo-600'
    },
    {
      year: '2024',
      title: 'Market Expansion',
      description: 'Extended our reach to serve more industries with tailored mapping solutions.',
      color: 'from-cyan-400 to-cyan-600'
    }
  ];

  const values = [
    {
      icon: <Gauge className="h-8 w-8 text-blue-600" />,
      title: 'Efficiency',
      description: 'We simplify complex territory management tasks, allowing you to accomplish more in less time.',
      color: 'from-blue-50 to-indigo-50'
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: 'Customer-Centricity',
      description: 'Every feature is designed with a deep understanding of field operations and your daily challenges.',
      color: 'from-purple-50 to-pink-50'
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-amber-600" />,
      title: 'Innovation',
      description: 'We leverage AI and modern technology to provide practical, impactful mapping solutions.',
      color: 'from-amber-50 to-yellow-50'
    },
    {
      icon: <Workflow className="h-8 w-8 text-green-600" />,
      title: 'Adaptability',
      description: 'Scalable solutions that grow with your business, from single locations to multi-branch operations.',
      color: 'from-green-50 to-emerald-50'
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: 'Excellence',
      description: 'Committed to delivering reliable, high-quality tools that support your operational success.',
      color: 'from-red-50 to-rose-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="w-full mx-auto py-20 px-4 sm:px-6 lg:px-8 2xl:px-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center max-w-[90rem] mx-auto"
          >
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Empowering Professionals with</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Intelligent Mapping Solutions
              </span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600">
              Part of the EffiWise family, EffiMap is committed to providing AI-driven tools that streamline workflows, enhance productivity, and deliver actionable insights for territory management.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Values Section */}
      <div ref={ref} className="py-24">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeIn}
            className="text-center mb-16 max-w-[90rem] mx-auto"
          >
            <h2 className="text-3xl font-extrabold text-gray-900">Our Core Values</h2>
            <p className="mt-4 text-xl text-gray-600">
              The principles that drive our commitment to your success
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-[90rem] mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className={`h-full rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${value.color} p-8`}>
                  <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-white shadow-md group-hover:scale-110 transition-transform duration-300 mx-auto">
                    {value.icon}
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900 text-center">
                    {value.title}
                  </h3>
                  <p className="mt-4 text-gray-600 text-center">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16 max-w-[90rem] mx-auto"
          >
            <h2 className="text-3xl font-extrabold text-gray-900">Our Commitment</h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              EffiMap empowers field operations with intelligent, intuitive tools that enhance efficiency, accuracy, and territory management. We provide industry-tailored solutions that equip professionals with the insights needed to make fast, informed decisions and drive operational success.
            </p>
          </motion.div>

          <div className="mt-16 max-w-[90rem] mx-auto">
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-blue-600 to-indigo-600 opacity-20" />
              
              <div className="space-y-16">
                {milestones.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    transition={{ delay: index * 0.2 }}
                    className="relative"
                  >
                    <div className="flex items-center justify-center">
                      <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${item.color} shadow-lg`}>
                        <span className="text-white font-bold">{item.year}</span>
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <h3 className="text-xl font-bold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-gray-600 max-w-md mx-auto">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="w-full mx-auto py-16 px-4 sm:px-6 lg:px-8 2xl:px-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-[90rem] mx-auto"
          >
            <h2 className="text-3xl font-extrabold text-white mb-8">
              Ready to transform your territory management?
            </h2>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200"
              >
                Start Your Journey
                <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
