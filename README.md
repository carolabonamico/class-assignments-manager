[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/F9jR7G97)

# Exam #2: "Compiti"

## Student: s339129 Bonamico Carola

## React Client Application Routes

- `/login` — Authentication page (public)
- `/` — Redirects to `/assignments` if authenticated, or to `/login` if not authenticated
- `/assignments` — Assignment list filtered by user role (protected)
- `/assignments/:id` — Assignment detail, answer submission (student) or evaluation (teacher) (protected)
- `/assignments/new` — Create new assignment (teachers only) (protected)
- `/statistics` — Student statistics (teachers only) (protected)
- `*` — Any other route redirects to `/assignments` if authenticated, or to `/login` if not authenticated

## API Server

### POST `/api/sessions`

Login, create user session

- **Request Body:**
  ```json
  {
    "username": "string (email)",
    "password": "string"
  }
  ```
- **Response Body:**
  ```json
  {
    "id": "integer",
    "username": "string",
    "name": "string",
    "role": "teacher|student"
  }
  ```
- **Error Codes:**
  - `401 Unauthorized`: invalid credentials
  - `500 Internal Server Error`: server/database error

### GET `/api/sessions/current`

Get authenticated user

- **Response Body:**
  ```json
  {
    "id": "integer",
    "username": "string",
    "name": "string",
    "role": "teacher|student"
  }
  ```
- **Error Codes:**
  - `401 Unauthorized`: not authenticated
  - `500 Internal Server Error`: server/database error

### DELETE `/api/sessions/current`

Logout

- **Response Body:** (empty)
- **Error Codes:**
  - `500 Internal Server Error`: server/database error

### GET `/api/students`

List all students

- **Response Body:**
  ```json
  [
    { "id": "integer", "name": "string", "email": "string", "role": "student" },
    ...
  ]
  ```
- **Error Codes:**
  - `401 Unauthorized`: not authenticated
  - `500 Internal Server Error`: server/database error

### GET `/api/assignments`

Assignment list filtered by user role

- **Response Body:**
  ```json
  [
    {
      "id": "integer",
      "question": "string",
      "teacher_id": "integer",
      "teacher_name": "string",
      "status": "open|closed",
      "answer": "string|null",
      "score": "integer|null",
      "groupMembers": [ { ...student } ],
      "groupSize": "integer"
    },
    ...
  ]
  ```
- **Error Codes:**
  - `401 Unauthorized`: not authenticated
  - `500 Internal Server Error`: server/database error

### GET `/api/assignments/:id`

Assignment detail

- **Parameters:**
  - `:id` — Assignment ID (integer, required)
- **Response Body:**
  ```json
  {
    "id": "integer",
    "question": "string",
    "teacher_id": "integer",
    "teacher_name": "string",
    "status": "open|closed",
    "answer": "string|null",
    "score": "integer|null",
    "groupMembers": [ { ...student } ],
    "groupSize": "integer"
  }
  ```
- **Error Codes:**
  - `401 Unauthorized`: not authenticated
  - `404 Not Found`: assignment not found or not accessible
  - `500 Internal Server Error`: server/database error

### POST `/api/assignments/check-constraints`

Check group constraints before assignment creation (teachers only)

- **Request Body:**
  ```json
  {
    "studentIds": [ "integer", ... ]
  }
  ```
- **Response Body:**
  ```json
  {
    "isValid": "boolean",
    "error": "string|null"
  }
  ```
- **Error Codes:**
  - `401 Unauthorized`: not authenticated
  - `403 Forbidden`: not a teacher
  - `400 Bad Request`: invalid student IDs array (must be 2-6 students)
  - `500 Internal Server Error`: server/database error

### POST `/api/assignments`

Create new assignment (teachers only)

- **Request Body:**
  ```json
  {
    "question": "string",
    "studentIds": [ "integer", ... ]
  }
  ```
- **Response Body:**
  ```json
  {
    "id": "integer"
  }
  ```
- **Error Codes:**
  - `401 Unauthorized`: not authenticated
  - `403 Forbidden`: not a teacher
  - `400 Bad Request`: missing/invalid fields or validation errors (2-6 students required)
  - `500 Internal Server Error`: server/database error

### PUT `/api/assignments/:id/answer`

Submit answer (students only)

- **Parameters:**
  - `:id` — Assignment ID (integer, required)
- **Request Body:**
  ```json
  {
    "answer": "string"
  }
  ```
- **Response Body:**
  ```json
  {
    "id": "integer",
    "message": "Answer submitted successfully"
  }
  ```
- **Error Codes:**
  - `401 Unauthorized`: not authenticated
  - `403 Forbidden`: not a student
  - `400 Bad Request`: empty/invalid answer, assignment not open
  - `500 Internal Server Error`: server/database error

### PUT `/api/assignments/:id/evaluate`

Evaluate assignment (teachers only)

