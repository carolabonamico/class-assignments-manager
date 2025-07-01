/**
 * Data models for the Compiti (Assignment) management system
 */

/**
 * User model - represents both students and teachers
 * @property {number} id - Unique identifier for the user
 * @property {string} name - Name of the user
 * @property {string} email - Email address of the user
 * @property {string} role - Role of the user, either 'student' or 'teacher'
 */
export class User {
  constructor(id, name, email, role) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role; // 'student' or 'teacher'
  }
}

/**
 * Assignment model - represents a homework/assignment
 * @property {number} id - Unique identifier for the assignment
 * @property {string} question - The question or task of the assignment
 * @property {Date} created_date - Date when the assignment was created
 * @property {number} teacher_id - ID of the teacher who created the assignment
 * @property {string} status - Status of the assignment, either 'open' or 'closed'
 * @property {string|null} answer - Answer provided by the student, null if not answered
 * @property {number|null} score - Score given to the assignment, null if not evaluated
 */
export class Assignment {
  constructor(id, question, teacher_id, teacher_name, status = 'open', created_date = null, answer = null, score = null) {
    this.id = id;
    this.question = question;
    this.teacher_id = teacher_id;
    this.teacher_name = teacher_name;
    this.status = status; // 'open' or 'closed'
    this.created_date = created_date;
    this.answer = answer;
    this.score = score; // 0-30
    
    // Additional properties populated by joins
    this.groupMembers = []; // Array of student objects who are part of the group for this assignment
    this.groupSize = 0;
  }
}

/**
 * Student statistics model - used for teacher dashboard
 * @property {number} id - Unique identifier for the student
 * @property {string} name - Name of the student
 * @property {string} email - Email address of the student
 * @property {number} open_assignments - Number of open assignments for the student
 * @property {number} closed_assignments - Number of closed assignments for the student
 * @property {number} total_assignments - Total number of assignments (open + closed)
 * @property {number|null} weighted_average - Weighted average of scores for the student, null if no scores available
 */
export class StudentStats {
  constructor(id, name, email, open_assignments = 0, closed_assignments = 0, weighted_average = null) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.open_assignments = open_assignments;
    this.closed_assignments = closed_assignments;
    this.total_assignments = open_assignments + closed_assignments;
    this.weighted_average = weighted_average; // Weighted average of scores
  }
}

/**
 * StudentPair model - used for checking group constraints
 * @property {number} student1_id - ID of the first student in the pair
 * @property {number} student2_id - ID of the second student in the pair
 * @property {number} count - Number of times these students have worked together
 */
export class StudentPair {
  constructor(student1_id, student2_id, count = 0) {
    this.student1_id = Math.min(student1_id, student2_id); // Ensure consistent ordering
    this.student2_id = Math.max(student1_id, student2_id);
    this.count = count; // Number of times these students worked together
  }
}

/**
 * GroupValidation model - used for validating group formation
 * @property {boolean} isValid - Indicates if the group is valid according to constraints
 * @property {string|null} error - Error message if the group is invalid, null if valid
 * @property {StudentPair[]} conflictingPairs - Array of StudentPair objects that violate constraints
 */
export class GroupValidation {
  constructor(isValid = true, error = null, conflictingPairs = []) {
    this.isValid = isValid;
    this.error = error;
    this.conflictingPairs = conflictingPairs; // Array of StudentPair objects that violate constraints
  }
}
