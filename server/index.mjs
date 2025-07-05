import express from 'express';
import cors from 'cors';
import { check, validationResult } from 'express-validator';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import * as dao from './dao.mjs';

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
      return cb(null, false, 'Invalid username or password');
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
 * @param {object} req The request object
 * @param {object} res The response object
 * @param {function} next The next middleware function
 * @returns {void} Calls next() if authenticated, otherwise sends a 401 response
 */
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
};

/**
 * Role-based authorization middleware
 * @param {string} requiredRole The role required to access the route
 * @returns {function} Middleware function
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ 
        error: `Access denied. ${requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)} role required.` 
      });
    }
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
 * @param {string} req.body.username The username of the user.
 * @param {string} req.body.password The password of the user.
 * @returns {object} The authenticated user object on success.
 * @returns {object} An error message on failure.
 */
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return res.status(500).json({ error: 'Internal server error during authentication' });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.login(user, (err) => {
      if (err)
        return res.status(500).json({ error: 'Internal server error during login' });
      return res.json(req.user);
    });
  })(req, res, next);
});

/**
 * Route to delete the current session (logout)
 * Ends the session and logs out the user.
 * @route DELETE /api/sessions/current
 * @returns {void} No content on success.
 * @returns {object} An error message if logout fails.
 */
app.delete('/api/sessions/current', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error during logout' });
    }
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
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

/** API ROUTES **/

/**
 * Route to list all students
 * Returns a list of all students in the system. Only accessible to teachers.
 * @route GET /api/students
 * @returns {Array} An array of student objects.
 * @returns {object} An error message if the user is not a teacher or if the request fails.
 */
app.get('/api/students', isTeacher, async (req, res) => {
  try {
    const students = await dao.listStudents();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error fetching students' });
  }
});

/**
 * Route to get open assignments for the current user
 * @route GET /api/assignments/open
 * @returns {Array} An array of open assignment objects.
 * @returns {object} An error message if the request fails.
 */
app.get('/api/assignments/open', isLoggedIn, async (req, res) => {
  try {
    const assignments = await dao.getOpenAssignments(req.user.id, req.user.role);
    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error fetching assignments' });
  }
});

/**
 * Route to check group constraints before assignment creation
 * Allows teachers to validate if a group of students can work together.
 * @route POST /api/groups/validate
 * @param {Array} req.body.studentIds An array of student IDs to check (2-6 students).
 * @returns {object} Validation result with isValid boolean and error message if applicable.
 */
app.post('/api/groups/validate', 
  isTeacher,
  [
    check('studentIds').isArray({ min: 2, max: 6 }).withMessage('Select between 2 and 6 students'),
  ],
  async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const validation = await dao.checkGroupConstraints(req.body.studentIds, req.user.id);
      res.status(200).json({
        isValid: validation.isValid,
        error: validation.error
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error validating group constraints' });
    }
  }
);

/**
 * Route to create a new assignment
 * Allows teachers to create a new assignment for a group of students.
 * @route POST /api/assignments
 * @param {string} req.body.question The question for the assignment.
 * @param {Array} req.body.studentIds An array of student IDs to assign the assignment to (2-6 students).
 * @returns {object} The created assignment object on success.
 * @returns {object} An error message if validation fails or if the user is not a teacher.
 */
app.post('/api/assignments', 
  isTeacher,
  [
    check('studentIds').isArray({ min: 2, max: 6 }).withMessage('Select 2-6 students'),
    check('question').custom(value => {
      if (!value || typeof value !== 'string' || value.trim().length === 0) {
        throw new Error('Question cannot be empty or contain only spaces');
      }
      return true;
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const validation = await dao.checkGroupConstraints(req.body.studentIds, req.user.id);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      const assignmentId = await dao.addAssignment(req.body.question, req.body.studentIds, req.user.id);
      res.status(201).json({ 
        id: assignmentId,
        message: "Assignment created successfully" 
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error creating assignment' });
    }
  }
);

/**
 * Route to update an assignment's answer
 * Allows students to submit their answers for an assignment.
 * @route PUT /api/assignments/:id/answer
 * @param {string} req.params.id The ID of the assignment.
 * @param {string} req.body.answer The answer to the assignment.
 * @returns {object} The updated assignment object on success.
 * @returns {object} An error message if validation fails or if the user is not a student.
 */
app.put('/api/assignments/:id/answer',
  isStudent,
  [
    check('answer').custom(value => {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('Answer cannot be empty or contain only spaces');
    }
    return true;
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const result = await dao.updateAssignmentAnswer(req.params.id, req.body.answer, req.user.id);
      if (result.error) {
        res.status(404).json({ error: result.error });
      } else {
        res.status(200).json({ 
          id: req.params.id, 
          message: "Answer submitted successfully" 
        });
      }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error updating assignment answer' });
    }
  }
);

/**
 * Route to evaluate an assignment
 * Allows teachers to evaluate a student's assignment and assign a score.
 * @route PUT /api/assignments/:id/evaluate
 * @param {string} req.params.id The ID of the assignment.
 * @param {number} req.body.score The score to assign (0-30).
 * @returns {object} The updated assignment object on success.
 * @returns {object} An error message if validation fails or if the user is not a teacher.
 */
app.put('/api/assignments/:id/evaluate',
  isTeacher,
  [
    check('score').isInt({ min: 0, max: 30 }).withMessage('Score must be a number between 0 and 30')
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const result = await dao.evaluateAssignment(req.params.id, req.body.score, req.user.id);
      if (result.error) {
        res.status(404).json({ error: result.error });
      } else {
        res.status(200).json({ 
          id: req.params.id, 
          score: req.body.score,
          status: "closed",
          message: "Assignment evaluated successfully" 
        });
      }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error evaluating assignment' });
    }
  }
);

/**
 * Route to get statistics for students
 * @route GET /api/students/statistics
 * @returns {Array} An array of student statistics objects.
 * @returns {object} An error message if the user is not a teacher or if the request fails.
 */
app.get('/api/students/statistics', isTeacher, async (req, res) => {
  try {
    const stats = await dao.getStudentStats(req.user.id);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error fetching statistics' });
  }
});

/**
 * Route to get closed assignments and their average score for the current student
 * @route GET /api/assignments/closed-with-average
 * @returns {object} Object containing assignments array and weightedAverage.
 * @returns {object} An error message if the request fails.
 */
app.get('/api/assignments/closed-with-average', isStudent, async (req, res) => {
  try {
    const result = await dao.getClosedAvg(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error fetching closed assignments' });
  }
});

// Activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});