[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/F9jR7G97)

# Exam #2: "Compiti"

## Student: s339129 Bonamico Carola

---

## How to Download and Run

To download and run this project, follow these exact steps in a clean directory:

```sh
git clone ...yourCloneURL...
cd ...yourProjectDir...
git pull origin main  # just in case the default branch is not main
git checkout -b evaluation final # check out the version tagged with 'final' and create a new branch 'evaluation'
(cd server ; npm install; nodemon index.mjs)
(cd client ; npm install; npm run dev)
```

- Make sure all required packages are installed via `npm install` in both `server` and `client` folders.
- If you have installed some packages globally, they may not appear as required dependencies. Always check with a clean install.

---

## React Client Application Routes

- `/login` — Authentication page (**public**)
- `/` — Dashboard homepage with assignments overview and role-based navigation (teacher/student) (**protected**)
- `/assignments` — Assignment list filtered by user role (**protected**)
- `/assignments/:id` — Assignment detail, answer submission (student) or evaluation (teacher) (**protected**)
- `/assignments/new` — Create new assignment (teachers only) (**protected, teachers only**)
- `/statistics` — Student statistics and analytics (teachers only) (**protected, teachers only**)

All routes except `/login` are protected and require authentication. The `/assignments/new` and `/statistics` routes are further restricted to users with the teacher role. Routing is managed with React Router and role-based route protection.

---

## API Server

Base URL: `http://localhost:3001/api`

### Quick API Overview
- **POST `/sessions`** — Login, create user session
- **GET `/sessions/current`** — Get authenticated user (401 if not authenticated)
- **DELETE `/sessions/current`** — Logout, destroy session
- **GET `/students`** — List all students (authentication required)
- **GET `/assignments`** — Assignment list filtered by user role
- **GET `/assignments/:id`** — Assignment detail
- **POST `/assignments`** — Create new assignment (teachers only)
- **PUT `/assignments/:id/answer`** — Submit answer (only group students)
- **PUT `/assignments/:id/evaluate`** — Evaluate assignment (only assignment creator teacher)
- **GET `/statistics`** — Student statistics (teachers only)

All protected APIs require an active session (HttpOnly cookie managed by backend). 401 errors are handled silently on the frontend.

### Detailed API Documentation

#### Authentication Endpoints

##### POST `/sessions`
**Description**: Authenticate user and create session  
**Authentication**: None required  
**Request Body**:
```json
{
  "username": "string (email address)",
  "password": "string"
}
```
**Success Response** (200):
```json
{
  "id": "integer",
  "username": "string (email)",
  "name": "string (full name)",
  "role": "string (teacher|student)"
}
```
**Error Responses**:
- `401 Unauthorized`: Invalid credentials
```json
{
  "error": "Incorrect username or password"
}
```

##### GET `/sessions/current`
**Description**: Get current authenticated user information  
**Authentication**: Required (any role)  
**Success Response** (200):
```json
{
  "id": "integer",
  "username": "string (email)",
  "name": "string (full name)",
  "role": "string (teacher|student)"
}
```
**Error Responses**:
- `401 Unauthorized`: Not authenticated

##### DELETE `/sessions/current`
**Description**: Logout and destroy current session  
**Authentication**: Required (any role)  
**Success Response** (200): Empty response  
**Error Responses**:
- `401 Unauthorized`: Not authenticated

---

#### User Management Endpoints

##### GET `/students`
**Description**: Retrieve list of all students (for assignment creation)  
**Authentication**: Required (any role)  
**Success Response** (200):
```json
[
  {
    "id": "integer",
    "name": "string (full name)",
    "email": "string (email address)",
    "role": "student"
  }
]
```
**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Database error

---

#### Assignment Management Endpoints

##### GET `/assignments`
**Description**: Get assignments list (filtered by user role and permissions)  
**Authentication**: Required (any role)  
**Success Response** (200):
```json
[
  {
    "id": "integer",
    "question": "string (assignment text)",
    "created_date": "string (ISO timestamp)",
    "teacher_id": "integer",
    "teacher_name": "string",
    "status": "string (open|closed)",
    "answer": "string|null (student answer)",
    "answer_date": "string|null (ISO timestamp)",
    "score": "integer|null (0-30)",
    "evaluation_date": "string|null (ISO timestamp)",
    "group_members": ["array of student objects"]
  }
]
```
**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Database error

