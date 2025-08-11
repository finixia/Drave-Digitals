import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Briefcase,
  Shield,
  Star,
  Settings,
  LogOut,
  Edit,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  FileText,
  Globe,
  Image,
  Type,
  Layout,
  Palette,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../utils/api';

interface DashboardStats {
  totalContacts: number;
  totalApplications: number;
  totalFraudCases: number;
  placedJobs: number;
  resolvedFraudCases: number;
  totalUsers: number;
  newsletterSubscribers: number;
  totalTestimonials: number;
  successRate: number;
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
  resume?: string;
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
  evidence?: string[];
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

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

interface WebsiteContent {
  hero: {
    title: string;
    subtitle: string;
    stats: Array<{ label: string; value: string }>;
  };
  services: Array<{
    id: string;
    title: string;
    description: string;
    features: string[];
  }>;
  about: {
    title: string;
    description: string;
    stats: Array<{ label: string; value: string; color: string }>;
    values: Array<{ title: string; description: string }>;
  };
  contact: {
    title: string;
    subtitle: string;
    contactInfo: Array<{ title: string; details: string[] }>;
  };
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [fraudCases, setFraudCases] = useState<FraudCase[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [contentForm, setContentForm] = useState<any>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        statsData,
        contactsData,
        applicationsData,
        fraudData,
        testimonialsData,
        usersData,
        contentData
      ] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getContacts(),
        apiService.getJobApplications(),
        apiService.getFraudCases(),
        apiService.getTestimonialsAdmin(),
        apiService.getUsers(),
        apiService.getWebsiteContent()
      ]);

      setStats(statsData);
      setContacts(contactsData);
      setJobApplications(applicationsData);
      setFraudCases(fraudData);
      setTestimonials(testimonialsData);
      setUsers(usersData);
      setWebsiteContent(contentData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStatusUpdate = async (type: string, id: string, status: string) => {
    try {
      switch (type) {
        case 'contact':
          await apiService.updateContactStatus(id, status);
          setContacts(prev => prev.map(item => 
            item._id === id ? { ...item, status } : item
          ));
          break;
        case 'job':
          await apiService.updateJobApplicationStatus(id, status);
          setJobApplications(prev => prev.map(item => 
            item._id === id ? { ...item, status } : item
          ));
          break;
        case 'fraud':
          await apiService.updateFraudCaseStatus(id, status);
          setFraudCases(prev => prev.map(item => 
            item._id === id ? { ...item, status } : item
          ));
          break;
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleTestimonialUpdate = async (id: string, approved: boolean, featured?: boolean) => {
    try {
      await apiService.updateTestimonialStatus(id, approved, featured);
      setTestimonials(prev => prev.map(item => 
        item._id === id ? { ...item, approved, ...(featured !== undefined && { featured }) } : item
      ));
    } catch (error) {
      console.error('Failed to update testimonial:', error);
    }
  };

  const handleContentEdit = (section: string) => {
    setEditingContent(section);
    if (websiteContent && websiteContent[section as keyof WebsiteContent]) {
      setContentForm({ ...websiteContent[section as keyof WebsiteContent] });
    }
  };

  const handleContentSave = async (section: string) => {
    try {
      setSaveStatus('saving');
      await apiService.updateWebsiteContent(section, contentForm);
      
      setWebsiteContent(prev => prev ? {
        ...prev,
        [section]: contentForm
      } : null);
      
      setEditingContent(null);
      setSaveStatus('success');
      setStatusMessage('Content updated successfully!');
      
      setTimeout(() => {
        setSaveStatus('idle');
        setStatusMessage('');
      }, 3000);
    } catch (error) {
      setSaveStatus('error');
      setStatusMessage('Failed to update content. Please try again.');
      console.error('Failed to save content:', error);
    }
  };

  const handleContentCancel = () => {
    setEditingContent(null);
    setContentForm({});
    setSaveStatus('idle');
    setStatusMessage('');
  };

  const addArrayItem = (field: string, newItem: any) => {
    setContentForm(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), newItem]
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setContentForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const updateArrayItem = (field: string, index: number, updatedItem: any) => {
    setContentForm(prev => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) => 
        i === index ? updatedItem : item
      )
    }));
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Refresh Data
        </motion.button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Contacts', value: stats.totalContacts, icon: MessageSquare, color: 'bg-blue-500' },
            { label: 'Job Applications', value: stats.totalApplications, icon: Briefcase, color: 'bg-green-500' },
            { label: 'Fraud Cases', value: stats.totalFraudCases, icon: Shield, color: 'bg-red-500' },
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-purple-500' },
            { label: 'Placed Jobs', value: stats.placedJobs, icon: CheckCircle, color: 'bg-emerald-500' },
            { label: 'Resolved Frauds', value: stats.resolvedFraudCases, icon: Shield, color: 'bg-orange-500' },
            { label: 'Newsletter Subscribers', value: stats.newsletterSubscribers, icon: Mail, color: 'bg-cyan-500' },
            { label: 'Success Rate', value: `${stats.successRate}%`, icon: BarChart3, color: 'bg-indigo-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContentManagement = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Website Content Management</h2>
        {saveStatus !== 'idle' && (
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            saveStatus === 'success' ? 'bg-green-100 text-green-700' :
            saveStatus === 'error' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {saveStatus === 'success' ? <CheckCircle size={16} /> :
             saveStatus === 'error' ? <AlertCircle size={16} /> :
             <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
            <span className="text-sm">{statusMessage || 'Saving...'}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hero Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Layout className="mr-2" size={20} />
              Hero Section
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleContentEdit('hero')}
              className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <Edit size={16} />
            </motion.button>
          </div>

          {editingContent === 'hero' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={contentForm.title || ''}
                  onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <textarea
                  value={contentForm.subtitle || ''}
                  onChange={(e) => setContentForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stats</label>
                {contentForm.stats?.map((stat: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Label"
                      value={stat.label || ''}
                      onChange={(e) => updateArrayItem('stats', index, { ...stat, label: e.target.value })}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={stat.value || ''}
                      onChange={(e) => updateArrayItem('stats', index, { ...stat, value: e.target.value })}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => removeArrayItem('stats', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('stats', { label: '', value: '' })}
                  className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                >
                  <Plus size={16} className="mr-1" /> Add Stat
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleContentSave('hero')}
                  disabled={saveStatus === 'saving'}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Save size={16} className="inline mr-1" /> Save
                </button>
                <button
                  onClick={handleContentCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X size={16} className="inline mr-1" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600"><strong>Title:</strong> {websiteContent?.hero?.title || 'Not set'}</p>
              <p className="text-gray-600"><strong>Subtitle:</strong> {websiteContent?.hero?.subtitle || 'Not set'}</p>
              <p className="text-gray-600"><strong>Stats:</strong> {websiteContent?.hero?.stats?.length || 0} items</p>
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="mr-2" size={20} />
              About Section
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleContentEdit('about')}
              className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <Edit size={16} />
            </motion.button>
          </div>

          {editingContent === 'about' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={contentForm.title || ''}
                  onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={contentForm.description || ''}
                  onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleContentSave('about')}
                  disabled={saveStatus === 'saving'}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Save size={16} className="inline mr-1" /> Save
                </button>
                <button
                  onClick={handleContentCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X size={16} className="inline mr-1" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600"><strong>Title:</strong> {websiteContent?.about?.title || 'Not set'}</p>
              <p className="text-gray-600"><strong>Description:</strong> {websiteContent?.about?.description || 'Not set'}</p>
            </div>
          )}
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Briefcase className="mr-2" size={20} />
              Services Section
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleContentEdit('services')}
              className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <Edit size={16} />
            </motion.button>
          </div>

          {editingContent === 'services' ? (
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto">
                {contentForm.map?.((service: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Service {index + 1}</h4>
                      <button
                        onClick={() => removeArrayItem('services', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Service Title"
                        value={service.title || ''}
                        onChange={(e) => updateArrayItem('services', index, { ...service, title: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                      <textarea
                        placeholder="Service Description"
                        value={service.description || ''}
                        onChange={(e) => updateArrayItem('services', index, { ...service, description: e.target.value })}
                        rows={2}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addArrayItem('services', { title: '', description: '', features: [] })}
                className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
              >
                <Plus size={16} className="mr-1" /> Add Service
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleContentSave('services')}
                  disabled={saveStatus === 'saving'}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Save size={16} className="inline mr-1" /> Save
                </button>
                <button
                  onClick={handleContentCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X size={16} className="inline mr-1" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600"><strong>Services:</strong> {websiteContent?.services?.length || 0} items</p>
              <div className="text-sm text-gray-500">
                {websiteContent?.services?.map((service, index) => (
                  <div key={index}>• {service.title}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <MessageSquare className="mr-2" size={20} />
              Contact Section
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleContentEdit('contact')}
              className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <Edit size={16} />
            </motion.button>
          </div>

          {editingContent === 'contact' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={contentForm.title || ''}
                  onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <textarea
                  value={contentForm.subtitle || ''}
                  onChange={(e) => setContentForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleContentSave('contact')}
                  disabled={saveStatus === 'saving'}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Save size={16} className="inline mr-1" /> Save
                </button>
                <button
                  onClick={handleContentCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X size={16} className="inline mr-1" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600"><strong>Title:</strong> {websiteContent?.contact?.title || 'Not set'}</p>
              <p className="text-gray-600"><strong>Subtitle:</strong> {websiteContent?.contact?.subtitle || 'Not set'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Contact Inquiries</h2>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={contact.status}
                      onChange={(e) => handleStatusUpdate('contact', contact._id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderJobApplications = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Job Applications</h2>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobApplications.map((application) => (
                <tr key={application._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{application.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.experience}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={application.status}
                      onChange={(e) => handleStatusUpdate('job', application._id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="applied">Applied</option>
                      <option value="screening">Screening</option>
                      <option value="interview">Interview</option>
                      <option value="placed">Placed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-2">View</button>
                    {application.resume && (
                      <a 
                        href={`http://localhost:5000/api/uploads/${application.resume.split('/').pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                      >
                        Resume
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTestimonials = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Testimonials Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial._id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{testimonial.avatar}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            
            <p className="text-gray-700 text-sm mb-4">"{testimonial.text}"</p>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs ${
                testimonial.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {testimonial.approved ? 'Approved' : 'Pending'}
              </span>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTestimonialUpdate(testimonial._id, !testimonial.approved)}
                  className={`p-1 rounded ${
                    testimonial.approved ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'
                  }`}
                >
                  {testimonial.approved ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => handleTestimonialUpdate(testimonial._id, testimonial.approved, !testimonial.featured)}
                  className={`p-1 rounded ${
                    testimonial.featured ? 'text-yellow-600 hover:bg-yellow-100' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Star size={16} className={testimonial.featured ? 'fill-current' : ''} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'content', label: 'Website Content', icon: Globe },
    { id: 'contacts', label: 'Contacts', icon: MessageSquare },
    { id: 'jobs', label: 'Job Applications', icon: Briefcase },
    { id: 'fraud', label: 'Fraud Cases', icon: Shield },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'users', label: 'Users', icon: Users },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
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
            {sidebarItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ x: 5 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-red-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">{user?.name?.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'content' && renderContentManagement()}
        {activeTab === 'contacts' && renderContacts()}
        {activeTab === 'jobs' && renderJobApplications()}
        {activeTab === 'testimonials' && renderTestimonials()}
      </div>
    </div>
  );
};

export default AdminDashboard;