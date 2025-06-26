const APIURL = 'http://localhost:3001/api';

const API = {
  /**
   * Login a user with the provided credentials
   */
  async login(credentials) {
    const response = await fetch(APIURL + '/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      const errDetails = await response.text();
      throw errDetails;
    }
  },

  /**
   * Get the current user session
   */
  async getCurrentUser() {
    const response = await fetch(APIURL + '/sessions/current', {
      credentials: 'include'
    });
    
    const user = await response.json();
    if (response.ok) {
      return user;
    } else {
      throw user; // an object with the error coming from the server
    }
  },

  /**
   * Logout the current user
   */
  async logout() {
    const response = await fetch(APIURL + '/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (response.ok) {
      return null;
    }
  },

  /**
   * Get the list of students
   */
  async getStudents() {
    const response = await fetch(APIURL + '/students', {
      credentials: 'include'
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      const errDetails = await response.text();
      throw errDetails;
    }
  },

  /**
   * Get assignments for the current user (teacher or student)
   */
  async getAssignments() {
    const response = await fetch(APIURL + '/assignments', {
      credentials: 'include'
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      const errDetails = await response.text();
      throw errDetails;
    }
  },

  /**
   * Get a specific assignment by ID
   */
  async getAssignment(id) {
    const response = await fetch(APIURL + `/assignments/${id}`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      const errDetails = await response.text();
      throw errDetails;
    }
  },

  /**
   * Create a new assignment (teacher only)
   */
  async createAssignment(assignmentData) {
    const response = await fetch(APIURL + '/assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(assignmentData),
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      const errDetails = await response.text();
      throw errDetails;
    }
  },

  /**
   * Submit an answer to an assignment (student only)
   */
  async submitAnswer(assignmentId, answer) {
    const response = await fetch(APIURL + `/assignments/${assignmentId}/answer`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ answer }),
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      const errDetails = await response.text();
      throw errDetails;
    }
  },

  /**
   * Evaluate an assignment (teacher only)
   */
  async evaluateAssignment(assignmentId, score) {
    const response = await fetch(APIURL + `/assignments/${assignmentId}/evaluate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ score }),
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      const errDetails = await response.text();
      throw errDetails;
    }
  },

  /**
   * Get statistics for the current user (teacher only)
   */
  async getStatistics() {
    const response = await fetch(APIURL + '/statistics', {
      credentials: 'include'
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      const errDetails = await response.text();
      throw errDetails;
    }
  }
};

export default API;
