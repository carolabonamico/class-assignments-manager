/* Utility functions for the task management system */

/**
 * Validates if a group of students meets the constraints
 * @param {Array} studentIds - Array of student IDs
 * @returns {Object} Validation result with details
 */
function validateGroupSize(studentIds) {
  if (!Array.isArray(studentIds)) {
    return { isValid: false, message: 'StudentIds deve essere un array' };
  }
  
  if (studentIds.length < 2) {
    return { isValid: false, message: 'Il gruppo deve avere almeno 2 studenti' };
  }
  
  if (studentIds.length > 6) {
    return { isValid: false, message: 'Il gruppo può avere un massimo di 6 studenti' };
  }
  
  // Check for duplicates
  const uniqueIds = [...new Set(studentIds)];
  if (uniqueIds.length !== studentIds.length) {
    return { isValid: false, message: 'Ci sono studenti duplicati nel gruppo' };
  }
  
  return { isValid: true, message: 'Dimensione del gruppo valida' };
}

/**
 * Validates the score of an assignment
 * @param {number} score - Score to validate
 * @returns {Object} Validation result
 */
function validateScore(score) {
  if (typeof score !== 'number') {
    return { isValid: false, message: 'Il punteggio deve essere un numero' };
  }
  
  if (score < 0 || score > 30) {
    return { isValid: false, message: 'Il punteggio deve essere compreso tra 0 e 30' };
  }
  
  if (!Number.isInteger(score)) {
    return { isValid: false, message: 'Il punteggio deve essere un numero intero' };
  }
  
  return { isValid: true, message: 'Punteggio valido' };
}

/**
 * Validates the text of a question
 * @param {string} question - Question text
 * @returns {Object} Validation result
 */
function validateQuestion(question) {
  if (typeof question !== 'string') {
    return { isValid: false, message: 'Il testo della domanda deve essere una stringa' };
  }
  
  if (question.trim().length === 0) {
    return { isValid: false, message: 'Il testo della domanda non può essere vuoto' };
  }
  
  if (question.trim().length < 10) {
    return { isValid: false, message: 'Il testo della domanda deve avere almeno 10 caratteri' };
  }
  
  if (question.length > 2000) {
    return { isValid: false, message: 'Il testo della domanda può avere un massimo di 2000 caratteri' };
  }

  return { isValid: true, message: 'Domanda valida' };
}

/**
 * Validates the text of an answer
 * @param {string} answer - Answer text
 * @returns {Object} Validation result
 */
function validateAnswer(answer) {
  if (typeof answer !== 'string') {
    return { isValid: false, message: 'Il testo della risposta deve essere una stringa' };
  }
  
  if (answer.trim().length === 0) {
    return { isValid: false, message: 'Il testo della risposta non può essere vuoto' };
  }
  
  if (answer.trim().length < 5) {
    return { isValid: false, message: 'Il testo della risposta deve avere almeno 5 caratteri' };
  }
  
  if (answer.length > 5000) {
    return { isValid: false, message: 'Il testo della risposta può avere un massimo di 5000 caratteri' };
  }

  return { isValid: true, message: 'Risposta valida' };
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