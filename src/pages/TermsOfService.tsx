import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Scale, Shield, Users, AlertTriangle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../utils/api';

const TermsOfService = () => {
  const navigate = useNavigate();
  const [termsContent, setTermsContent] = React.useState<any>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTermsContent = async () => {
      try {
        setLoading(true);
        console.log('Fetching terms of service...');
        const data = await apiService.getTermsOfService();
        console.log('Terms of service fetched:', data);
        if (data && Object.keys(data).length > 0) {
          setTermsContent(data);
        }
      } catch (error) {
        console.error('Failed to fetch terms of service:', error);
        // Keep empty state on error to show loading failed
      } finally {
        setLoading(false);
      }
    };

    fetchTermsContent();
  }, []);

  const sections = [
    {
      icon: FileText,
      title: "Scope of Services",
      content: [
        {
          subtitle: "Job Consultancy Services",
          items: [
            "We assist candidates in connecting with potential employers.",
            "We do not guarantee employment; final hiring decisions are made solely by the employer.",
            "Candidates are responsible for providing accurate and truthful information."
          ]
        },
        {
          subtitle: "Cybercrime & Digital Forensics",
          items: [
            "We provide digital investigation, cybercrime consultation, and online fraud prevention services strictly in accordance with Indian Cyber Laws (IT Act 2000 & its amendments).",
            "We do not engage in illegal hacking, unauthorized access, or any unlawful cyber activity.",
            "All investigations are conducted with proper client consent and in compliance with applicable laws."
          ]
        },
        {
          subtitle: "App Development",
          items: [
            "We design, develop, and maintain mobile and web applications as per client requirements.",
            "All source code and intellectual property rights are subject to the terms agreed in the service contract."
          ]
        }
      ]
    },
    {
      icon: Users,
      title: "Eligibility",
      content: [
        {
          subtitle: "",
          items: [
            "You must be at least 18 years old to use our services. By engaging with us, you confirm that you are legally capable of entering into a binding agreement under Indian law."
          ]
        }
      ]
    },
    {
      icon: Shield,
      title: "User Responsibilities",
      content: [
        {
          subtitle: "",
          items: [
            "Provide accurate, complete, and updated information when requested.",
            "Use our services only for lawful purposes.",
            "Avoid engaging in fraud, misrepresentation, harassment, or any activity that violates applicable laws."
          ]
        }
      ]
    },
    {
      icon: Scale,
      title: "Payments & Fees",
      content: [
        {
          subtitle: "",
          items: [
            "Service fees are communicated before commencement of work and must be paid as per agreed terms.",
            "All payments are non-refundable unless otherwise stated in writing.",
            "In the case of job consultancy, fees are charged as per service agreement and do not constitute a placement guarantee."
          ]
        }
      ]
    },
    {
      icon: Lock,
      title: "Intellectual Property",
      content: [
        {
          subtitle: "",
          items: [
            "All content on our website — including text, graphics, logos, designs, and software — is the property of Drave Digitals and protected under Indian Copyright Law.",
            "Clients may not copy, distribute, or reproduce any part of our services without written consent."
          ]
        }
      ]
    },
    {
      icon: Shield,
      title: "Confidentiality",
      content: [
        {
          subtitle: "",
          items: [
            "We maintain the confidentiality of client information unless disclosure is required by law or for legal proceedings."
          ]
        }
      ]
    },
    {
      icon: AlertTriangle,
      title: "Limitation of Liability",
      content: [
        {
          subtitle: "",
          items: [
            "We are not liable for any loss, damage, or legal consequences arising from misuse of our services.",
            "Job placement results, cybercrime resolution timelines, and app performance depend on factors beyond our control."
          ]
        }
      ]
    },
    {
      icon: AlertTriangle,
      title: "Prohibited Activities",
      content: [
        {
          subtitle: "You agree NOT to:",
          items: [
            "Use our services for any unlawful or fraudulent activity.",
            "Submit false documents or information.",
            "Attempt to gain unauthorized access to our systems or client data."
          ]
        }
      ]
    },
    {
      icon: Scale,
      title: "Termination",
      content: [
        {
          subtitle: "",
          items: [
            "We reserve the right to suspend or terminate your access to our services without notice for violation of these Terms or applicable laws."
          ]
        }
      ]
    },
    {
      icon: Scale,
      title: "Governing Law & Jurisdiction",
      content: [
        {
          subtitle: "",
          items: [
            "These Terms are governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in India."
          ]
        }
      ]
    },
    {
      icon: FileText,
      title: "Changes to Terms",
      content: [
        {
          subtitle: "",
          items: [
            "We may update these Terms from time to time. Continued use of our services after changes implies acceptance of the revised Terms."
          ]
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full"
        />
        <p className="ml-4 text-gray-600">Loading terms of service...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center space-x-2 mb-8 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {termsContent.title || 'Terms of Service'}
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              {termsContent.subtitle || 'Legal Terms and Conditions'}
            </p>
            <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-white/90 whitespace-pre-line">
                {termsContent.introduction || 'Welcome to Drave Digitals ("Company," "we," "our," or "us"). By accessing or using our website, products, and services — including Job Consultancy, Cybercrime & Digital Forensics Solutions, and App Development — you ("User," "Client," or "You") agree to comply with and be bound by these Terms and Conditions.\n\nIf you do not agree with these Terms, please discontinue use of our services immediately.'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-12">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <section.icon className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {index + 1}. {section.title}
                </h2>
              </div>

              <div className="space-y-6">
                {section.content.map((subsection, subIndex) => (
                  <div key={subIndex}>
                    {subsection.subtitle && (
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        {subsection.subtitle}
                      </h3>
                    )}
                    <ul className="space-y-2">
                      {subsection.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-3">
                          {item.trim() && (
                            <>
                              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-700 leading-relaxed">{item}</span>
                            </>
                          )}
                          {!item.trim() && <div className="h-2" />}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-8 border border-red-200"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For any queries, complaints, or clarifications regarding these Terms, contact:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> {termsContent.contactInfo?.email || 'legal@dravedigitals.com'}</p>
              <p><strong>Phone:</strong> {termsContent.contactInfo?.phone || '+91 9876543210'}</p>
              <p><strong>Address:</strong> {termsContent.contactInfo?.address || 'Mumbai, Maharashtra, India'}</p>
            </div>
          </motion.div>

          {/* Last Updated */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center py-8"
          >
            <p className="text-gray-500 text-sm">
              Last updated: {termsContent.lastUpdated ? new Date(termsContent.lastUpdated).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;