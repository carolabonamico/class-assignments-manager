/* Data models for the Compiti (Assignment) management system */

/**
 * User model - represents both students and teachers
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
 */
export class Assignment {
  constructor(id, question, teacher_id, teacher_name, status = 'open', answer = null, score = null, groupSize = 0) {
    this.id = id;
    this.question = question;
    this.teacher_id = teacher_id;
    this.teacher_name = teacher_name;
    this.status = status; // 'open' or 'closed'
    this.answer = answer;
    this.score = score; // 0-30
    this.groupSize = groupSize; // Size of the group for this assignment
  }
}

/**
 * Student statistics model - used for teacher statistics page
 */
export class StudentStats {
  constructor(id, name, open_assignments = 0, closed_assignments = 0, weighted_average = null) {
    this.id = id;
    this.name = name;
    this.open_assignments = open_assignments;
    this.closed_assignments = closed_assignments;
    this.total_assignments = closed_assignments + open_assignments;
    this.weighted_average = weighted_average;
  }
}

/**
 * Group validation model - used for checking student pair constraints
 */
export class GroupValidation {
  constructor(isValid = true, error = null, conflictingPairs = []) {
    this.isValid = isValid;
    this.error = error;
    this.conflictingPairs = conflictingPairs;
  }
}
