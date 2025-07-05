const APIURL = 'http://localhost:3001/api';

const API = {
  /**
   * Login a user with the provided credentials
   * @param {Object} credentials The user's credentials containing email and password
   * @returns {Promise<Object>} Returns the user data if login is successful
   * @throws {Error} Throws an error if login fails
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
      const user = await response.json();
      return user;
    } else {
      if (response.status === 401) {
        throw new Error("Invalid credentials");
      } else if (response.status === 500) {
        throw new Error("Internal server error");
      } else {
        const errDetails = await response.text();
        throw new Error(errDetails || "Login failed");
      }
    }
  },

  /**
   * Get the current user session
   * @return {Promise<Object>} Returns the current user data if session is valid
   * @throws {Error} Throws an error if session is invalid or user is not logged in
   */
  async getCurrentUser() {
    const response = await fetch(APIURL + '/sessions/current', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const user = await response.json();
      return user;
    } else {
      if (response.status === 401) {
        throw new Error("Not authenticated");
      } else if (response.status === 500) {
        throw new Error("Internal server error");
      } else {
        const errDetails = await response.text();
        throw new Error(errDetails || "Failed to fetch current user");
      }
    }
  },

  /**
   * Logout the current user
   * @returns {Promise<null>} Returns null if logout is successful
   * @throws {Error} Throws an error if logout fails
   */
  async logout() {
    const response = await fetch(APIURL + '/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (response.ok) {
      return null;
    } else {
      if (response.status === 500) {
        throw new Error("Internal server error");
      } else {
        const errDetails = await response.text();
        throw new Error(errDetails || "Logout failed");
      }
    }
  },

  /**
   * Get the list of students
   * @returns {Promise<Array>} Returns an array of student objects
   * @throws {Error} Throws an error if fetching students fails
   */
  async getStudents() {
    const response = await fetch(APIURL + '/students', {
      credentials: 'include'
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      if (response.status === 401) {
        throw new Error("Not authenticated");
      } else if (response.status === 500) {
        throw new Error("Internal server error");
      } else {
        const errDetails = await response.text();
        throw new Error(errDetails || "Failed to fetch students");
      }
    }
  },

  /**
   * Check if creating an assignment with selected students would violate pair constraints
   * @param {Array<number>} studentIds Array of student IDs to check
   * @returns {Promise<Object>} Returns {isValid: boolean, error?: string}
   * @throws {Error} Throws an error if checking constraints fails
   */
  async checkPairConstraints(studentIds) {
    const response = await fetch(APIURL + '/groups/validate', {
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
      if (response.status === 401) {
        throw new Error("Not authenticated");
      } else if (response.status === 403) {
        throw new Error("Not a teacher");
      } else if (response.status === 422) {
        const errMessage = await response.json();
        throw new Error(`${errMessage.errors[0].msg} for ${errMessage.errors[0].path}.`);
      } else if (response.status === 500) {
        throw new Error("Internal server error");
      } else {
        const errDetails = await response.text();
        throw new Error(errDetails || "Failed to check pair constraints");
      }
    }
  },

  /**
   * Create a new assignment (teacher only)
   * @param {Object} assignmentData The data for the new assignment
   * @returns {Promise<Object>} Returns the created assignment object
   * @throws {Error} Throws an error if creating the assignment fails
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
      if (response.status === 401) {
        throw new Error("Not authenticated");
      } else if (response.status === 403) {
        throw new Error("Not a teacher");
      } else if (response.status === 400) {
        const errData = await response.json();
        throw new Error(errData.error || "Missing/invalid fields or validation errors (2-6 students required)");
      } else if (response.status === 422) {
        const errMessage = await response.json();
        throw new Error(`${errMessage.errors[0].msg} for ${errMessage.errors[0].path}.`);
      } else if (response.status === 500) {
        throw new Error("Internal server error");
      } else {
        const errMessage = await response.json();
        throw new Error(errMessage.error || "Failed to create assignment");
      }
    }
  },

  /**
   * Update assignment answer (student only)
   * @param {string} assignmentId The ID of the assignment to update
   * @param {string} answer The answer to submit
   * @returns {Promise<Object>} Returns the updated assignment object
   * @throws {Error} Throws an error if updating the answer fails
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
      if (response.status === 401) {
        throw new Error("Not authenticated");
      } else if (response.status === 403) {
        throw new Error("Not a student");
      } else if (response.status === 404) {
        const errData = await response.json();
        throw new Error(errData.error || "Student not assigned to this assignment/assignment not open");
      } else if (response.status === 422) {
        const errMessage = await response.json();
        throw new Error(`${errMessage.errors[0].msg} for ${errMessage.errors[0].path}.`);
      } else if (response.status === 500) {
        throw new Error("Internal server error");
      } else {
        const errMessage = await response.json();
        throw new Error(errMessage.error || "Failed to update assignment answer");
      }
    }
  },

  /**
   * Evaluate an assignment (teacher only)
   * @param {string} assignmentId The ID of the assignment to evaluate
   * @param {number} score The score to assign to the assignment
   * @returns {Promise<Object>} Returns the updated assignment object with the evaluation score
   * @throws {Error} Throws an error if evaluating the assignment fails
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
      if (response.status === 401) {
        throw new Error("Not authenticated");
      } else if (response.status === 403) {
        throw new Error("Not a teacher");
      } else if (response.status === 404) {
        const errData = await response.json();
        throw new Error(errData.error);
      } else if (response.status === 422) {
        const errMessage = await response.json();
        throw new Error(`${errMessage.errors[0].msg} for ${errMessage.errors[0].path}.`);
      } else if (response.status === 500) {
        throw new Error("Internal server error");
      } else {
        const errMessage = await response.json();
        throw new Error(errMessage.error || "Failed to evaluate assignment");
      }
    }
  },

  /**
   * Get statistics for the current user (teacher only)
   * @returns {Promise<Array>} Returns an array of statistics objects for each student
   * @throws {Error} Throws an error if fetching statistics fails
   */
  async getStatistics() {
    const response = await fetch(APIURL + '/students/statistics', {
      credentials: 'include'
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      if (response.status === 401) {
        throw new Error("Not authenticated");
      } else if (response.status === 403) {
        throw new Error("Not a teacher");
      } else if (response.status === 500) {
        throw new Error("Internal server error");
      } else {
        const errDetails = await response.text();
        throw new Error(errDetails || "Failed to fetch statistics");
      }
    }
  },

  /**
   * Get open assignments for the current user
   * @returns {Promise<Array>} Returns an array of open assignment objects
   * @throws {Error} Throws an error if fetching assignments fails
   */
  async getOpenAssignments() {
    const response = await fetch(APIURL + '/assignments/open', {
      credentials: 'include'
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      if (response.status === 401) {
        throw new Error("Not authenticated");
      } else if (response.status === 500) {
        throw new Error("Internal server error");
      } else {
        const errDetails = await response.text();
        throw new Error(errDetails || "Failed to fetch open assignments");
      }
    }
  },

  /**
   * Get closed assignments and their average score for the current student
   * @returns {Promise<Object>} Returns object with assignments array and weightedAverage
   * @throws {Error} Throws an error if fetching scores fails
   */
  async getClosedAvg() {
    const response = await fetch(APIURL + '/assignments/closed-with-average', {
      credentials: 'include'
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      if (response.status === 401) {
        throw new Error("Not authenticated");
      } else if (response.status === 403) {
        throw new Error("Not a student");
      } else if (response.status === 500) {
        throw new Error("Internal server error");
      } else {
        const errMessage = await response.json();
        throw new Error(errMessage.error || "Failed to fetch closed assignments");
      }
    }
  },
};

export default API;
