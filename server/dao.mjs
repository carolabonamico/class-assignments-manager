/* Data Access Object (DAO) module for accessing Compiti system */

import sqlite from 'sqlite3';
import { User, Assignment, StudentStats, StudentPair, GroupValidation } from './CompitiModels.mjs';
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
        const user = {id: row.id, username: row.email, name: row.name, role: row.role};
        
        crypto.scrypt(password, row.salt, 16, function(err, hashedPassword) {
          if (err) reject(err);
          if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

/**
 * Get a user by ID
 * @param {number} id - The ID of the user
 * @returns {Promise<User|{error: string}>} - Returns a User object if found, or an error object if not found
 */
export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, name, email, role FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve({error: "Utente non trovato."});
      } else {
        resolve(new User(row.id, row.name, row.email, row.role));
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
 * List assignments for a user based on their role
 * @param {number} userId - The ID of the user
 * @param {string} userRole - The role of the user ('teacher' or 'student')
 * @returns {Promise<Assignment[]>} - Returns an array of Assignment objects
 */
export const listAssignments = (userId, userRole) => {
  return new Promise((resolve, reject) => {
    let sql;
    let params;
    
    if (userRole === 'teacher') {
      // Teachers see all assignments they created
      sql = `SELECT a.*, u.name as teacher_name 
             FROM assignments a 
             JOIN users u ON a.teacher_id = u.id 
             WHERE a.teacher_id = ? 
             ORDER BY a.created_date DESC`;
      params = [userId];
    } else {
      // Students see assignments they are part of
      sql = `SELECT a.*, u.name as teacher_name 
             FROM assignments a 
             JOIN users u ON a.teacher_id = u.id 
             JOIN assignment_groups ag ON a.id = ag.assignment_id 
             WHERE ag.student_id = ? 
             ORDER BY a.created_date DESC`;
      params = [userId];
    }
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const assignments = rows.map((a) => new Assignment(
          a.id, a.question, a.teacher_id, a.teacher_name, a.status, 
          a.created_date, a.answer, a.answer_date, a.score, a.evaluation_date
        ));
        resolve(assignments);
      }
    });
  });
};

/**
 * Get a specific assignment by ID
 * @param {number} id - The ID of the assignment
 * @param {number} userId - The ID of the user requesting the assignment
 * @param {string} userRole - The role of the user ('teacher' or 'student')
 * @returns {Promise<Assignment|{error: string}>} - Returns an Assignment object if found, or an error object if not found or unauthorized
 */
