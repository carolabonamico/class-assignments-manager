/* Data Access Object (DAO) module for accessing Compiti system */

import sqlite from 'sqlite3';
import { User, Assignment, StudentStats, GroupValidation } from './CompitiModels.mjs';
import { calculateWeightedAverage, generateStudentPairs } from './utils.mjs';
import crypto from 'crypto';

// Open the database
const db = new sqlite.Database('compiti.sqlite', (err) => {
  if (err) throw err;
});

/** USER AUTHENTICATION **/

/**
 * Get a user by email and password
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @returns {Promise<User|boolean>} - Returns a User object if authentication is successful, false otherwise
 */
export const getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve(false); 
      }
      else {
        crypto.scrypt(password, row.salt, 16, function(err, hashedPassword) {
          if (err) reject(err);
          if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
            resolve(false);
          else {
            const user = new User(row.id, row.name, row.email, row.role);
            resolve(user);
          }
        });
      }
    });
  });
};

/** STUDENTS **/

/**
 * List all students in the system
 * @returns {Promise<User[]>} - Returns an array of User objects representing students
 */
export const listStudents = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, name, email, role FROM users WHERE role = "student" ORDER BY name';
    db.all(sql, [], (err, rows) => {
      if (err)
        reject(err);
      else {
        const students = rows.map((s) => new User(s.id, s.name, s.email, s.role));
        resolve(students);
      }
    });
  });
};

/** ASSIGNMENTS **/

/**
 * Add a new assignment
 * @param {string} question - The question or task of the assignment
 * @param {number[]} studentIds - Array of student IDs to assign the homework to
 * @param {number} teacherId - The ID of the teacher creating the assignment
 * @returns {Promise<number>} - Returns the ID of the created assignment
 * @throws {Error} - Throws an error if the assignment creation fails
 */
export const addAssignment = (question, studentIds, teacherId) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO assignments(question, teacher_id, status) VALUES (?,?,?)';
    
    db.run(sql, [question, teacherId, 'open'], function(err) {
      if (err) {
        reject(err);
      } else {
        const assignmentId = this.lastID;
        
        // Add group members
        const groupValues = studentIds.map(studentId => `(${assignmentId}, ${studentId})`).join(',');
        const groupSql = `INSERT INTO assignment_groups(assignment_id, student_id) VALUES ${groupValues}`;
        
        db.run(groupSql, [], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(assignmentId);
          }
        });
      }
    });
  });
};

/**
 * Update an assignment's question
 * @param {number} assignmentId - The ID of the assignment to update
 * @param {string} question - The new question for the assignment
 * @param {number} teacherId - The ID of the teacher updating the assignment
 * @returns {Promise<number>} - Returns the number of rows updated
 * @throws {Error} - Throws an error if the update fails or if the teacher is not authorized
 */
export const updateAssignmentAnswer = (assignmentId, answer, studentId) => {
  return new Promise((resolve, reject) => {
    // First check if student is in the group and assignment is open
    const checkSql = `SELECT a.status 
                      FROM assignments a 
                      JOIN assignment_groups ag ON a.id = ag.assignment_id 
                      WHERE a.id = ? AND ag.student_id = ?`;
    
    db.get(checkSql, [assignmentId, studentId], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve({error: "Student not assigned to this assignment."});
      } else if (row.status !== 'open') {
        resolve({error: "Assignment is closed, cannot modify the answer."});
      } else {
        const sql = 'UPDATE assignments SET answer = ? WHERE id = ?';
        
        db.run(sql, [answer, assignmentId], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        });
      }
    });
  });
};

/**
 * Evaluate an assignment
 * @param {number} assignmentId - The ID of the assignment to evaluate
 * @param {number} score - The score to assign to the assignment (0-30)
 * @param {number} teacherId - The ID of the teacher evaluating the assignment
 * @returns {Promise<number|{error: string}>} - Returns the number of rows updated, or an error object if evaluation fails
 * @throws {Error} - Throws an error if the evaluation fails or if the teacher is not authorized
 */
