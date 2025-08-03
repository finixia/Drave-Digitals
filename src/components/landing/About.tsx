import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Award, TrendingUp, Shield, Heart } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Happy Clients', value: '5000+', color: 'text-blue-400' },
  { icon: Award, label: 'Success Rate', value: '98%', color: 'text-green-400' },
  { icon: Shield, label: 'Fraud Cases Resolved', value: '1200+', color: 'text-red-400' },
  { icon: TrendingUp, label: 'Growth Rate', value: '150%', color: 'text-purple-400' }
];

const values = [
  {
    icon: Target,
    title: 'Mission Driven',
    description: 'Empowering careers while protecting against digital threats with innovative solutions.'
  },
  {
    icon: Heart,
    title: 'Client First',
    description: 'Your success is our priority. We provide personalized solutions for every client.'
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description: 'Building trust through transparency, security, and reliable service delivery.'
  }
];

const About = () => {
  return (
    <section id="about" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-full px-4 py-2 text-red-400 text-sm font-medium mb-6"
          >
            <Target size={16} />
            <span>About Us</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
           <span className="text-gray-900">Your Trusted</span>{' '}
            <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Career Partner
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Drave Digitals is more than just a consultancy. We're your comprehensive career 
            protection and growth partner, combining job placement expertise with 
            cybersecurity awareness and cutting-edge technology solutions.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="text-center bg-gray-50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6"
            >
              <stat.icon className={`${stat.color} mx-auto mb-4`} size={32} />
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Values Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-8">
              Why Choose CareerGuard?
            </h3>
            <div className="space-y-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex items-start space-x-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center"
                  >
                    <value.icon className="text-white" size={20} />
                  </motion.div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl p-8 border border-red-200">
              <motion.div
                animate={{ 
                  background: [
                    "linear-gradient(45deg, rgba(239, 68, 68, 0.05), rgba(220, 38, 38, 0.05))",
                    "linear-gradient(45deg, rgba(220, 38, 38, 0.05), rgba(239, 68, 68, 0.05))"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-3xl"
              />
              <div className="relative z-10">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">
                  Our Commitment
                </h4>
                <div className="space-y-4">
                  {[
                    'Personalized career guidance for every individual',
                    'Comprehensive fraud protection and awareness',
                    'Cutting-edge technology solutions',
                    '24/7 support and consultation',
                    'Transparent pricing with no hidden costs',
                    'Continuous skill development programs'
                  ].map((commitment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-2 h-2 bg-red-400 rounded-full" />
                      <span className="text-gray-700">{commitment}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-20"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition-all"
          >
            Start Your Journey Today
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default About;