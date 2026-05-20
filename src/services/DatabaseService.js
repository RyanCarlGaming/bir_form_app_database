// Database Service - SQLite Backend Integration
const API_BASE_URL = 'http://localhost:3001/api';

class DatabaseService {
  constructor() {
    this.isConnected = false;
  }

  // Initialize and check connection to backend
  async init() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        this.isConnected = true;
        console.log('✓ Connected to SQLite Backend');
        return true;
      }
    } catch (err) {
      console.error('Backend connection error:', err);
      this.isConnected = false;
      throw new Error('Failed to connect to SQLite backend. Make sure the server is running.', { cause: err });
    }
  }

  // Add new form to SQLite database
  async addForm(formData) {
    if (!this.isConnected) {
      throw new Error('Database service not connected');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add form');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error('Error adding form:', err);
      throw err;
    }
  }

  // Get all forms from SQLite database
  async getAllForms() {
    if (!this.isConnected) {
      throw new Error('Database service not connected');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/forms`);

      if (!response.ok) {
        throw new Error('Failed to fetch forms');
      }

      const forms = await response.json();
      return forms;
    } catch (err) {
      console.error('Error fetching forms:', err);
      throw err;
    }
  }

  // Get form by ID from SQLite database
  async getFormById(id) {
    if (!this.isConnected) {
      throw new Error('Database service not connected');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/forms/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch form');
      }

      const form = await response.json();
      return form;
    } catch (err) {
      console.error('Error fetching form by ID:', err);
      throw err;
    }
  }

  // Update form in SQLite database
  async updateForm(id, updates) {
    if (!this.isConnected) {
      throw new Error('Database service not connected');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/forms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Form not found');
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to update form');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error('Error updating form:', err);
      throw err;
    }
  }

  // Delete form from SQLite database
  async deleteForm(id) {
    if (!this.isConnected) {
      throw new Error('Database service not connected');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/forms/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Form not found');
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete form');
      }

      return true;
    } catch (err) {
      console.error('Error deleting form:', err);
      throw err;
    }
  }

  // Search forms in SQLite database
  async searchForms(query) {
    if (!this.isConnected) {
      throw new Error('Database service not connected');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/forms/search/${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error('Failed to search forms');
      }

      const forms = await response.json();
      return forms;
    } catch (err) {
      console.error('Error searching forms:', err);
      throw err;
    }
  }

  // Get forms by status from SQLite database
  async getFormsByStatus(status) {
    if (!this.isConnected) {
      throw new Error('Database service not connected');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/forms/status/${status}`);

      if (!response.ok) {
        throw new Error('Failed to fetch forms by status');
      }

      const forms = await response.json();
      return forms;
    } catch (err) {
      console.error('Error fetching forms by status:', err);
      throw err;
    }
  }

  // Get database connection status
  isReady() {
    return this.isConnected;
  }
}

export default DatabaseService;