- **Parameters:**
  - `:id` — Assignment ID (integer, required)
- **Request Body:**
  ```json
  {
    "score": "integer (0-30)"
  }
  ```
- **Response Body:**
  ```json
  {
    "id": "integer",
    "score": "integer",
    "status": "closed",
    "message": "Assignment evaluated successfully"
  }
  ```
- **Error Codes:**
  - `401 Unauthorized`: not authenticated
  - `403 Forbidden`: not a teacher
  - `400 Bad Request`: invalid score, assignment not open
  - `500 Internal Server Error`: server/database error

### GET `/api/statistics`

Student statistics (teachers only)

- **Response Body:**
  ```json
  [
    {
      "id": "integer",
      "name": "string",
      "email": "string",
      "open_assignments": "integer",
      "closed_assignments": "integer",
      "total_assignments": "integer",
      "weighted_average": "number|null"
    },
    ...
  ]
  ```
- **Error Codes:**
  - `401 Unauthorized`: not authenticated
  - `403 Forbidden`: not a teacher
  - `500 Internal Server Error`: server/database error

## Database Tables

| Table Name        | Main Columns & Types                                                                           | Purpose/Description                                |
| ----------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| users             | id (int, PK), name (text), email (text, unique), password (text), salt (text), role (text)     | Stores all users (students and teachers)           |
| assignments       | id (int, PK), question (text), teacher_id (int, FK), status (text), answer (text), score (int) | Stores assignments with metadata and status        |
| assignment_groups | assignment_id (int, FK), student_id (int, FK), PK (assignment_id, student_id)                  | Links assignments to student groups (many-to-many) |

(PK = Primary Key, FK = Foreign Key)

## Main React Components

### Components

- `Navigation.jsx`: navigation bar with role-based menu and logout
- `LoginForm.jsx`: authentication form with validation and error handling
- `LoadingSpinner.jsx`: loading indicator
- `QuestionFormCard.jsx`: component for assignment question input
- `StudentSelectionCard.jsx`: component for student selection with constraint validation
- `AssignmentCard.jsx`: card component for assignment list display
- `AssignmentQuestionCard.jsx`: component for assignment question display
- `AssignmentAnswerCard.jsx`: component for answer submission and display
- `AssignmentEvaluationCard.jsx`: component for assignment evaluation
  
### Pages

- `AssignmentList.jsx`: assignment list, filterable by status and role
- `AssignmentDetail.jsx`: assignment detail, answer submission (student) or evaluation (teacher)
- `CreateAssignment.jsx`: new assignment creation with live pair constraint validation (teacher only)
- `Statistics.jsx`: student statistics and analytics (teacher only)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

| Username                             | Password    | Role    | Name                |
| ------------------------------------ | ----------- | ------- | ------------------- |
| mario.rossi@polito.it                | password123 | teacher | Prof. Mario Rossi   |
| anna.verdi@polito.it                 | password456 | teacher | Prof.ssa Anna Verdi |
| giulia.bianchi@studenti.polito.it    | student123  | student | Giulia Bianchi      |
| marco.ferrari@studenti.polito.it     | student123  | student | Marco Ferrari       |
| laura.russo@studenti.polito.it       | student123  | student | Laura Russo         |
| alessandro.bruno@studenti.polito.it  | student123  | student | Alessandro Bruno    |
| francesca.romano@studenti.polito.it  | student123  | student | Francesca Romano    |
| davide.ricci@studenti.polito.it      | student123  | student | Davide Ricci        |
| chiara.marino@studenti.polito.it     | student123  | student | Chiara Marino       |
| luca.greco@studenti.polito.it        | student123  | student | Luca Greco          |
| valentina.conti@studenti.polito.it   | student123  | student | Valentina Conti     |
| simone.deluca@studenti.polito.it     | student123  | student | Simone De Luca      |
| elena.galli@studenti.polito.it       | student123  | student | Elena Galli         |
| matteo.lombardi@studenti.polito.it   | student123  | student | Matteo Lombardi     |
| sara.moretti@studenti.polito.it      | student123  | student | Sara Moretti        |
| andrea.barbieri@studenti.polito.it   | student123  | student | Andrea Barbieri     |
| martina.fontana@studenti.polito.it   | student123  | student | Martina Fontana     |
| riccardo.serra@studenti.polito.it    | student123  | student | Riccardo Serra      |
| federica.vitale@studenti.polito.it   | student123  | student | Federica Vitale     |
| nicola.pellegrini@studenti.polito.it | student123  | student | Nicola Pellegrini   |
| roberta.caruso@studenti.polito.it    | student123  | student | Roberta Caruso      |
| stefano.fiore@studenti.polito.it     | student123  | student | Stefano Fiore       |
| alessia.desantis@studenti.polito.it  | student123  | student | Alessia De Santis   |
| emanuele.marini@studenti.polito.it   | student123  | student | Emanuele Marini     |
