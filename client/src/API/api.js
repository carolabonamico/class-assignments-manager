const APIURL = 'http://localhost:3001/api';

const API = {
  /**
   * Login a user with the provided credentials
   * @param {Object} credentials - The user's credentials containing email and password
   * @returns {Promise<Object>} - Returns the user data if login is successful
   * @throws {string} - Throws an error message if login fails
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
   * @return {Promise<Object>} - Returns the current user data if session is valid
   * @throws {Object} - Throws an error object if session is invalid or user is not logged in
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
   * @returns {Promise<null>} - Returns null if logout is successful
   * @throws {string} - Throws an error message if logout fails
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
   * @returns {Promise<Array>} - Returns an array of student objects
   * @throws {string} - Throws an error message if fetching students fails
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
   * Check if creating an assignment with selected students would violate pair constraints
   * @param {Array<number>} studentIds - Array of student IDs to check
   * @returns {Promise<Object>} - Returns {isValid: boolean, error?: string}
   * @throws {string} - Throws an error message if checking constraints fails
   */
  async checkPairConstraints(studentIds) {
    const response = await fetch(APIURL + '/assignments/check-constraints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ studentIds }),
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
   * @param {Object} assignmentData - The data for the new assignment
   * @returns {Promise<Object>} - Returns the created assignment object
   * @throws {string} - Throws an error message if creating the assignment fails
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
   * Update assignment answer (student only)
   * @param {string} assignmentId - The ID of the assignment to update
   * @param {string} answer - The answer to submit
   * @returns {Promise<Object>} - Returns the updated assignment object
   * @throws {string} - Throws an error message if updating the answer fails
   */
  async updateAssignmentAnswer(assignmentId, answer) {
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
      const errDetail = await response.json();
      throw errDetail;
    }
  },

  /**
   * Evaluate an assignment (teacher only)
   * @param {string} assignmentId - The ID of the assignment to evaluate
   * @param {number} score - The score to assign to the assignment
   * @returns {Promise<Object>} - Returns the updated assignment object with the evaluation score
   * @throws {string} - Throws an error message if evaluating the assignment fails
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
   * @returns {Promise<Array>} - Returns an array of statistics objects for each student
   * @throws {string} - Throws an error message if fetching statistics fails
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
  },

  /**
   * Get open assignments for the current user
   * @returns {Promise<Array>} - Returns an array of open assignment objects
   * @throws {string} - Throws an error message if fetching assignments fails
   */
  async getOpenAssignments() {
    const response = await fetch(APIURL + '/assignments/open', {
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
   * Get student scores and weighted average
   * @returns {Promise<Object>} - Returns object with assignments array and weightedAverage
   * @throws {string} - Throws an error message if fetching scores fails
   */
  async getStudentScores() {
    const response = await fetch(APIURL + '/students/scores', {
      credentials: 'include'
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      const errDetails = await response.text();
      throw errDetails;
    }
  },
};

export default API;
