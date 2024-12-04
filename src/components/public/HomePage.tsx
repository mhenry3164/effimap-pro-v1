import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, BarChart2, Users, Globe, ArrowRight, Zap, Target, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackgroundAnimation from '../animations/BackgroundAnimation';

const HomePage: React.FC = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const stats = [
    { 
      value: '40%', 
      label: 'Average Time Saved', 
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      description: 'Streamline territory planning and management'
    },
    { 
      value: '2.5x', 
      label: 'Efficiency Increase', 
      icon: <Target className="w-6 h-6 text-purple-600" />,
      description: 'Improve resource allocation and coverage'
    },
    { 
      value: '30%', 
      label: 'Cost Reduction', 
      icon: <Workflow className="w-6 h-6 text-green-600" />,
      description: 'Optimize operations and reduce overhead'
    }
  ];

  const features = [
    {
      icon: <MapPin className="h-12 w-12 text-blue-600" />,
      title: "Intelligent Territory Planning",
      description: "AI-powered mapping tools that simplify complex territory management tasks for small and mid-sized businesses.",
      color: "from-blue-50 to-indigo-50"
    },
    {
      icon: <BarChart2 className="h-12 w-12 text-purple-600" />,
      title: "Data-Driven Insights",
      description: "Transform your field operations with real-time analytics and actionable insights for informed decision-making.",
      color: "from-purple-50 to-pink-50"
    },
    {
      icon: <Users className="h-12 w-12 text-green-600" />,
      title: "Field-Ready Solutions",
      description: "Practical tools designed for real-world use, enabling efficient territory management and team coordination.",
      color: "from-green-50 to-emerald-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50">
        <div className="absolute inset-0">
          <BackgroundAnimation className="w-full h-full opacity-30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-20 sm:py-24 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Intelligent Territory</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Management Made Simple
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 sm:text-xl max-w-2xl mx-auto">
                Empower your field operations with AI-driven mapping solutions that streamline territory management, enhance efficiency, and drive growth for your business.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-md shadow"
                >
                  <Link
                    to="/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/features"
                    className="w-full flex items-center justify-center px-8 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                  >
                    See How It Works
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="relative py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Proven Results for Growing Businesses
            </h2>
            <p className="mt-3 text-xl text-gray-600">
              Join businesses that are transforming their territory management
            </p>
          </motion.div>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="px-6 py-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <dt className="flex items-center justify-center">
                  {stat.icon}
                </dt>
                <dd className="mt-4 text-4xl font-extrabold text-blue-600 text-center">
                  {stat.value}
                </dd>
                <dt className="mt-2 text-lg font-medium text-gray-900 text-center">
                  {stat.label}
                </dt>
                <dd className="mt-2 text-sm text-gray-600 text-center">
                  {stat.description}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features Section */}
      <section ref={ref} className="py-16 sm:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Tailored for Your Success
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
              Practical solutions designed for real-world territory management challenges
            </p>
          </motion.div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative group"
                >
                  <div className={`h-full flex flex-col bg-gradient-to-br ${feature.color} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8`}>
                    <div className="flex items-center justify-center">
                      <div className="p-3 bg-white rounded-lg group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-gray-900 text-center">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-gray-600 text-center flex-grow">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
