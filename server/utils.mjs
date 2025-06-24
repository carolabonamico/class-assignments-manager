/* Utility functions for the task management system */

/**
 * Validates if a group of students meets the constraints
 * @param {Array} studentIds - Array of student IDs
 * @returns {Object} Validation result with details
 */
function validateGroupSize(studentIds) {
  if (!Array.isArray(studentIds)) {
    return { isValid: false, message: 'StudentIds must be an array' };
  }
  
  if (studentIds.length < 2) {
    return { isValid: false, message: 'The group must have at least 2 students' };
  }
  
  if (studentIds.length > 6) {
    return { isValid: false, message: 'The group can have a maximum of 6 students' };
  }
  
  // Check for duplicates
  const uniqueIds = [...new Set(studentIds)];
  if (uniqueIds.length !== studentIds.length) {
    return { isValid: false, message: 'There are duplicate students in the group' };
  }
  
  return { isValid: true, message: 'Valid group size' };
}

/**
 * Validates the score of an assignment
 * @param {number} score - Score to validate
 * @returns {Object} Validation result
 */
function validateScore(score) {
  if (typeof score !== 'number') {
    return { isValid: false, message: 'The score must be a number' };
  }
  
  if (score < 0 || score > 30) {
    return { isValid: false, message: 'The score must be between 0 and 30' };
  }
  
  if (!Number.isInteger(score)) {
    return { isValid: false, message: 'The score must be an integer' };
  }
  
  return { isValid: true, message: 'Valid score' };
}

/**
 * Validates the text of a question
 * @param {string} question - Question text
 * @returns {Object} Validation result
 */
function validateQuestion(question) {
  if (typeof question !== 'string') {
    return { isValid: false, message: 'The question must be a string' };
  }
  
  if (question.trim().length === 0) {
    return { isValid: false, message: 'The question cannot be empty' };
  }
  
  if (question.trim().length < 10) {
    return { isValid: false, message: 'The question must have at least 10 characters' };
  }
  
  if (question.length > 2000) {
    return { isValid: false, message: 'The question can have a maximum of 2000 characters' };
  }
  
  return { isValid: true, message: 'Valid question' };
}

/**
 * Validates the text of an answer
 * @param {string} answer - Answer text
 * @returns {Object} Validation result
 */
function validateAnswer(answer) {
  if (typeof answer !== 'string') {
    return { isValid: false, message: 'The answer must be a string' };
  }
  
  if (answer.trim().length === 0) {
    return { isValid: false, message: 'The answer cannot be empty' };
  }
  
  if (answer.trim().length < 5) {
    return { isValid: false, message: 'The answer must have at least 5 characters' };
  }
  
  if (answer.length > 5000) {
    return { isValid: false, message: 'The answer can have a maximum of 5000 characters' };
  }
  
  return { isValid: true, message: 'Valid answer' };
}

/**
 * Calculates the weighted average of a student
 * @param {Array} assignments - Array of assignments with score and groupSize
 * @returns {number|null} Weighted average or null if no assignments evaluated
 */
function calculateWeightedAverage(assignments) {
  const evaluatedAssignments = assignments.filter(a => a.score !== null && a.groupSize > 0);
  
  if (evaluatedAssignments.length === 0) {
    return null;
  }
  
  const weightedSum = evaluatedAssignments.reduce((sum, assignment) => {
    const weight = 1 / assignment.groupSize; // Weight inversely proportional to group size
    return sum + (assignment.score * weight);
  }, 0);
  
  const totalWeight = evaluatedAssignments.reduce((sum, assignment) => {
    return sum + (1 / assignment.groupSize);
  }, 0);
  
  return Math.round((weightedSum / totalWeight) * 100) / 100; // Round to 2 decimal places
}

/**
 * Generates student pairs from an array of IDs
 * @param {Array} studentIds - Array of student IDs
 * @returns {Array} Array of pairs [id1, id2] where id1 < id2
 */
function generateStudentPairs(studentIds) {
  const pairs = [];
  
  for (let i = 0; i < studentIds.length; i++) {
    for (let j = i + 1; j < studentIds.length; j++) {
      const id1 = Math.min(studentIds[i], studentIds[j]);
      const id2 = Math.max(studentIds[i], studentIds[j]);
      pairs.push([id1, id2]);
    }
  }
  
  return pairs;
}

/**
 * Formats a date for the database
 * @param {Date} date - Date to format
 * @returns {string} Date in ISO format
 */
function formatDateForDB(date = new Date()) {
  return date.toISOString();
}

export {
  validateGroupSize,
  validateScore,
  validateQuestion,
  validateAnswer,
  calculateWeightedAverage,
  generateStudentPairs,
  formatDateForDB
};