export const getAssignment = (id, userId, userRole) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT a.*, u.name as teacher_name 
                 FROM assignments a 
                 JOIN users u ON a.teacher_id = u.id 
                 WHERE a.id = ?`;
    
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve({error: "Compito non trovato."});
      } else {
        // Check authorization
        if (userRole === 'teacher' && row.teacher_id !== userId) {
          resolve({error: "Accesso non autorizzato a questo compito."});
          return;
        }
        
        const assignment = new Assignment(
          row.id, row.question, row.teacher_id, row.teacher_name, row.status,
          row.created_date, row.answer, row.answer_date, row.score, row.evaluation_date
        );
        
        // Get group members
        const groupSql = `SELECT u.id, u.name, u.email, u.role 
                          FROM users u 
                          JOIN assignment_groups ag ON u.id = ag.student_id 
                          WHERE ag.assignment_id = ? 
                          ORDER BY u.name`;
        
        db.all(groupSql, [id], (err, groupRows) => {
          if (err) {
            reject(err);
          } else {
            const groupMembers = groupRows.map((s) => new User(s.id, s.name, s.email, s.role));
            assignment.groupMembers = groupMembers;
            assignment.groupSize = groupMembers.length;
            
            // Check if student is authorized to see this assignment
            if (userRole === 'student') {
              const isInGroup = assignment.groupMembers.some(member => member.id === userId);
              if (!isInGroup) {
                resolve({error: "Accesso non autorizzato a questo compito."});
                return;
              }
            }
            
            resolve(assignment);
          }
        });
      }
    });
  });
};

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
    const createdDate = new Date().toISOString();
    const sql = 'INSERT INTO assignments(question, created_date, teacher_id, status) VALUES (?,?,?,?)';
    
    db.run(sql, [question, createdDate, teacherId, 'open'], function(err) {
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
        resolve({error: "Studente non autorizzato per questo compito."});
      } else if (row.status !== 'open') {
        resolve({error: "Il compito è chiuso, non è possibile modificare la risposta."});
      } else {
        const answerDate = new Date().toISOString();
        const sql = 'UPDATE assignments SET answer = ?, answer_date = ? WHERE id = ?';
        
        db.run(sql, [answer, answerDate, assignmentId], function(err) {
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
        resolve({error: "Compito non trovato."});
      } else if (row.teacher_id !== teacherId) {
        resolve({error: "Non autorizzato a valutare questo compito."});
      } else if (!row.answer) {
        resolve({error: "Impossibile valutare il compito senza risposta."});
      } else {
        const evaluationDate = new Date().toISOString();
        const sql = 'UPDATE assignments SET score = ?, evaluation_date = ?, status = ? WHERE id = ?';
        
        db.run(sql, [score, evaluationDate, 'closed', assignmentId], function(err) {
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
 * @param {string} orderBy - The field to order by ('name', 'total', 'average')
 * @returns {Promise<StudentStats[]>} - Returns an array of StudentStats objects
 * @throws {Error} - Throws an error if the query fails
 */
export const getStudentStats = (teacherId, orderBy = 'name') => {
  return new Promise((resolve, reject) => {
    let orderClause;
    switch(orderBy) {
      case 'total':
        orderClause = 'total_assignments DESC, u.name';
        break;
      case 'average':
        orderClause = 'weighted_average DESC, u.name';
        break;
      default:
        orderClause = 'u.name';
    }
    
    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
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
      GROUP BY u.id, u.name, u.email
      ORDER BY ${orderClause}`;
    
    db.all(sql, [teacherId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const stats = rows.map((row) => {
          let weightedAverage = null;
          
          if (row.scores_and_sizes) {
            const scoreData = row.scores_and_sizes.split(',').map(item => {
              const [score, size] = item.split('/');
              return { score: parseInt(score), groupSize: parseInt(size) };
            });
            weightedAverage = calculateWeightedAverage(scoreData);
          }
          
          return new StudentStats(
            row.id, 
            row.name, 
            row.email,
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

/**
 * Get personal statistics for a student
 * @param {number} studentId - The ID of the student
 * @returns {Promise<StudentStats>} - Returns a StudentStats object with personal statistics
 * @throws {Error} - Throws an error if the query fails
 */
export const getPersonalStats = (studentId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        COUNT(CASE WHEN a.status = 'open' THEN 1 END) as open_assignments,
        COUNT(CASE WHEN a.status = 'closed' THEN 1 END) as closed_assignments,
        COUNT(*) as total_assignments,
        GROUP_CONCAT(
          CASE WHEN a.status = 'closed' AND a.score IS NOT NULL 
          THEN a.score || '/' || group_sizes.size 
          END
        ) as scores_and_sizes
      FROM assignment_groups ag
      JOIN assignments a ON ag.assignment_id = a.id
      JOIN (
        SELECT assignment_id, COUNT(*) as size
        FROM assignment_groups
        GROUP BY assignment_id
      ) group_sizes ON a.id = group_sizes.assignment_id
      WHERE ag.student_id = ?`;
    
    db.get(sql, [studentId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        let weightedAverage = null;
        
        if (row.scores_and_sizes) {
          const scoreData = row.scores_and_sizes.split(',').map(item => {
            const [score, size] = item.split('/');
            return { score: parseInt(score), groupSize: parseInt(size) };
          });
          weightedAverage = calculateWeightedAverage(scoreData);
        }
        
        resolve({
          openAssignments: row.open_assignments,
          closedAssignments: row.closed_assignments,
          totalAssignments: row.total_assignments,
          weightedAverage: weightedAverage
        });
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
    
    // This query checks for pairs of students who have collaborated on assignments
    // and counts how many times they have worked together.
    // It returns pairs that have collaborated 2 or more times.
    // `VALUES` is used to insert multiple pairs in a single query.
    // Note: The pairs are ordered to ensure consistent ordering (smaller ID first).
    // This prevents duplicate pairs like (2, 1) and (1, 2) from being counted separately.
    
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
            `Alcuni studenti hanno già lavorato insieme in 2 o più compiti: ${conflictingPairs.map(p => `${p.student1} and ${p.student2} (${p.count} volte)`).join(', ')}`,
            conflictingPairs
          ));
        } else {
          resolve(new GroupValidation(true));
        }
      }
    });
  });
};
