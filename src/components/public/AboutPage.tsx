import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, Target, Users, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const timeline = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'EffiWise was established with a vision to revolutionize territory management.',
    },
    {
      year: '2021',
      title: 'Launch of EffiMapPro',
      description: 'Our flagship product was launched, bringing innovative mapping solutions to businesses.',
    },
    {
      year: '2022',
      title: 'Major Platform Updates',
      description: 'Introduced advanced analytics and team management features.',
    },
    {
      year: '2023',
      title: 'Global Expansion',
      description: 'Expanded our services to international markets and enhanced our feature set.',
    },
  ];

  const values = [
    {
      icon: <MapPin className="h-6 w-6 text-[#003f88]" />,
      title: 'Accessibility',
      description: 'Providing tools that are effective for businesses of all sizes.',
    },
    {
      icon: <Target className="h-6 w-6 text-[#003f88]" />,
      title: 'Business First',
      description: 'Focusing on enabling business decisions, not technical complexity.',
    },
    {
      icon: <Users className="h-6 w-6 text-[#003f88]" />,
      title: 'Collaboration',
      description: 'Fostering partnerships with consultants, strategists, and users for mutual growth.',
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-[#003f88]" />,
      title: 'Innovation',
      description: 'Leveraging cutting-edge technology to simplify complex geographic decision-making.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Our Mission is</span>
              <span className="block text-[#003f88]">Your Success</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              EffiMap empowers businesses of all sizes to make data-driven decisions about territory management and geographic strategy.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div ref={ref} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Our Values</h2>
          </div>
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  variants={fadeIn}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                    {value.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Our Journey</h2>
          </div>
          <div className="mt-10">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gray-200" />
              
              {/* Timeline entries */}
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    variants={fadeIn}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="flex items-center justify-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full">
                        <span className="text-white font-bold">{item.year}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-base text-gray-500">
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
    </div>
  );
}
