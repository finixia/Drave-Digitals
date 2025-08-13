import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  Star,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Database,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: string;
  createdAt: string;
}

interface JobApplication {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  skills: string;
  status: string;
  createdAt: string;
}

interface FraudCase {
  _id: string;
  name: string;
  email: string;
  phone: string;
  fraudType: string;
  description: string;
  amount?: number;
  status: string;
  createdAt: string;
}

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  text: string;
  avatar: string;
  service: string;
  featured: boolean;
  approved: boolean;
  createdAt: string;
}

interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  active: boolean;
  order: number;
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Overview state
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalUsers: 0,
    jobApplications: 0,
    fraudCases: 0
  });

  // Data state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [fraudCases, setFraudCases] = useState<FraudCase[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Dashboard Stats state
  const [dashboardStats, setDashboardStats] = useState({
    happyClients: '5000+',
    successRate: '98%',
    growthRate: '150%',
    fraudCasesResolved: '1200+'
  });
  const [editingStats, setEditingStats] = useState<string | null>(null);
  const [tempStatValue, setTempStatValue] = useState('');

  // Contact Info state
  const [contactInfo, setContactInfo] = useState({
    phone: [''],
    email: [''],
    address: [''],
    workingHours: ['']
  });
  const [editingContactInfo, setEditingContactInfo] = useState(false);

  // Privacy Policy state
  const [privacyPolicy, setPrivacyPolicy] = useState({
    title: 'Privacy Policy',
    subtitle: 'How we protect your information',
    introduction: '',
    contactInfo: {
      email: 'privacy@dravedigitals.com',
      phone: '+91 9876543210',
      address: 'Mumbai, Maharashtra, India'
    }
  });
  const [editingPrivacyPolicy, setEditingPrivacyPolicy] = useState(false);

  // Terms of Service state
  const [termsOfService, setTermsOfService] = useState({
    title: 'Terms of Service',
    subtitle: 'Legal Terms and Conditions',
    introduction: '',
    contactInfo: {
      email: 'legal@dravedigitals.com',
      phone: '+91 9876543210',
      address: 'Mumbai, Maharashtra, India'
    }
  });
  const [editingTermsOfService, setEditingTermsOfService] = useState(false);

  // Form states
  const [editingTestimonial, setEditingTestimonial] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    role: '',
    company: '',
    rating: 5,
    text: '',
    avatar: '👤',
    service: '',
    featured: false,
    approved: true
  });
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    icon: 'Shield',
    color: 'from-red-500 to-red-600',
    features: [''],
    active: true,
    order: 0
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        contactsData,
        usersData,
        jobAppsData,
        fraudCasesData,
        testimonialsData,
        servicesData,
        dashboardStatsData,
        contactInfoData,
        privacyPolicyData,
        termsOfServiceData
      ] = await Promise.all([
        apiService.getContacts(),
        apiService.getUsers(),
        apiService.getJobApplications(),
        apiService.getFraudCases(),
        apiService.getTestimonialsAdmin(),
        apiService.getServicesAdmin(),
        apiService.getDashboardStatsData(),
        apiService.getContactInfo(),
        apiService.getPrivacyPolicy(),
        apiService.getTermsOfService()
      ]);

      setContacts(contactsData || []);
      setUsers(usersData || []);
      setJobApplications(jobAppsData || []);
      setFraudCases(fraudCasesData || []);
      setTestimonials(testimonialsData || []);
      setServices(servicesData || []);

      if (dashboardStatsData) {
        setDashboardStats(dashboardStatsData);
      }

      if (contactInfoData) {
        setContactInfo(contactInfoData);
      }

      if (privacyPolicyData) {
        setPrivacyPolicy(privacyPolicyData);
      }

      if (termsOfServiceData) {
        setTermsOfService(termsOfServiceData);
      }

      setStats({
        totalContacts: contactsData?.length || 0,
        totalUsers: usersData?.length || 0,
        jobApplications: jobAppsData?.length || 0,
        fraudCases: fraudCasesData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Dashboard Stats functions
  const handleEditStat = (statKey: string, currentValue: string) => {
    setEditingStats(statKey);
    setTempStatValue(currentValue);
  };

  const handleSaveStat = async () => {
    if (!editingStats) return;
    
    try {
      const updatedStats = { ...dashboardStats, [editingStats]: tempStatValue };
      await apiService.updateDashboardStats(updatedStats);
      setDashboardStats(updatedStats);
      setEditingStats(null);
      setTempStatValue('');
      showMessage('success', 'Dashboard stat updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to update dashboard stat');
    }
  };

  const handleCancelStatEdit = () => {
    setEditingStats(null);
    setTempStatValue('');
  };

  // Contact Info functions
  const handleSaveContactInfo = async () => {
    try {
      await apiService.updateContactInfo(contactInfo);
      setEditingContactInfo(false);
      showMessage('success', 'Contact information updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to update contact information');
    }
  };

  const addContactField = (field: keyof typeof contactInfo) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeContactField = (field: keyof typeof contactInfo, index: number) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateContactField = (field: keyof typeof contactInfo, index: number, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  // Privacy Policy functions
  const handleSavePrivacyPolicy = async () => {
    try {
      await apiService.updatePrivacyPolicy(privacyPolicy);
      setEditingPrivacyPolicy(false);
      showMessage('success', 'Privacy policy updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to update privacy policy');
    }
  };

  // Terms of Service functions
  const handleSaveTermsOfService = async () => {
    try {
      await apiService.updateTermsOfService(termsOfService);
      setEditingTermsOfService(false);
      showMessage('success', 'Terms of service updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to update terms of service');
    }
  };

  // Testimonial functions
  const handleCreateTestimonial = async () => {
    try {
      const response = await apiService.createTestimonial(newTestimonial);
      setTestimonials([...testimonials, response]);
      setNewTestimonial({
        name: '',
        role: '',
        company: '',
        rating: 5,
        text: '',
        avatar: '👤',
        service: '',
        featured: false,
        approved: true
      });
      showMessage('success', 'Testimonial created successfully');
    } catch (error) {
      showMessage('error', 'Failed to create testimonial');
    }
  };

  const handleUpdateTestimonial = async (id: string, data: any) => {
    try {
      await apiService.updateTestimonial(id, data);
      setTestimonials(testimonials.map(t => t._id === id ? { ...t, ...data } : t));
      setEditingTestimonial(null);
      showMessage('success', 'Testimonial updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to update testimonial');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      await apiService.deleteTestimonial(id);
      setTestimonials(testimonials.filter(t => t._id !== id));
      showMessage('success', 'Testimonial deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete testimonial');
    }
  };

  const handleToggleTestimonialStatus = async (id: string, approved: boolean, featured?: boolean) => {
    try {
      await apiService.updateTestimonialStatus(id, approved, featured);
      setTestimonials(testimonials.map(t => 
        t._id === id ? { ...t, approved, ...(featured !== undefined && { featured }) } : t
      ));
      showMessage('success', 'Testimonial status updated');
    } catch (error) {
      showMessage('error', 'Failed to update testimonial status');
    }
  };

  // Service functions
  const handleCreateService = async () => {
    try {
      const response = await apiService.createService(newService);
      setServices([...services, response]);
      setNewService({
        title: '',
        description: '',
        icon: 'Shield',
        color: 'from-red-500 to-red-600',
        features: [''],
        active: true,
        order: 0
      });
      showMessage('success', 'Service created successfully');
    } catch (error) {
      showMessage('error', 'Failed to create service');
    }
  };

  const handleUpdateService = async (id: string, data: any) => {
    try {
      await apiService.updateService(id, data);
      setServices(services.map(s => s._id === id ? { ...s, ...data } : s));
      setEditingService(null);
      showMessage('success', 'Service updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to update service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await apiService.deleteService(id);
      setServices(services.filter(s => s._id !== id));
      showMessage('success', 'Service deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete service');
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Contacts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalContacts}</p>
            </div>
            <Mail className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Job Applications</p>
              <p className="text-3xl font-bold text-gray-900">{stats.jobApplications}</p>
            </div>
            <FileText className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Fraud Cases</p>
              <p className="text-3xl font-bold text-gray-900">{stats.fraudCases}</p>
            </div>
            <Shield className="text-red-400" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className="text-purple-400" size={32} />
          </div>
        </div>
      </div>

      {/* Editable Dashboard Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Website Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(dashboardStats).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                {editingStats === key ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveStat}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={handleCancelStatEdit}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditStat(key, value)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit size={16} />
                  </button>
                )}
              </div>
              {editingStats === key ? (
                <input
                  type="text"
                  value={tempStatValue}
                  onChange={(e) => setTempStatValue(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-lg font-bold"
                  autoFocus
                />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Contact Information Management</h3>
        {editingContactInfo ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveContactInfo}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
            <button
              onClick={() => setEditingContactInfo(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingContactInfo(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <Edit size={16} />
            <span>Edit Contact Info</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Phone Numbers */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Phone Numbers</label>
          {contactInfo.phone.map((phone, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => updateContactField('phone', index, e.target.value)}
                disabled={!editingContactInfo}
                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
                placeholder="Phone number"
              />
              {editingContactInfo && (
                <button
                  onClick={() => removeContactField('phone', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {editingContactInfo && (
            <button
              onClick={() => addContactField('phone')}
              className="text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>Add Phone</span>
            </button>
          )}
        </div>

        {/* Email Addresses */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Email Addresses</label>
          {contactInfo.email.map((email, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => updateContactField('email', index, e.target.value)}
                disabled={!editingContactInfo}
                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
                placeholder="Email address"
              />
              {editingContactInfo && (
                <button
                  onClick={() => removeContactField('email', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {editingContactInfo && (
            <button
              onClick={() => addContactField('email')}
              className="text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>Add Email</span>
            </button>
          )}
        </div>

        {/* Addresses */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Addresses</label>
          {contactInfo.address.map((address, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={address}
                onChange={(e) => updateContactField('address', index, e.target.value)}
                disabled={!editingContactInfo}
                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
                placeholder="Address"
              />
              {editingContactInfo && (
                <button
                  onClick={() => removeContactField('address', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {editingContactInfo && (
            <button
              onClick={() => addContactField('address')}
              className="text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>Add Address</span>
            </button>
          )}
        </div>

        {/* Working Hours */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Working Hours</label>
          {contactInfo.workingHours.map((hours, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={hours}
                onChange={(e) => updateContactField('workingHours', index, e.target.value)}
                disabled={!editingContactInfo}
                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
                placeholder="Working hours"
              />
              {editingContactInfo && (
                <button
                  onClick={() => removeContactField('workingHours', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {editingContactInfo && (
            <button
              onClick={() => addContactField('workingHours')}
              className="text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>Add Working Hours</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderPrivacyPolicy = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Privacy Policy Management</h3>
        {editingPrivacyPolicy ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSavePrivacyPolicy}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
            <button
              onClick={() => setEditingPrivacyPolicy(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingPrivacyPolicy(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <Edit size={16} />
            <span>Edit Privacy Policy</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Title</label>
          <input
            type="text"
            value={privacyPolicy.title}
            onChange={(e) => setPrivacyPolicy(prev => ({ ...prev, title: e.target.value }))}
            disabled={!editingPrivacyPolicy}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Subtitle</label>
          <input
            type="text"
            value={privacyPolicy.subtitle}
            onChange={(e) => setPrivacyPolicy(prev => ({ ...prev, subtitle: e.target.value }))}
            disabled={!editingPrivacyPolicy}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Introduction</label>
          <textarea
            value={privacyPolicy.introduction}
            onChange={(e) => setPrivacyPolicy(prev => ({ ...prev, introduction: e.target.value }))}
            disabled={!editingPrivacyPolicy}
            rows={4}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Contact Email</label>
            <input
              type="email"
              value={privacyPolicy.contactInfo.email}
              onChange={(e) => setPrivacyPolicy(prev => ({ 
                ...prev, 
                contactInfo: { ...prev.contactInfo, email: e.target.value }
              }))}
              disabled={!editingPrivacyPolicy}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Contact Phone</label>
            <input
              type="text"
              value={privacyPolicy.contactInfo.phone}
              onChange={(e) => setPrivacyPolicy(prev => ({ 
                ...prev, 
                contactInfo: { ...prev.contactInfo, phone: e.target.value }
              }))}
              disabled={!editingPrivacyPolicy}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Contact Address</label>
            <input
              type="text"
              value={privacyPolicy.contactInfo.address}
              onChange={(e) => setPrivacyPolicy(prev => ({ 
                ...prev, 
                contactInfo: { ...prev.contactInfo, address: e.target.value }
              }))}
              disabled={!editingPrivacyPolicy}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTermsOfService = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Terms of Service Management</h3>
        {editingTermsOfService ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveTermsOfService}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
            <button
              onClick={() => setEditingTermsOfService(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingTermsOfService(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <Edit size={16} />
            <span>Edit Terms</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Title</label>
          <input
            type="text"
            value={termsOfService.title}
            onChange={(e) => setTermsOfService(prev => ({ ...prev, title: e.target.value }))}
            disabled={!editingTermsOfService}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Subtitle</label>
          <input
            type="text"
            value={termsOfService.subtitle}
            onChange={(e) => setTermsOfService(prev => ({ ...prev, subtitle: e.target.value }))}
            disabled={!editingTermsOfService}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Introduction</label>
          <textarea
            value={termsOfService.introduction}
            onChange={(e) => setTermsOfService(prev => ({ ...prev, introduction: e.target.value }))}
            disabled={!editingTermsOfService}
            rows={4}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Contact Email</label>
            <input
              type="email"
              value={termsOfService.contactInfo.email}
              onChange={(e) => setTermsOfService(prev => ({ 
                ...prev, 
                contactInfo: { ...prev.contactInfo, email: e.target.value }
              }))}
              disabled={!editingTermsOfService}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Contact Phone</label>
            <input
              type="text"
              value={termsOfService.contactInfo.phone}
              onChange={(e) => setTermsOfService(prev => ({ 
                ...prev, 
                contactInfo: { ...prev.contactInfo, phone: e.target.value }
              }))}
              disabled={!editingTermsOfService}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Contact Address</label>
            <input
              type="text"
              value={termsOfService.contactInfo.address}
              onChange={(e) => setTermsOfService(prev => ({ 
                ...prev, 
                contactInfo: { ...prev.contactInfo, address: e.target.value }
              }))}
              disabled={!editingTermsOfService}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTestimonials = () => (
    <div className="space-y-6">
      {/* Create New Testimonial */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Testimonial</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Name"
            value={newTestimonial.name}
            onChange={(e) => setNewTestimonial({...newTestimonial, name: e.target.value})}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Role"
            value={newTestimonial.role}
            onChange={(e) => setNewTestimonial({...newTestimonial, role: e.target.value})}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Company"
            value={newTestimonial.company}
            onChange={(e) => setNewTestimonial({...newTestimonial, company: e.target.value})}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2"
          />
          <select
            value={newTestimonial.service}
            onChange={(e) => setNewTestimonial({...newTestimonial, service: e.target.value})}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select Service</option>
            <option value="Job Consultancy">Job Consultancy</option>
            <option value="Fraud Assistance">Fraud Assistance</option>
            <option value="Web Development">Web Development</option>
            <option value="Digital Marketing">Digital Marketing</option>
            <option value="Training">Training</option>
          </select>
        </div>
        <textarea
          placeholder="Testimonial text"
          value={newTestimonial.text}
          onChange={(e) => setNewTestimonial({...newTestimonial, text: e.target.value})}
          rows={3}
          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 mb-4"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span>Rating:</span>
              {[1,2,3,4,5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setNewTestimonial({...newTestimonial, rating})}
                  className={`${rating <= newTestimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star size={20} fill="currentColor" />
                </button>
              ))}
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newTestimonial.featured}
                onChange={(e) => setNewTestimonial({...newTestimonial, featured: e.target.checked})}
              />
              <span>Featured</span>
            </label>
          </div>
          <button
            onClick={handleCreateTestimonial}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Manage Testimonials</h3>
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{testimonial.avatar}</span>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                    </div>
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">"{testimonial.text}"</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{testimonial.service}</span>
                    <span className={`px-2 py-1 rounded ${testimonial.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {testimonial.approved ? 'Approved' : 'Pending'}
                    </span>
                    {testimonial.featured && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Featured</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleTestimonialStatus(testimonial._id, !testimonial.approved)}
                    className={`px-3 py-1 rounded text-sm ${testimonial.approved ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'}`}
                  >
                    {testimonial.approved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleToggleTestimonialStatus(testimonial._id, testimonial.approved, !testimonial.featured)}
                    className={`px-3 py-1 rounded text-sm ${testimonial.featured ? 'bg-gray-600 text-white' : 'bg-purple-600 text-white'}`}
                  >
                    {testimonial.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    onClick={() => handleDeleteTestimonial(testimonial._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      {/* Create New Service */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Service</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Service Title"
            value={newService.title}
            onChange={(e) => setNewService({...newService, title: e.target.value})}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2"
          />
          <select
            value={newService.icon}
            onChange={(e) => setNewService({...newService, icon: e.target.value})}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="Shield">Shield</option>
            <option value="Briefcase">Briefcase</option>
            <option value="Code">Code</option>
            <option value="TrendingUp">TrendingUp</option>
            <option value="GraduationCap">GraduationCap</option>
          </select>
        </div>
        <textarea
          placeholder="Service Description"
          value={newService.description}
          onChange={(e) => setNewService({...newService, description: e.target.value})}
          rows={3}
          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 mb-4"
        />
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Features</label>
          {newService.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => {
                  const updatedFeatures = [...newService.features];
                  updatedFeatures[index] = e.target.value;
                  setNewService({...newService, features: updatedFeatures});
                }}
                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Feature description"
              />
              <button
                onClick={() => {
                  const updatedFeatures = newService.features.filter((_, i) => i !== index);
                  setNewService({...newService, features: updatedFeatures});
                }}
                className="text-red-600 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setNewService({...newService, features: [...newService.features, '']})}
            className="text-red-600 hover:text-red-700 flex items-center space-x-1"
          >
            <Plus size={16} />
            <span>Add Feature</span>
          </button>
        </div>
        <button
          onClick={handleCreateService}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Service</span>
        </button>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Manage Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-lg">{service.title}</h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">{service.description}</p>
              <div className="space-y-1 mb-3">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1 h-1 bg-red-400 rounded-full" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded ${service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {service.active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-gray-500">Order: {service.order}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'contacts':
        return <div>Contacts management coming soon...</div>;
      case 'users':
        return <div>Users management coming soon...</div>;
      case 'testimonials':
        return renderTestimonials();
      case 'services':
        return renderServices();
      case 'about':
        return <div>About Us management coming soon...</div>;
      case 'contact-info':
        return renderContactInfo();
      case 'dashboard-stats':
        return renderOverview();
      case 'privacy-policy':
        return renderPrivacyPolicy();
      case 'terms-of-service':
        return renderTermsOfService();
      default:
        return renderOverview();
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'contacts', label: 'Contacts', icon: Mail },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'services', label: 'Services', icon: Settings },
    { id: 'about', label: 'About Us', icon: FileText },
    { id: 'contact-info', label: 'Contact Info', icon: Phone },
    { id: 'dashboard-stats', label: 'Dashboard Stats', icon: Database },
    { id: 'privacy-policy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms-of-service', label: 'Terms of Service', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <img 
              src="/company logo.png" 
              alt="Drave Capitals Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600">Drave Digitals</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-red-50 text-red-600 border-r-2 border-red-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{message.text}</span>
            </motion.div>
          )}

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;