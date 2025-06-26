const APIURL = 'http://localhost:3001/api';

/**
 * Utility function to handle JSON responses from the server
 * @param {Promise<Response>} httpResponsePromise - The promise that resolves to the HTTP response
 * @returns {Promise<object>} Returns a promise that resolves to the JSON object from the response
 * @throws {Error} If the response cannot be parsed or if the request fails
 */
function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is {error: <message>} 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {
         // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
         response.json()
            .then( json => resolve(json) )
            .catch( () => reject({ error: "Cannot parse server response" }))
        } else {
          // analyzing the cause of error
          response.json()
            .then(obj => {
              // Add status code to error object for better error handling
              obj.status = response.status;
              reject(obj);
            }) // error msg in the response body
            .catch(() => reject({ 
              error: "Cannot parse server response", 
              status: response.status 
            })) // something else
        }
      })
      .catch(() => 
        reject({ error: "Cannot communicate"  })
      ) // connection error
  });
}

const API = {
  
  /**
   * Login a user with the provided credentials
   * @param {object} credentials - The login credentials.
   * @param {string} credentials.username - The username of the user.
   * @param {string} credentials.password - The password of the user.
   * @returns {Promise<object>} Returns a promise that resolves to the user object on successful login.
   * @throws {Error} If the request fails or if the credentials are invalid.
   */
  async login(credentials) {
    return getJson(
      fetch(APIURL + '/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      })
    );
  },

  /**
   * Logout the current user
   * @returns {Promise<void>} Returns a promise that resolves when the user is logged out.
   * @throws {Error} If the request fails or if the user is not authenticated.
   */
  async logout() {
    const response = await fetch(APIURL + '/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Logout failed: ${response.status}`);
    }
    
    // Logout endpoint returns empty response, no JSON parsing needed
    return;
  },

  /**
   * Get the current user session
   * @returns {Promise<object>} Returns a promise that resolves to the current user object.
   * @throws {Error} If the request fails or if the user is not authenticated.
   */
  async getCurrentUser() {
    return getJson(
      fetch(APIURL + '/sessions/current', {
        credentials: 'include'
      })
    );
  },

  /**
   * Get the list of students
   * @returns {Promise<Array>} Returns a promise that resolves to an array of students.
   * @throws {Error} If the request fails or if the user is not authenticated.
   */
  async getStudents() {
    return getJson(
      fetch(APIURL + '/students', {
        credentials: 'include'
      })
    );
  },

  /**
   * Get assignments for the current user (teacher or student)
   * @returns {Promise<Array>} Returns a promise that resolves to an array of assignments.
   * @throws {Error} If the request fails or if the user is not authenticated.
   */
  async getAssignments() {
    return getJson(
      fetch(APIURL + '/assignments', {
        credentials: 'include'
      })
    );
  },

  /**
   * Get a specific assignment by ID
   * @param {string} id - The ID of the assignment to retrieve.
   * @returns {Promise<object>} Returns a promise that resolves to the assignment object.
   * @throws {Error} If the request fails or if the assignment is not found.
   */
  async getAssignment(id) {
    return getJson(
      fetch(APIURL + `/assignments/${id}`, {
        credentials: 'include'
      })
    );
  },

  /**
   * Create a new assignment (teacher only)
   * @param {object} assignmentData - The data for the new assignment.
   * @param {string} assignmentData.question - The question for the assignment.
   * @param {Array<string>} assignmentData.studentIds - Array of student IDs to assign the assignment to (2-6 students).
   * @returns {Promise<object>} Returns a promise that resolves to the created assignment object.
   * @throws {Error} If the request fails or if validation fails.
   */
  async createAssignment(assignmentData) {
    return getJson(
      fetch(APIURL + '/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(assignmentData),
      })
    );
  },

  /**
   * Submit an answer to an assignment (student only)
   * @param {string} assignmentId - The ID of the assignment to answer.
   * @param {string} answer - The answer to submit.
   * @returns {Promise<object>} Returns a promise that resolves to the updated assignment object.
   */
  async submitAnswer(assignmentId, answer) {
    return getJson(
      fetch(APIURL + `/assignments/${assignmentId}/answer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ answer }),
      })
    );
  },

  /**
   * Evaluate an assignment (teacher only)
   * @param {string} assignmentId - The ID of the assignment to evaluate.
   * @param {number} score - The score to assign to the assignment.
   * @returns {Promise<object>} Returns a promise that resolves to the updated assignment object.
   */
  async evaluateAssignment(assignmentId, score) {
    return getJson(
      fetch(APIURL + `/assignments/${assignmentId}/evaluate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ score }),
      })
    );
  },

  /**
   * Get statistics for the current user (teacher only)
   * @returns {Promise<object>} Returns a promise that resolves to the statistics object.
   */
  async getStatistics() {
    return getJson(
      fetch(APIURL + '/statistics', {
        credentials: 'include'
      })
    );
  }
};

export default API;
