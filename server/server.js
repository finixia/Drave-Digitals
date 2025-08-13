const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow specific file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'https://dravedigitals.in'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log("MONGODB_URI:", process.env.MONGODB_URI);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerguard')
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  
  // Personal Details
  phone: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  
  // Professional Details
  currentPosition: { type: String },
  experience: { type: String },
  skills: { type: String },
  education: { type: String },
  expectedSalary: { type: String },
  preferredLocation: { type: String },
  
  // Preferences
  jobType: { type: String },
  workMode: { type: String },
  interestedServices: [{ type: String }],
  
  // Documents
  resume: { type: String }, // File path
  
  // Profile completion
  profileCompleted: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Create default admin user if it doesn't exist
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@careerguard.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        name: 'Admin',
        email: 'admin@careerguard.com',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'contacted', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// Job Application Schema
const jobApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  position: { type: String, required: true },
  experience: { type: String, required: true },
  skills: { type: String, required: true },
  expectedSalary: { type: String },
  location: { type: String },
  resume: { type: String }, // File path
  status: { type: String, enum: ['applied', 'screening', 'interview', 'placed', 'rejected'], default: 'applied' },
  createdAt: { type: Date, default: Date.now }
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

// Fraud Case Schema
const fraudCaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  fraudType: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number },
  dateOfIncident: { type: Date },
  policeComplaint: { type: Boolean, default: false },
  evidence: [{ type: String }], // File paths
  status: { type: String, enum: ['reported', 'investigating', 'resolved', 'closed'], default: 'reported' },
  createdAt: { type: Date, default: Date.now }
});

const FraudCase = mongoose.model('FraudCase', fraudCaseSchema);

