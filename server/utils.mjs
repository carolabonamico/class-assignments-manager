/* Utility functions */

/**
 * Calculates the weighted average of a student
 * @param {Array} assignments Array of assignments with score and groupSize
 * @returns {number|null} Weighted average or null if no assignments evaluated
 * @description It is just necessary to pass as input an array of objects with 'score' and 'groupSize' properties.
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
 * @param {Array} studentIds Array of student IDs
 * @returns {Array} Array of pairs [id1, id2] where id1 < id2
 * @description This function generates all unique pairs of students from the provided IDs.
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

export {
  calculateWeightedAverage,
  generateStudentPairs
};