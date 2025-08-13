const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export interface JobApplicationData {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  skills: string;
  resume?: File;
}

export interface FraudCaseData {
  name: string;
  email: string;
  phone: string;
  fraudType: string;
  description: string;
  amount?: number;
  evidence?: File[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface DetailedRegistrationData {
  // Basic Info
  name: string;
  email: string;
  password: string;
  phone: string;
  
  // Personal Details
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  
  // Professional Details
  currentPosition?: string;
  experience: string;
  skills: string;
  education: string;
  expectedSalary?: string;
  preferredLocation?: string;
  
  // Preferences
  jobType?: string;
  workMode?: string;
  interestedServices: string[];
  
  // Documents
  resume?: File;
}

export interface TestimonialData {
  name: string;
  role: string;
  company: string;
  rating: number;
  text: string;
  avatar: string;
  service: string;
  featured?: boolean;
  approved?: boolean;
}

export interface ServiceData {
  title: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  active?: boolean;
  order?: number;
}
export interface AboutContentData {
  title: string;
  subtitle: string;
  description: string;
  values: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  commitments: string[];
  active?: boolean;
}

export interface PrivacyPolicyData {
  title: string;
  subtitle: string;
  introduction: string;
  sections: Array<{
    title: string;
    content: Array<{
      subtitle?: string;
      items: string[];
    }>;
  }>;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  active?: boolean;
}

export interface TermsOfServiceData {
  title: string;
  subtitle: string;
  introduction: string;
  sections: Array<{
    title: string;
    content: Array<{
      subtitle?: string;
      items: string[];
    }>;
  }>;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  active?: boolean;
}

export interface ContactInfoData {
  phone: string[];
  email: string[];
  address: string[];
  workingHours: string[];
  active?: boolean;
}

export interface DashboardStatsData {
  happyClients: string;
  successRate: string;
  growthRate: string;
  fraudCasesResolved: string;
  active?: boolean;
}

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(data: LoginData) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  }

  async register(data: RegisterData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  }

  async registerWithDetails(formData: FormData) {
    const response = await fetch(`${API_BASE_URL}/auth/register-detailed`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  }

  // Contact form
  async submitContact(data: ContactFormData) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Job applications
  async submitJobApplication(data: JobApplicationData) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return this.request('/job-applications', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  // Fraud cases
  async submitFraudCase(data: FraudCaseData) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'evidence' && Array.isArray(value)) {
        value.forEach((file) => formData.append('evidence', file));
      } else if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return this.request('/fraud-cases', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async subscribeNewsletter(email: string) {
    return this.request('/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Admin endpoints
  async getContacts() {
    return this.request('/contacts');
  }

  async getJobApplications() {
    return this.request('/job-applications');
  }

  async getFraudCases() {
    return this.request('/fraud-cases');
  }

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Website content management
  async updateWebsiteContent(section: string, data: any) {
    return this.request(`/website-content/${section}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWebsiteContent(section: string, itemId: string | number) {
    return this.request(`/website-content/${section}/${itemId}`, {
      method: 'DELETE',
    });
  }

  async getWebsiteContent() {
    return this.request('/website-content');
  }

  // User management
  async getUsers() {
    return this.request('/users');
  }

  async updateUserStatus(userId: string, status: string) {
    return this.request(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Testimonial endpoints
  async getTestimonials() {
    try {
      console.log('API: Fetching testimonials...');
      return await this.request('/testimonials');
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      throw error;
    }
  }

  async getTestimonialsAdmin() {
    console.log('API: Fetching admin testimonials...');
    return this.request('/testimonials/admin');
  }

  async createTestimonial(data: TestimonialData) {
    console.log('API: Creating testimonial...', data);
    return this.request('/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTestimonial(testimonialId: string, data: TestimonialData) {
    return this.request(`/testimonials/${testimonialId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  async updateTestimonialStatus(testimonialId: string, approved: boolean, featured?: boolean) {
    return this.request(`/testimonials/${testimonialId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approved, featured }),
    });
  }

  async deleteTestimonial(testimonialId: string) {
    return this.request(`/testimonials/${testimonialId}`, {
      method: 'DELETE',
    });
  }

  async submitTestimonial(data: TestimonialData) {
    return this.request('/testimonials', {
      method: 'POST',
      body: JSON.stringify({ ...data, approved: false }),
    });
  }

  // Service endpoints
  async getServices() {
    try {
      console.log('API: Fetching services...');
      return await this.request('/services');
    } catch (error) {
      console.error('Failed to fetch services:', error);
      throw error;
    }
  }

  async getServicesAdmin() {
    console.log('API: Fetching admin services...');
    return this.request('/services/admin');
  }

  async createService(data: ServiceData) {
    console.log('API: Creating service...', data);
    const response = await this.request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('Service creation response:', response);
    return response;
  }

  async updateService(serviceId: string, data: ServiceData) {
    return this.request(`/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteService(serviceId: string) {
    return this.request(`/services/${serviceId}`, {
      method: 'DELETE',
    });
  }
  // Contact status updates
  async updateContactStatus(contactId: string, status: string) {
    return this.request(`/contacts/${contactId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Job application status updates
  async updateJobApplicationStatus(applicationId: string, status: string) {
    return this.request(`/job-applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Fraud case status updates
  async updateFraudCaseStatus(caseId: string, status: string) {
    return this.request(`/fraud-cases/${caseId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // About Content endpoints
  async getAboutContent() {
    try {
      console.log('API: Fetching about content...');
      return await this.request('/about-content');
    } catch (error) {
      console.error('Failed to fetch about content:', error);
      throw error;
    }
  }

  async updateAboutContent(data: AboutContentData) {
    console.log('API: Updating about content...', data);
    return this.request('/about-content', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Contact Info endpoints
  async getContactInfo() {
    try {
      console.log('API: Fetching contact info...');
      return await this.request('/contact-info');
    } catch (error) {
      console.error('Failed to fetch contact info:', error);
      throw error;
    }
  }

  async updateContactInfo(data: ContactInfoData) {
    console.log('API: Updating contact info...', data);
    return this.request('/contact-info', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Dashboard Stats endpoints
  async getDashboardStatsData() {
    try {
      console.log('API: Fetching dashboard stats...');
      return await this.request('/dashboard-stats');
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }

  async updateDashboardStats(data: DashboardStatsData) {
    console.log('API: Updating dashboard stats...', data);
    return this.request('/dashboard-stats', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Privacy Policy endpoints
  async getPrivacyPolicy() {
    try {
      console.log('API: Fetching privacy policy...');
      return await this.request('/privacy-policy');
    } catch (error) {
      console.error('Failed to fetch privacy policy:', error);
      throw error;
    }
  }

  async updatePrivacyPolicy(data: PrivacyPolicyData) {
    console.log('API: Updating privacy policy...', data);
    return this.request('/privacy-policy', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Terms of Service endpoints
  async getTermsOfService() {
    try {
      console.log('API: Fetching terms of service...');
      return await this.request('/terms-of-service');
    } catch (error) {
      console.error('Failed to fetch terms of service:', error);
      throw error;
    }
  }

  async updateTermsOfService(data: TermsOfServiceData) {
    console.log('API: Updating terms of service...', data);
    return this.request('/terms-of-service', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();