// Newsletter Schema
const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribed: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// Website Content Schema
const websiteContentSchema = new mongoose.Schema({
  section: { type: String, required: true, unique: true },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const WebsiteContent = mongoose.model('WebsiteContent', websiteContentSchema);

// About Content Schema
const aboutContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  values: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  commitments: [{ type: String }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const AboutContent = mongoose.model('AboutContent', aboutContentSchema, 'aboutcontents');

// Privacy Policy Schema
const privacyPolicySchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  introduction: { type: String, required: true },
  sections: [{
    title: { type: String, required: true },
    content: [{
      subtitle: { type: String },
      items: [{ type: String }]
    }]
  }],
  contactInfo: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  lastUpdated: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const PrivacyPolicy = mongoose.model('PrivacyPolicy', privacyPolicySchema);

// Terms of Service Schema
// Contact Info Schema
const contactInfoSchema = new mongoose.Schema({
  phone: [String],
  email: [String],
  address: [String],
  workingHours: [String],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ContactInfo = mongoose.model('ContactInfo', contactInfoSchema);

// Dashboard Stats Schema
const dashboardStatsSchema = new mongoose.Schema({
  happyClients: { type: String, default: '5000+' },
  successRate: { type: String, default: '98%' },
  growthRate: { type: String, default: '150%' },
  fraudCasesResolved: { type: String, default: '1200+' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const DashboardStats = mongoose.model('DashboardStats', dashboardStatsSchema);

const termsOfServiceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  introduction: { type: String, required: true },
  sections: [{
    title: { type: String, required: true },
    content: [{
      subtitle: { type: String },
      items: [{ type: String }]
    }]
  }],
  contactInfo: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  lastUpdated: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const TermsOfService = mongoose.model('TermsOfService', termsOfServiceSchema);
// Service Schema
const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  features: [{ type: String }],
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Service = mongoose.model('Service', serviceSchema);

// Create default services
const createDefaultServices = async () => {
  try {
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      const defaultServices = [
        {
          title: 'Cyber Crime Fraud Assistance',
          description: 'Complete protection against cyber fraud with expert guidance and legal support.',
          icon: 'Shield',
          color: 'from-red-500 to-pink-600',
          features: [
            'Cyber fraud complaint support',
            'FIR filing guidance',
            'Online complaint assistance',
            'Prevention tips & awareness'
          ],
          order: 1
        },
        {
          title: 'Job Consultancy Services',
          description: 'End-to-end job placement services for IT & Non-IT professionals.',
          icon: 'Briefcase',
          color: 'from-blue-500 to-cyan-600',
          features: [
            'IT & Non-IT placements',
            'Resume building support',
            'Interview preparation',
            'Work from home opportunities'
          ],
          order: 2
        },
        {
          title: 'Web & App Development',
          description: 'Custom digital solutions from websites to mobile applications.',
          icon: 'Code',
          color: 'from-green-500 to-emerald-600',
          features: [
            'Website development',
            'E-commerce platforms',
            'Mobile app development',
            'UI/UX design services'
          ],
          order: 3
        },
        {
          title: 'Digital Marketing',
          description: 'Comprehensive digital marketing solutions to grow your business online.',
          icon: 'TrendingUp',
          color: 'from-purple-500 to-violet-600',
          features: [
            'Social media marketing',
            'SEO optimization',
            'Google Ads management',
            'Meta Ads campaigns'
          ],
          order: 4
        },
        {
          title: 'Training & Certification',
          description: 'Professional skill development programs with industry certifications.',
          icon: 'GraduationCap',
          color: 'from-orange-500 to-amber-600',
          features: [
            'IT training programs',
            'Digital marketing courses',
            'Freelancing skills',
            'Industry certifications'
          ],
          order: 5
        }
      ];
      
      await Service.insertMany(defaultServices);
      console.log('Default services created');
    }
  } catch (error) {
    console.error('Error creating default services:', error);
  }
};
// Testimonial Schema
// Create default contact info
const createDefaultContactInfo = async () => {
  try {
    const contactInfoExists = await ContactInfo.findOne({ active: true });
    if (!contactInfoExists) {
      const defaultContactInfo = new ContactInfo({
        phone: ['+91 9876543210', '+91 9876543211'],
        email: ['info@dravedigitals.com', 'support@dravedigitals.com'],
        address: ['123 Business District', 'Bangalore, Karnataka 530068'],
        workingHours: ['Mon - Fri: 9:00 AM - 7:00 PM', 'Sat: 10:00 AM - 4:00 PM'],
        active: true
      });
      await defaultContactInfo.save();
      console.log('Default contact info created');
    }
  } catch (error) {
    console.error('Error creating default contact info:', error);
  }
};

// Create default dashboard stats
const createDefaultDashboardStats = async () => {
  try {
    const dashboardStatsExists = await DashboardStats.findOne({ active: true });
    if (!dashboardStatsExists) {
      const defaultStats = new DashboardStats({
        happyClients: '5000+',
        successRate: '98%',
        growthRate: '150%',
        fraudCasesResolved: '1200+',
        active: true
      });
      await defaultStats.save();
      console.log('Default dashboard stats created');
    }
  } catch (error) {
    console.error('Error creating default dashboard stats:', error);
  }
};

const createDefaultPrivacyPolicy = async () => {
  try {
    const existingPolicy = await PrivacyPolicy.findOne();
    if (!existingPolicy) {
      const defaultPolicy = new PrivacyPolicy({
        title: 'Privacy Policy',
        subtitle: 'How we protect your information',
        introduction: 'Drave Digitals ("Company," "we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and safeguard your data when you use our services — including Job Consultancy, Cybercrime & Digital Forensics, and App Development.',
        contactInfo: {
          email: 'privacy@dravedigitals.com',
          phone: '+91 9876543210',
          address: 'Mumbai, Maharashtra, India'
        },
        active: true
      });
      await defaultPolicy.save();
      console.log('Default privacy policy created');
    }
  } catch (error) {
    console.error('Error creating default privacy policy:', error);
  }
};

const createDefaultTermsOfService = async () => {
  try {
    const existingTerms = await TermsOfService.findOne();
    if (!existingTerms) {
      const defaultTerms = new TermsOfService({
        title: 'Terms of Service',
        subtitle: 'Legal Terms and Conditions',
        introduction: 'Welcome to Drave Digitals ("Company," "we," "our," or "us"). By accessing or using our website, products, and services — including Job Consultancy, Cybercrime & Digital Forensics Solutions, and App Development — you ("User," "Client," or "You") agree to comply with and be bound by these Terms and Conditions.\n\nIf you do not agree with these Terms, please discontinue use of our services immediately.',
        contactInfo: {
          email: 'legal@dravedigitals.com',
          phone: '+91 9876543210',
          address: 'Mumbai, Maharashtra, India'
        },
        active: true
      });
      await defaultTerms.save();
      console.log('Default terms of service created');
    }
  } catch (error) {
    console.error('Error creating default terms of service:', error);
  }
};

const createDefaultAboutContent = async () => {
  try {
    const existingAbout = await AboutContent.findOne();
    if (!existingAbout) {
      const defaultAbout = new AboutContent({
        title: 'Your Trusted Career Partner',
        subtitle: 'About Us',
        description: 'Drave Digitals is more than just a consultancy. We\'re your comprehensive career protection and growth partner, combining job placement expertise with cybersecurity awareness and cutting-edge technology solutions.',
        values: [
          {
            title: 'Mission Driven',
            description: 'Empowering careers while protecting against digital threats with innovative solutions.',
            icon: 'Target'
          },
          {
            title: 'Client First',
            description: 'Your success is our priority. We provide personalized solutions for every client.',
            icon: 'Heart'
          },
          {
            title: 'Trust & Security',
            description: 'Building trust through transparency, security, and reliable service delivery.',
            icon: 'Shield'
          }
        ],
        commitments: [
          'Personalized career guidance for every individual',
          'Comprehensive fraud protection and awareness',
          'Cutting-edge technology solutions',
          '24/7 support and consultation',
          'Transparent pricing with no hidden costs',
          'Continuous skill development programs'
        ],
        active: true
      });
      await defaultAbout.save();
      console.log('Default about content created');
    }
  } catch (error) {
    console.error('Error creating default about content:', error);
  }
};
// Create default privacy policy
const createDefaultPrivacyPolicy = async () => {
  try {
    const privacyPolicyExists = await PrivacyPolicy.findOne({ active: true });
    if (!privacyPolicyExists) {
      const defaultPrivacyPolicy = new PrivacyPolicy({
        title: 'Privacy Policy',
        subtitle: 'Your Privacy Matters to Us',
        introduction: 'Drave Digitals ("Company," "we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and safeguard your data when you use our services — including Job Consultancy, Cybercrime & Digital Forensics, and App Development.\n\nBy using our website and services, you agree to the terms outlined in this Privacy Policy.',
        sections: [
          {
            title: 'Information We Collect',
            content: [
              {
                subtitle: 'Personal Information (for job consultancy & client onboarding)',
                items: [
                  'Full Name',
                  'Contact details (email, phone number, address)',
                  'Date of Birth, Gender',
                  'Resume/CV, qualifications, employment history',
                  'Identification documents (e.g., Aadhaar, PAN, Passport — only when legally required)'
                ]
              },
              {
                subtitle: 'Cybercrime & Forensics Data',
                items: [
                  'Digital evidence provided by clients (e.g., screenshots, logs, emails)',
                  'Technical information related to incidents',
                  'Any other data necessary for investigation'
                ]
              },
              {
                subtitle: 'App Development Information',
                items: [
                  'Project requirements and specifications',
                  'User analytics for apps we develop',
                  'Client feedback and communication history'
                ]
              },
              {
                subtitle: 'Automatically Collected Data',
                items: [
                  'IP address',
                  'Browser type & device information',
                  'Cookies & usage patterns'
                ]
              }
            ]
          },
          {
            title: 'How We Use Your Information',
            content: [
              {
                subtitle: '',
                items: [
                  'Job Consultancy: To match candidates with employers, verify credentials, and communicate hiring updates.',
                  'Cybercrime Services: To conduct legal investigations, gather evidence, and provide reports.',
                  'App Development: To deliver, maintain, and improve our applications.',
                  'Legal Compliance: To meet legal obligations under Indian law.',
                  'Customer Support: To respond to queries, complaints, or requests.'
                ]
              }
            ]
          },
          {
            title: 'Data Sharing & Disclosure',
            content: [
              {
                subtitle: '',
                items: [
                  'We do not sell your personal data. We may share your information with:',
                  'Employers & Recruiters (job consultancy) — only with your consent.',
                  'Law Enforcement Agencies — in cases involving cybercrime or legal compliance.',
                  'Service Providers — for hosting, analytics, or technical support.',
                  'Legal Authorities — if required by court order or government directive.'
                ]
              }
            ]
          },
          {
            title: 'Data Retention',
            content: [
              {
                subtitle: '',
                items: [
                  'Job consultancy data is retained for up to 2 years unless you request deletion earlier.',
                  'Cybercrime case data is retained as per legal requirements and then securely destroyed.',
                  'App development project data is retained for contract duration + 1 year for support purposes.'
                ]
              }
            ]
          },
          {
            title: 'Security Measures',
            content: [
              {
                subtitle: '',
                items: [
                  'We implement reasonable security practices, including:',
                  'Encrypted data storage',
                  'Secure communication protocols (HTTPS, SSL)',
                  'Restricted employee access to sensitive data',
                  'Regular security audits',
                  '',
                  'However, no system is 100% secure, and we cannot guarantee absolute security of your data.'
                ]
              }
            ]
          },
          {
            title: 'Your Rights',
            content: [
              {
                subtitle: '',
                items: [
                  'You have the right to:',
                  'Access and request a copy of your data',
                  'Correct inaccurate information',
                  'Request deletion of your personal data (subject to legal obligations)',
                  'Withdraw consent for data processing (where applicable)',
                  '',
                  'To exercise your rights, contact us using the details in Section 9'
                ]
              }
            ]
          }
        ],
        contactInfo: {
          email: 'privacy@dravedigitals.com',
          phone: '+91 9876543210',
          address: 'Mumbai, Maharashtra, India'
        },
        active: true
      });
      await defaultPrivacyPolicy.save();
      console.log('Default privacy policy created');
    }
  } catch (error) {
    console.error('Error creating default privacy policy:', error);
  }
};

// Create default terms of service
const createDefaultTermsOfService = async () => {
  try {
    const termsExists = await TermsOfService.findOne({ active: true });
    if (!termsExists) {
      const defaultTerms = new TermsOfService({
        title: 'Terms of Service',
        subtitle: 'Legal Terms and Conditions',
        introduction: 'Welcome to Drave Digitals ("Company," "we," "our," or "us"). By accessing or using our website, products, and services — including Job Consultancy, Cybercrime & Digital Forensics Solutions, and App Development — you ("User," "Client," or "You") agree to comply with and be bound by these Terms and Conditions.\n\nIf you do not agree with these Terms, please discontinue use of our services immediately.',
        sections: [
          {
            title: 'Scope of Services',
            content: [
              {
                subtitle: 'Job Consultancy Services',
                items: [
                  'We assist candidates in connecting with potential employers.',
                  'We do not guarantee employment; final hiring decisions are made solely by the employer.',
                  'Candidates are responsible for providing accurate and truthful information.'
                ]
              },
              {
                subtitle: 'Cybercrime & Digital Forensics',
                items: [
                  'We provide digital investigation, cybercrime consultation, and online fraud prevention services strictly in accordance with Indian Cyber Laws (IT Act 2000 & its amendments).',
                  'We do not engage in illegal hacking, unauthorized access, or any unlawful cyber activity.',
                  'All investigations are conducted with proper client consent and in compliance with applicable laws.'
                ]
              },
              {
                subtitle: 'App Development',
                items: [
                  'We design, develop, and maintain mobile and web applications as per client requirements.',
                  'All source code and intellectual property rights are subject to the terms agreed in the service contract.'
                ]
              }
            ]
          },
          {
            title: 'Eligibility',
            content: [
              {
                subtitle: '',
                items: [
                  'You must be at least 18 years old to use our services. By engaging with us, you confirm that you are legally capable of entering into a binding agreement under Indian law.'
                ]
              }
            ]
          },
          {
            title: 'User Responsibilities',
            content: [
              {
                subtitle: '',
                items: [
                  'Provide accurate, complete, and updated information when requested.',
                  'Use our services only for lawful purposes.',
                  'Avoid engaging in fraud, misrepresentation, harassment, or any activity that violates applicable laws.'
                ]
              }
            ]
          },
          {
            title: 'Payments & Fees',
            content: [
              {
                subtitle: '',
                items: [
                  'Service fees are communicated before commencement of work and must be paid as per agreed terms.',
                  'All payments are non-refundable unless otherwise stated in writing.',
                  'In the case of job consultancy, fees are charged as per service agreement and do not constitute a placement guarantee.'
                ]
              }
            ]
          },
          {
            title: 'Intellectual Property',
            content: [
              {
                subtitle: '',
                items: [
                  'All content on our website — including text, graphics, logos, designs, and software — is the property of Drave Digitals and protected under Indian Copyright Law.',
                  'Clients may not copy, distribute, or reproduce any part of our services without written consent.'
                ]
              }
            ]
          },
          {
            title: 'Confidentiality',
            content: [
              {
                subtitle: '',
                items: [
                  'We maintain the confidentiality of client information unless disclosure is required by law or for legal proceedings.'
                ]
              }
            ]
          },
          {
            title: 'Limitation of Liability',
            content: [
              {
                subtitle: '',
                items: [
                  'We are not liable for any loss, damage, or legal consequences arising from misuse of our services.',
                  'Job placement results, cybercrime resolution timelines, and app performance depend on factors beyond our control.'
                ]
              }
            ]
          },
          {
            title: 'Prohibited Activities',
            content: [
              {
                subtitle: 'You agree NOT to:',
                items: [
                  'Use our services for any unlawful or fraudulent activity.',
                  'Submit false documents or information.',
                  'Attempt to gain unauthorized access to our systems or client data.'
                ]
              }
            ]
          },
          {
            title: 'Termination',
            content: [
              {
                subtitle: '',
                items: [
                  'We reserve the right to suspend or terminate your access to our services without notice for violation of these Terms or applicable laws.'
                ]
              }
            ]
          },
          {
            title: 'Governing Law & Jurisdiction',
            content: [
              {
                subtitle: '',
                items: [
                  'These Terms are governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in India.'
                ]
              }
            ]
          },
          {
            title: 'Changes to Terms',
            content: [
              {
                subtitle: '',
                items: [
                  'We may update these Terms from time to time. Continued use of our services after changes implies acceptance of the revised Terms.'
                ]
              }
            ]
          }
        ],
        contactInfo: {
          email: 'legal@dravedigitals.com',
          phone: '+91 9876543210',
          address: 'Mumbai, Maharashtra, India'
        },
        active: true
      });
      await defaultTerms.save();
      console.log('Default terms of service created');
    }
  } catch (error) {
    console.error('Error creating default terms of service:', error);
  }
};
const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  avatar: { type: String, default: '👤' },
  service: { type: String, required: true },
  featured: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

// Create default testimonials
const createDefaultTestimonials = async () => {
  try {
    const testimonialCount = await Testimonial.countDocuments();
    if (testimonialCount === 0) {
      const defaultTestimonials = [
        {
          name: 'Priya Sharma',
          role: 'Software Engineer',
          company: 'Tech Solutions Inc.',
          rating: 5,
          text: 'CareerGuard helped me land my dream job in just 2 weeks! Their resume building and interview preparation services are exceptional.',
          avatar: '👩‍💻',
          service: 'Job Consultancy',
          featured: true,
          approved: true
        },
        {
          name: 'Rajesh Kumar',
          role: 'Business Owner',
          company: 'Kumar Enterprises',
          rating: 5,
          text: 'When I faced cyber fraud, CareerGuard guided me through the entire process. They helped me file the FIR and recover my money.',
          avatar: '👨‍💼',
          service: 'Fraud Assistance',
          featured: true,
          approved: true
        },
        {
          name: 'Anita Patel',
          role: 'Digital Marketer',
          company: 'Creative Agency',
          rating: 5,
          text: 'The digital marketing training program transformed my career. Now I run successful campaigns for multiple clients.',
          avatar: '👩‍🎨',
          service: 'Training',
          featured: true,
          approved: true
        },
        {
          name: 'Vikram Singh',
          role: 'Startup Founder',
          company: 'InnovateTech',
          rating: 5,
          text: 'Their web development team created an amazing e-commerce platform for my business. Professional and timely delivery!',
          avatar: '👨‍💻',
          service: 'Development',
          featured: true,
          approved: true
        },
        {
          name: 'Meera Joshi',
          role: 'HR Manager',
          company: 'Global Corp',
          rating: 5,
          text: 'CareerGuard provided excellent candidates for our IT positions. Their screening process is thorough and reliable.',
          avatar: '👩‍💼',
          service: 'Recruitment',
          featured: true,
          approved: true
        },
        {
          name: 'Arjun Reddy',
          role: 'Freelancer',
          company: 'Independent',
          rating: 5,
          text: 'The freelancing skills program helped me build a successful remote career. Earning 6 figures now working from home!',
          avatar: '👨‍🎯',
          service: 'Training',
          featured: true,
          approved: true
        }
      ];
      
      await Testimonial.insertMany(defaultTestimonials);
      console.log('Default testimonials created');
    }
  } catch (error) {
    console.error('Error creating default testimonials:', error);
  }
};

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware for admin authentication
const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, (err) => {
    if (err) return next(err);
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};

// Routes

// File serving route

// Dashboard Stats Routes
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const stats = await DashboardStats.findOne({ active: true });
    if (!stats) {
      return res.json({
        happyClients: '5000+',
        successRate: '98%',
        growthRate: '150%',
        fraudCasesResolved: '1200+'
      });
    }
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/dashboard-stats', async (req, res) => {
  try {
    let stats = await DashboardStats.findOne({ active: true });
    if (!stats) {
      stats = new DashboardStats({ ...req.body, active: true });
    } else {
      Object.assign(stats, req.body);
    }
    await stats.save();
    res.json(stats);
  } catch (error) {
    console.error('Error updating dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Contact Info Routes
app.get('/api/contact-info', async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findOne({ active: true });
    if (!contactInfo) {
      return res.json({
        phone: ['+91 9876543210', '+91 9876543211'],
        email: ['info@dravedigitals.com', 'support@dravedigitals.com'],
        address: ['123 Business District', 'Bangalore, Karnataka 530068'],
        workingHours: ['Mon - Fri: 9:00 AM - 7:00 PM', 'Sat: 10:00 AM - 4:00 PM']
      });
    }
    res.json(contactInfo);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/contact-info', async (req, res) => {
  try {
    let contactInfo = await ContactInfo.findOne({ active: true });
    if (!contactInfo) {
      contactInfo = new ContactInfo({ ...req.body, active: true });
    } else {
      Object.assign(contactInfo, req.body);
    }
    await contactInfo.save();
    res.json(contactInfo);
  } catch (error) {
    console.error('Error updating contact info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Privacy Policy Routes
app.get('/api/privacy-policy', async (req, res) => {
  try {
    const privacyPolicy = await PrivacyPolicy.findOne({ active: true });
    if (!privacyPolicy) {
      return res.json({
        title: 'Privacy Policy',
        subtitle: 'How we protect your information',
        introduction: 'Drave Digitals ("Company," "we," "our," or "us") respects your privacy and is committed to protecting your personal information.',
        contactInfo: {
          email: 'privacy@dravedigitals.com',
          phone: '+91 9876543210',
          address: 'Mumbai, Maharashtra, India'
        }
      });
    }
    res.json(privacyPolicy);
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/privacy-policy', async (req, res) => {
  try {
    let privacyPolicy = await PrivacyPolicy.findOne({ active: true });
    if (!privacyPolicy) {
      privacyPolicy = new PrivacyPolicy({ ...req.body, active: true });
    } else {
      Object.assign(privacyPolicy, req.body);
    }
    await privacyPolicy.save();
    res.json(privacyPolicy);
  } catch (error) {
    console.error('Error updating privacy policy:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Terms of Service Routes
app.get('/api/terms-of-service', async (req, res) => {
  try {
    const termsOfService = await TermsOfService.findOne({ active: true });
    if (!termsOfService) {
      return res.json({
        title: 'Terms of Service',
        subtitle: 'Legal Terms and Conditions',
        introduction: 'Welcome to Drave Digitals ("Company," "we," "our," or "us"). By accessing or using our website, products, and services — including Job Consultancy, Cybercrime & Digital Forensics Solutions, and App Development — you ("User," "Client," or "You") agree to comply with and be bound by these Terms and Conditions.',
        contactInfo: {
          email: 'legal@dravedigitals.com',
          phone: '+91 9876543210',
          address: 'Mumbai, Maharashtra, India'
        }
      });
    }
    res.json(termsOfService);
  } catch (error) {
    console.error('Error fetching terms of service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/terms-of-service', async (req, res) => {
  try {
    let termsOfService = await TermsOfService.findOne({ active: true });
    if (!termsOfService) {
      termsOfService = new TermsOfService({ ...req.body, active: true });
    } else {
      Object.assign(termsOfService, req.body);
    }
    await termsOfService.save();
    res.json(termsOfService);
  } catch (error) {
    console.error('Error updating terms of service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// About Content Routes
app.get('/api/about-content', async (req, res) => {
  try {
    const aboutContent = await AboutContent.findOne({ active: true });
    if (!aboutContent) {
      return res.json({
        title: 'Your Trusted Career Partner',
        subtitle: 'About Us',
        description: 'Drave Digitals is more than just a consultancy. We\'re your comprehensive career protection and growth partner, combining job placement expertise with cybersecurity awareness and cutting-edge technology solutions.',
        values: [
          {
            title: 'Mission Driven',
            description: 'Empowering careers while protecting against digital threats with innovative solutions.',
            icon: 'Target'
          },
          {
            title: 'Client First',
            description: 'Your success is our priority. We provide personalized solutions for every client.',
            icon: 'Heart'
          },
          {
            title: 'Trust & Security',
            description: 'Building trust through transparency, security, and reliable service delivery.',
            icon: 'Shield'
          }
        ],
        commitments: [
          'Personalized career guidance for every individual',
          'Comprehensive fraud protection and awareness',
          'Cutting-edge technology solutions',
          '24/7 support and consultation',
          'Transparent pricing with no hidden costs',
          'Continuous skill development programs'
        ]
      });
    }
    res.json(aboutContent);
  } catch (error) {
    console.error('Error fetching about content:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/about-content', async (req, res) => {
  try {
    let aboutContent = await AboutContent.findOne({ active: true });
    if (!aboutContent) {
      aboutContent = new AboutContent({ ...req.body, active: true });
    } else {
      Object.assign(aboutContent, req.body);
    }
    await aboutContent.save();
    res.json(aboutContent);
  } catch (error) {
    console.error('Error updating about content:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.get('/api/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }
  
  // Set appropriate headers
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif'
  };
  
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  
  // Send file
  res.sendFile(filePath);
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/register-detailed', upload.single('resume'), async (req, res) => {
  try {
    const {
      name, email, password, phone, dateOfBirth, gender, address, city, state, pincode,
      currentPosition, experience, skills, education, expectedSalary, preferredLocation,
      jobType, workMode, interestedServices
    } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse interested services if it's a string
    let parsedServices = [];
    if (interestedServices) {
      try {
        parsedServices = typeof interestedServices === 'string' 
          ? JSON.parse(interestedServices) 
          : interestedServices;
      } catch (error) {
        parsedServices = [];
      }
    }

    // Create user with detailed information
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      address,
      city,
      state,
      pincode,
      currentPosition,
      experience,
      skills,
      education,
      expectedSalary,
      preferredLocation,
      jobType,
      workMode,
      interestedServices: parsedServices,
      profileCompleted: true
    };

    // Add resume path if uploaded
    if (req.file) {
      userData.resume = req.file.path;
    }

    const user = new User(userData);
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted
      }
    });
  } catch (error) {
    console.error('Detailed registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Contact Routes
app.post('/api/contact', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    
    // Send email notification (configure nodemailer)
    // ... email sending logic
    
    res.status(201).json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/contacts', authenticateAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Job Application Routes
app.post('/api/job-applications', upload.single('resume'), async (req, res) => {
  try {
    const applicationData = { ...req.body };
    if (req.file) {
      applicationData.resume = req.file.path;
    }
    const application = new JobApplication(applicationData);
    await application.save();
    res.status(201).json({ message: 'Job application submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/job-applications', authenticateAdmin, async (req, res) => {
  try {
    const applications = await JobApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fraud Case Routes
app.post('/api/fraud-cases', upload.array('evidence', 5), async (req, res) => {
  try {
    const fraudData = { ...req.body };
    if (req.files && req.files.length > 0) {
      fraudData.evidence = req.files.map(file => file.path);
    }
    const fraudCase = new FraudCase(fraudData);
    await fraudCase.save();
    res.status(201).json({ message: 'Fraud case reported successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/fraud-cases', authenticateAdmin, async (req, res) => {
  try {
    const cases = await FraudCase.find().sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Newsletter Routes
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    const existingSubscription = await Newsletter.findOne({ email });
    
    if (existingSubscription) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }
    
    const newsletter = new Newsletter({ email });
    await newsletter.save();
    res.status(201).json({ message: 'Successfully subscribed to newsletter' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Testimonial Routes
app.get('/api/testimonials', async (req, res) => {
  try {
    console.log('Fetching testimonials from database...');
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected');
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    const testimonials = await Testimonial.find({ approved: true }).sort({ createdAt: -1 });
    console.log('Found testimonials:', testimonials.length);
    console.log('Sample testimonial:', testimonials[0]);
    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/testimonials/admin', authenticateAdmin, async (req, res) => {
  try {
    console.log('Fetching admin testimonials from database...');
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    console.log('Found admin testimonials:', testimonials.length);
    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching admin testimonials:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/testimonials', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected');
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    console.log('Creating testimonial:', req.body);
    const testimonial = new Testimonial({
      ...req.body,
      approved: true // Auto-approve for now
    });
    await testimonial.save();
    console.log('Testimonial created successfully');
    res.status(201).json({ message: 'Testimonial created successfully' });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/testimonials/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, featured } = req.body;
    
    const updateData = {};
    if (typeof approved === 'boolean') updateData.approved = approved;
    if (typeof featured === 'boolean') updateData.featured = featured;
    
    await Testimonial.findByIdAndUpdate(id, updateData);
    res.json({ message: 'Testimonial updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/testimonials/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating testimonial:', id, req.body);
    const updateData = { ...req.body, updatedAt: new Date() };
    
    await Testimonial.findByIdAndUpdate(id, updateData);
    console.log('Testimonial updated successfully');
    res.json({ message: 'Testimonial updated successfully' });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
app.delete('/api/testimonials/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting testimonial:', id);
    await Testimonial.findByIdAndDelete(id);
    console.log('Testimonial deleted successfully');
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Service Routes
app.get('/api/services', async (req, res) => {
  try {
    console.log('Fetching services from database...');
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected');
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    const services = await Service.find({ active: true }).sort({ order: 1 });
    console.log('Found services:', services.length);
    console.log('Sample service:', services[0]);
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/services/admin', authenticateAdmin, async (req, res) => {
  try {
    console.log('Fetching admin services from database...');
    const services = await Service.find().sort({ order: 1 });
    console.log('Found admin services:', services.length);
    res.json(services);
  } catch (error) {
    console.error('Error fetching admin services:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected');
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    console.log('Creating service:', req.body);
    const service = new Service(req.body);
    await service.save();
    console.log('Service created successfully');
    res.status(201).json({ message: 'Service created successfully' });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating service:', id, req.body);
    const updateData = { ...req.body, updatedAt: new Date() };
    
    await Service.findByIdAndUpdate(id, updateData);
    console.log('Service updated successfully');
    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting service:', id);
    await Service.findByIdAndDelete(id);
    console.log('Service deleted successfully');
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Dashboard Stats
// Privacy Policy Routes
app.get('/api/privacy-policy', async (req, res) => {
  try {
    console.log('Fetching privacy policy from database...');
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected');
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    const privacyPolicy = await PrivacyPolicy.findOne({ active: true });
    console.log('Found privacy policy:', privacyPolicy);
    res.json(privacyPolicy || {});
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/privacy-policy', authenticateAdmin, async (req, res) => {
  try {
    console.log('Updating privacy policy:', req.body);
    
    // Find existing privacy policy or create new
    let privacyPolicy = await PrivacyPolicy.findOne({ active: true });
    
    if (privacyPolicy) {
      // Update existing
      Object.assign(privacyPolicy, req.body);
      privacyPolicy.lastUpdated = new Date();
      await privacyPolicy.save();
    } else {
      // Create new
      privacyPolicy = new PrivacyPolicy({ ...req.body, active: true });
      await privacyPolicy.save();
    }
    
    console.log('Privacy policy updated successfully');
    res.json({ message: 'Privacy policy updated successfully' });
  } catch (error) {
    console.error('Error updating privacy policy:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// About Content Routes
app.get('/api/about-content', async (req, res) => {
  try {
    console.log('Fetching about content from database...');
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected');
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    const aboutContent = await AboutContent.findOne({ active: true });
    console.log('Found about content:', aboutContent);
    res.json(aboutContent || {});
  } catch (error) {
    console.error('Error fetching about content:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/about-content', authenticateAdmin, async (req, res) => {
  try {
    console.log('Updating about content:', req.body);
    
    // Find existing content or create new
    let aboutContent = await AboutContent.findOne({ active: true });
    
    if (aboutContent) {
      // Update existing
      Object.assign(aboutContent, req.body);
      await aboutContent.save();
    } else {
      // Create new
      aboutContent = new AboutContent({ ...req.body, active: true });
      await aboutContent.save();
    }
    
    console.log('About content updated successfully');
    res.json({ message: 'About content updated successfully' });
  } catch (error) {
    console.error('Error updating about content:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/dashboard/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const totalApplications = await JobApplication.countDocuments();
    const totalFraudCases = await FraudCase.countDocuments();
    const placedJobs = await JobApplication.countDocuments({ status: 'placed' });
    const resolvedFraudCases = await FraudCase.countDocuments({ status: 'resolved' });
    const totalUsers = await User.countDocuments();
    const newsletterSubscribers = await Newsletter.countDocuments();
    const totalTestimonials = await Testimonial.countDocuments({ approved: true });

    res.json({
      totalContacts,
      totalApplications,
      totalFraudCases,
      placedJobs,
      resolvedFraudCases,
      totalUsers,
      newsletterSubscribers,
      totalTestimonials,
      successRate: totalApplications > 0 ? Math.round((placedJobs / totalApplications) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Website Content Management Routes
app.get('/api/website-content', async (req, res) => {
  try {
    const content = await WebsiteContent.find();
    const contentObj = {};
    content.forEach(item => {
      contentObj[item.section] = item.content;
    });
    res.json(contentObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/website-content/:section', authenticateAdmin, async (req, res) => {
  try {
    const { section } = req.params;
    const content = req.body;
    
    await WebsiteContent.findOneAndUpdate(
      { section },
      { 
        content, 
        lastUpdated: new Date(),
        updatedBy: req.user.userId 
      },
      { upsert: true, new: true }
    );
    
    res.json({ message: 'Content updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/website-content/:section/:itemId', authenticateAdmin, async (req, res) => {
  try {
    const { section, itemId } = req.params;
    
    const websiteContent = await WebsiteContent.findOne({ section });
    if (!websiteContent) {
      return res.status(404).json({ message: 'Content section not found' });
    }
    
    if (Array.isArray(websiteContent.content)) {
      websiteContent.content = websiteContent.content.filter(
        item => item.id.toString() !== itemId
      );
      await websiteContent.save();
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Status update routes
app.put('/api/contacts/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await Contact.findByIdAndUpdate(id, { status });
    res.json({ message: 'Contact status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/job-applications/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await JobApplication.findByIdAndUpdate(id, { status });
    res.json({ message: 'Job application status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/fraud-cases/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await FraudCase.findByIdAndUpdate(id, { status });
    res.json({ message: 'Fraud case status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User management routes
app.get('/api/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/careerguard'}`);
  
  // Wait for MongoDB connection before creating default data
  mongoose.connection.once('open', async () => {
    console.log('MongoDB connection established');
    await createDefaultAdmin();
    await createDefaultTestimonials();
    await createDefaultServices();
    await createDefaultContactInfo();
    await createDefaultDashboardStats();
    await createDefaultPrivacyPolicy();
    await createDefaultTermsOfService();
    // await createDefaultContent();
    console.log('Server initialization complete');
  });
  
  // Handle connection errors gracefully
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
});