##### GET `/assignments/:id`
**Description**: Get specific assignment details by ID  
**Authentication**: Required (any role)  
**Path Parameters**:
- `id`: Assignment ID (integer)
**Success Response** (200):
```json
{
  "id": "integer",
  "question": "string (assignment text)",
  "created_date": "string (ISO timestamp)",
  "teacher_id": "integer",
  "teacher_name": "string",
  "status": "string (open|closed)",
  "answer": "string|null (student answer)",
  "answer_date": "string|null (ISO timestamp)",
  "score": "integer|null (0-30)",
  "evaluation_date": "string|null (ISO timestamp)",
  "group_members": ["array of student objects"]
}
```
**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Assignment not found or access denied
- `500 Internal Server Error`: Database error

##### POST `/assignments`
**Description**: Create new assignment for student group  
**Authentication**: Required (teacher role only)  
**Request Body**:
```json
{
  "question": "string (min length: 1)",
  "studentIds": ["array of integers (2-6 students)"]
}
```
**Success Response** (201):
```json
{
  "id": "integer (new assignment ID)",
  "question": "string",
  "created_date": "string (ISO timestamp)",
  "teacher_id": "integer",
  "status": "open"
}
```
**Error Responses**:
- `400 Bad Request`: Validation errors or group constraints violation
```json
{
  "errors": [
    {
      "msg": "Question is required",
      "param": "question"
    }
  ]
}
```
- `400 Bad Request`: Group constraint violation
```json
{
  "error": "Group constraint violated",
  "message": "Students X and Y have already collaborated 2 times",
  "isValid": false
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a teacher
- `500 Internal Server Error`: Database error

##### PUT `/assignments/:id/answer`
**Description**: Submit answer to assignment (students only)  
**Authentication**: Required (student role only, must be member of assignment group)  
**Path Parameters**:
- `id`: Assignment ID (integer)
**Request Body**:
```json
{
  "answer": "string (min length: 1)"
}
```
**Success Response** (200):
```json
{
  "id": "integer",
  "message": "Answer submitted successfully",
  "answer_date": "string (ISO timestamp)"
}
```
**Error Responses**:
- `400 Bad Request`: Validation errors or assignment constraints
```json
{
  "errors": [
    {
      "msg": "Answer is required",
      "param": "answer"
    }
  ]
}
```
- `400 Bad Request`: Assignment constraints
```json
{
  "error": "Cannot submit answer to closed assignment"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a student or not in assignment group
- `500 Internal Server Error`: Database error

##### PUT `/assignments/:id/evaluate`
**Description**: Evaluate assignment and assign score (teachers only)  
**Authentication**: Required (teacher role only, must be assignment creator)  
**Path Parameters**:
- `id`: Assignment ID (integer)
**Request Body**:
```json
{
  "score": "integer (0-30)"
}
```
**Success Response** (200):
```json
{
  "id": "integer",
  "score": "integer",
  "evaluation_date": "string (ISO timestamp)",
  "status": "closed",
  "message": "Assignment evaluated successfully"
}
```
**Error Responses**:
- `400 Bad Request`: Validation errors
```json
{
  "errors": [
    {
      "msg": "Score must be between 0 and 30",
      "param": "score"
    }
  ]
}
```
- `400 Bad Request`: Assignment constraints
```json
{
  "error": "Cannot evaluate assignment without student answer"
}
```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a teacher or not assignment creator
- `500 Internal Server Error`: Database error

---

#### Statistics Endpoints

##### GET `/statistics`
**Description**: Get student performance statistics and analytics  
**Authentication**: Required (teacher role only)  
**Success Response** (200):
```json
[
  {
    "id": "integer (student ID)",
    "name": "string (student full name)",
    "email": "string (student email)",
    "open_assignments": "integer",
    "closed_assignments": "integer", 
    "total_assignments": "integer",
    "weighted_average": "number|null (calculated weighted average score)"
  }
]
```
**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a teacher
- `500 Internal Server Error`: Database error

---

### HTTP Status Codes Used

| Status Code | Description | Usage |
|-------------|-------------|--------|
| `200 OK` | Success | Successful GET, PUT operations |
| `201 Created` | Resource created | Successful POST operations |
| `400 Bad Request` | Invalid request | Validation errors, constraint violations |
| `401 Unauthorized` | Authentication required | Missing or invalid authentication |
| `403 Forbidden` | Access denied | Valid auth but insufficient permissions |
| `404 Not Found` | Resource not found | Invalid assignment ID or access denied |
| `500 Internal Server Error` | Server error | Database errors, unexpected server issues |

---

## Database Tables

### Table `users`

Contains all system users (students and teachers) with authentication and profile data.

| Column       | Type    | Constraints                                     | Description                                   |
| ------------ | ------- | ----------------------------------------------- | --------------------------------------------- |
| `id`       | INTEGER | PRIMARY KEY                                     | Unique identifier for each user               |
| `name`     | TEXT    | NOT NULL                                        | Full name of the user                         |
| `email`    | TEXT    | NOT NULL, UNIQUE                                | Email address used as username for login      |
| `password` | TEXT    | NOT NULL                                        | Hashed password using crypto.scrypt with salt |
| `salt`     | TEXT    | NOT NULL                                        | Random salt used for password hashing         |
| `role`     | TEXT    | NOT NULL, CHECK(role IN ('student', 'teacher')) | User role: 'student' or 'teacher'             |

### Table `assignments`

Contains homework assignments with all related information.

| Column              | Type    | Constraints                                                   | Description                                        |
| ------------------- | ------- | ------------------------------------------------------------- | -------------------------------------------------- |
| `id`              | INTEGER | PRIMARY KEY                                                   | Unique identifier for each assignment              |
| `question`        | TEXT    | NOT NULL                                                      | The assignment question/task description           |
| `created_date`    | TEXT    | NOT NULL                                                      | ISO timestamp when assignment was created          |
| `teacher_id`      | INTEGER | NOT NULL, FOREIGN KEY                                         | References users.id of the teacher who created it  |
| `status`          | TEXT    | NOT NULL, DEFAULT 'open', CHECK(status IN ('open', 'closed')) | Assignment status                                  |
| `answer`          | TEXT    | NULLABLE                                                      | Student group's answer text (NULL until submitted) |
| `answer_date`     | TEXT    | NULLABLE                                                      | ISO timestamp when answer was submitted            |
| `score`           | INTEGER | NULLABLE, CHECK(score >= 0 AND score <= 30)                   | Evaluation score 0-30 (NULL until evaluated)       |
| `evaluation_date` | TEXT    | NULLABLE                                                      | ISO timestamp when assignment was evaluated        |

### Table `assignment_groups`

Junction table linking assignments to student groups.

| Column            | Type    | Constraints                         | Description                                      |
| ----------------- | ------- | ----------------------------------- | ------------------------------------------------ |
| `assignment_id` | INTEGER | NOT NULL, FOREIGN KEY               | References assignments.id                        |
| `student_id`    | INTEGER | NOT NULL, FOREIGN KEY               | References users.id of a student                 |
| PRIMARY KEY       | -       | (`assignment_id`, `student_id`) | Composite key preventing duplicate pairs         |
| CASCADE DELETE    | -       | ON DELETE CASCADE                   | Auto-removes memberships when assignment deleted |

---

## Initial Database Data

The initial database is automatically populated with a complete set of test data to support all application features and test scenarios:

- **Teachers**: 2 accounts with realistic names and emails, both using the password `password123`.
- **Students**: 22 accounts, each with a unique name and email, all using the password `student123`.
- **Assignments**: At least one closed and one open assignment are pre-created, with realistic questions, group compositions, and evaluation data. These assignments are distributed among the teachers and student groups to allow immediate testing of all flows (creation, answer, evaluation, statistics, group constraints).
- **Passwords**: All user passwords are securely hashed using Node.js crypto.scrypt with a unique random salt for each user, following best security practices.
- **Group constraints**: The initial assignments are set up to demonstrate group size limits, collaboration limits, and exclusive group membership rules.

The following table lists all initial user accounts (teachers and students) with their credentials and roles for easy access during testing:

| Username                             | Password    | Role     | Name                    |
|--------------------------------------|-------------|----------|-------------------------|
| mario.rossi@polito.it                | password123 | teacher  | Prof. Mario Rossi       |
| anna.verdi@polito.it                 | password123 | teacher  | Prof.ssa Anna Verdi     |
| giulia.bianchi@studenti.polito.it    | student123  | student  | Giulia Bianchi          |
| marco.ferrari@studenti.polito.it     | student123  | student  | Marco Ferrari           |
| laura.russo@studenti.polito.it       | student123  | student  | Laura Russo             |
| alessandro.bruno@studenti.polito.it  | student123  | student  | Alessandro Bruno        |
| francesca.romano@studenti.polito.it  | student123  | student  | Francesca Romano        |
| davide.ricci@studenti.polito.it      | student123  | student  | Davide Ricci            |
| chiara.marino@studenti.polito.it     | student123  | student  | Chiara Marino           |
| luca.greco@studenti.polito.it        | student123  | student  | Luca Greco              |
| valentina.conti@studenti.polito.it   | student123  | student  | Valentina Conti         |
| simone.deluca@studenti.polito.it     | student123  | student  | Simone De Luca          |
| elena.galli@studenti.polito.it       | student123  | student  | Elena Galli             |
| matteo.lombardi@studenti.polito.it   | student123  | student  | Matteo Lombardi         |
| sara.moretti@studenti.polito.it      | student123  | student  | Sara Moretti            |
| andrea.barbieri@studenti.polito.it   | student123  | student  | Andrea Barbieri         |
| martina.fontana@studenti.polito.it   | student123  | student  | Martina Fontana         |
| riccardo.serra@studenti.polito.it    | student123  | student  | Riccardo Serra          |
| federica.vitale@studenti.polito.it   | student123  | student  | Federica Vitale         |
| nicola.pellegrini@studenti.polito.it | student123  | student  | Nicola Pellegrini       |
| roberta.caruso@studenti.polito.it    | student123  | student  | Roberta Caruso          |
| stefano.fiore@studenti.polito.it     | student123  | student  | Stefano Fiore           |
| alessia.desantis@studenti.polito.it  | student123  | student  | Alessia De Santis       |
| emanuele.marini@studenti.polito.it   | student123  | student  | Emanuele Marini         |

---

## API Test Files (server/test.http)

The file `server/test.http` implements a suite of HTTP tests covering all main API features and edge cases. The test suite is organized into the following categories:

- **Authentication**: login/logout for both teachers and students, session checks
- **Unauthenticated Access**: verifies that protected endpoints return 401 when not logged in
- **Teacher Functionality**: student/assignment listing, assignment creation (valid/invalid), evaluation, statistics
- **Student Functionality**: assignment listing, answer submission (valid/invalid), forbidden actions (e.g., evaluation)
- **Authorization**: ensures users cannot access or modify resources outside their permissions (e.g., students answering assignments not assigned to them)
- **Edge Cases & Error Handling**: invalid credentials, non-existent resources, invalid input data
- **Group Constraints**: tests for group size, collaboration limits, and exclusive group membership
- **Answer Validation**: checks for empty/whitespace-only answers, valid/invalid submissions

**How to run:**
- Start the server (`npm start` in the server folder)
- Open `server/test.http` in VS Code with the REST Client extension
- Click "Send Request" above each test to execute

**Example test categories:**
| Category                | Example Test Description                                 |
|------------------------|---------------------------------------------------------|
| Authentication         | Login as teacher/student, check session, logout          |
| Unauthenticated Access | Access students/assignments endpoints without login      |
| Teacher Functionality  | Create assignment, evaluate, get statistics              |
| Student Functionality  | Submit answer, forbidden assignment creation/evaluation  |
| Authorization          | Student tries to answer assignment not assigned to them  |
| Edge Cases             | Invalid login, non-existent assignment, invalid input    |
| Group Constraints      | Exceed group size, duplicate collaborations              |
| Answer Validation      | Empty/whitespace answer, valid/invalid answer formats    |

The test suite ensures robust coverage of all business rules, error handling, and security constraints for the application APIs.

---

## Database Management Scripts

The server includes npm scripts for database management:

| Script                | Command                | Description                                             |
|-----------------------|------------------------|---------------------------------------------------------|
| **Initialize DB**     | `npm run init-db`      | Creates database, tables, and inserts test data         |
| **Reset DB**          | `npm run reset-db`     | Completely resets database (⚠️ deletes all data!)      |
| **Generate Passwords**| `npm run generate-passwords` | Generates new random password hashes            |

---

## Main React Components

### Core Components

- **Navigation.jsx** — Responsive navigation bar with role-based menu items, user profile, and logout functionality.
- **LoginForm.jsx** — User authentication form with validation and error handling.
- **LoadingSpinner.jsx** — Reusable loading indicator for asynchronous operations.
- **ErrorAlert.jsx** — Standardized error message display for consistent feedback.

### Main Pages

- **Dashboard.jsx** — Homepage with assignments overview, quick stats, and role-based content for teachers and students.
- **AssignmentList.jsx** — Paginated and filterable list of assignments, with search and sorting features.
- **AssignmentDetail.jsx** — Detailed view of a single assignment, including answer submission (student), evaluation (teacher), and group information.
- **CreateAssignment.jsx** — Assignment creation form for teachers, with student selection, group constraint validation, and real-time feedback.
- **Statistics.jsx** — Student performance analytics and statistics (teachers only), with charts, filters, and export options.

---

## Screenshot

![Screenshot](./img/screenshot.jpg)

---

### Group Constraint Rules

The system enforces these business rules for assignment groups:

1. **Group Size**: 2-6 students per assignment
2. **Collaboration Limit**: Any pair of students can collaborate maximum 2 times per teacher
3. **Exclusive Groups**: Students can only be in one active assignment group at a time per teacher

**Example Constraint Violation**:
If students Alice and Bob have already worked together in 2 assignments from Prof. Smith, they cannot be assigned together in a third assignment by the same professor.

---
