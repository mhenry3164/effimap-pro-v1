import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, BarChart2, Users, Globe, ArrowRight, Zap, DollarSign } from 'lucide-react';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const stats = [
    { value: '40%', label: 'Average Efficiency Gain', icon: <Zap className="w-6 h-6 text-primary" /> },
    { value: '2.5x', label: 'ROI in First Year', icon: <DollarSign className="w-6 h-6 text-primary" /> },
    { value: '30%', label: 'Time Saved in Planning', icon: <Globe className="w-6 h-6 text-primary" /> }
  ];

  const features = [
    {
      icon: <MapPin className="h-12 w-12 text-primary" />,
      title: "Smart Territory Optimization",
      description: "Transform your geographic strategy with AI-powered territory mapping and optimization."
    },
    {
      icon: <BarChart2 className="h-12 w-12 text-primary" />,
      title: "Data-Driven Decisions",
      description: "Make informed decisions with real-time analytics and performance insights."
    },
    {
      icon: <Users className="h-12 w-12 text-primary" />,
      title: "Seamless Collaboration",
      description: "Enable team-wide territory planning and strategy alignment."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-20">
              <div className="sm:text-center lg:text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                >
                  <span className="block">Transform Your</span>
                  <span className="block text-primary">Territory Management</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                >
                  Optimize your sales territories, track performance, and make data-driven decisions with our advanced mapping solution.
                </motion.p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/signup"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark md:py-4 md:text-lg md:px-10"
                    >
                      Get Started
                      <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/features"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <BackgroundAnimation className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Proven Results
            </h2>
            <p className="mt-3 text-xl text-gray-500 sm:mt-4">
              Real numbers from real customers achieving real results.
            </p>
          </div>
          <dl className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <dt className="flex items-center justify-center">
                  {stat.icon}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 text-center">
                  {stat.value}
                </dd>
                <dt className="mt-2 text-sm font-medium text-gray-500 text-center">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose EffiMap Pro?
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Everything you need to manage and optimize your territories effectively.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8 h-full hover:shadow-lg transition-shadow duration-300">
                    <div className="-mt-6">
                      <div className="flex items-center justify-center">
                        <span className="p-3 bg-primary-light rounded-md shadow-lg">
                          {feature.icon}
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 text-center">
                        {feature.title}
                      </h3>
                      <p className="mt-5 text-base text-gray-500 text-center">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