export const evaluateAssignment = (assignmentId, score, teacherId) => {
  return new Promise((resolve, reject) => {
    // Check if teacher owns this assignment and it has an answer
    const checkSql = 'SELECT teacher_id, answer FROM assignments WHERE id = ?';
    
    db.get(checkSql, [assignmentId], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve({error: "Assignment not found."});
      } else if (row.teacher_id !== teacherId) {
        resolve({error: "Not authorized to evaluate this assignment."});
      } else if (!row.answer) {
        resolve({error: "Cannot evaluate assignment without answer."});
      } else {
        const sql = 'UPDATE assignments SET score = ?, status = ? WHERE id = ?';
        
        db.run(sql, [score, 'closed', assignmentId], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        });
      }
    });
  });
};

/** STATISTICS **/

/**
 * Get statistics for all students of a teacher
 * @param {number} teacherId - The ID of the teacher
 * @returns {Promise<StudentStats[]>} - Returns an array of StudentStats objects
 * @throws {Error} - Throws an error if the query fails
 */
export const getStudentStats = (teacherId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        u.id,
        u.name,
        COUNT(CASE WHEN a.status = 'open' THEN 1 END) as open_assignments,
        COUNT(CASE WHEN a.status = 'closed' THEN 1 END) as closed_assignments,
        GROUP_CONCAT(
          CASE WHEN a.status = 'closed' AND a.score IS NOT NULL 
          THEN a.score || '/' || group_sizes.size 
          END
        ) as scores_and_sizes
      FROM users u
      LEFT JOIN assignment_groups ag ON u.id = ag.student_id
      LEFT JOIN assignments a ON ag.assignment_id = a.id AND a.teacher_id = ?
      LEFT JOIN (
        SELECT assignment_id, COUNT(*) as size
        FROM assignment_groups
        GROUP BY assignment_id
      ) group_sizes ON a.id = group_sizes.assignment_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.name, u.email`;
    
    // GROUP_CONCAT will return a string like "28/2,25/3,30/2" for scores_and_sizes
    
    db.all(sql, [teacherId], (err, rows) => {
      if (err) {
        reject(err);
      } else {

        const stats = rows.map((row) => {
          let weightedAverage = null;
          
          if (row.scores_and_sizes) {
            const data = row.scores_and_sizes.split(',').map(item => {
              const [score, size] = item.split('/');
              return { score: parseInt(score), groupSize: parseInt(size) };
            });
            // data is now an array of objects like [{ score: 28, groupSize: 2 }, ...]
            weightedAverage = calculateWeightedAverage(data);
          }
          
          return new StudentStats(
            row.id, 
            row.name,
            row.open_assignments || 0,
            row.closed_assignments || 0,
            weightedAverage
          );
        });

        resolve(stats);
      }
    });
  });
};

/** GROUP VALIDATION **/

/**
 * Check if a group of students can be formed based on collaboration constraints
 * @param {number[]} studentIds - Array of student IDs to check
 * @param {number} teacherId - The ID of the teacher
 * @returns {Promise<GroupValidation>} - Returns a GroupValidation object indicating if the group is valid or not
 */
export const checkGroupConstraints = (studentIds, teacherId) => {
  return new Promise((resolve, reject) => {
    const pairs = generateStudentPairs(studentIds);
    
    if (pairs.length === 0) {
      resolve(new GroupValidation(true));
      return;
    }
    
    const placeholders = pairs.map(() => '(?,?)').join(',');  // Create placeholders for the pairs in the SQL query
    const sql = `
      SELECT 
        ag1.student_id as student1_id,
        ag2.student_id as student2_id,
        u1.name as student1_name,
        u2.name as student2_name,
        COUNT(*) as collaborations_count
      FROM assignment_groups ag1
      JOIN assignment_groups ag2 ON ag1.assignment_id = ag2.assignment_id
      JOIN assignments a ON ag1.assignment_id = a.id
      JOIN users u1 ON ag1.student_id = u1.id
      JOIN users u2 ON ag2.student_id = u2.id
      WHERE (ag1.student_id, ag2.student_id) IN (VALUES ${placeholders})
      AND ag1.student_id < ag2.student_id
      AND a.teacher_id = ?
      GROUP BY ag1.student_id, ag2.student_id, u1.name, u2.name
      HAVING COUNT(*) >= 2`;
    
    const params = [...pairs.flat(), teacherId];  // Flatten the pairs and add teacherId for the query
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        if (rows.length > 0) {
          const conflictingPairs = rows.map(row => ({
            student1: row.student1_name,
            student2: row.student2_name,
            count: row.collaborations_count
          }));
          
          resolve(new GroupValidation(
            false, 
            `Some students have already worked together in 2 or more assignments: ${conflictingPairs.map(p => `${p.student1} and ${p.student2} (${p.count} times)`).join(', ')}`,
            conflictingPairs
          ));
        } else {
          resolve(new GroupValidation(true));
        }
      }
    });
  });
};

/**
 * Get open assignments for a user (both students and teachers)
 * @param {number} userId - The ID of the user
 * @param {string} userRole - The role of the user ('teacher' or 'student')
 * @returns {Promise<Assignment[]>} - Returns an array of open Assignment objects
 */
export const getOpenAssignments = (userId, userRole) => {
  return new Promise((resolve, reject) => {
    let sql;
    let params;
    
    if (userRole === 'teacher') {
      // Teachers see all open assignments they created
      // TODO: the theacher name would not be used in this query, so it can be removed
      // but it is useful for the client to display the teacher's name
      sql = `SELECT a.*, u.name as teacher_name 
             FROM assignments a 
             JOIN users u ON a.teacher_id = u.id 
             WHERE a.teacher_id = ? AND a.status = 'open'
             ORDER BY a.id DESC`;
      params = [userId];
    } else {
      // Students see open assignments they are part of
      sql = `SELECT a.*, u.name as teacher_name 
             FROM assignments a 
             JOIN users u ON a.teacher_id = u.id 
             JOIN assignment_groups ag ON a.id = ag.assignment_id 
             WHERE ag.student_id = ? AND a.status = 'open'
             ORDER BY a.id DESC`;
      params = [userId];
    }
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const assignments = rows.map((a) => new Assignment(
          a.id, a.question, a.teacher_id, a.teacher_name, a.status, a.answer, a.score
        ));
        // At this point, groupSize is not needed for open assignments
        resolve(assignments);
      }
    });
  });
};

/**
 * Get closed assignments and their average score for a student
 * @param {number} studentId - The ID of the student
 * @returns {Promise<{assignments: Assignment[], weightedAverage: number|null}>} - Returns assignments and weighted average
 */
export const getClosedAvg = (studentId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        a.*,
        u.name as teacher_name,
        group_sizes.size as group_size
      FROM assignments a 
      JOIN users u ON a.teacher_id = u.id 
      JOIN assignment_groups ag ON a.id = ag.assignment_id 
      LEFT JOIN (
        SELECT assignment_id, COUNT(*) as size
        FROM assignment_groups
        GROUP BY assignment_id
      ) group_sizes ON a.id = group_sizes.assignment_id
      WHERE ag.student_id = ? AND a.status = 'closed' AND a.score IS NOT NULL
      ORDER BY a.id DESC`;
    
    db.all(sql, [studentId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const assignments = rows.map((a) => {
          return new Assignment(
            a.id, a.question, a.teacher_id, a.teacher_name, a.status, 
            a.answer, a.score, a.group_size
          );
        });
        
        const weightedAverage = calculateWeightedAverage(assignments);
        
        resolve({
          assignments,
          weightedAverage
        });
      }
    });
  });
};
