// Imports
import express from 'express';
import cors from 'cors';
import { check, validationResult } from 'express-validator';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import * as dao from './dao.mjs';
import { isValidString } from './utils.mjs';

// Init express
const app = new express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Authentication setup
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  try {
    const user = await dao.getUser(username, password);
    if (!user)
      return cb(null, false, 'Incorrect username or password');
    return cb(null, user);
  } catch (err) {
    return cb(err);
  }
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

app.use(session({
  secret: 'compiti-secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.authenticate('session'));

/**
 * Middleware to check if the user is logged in
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {function} next - The next middleware function
 * @returns {void} - Calls next() if authenticated, otherwise sends a 401 response
 */
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Non autenticato' });
};

/**
 * Role-based authorization middleware
 * @param {string} requiredRole - The role required to access the route
 * @returns {function} - Middleware function
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Non autenticato' });
    }
    if (!req.user || req.user.role !== requiredRole) {
      const roleCapitalized = requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1);
      return res.status(403).json({ 
        error: `Accesso negato. ${roleCapitalized} ruolo richiesto.` 
      });
    }
    // User is authenticated and has the required role
    // next() allows the request to proceed
    return next();
  };
};

// Middleware for specific roles
const isTeacher = requireRole('teacher');
const isStudent = requireRole('student');

/** AUTHENTICATION ROUTES **/

/**
 * Route to create a new session (login)
 * Uses Passport.js for local authentication.
 * @route POST /api/sessions
 * @param {string} req.body.username - The username of the user.
 * @param {string} req.body.password - The password of the user.
 * @returns {object} The authenticated user object on success.
 * @returns {object} An error message on failure.
 */
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      return res.status(401).json(info);
    }
    req.login(user, (err) => {
      if (err)
        return next(err);
      return res.json(req.user);
    });
  })(req, res, next);
});

/**
 * Route to delete the current session (logout)
 * Ends the session and logs out the user.
 * @route DELETE /api/sessions/current
 * @returns {void} No content on success.
 * @returns {object} An error message if not authenticated.
 */
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

/**
 * Route to get the current session (current user)
 * Returns the currently authenticated user.
 * @route GET /api/sessions/current
 * @returns {object} The current user object if authenticated.
 * @returns {object} An error message if not authenticated.
 */
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Non autenticato' });
});

/** API ROUTES **/

/**
 * Route to list all students
 * Returns a list of all students in the system.
 * @route GET /api/students
 * @returns {Array} An array of student objects.
 * @returns {object} An error message if the request fails.
 */
app.get('/api/students', isLoggedIn, async (req, res) => {
  try {
    const students = await dao.listStudents();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Route to list all assignments
 * Returns a list of all assignments for the current user.
 * @route GET /api/assignments
 * @param {string} req.user.id - The ID of the current user.
 * @param {string} req.user.role - The role of the current user (teacher or student).
 * @returns {Array} An array of assignment objects.
 * @returns {object} An error message if the request fails.
 */
app.get('/api/assignments', isLoggedIn, async (req, res) => {
  try {
    const assignments = await dao.listAssignments(req.user.id, req.user.role);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Route to get a specific assignment by ID
 * Returns the details of a specific assignment.
 * @route GET /api/assignments/:id
 * @param {string} req.params.id - The ID of the assignment.
 * @returns {object} The assignment object if found.
 * @returns {object} An error message if the assignment is not found.
 */
app.get('/api/assignments/:id', isLoggedIn, async (req, res) => {
  try {
    const assignment = await dao.getAssignment(req.params.id, req.user.id, req.user.role);
    if (assignment.error) {
      res.status(404).json(assignment);
    } else {
      res.json(assignment);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Route to create a new assignment
 * Allows teachers to create a new assignment for a group of students.
 * @route POST /api/assignments
 * @param {string} req.body.question - The question for the assignment.
 * @param {Array} req.body.studentIds - An array of student IDs to assign the assignment to (2-6 students).
 * @returns {object} The created assignment object on success.
 * @returns {object} An error message if validation fails or if the user is not a teacher.
 */
app.post('/api/assignments', 
  isTeacher,
  [
    check('question').isLength({ min: 1 }).withMessage('Question is required'),
    check('studentIds').isArray({ min: 2, max: 6 }).withMessage('Select 2-6 students')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const validation = await dao.checkGroupConstraints(req.body.studentIds, req.user.id);
      if (!validation.isValid) {
        return res.status(400).json(validation);
      }

      const assignmentId = await dao.addAssignment(req.body.question, req.body.studentIds, req.user.id);
      res.status(201).json({ id: assignmentId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * Route to update an assignment's answer
 * Allows students to submit their answers for an assignment.
 * @route PUT /api/assignments/:id/answer
 * @param {string} req.params.id - The ID of the assignment.
 * @param {string} req.body.answer - The answer to the assignment.
 * @returns {object} The updated assignment object on success.
 * @returns {object} An error message if validation fails or if the user is not a student.
 */
app.put('/api/assignments/:id/answer',
  isStudent,
  [check('answer').custom(value => {
    if (!isValidString(value)) {
      throw new Error('La risposta non può essere vuota o contenere solo spazi');
    }
    return true;
  })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await dao.updateAssignmentAnswer(req.params.id, req.body.answer, req.user.id);
      if (result.error) {
        res.status(400).json(result);
      } else {
        res.json(result);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * Route to evaluate an assignment
 * Allows teachers to evaluate a student's assignment and assign a score.
 * @route PUT /api/assignments/:id/evaluate
 * @param {string} req.params.id - The ID of the assignment.
 * @param {number} req.body.score - The score to assign (0-30).
 * @returns {object} The updated assignment object on success.
 * @returns {object} An error message if validation fails or if the user is not a teacher.
 */
app.put('/api/assignments/:id/evaluate',
  isTeacher,
  [check('score').isInt({ min: 0, max: 30 }).withMessage('Score must be between 0 and 30')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await dao.evaluateAssignment(req.params.id, req.body.score, req.user.id);
      if (result.error) {
        res.status(400).json(result);
      } else {
        res.json(result);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * Route to get statistics for students
 * Returns statistics about students' assignments, including open and closed assignments, total assignments, and weighted average.
 * @route GET /api/statistics
 * @returns {Array} An array of student statistics objects.
 * @returns {object} An error message if the user is not a teacher or if the request fails.
 */
app.get('/api/statistics', isTeacher, async (req, res) => {
  try {
    const stats = await dao.getStudentStats(req.user.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});