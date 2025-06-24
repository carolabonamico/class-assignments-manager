[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/F9jR7G97)

# Exam #2: "Compiti"

## Student: s339129 Bonamico Carola

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

- POST `/api/something`
  - request parameters and request body content
  - response body content
- GET `/api/something`
  - request parameters
  - response body content
- POST `/api/something`
  - request parameters and request body content
  - response body content
- ...

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

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm
- SQLite3

### Installation Steps

1. **Clone and Install Dependencies**

   ```bash
   # Clone the repository
   git clone <repository-url>
   cd esame2-compiti-carolabonamico

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```
2. **Database Setup**

   ```bash
   # Initialize database with test data
   cd ../server
   npm run init-db
   ```
3. **Start the Application**

   ```bash
   # Terminal 1: Start server (port 3001)
   cd server
   npm start

   # Terminal 2: Start client (port 5173)
   cd client
   npm run dev
   ```

### Database Management Scripts

The server includes convenient npm scripts for database management:

| Script                       | Command                        | Description                                                           |
| ---------------------------- | ------------------------------ | --------------------------------------------------------------------- |
| **Initialize DB**      | `npm run init-db`            | Creates database, tables, and inserts test data with secure passwords |
| **Reset DB**           | `npm run reset-db`           | Completely resets database (⚠️ deletes all data!)                   |
| **Generate Passwords** | `npm run generate-passwords` | Generates new random password hashes                                  |

#### Database Reset Workflow

```bash
cd server
npm run reset-db  # Clean slate with fresh test data
npm start         # Ready to test
```

## Users Credentials

### Teachers

| Username              | Password    | Role    | Full Name           |
| --------------------- | ----------- | ------- | ------------------- |
| mario.rossi@polito.it | password123 | teacher | Prof. Mario Rossi   |
| anna.verdi@polito.it  | password123 | teacher | Prof.ssa Anna Verdi |

### Students

| Username                             | Password   | Role    | Full Name         |
| ------------------------------------ | ---------- | ------- | ----------------- |
| giulia.bianchi@studenti.polito.it    | student123 | student | Giulia Bianchi    |
| marco.ferrari@studenti.polito.it     | student123 | student | Marco Ferrari     |
| laura.russo@studenti.polito.it       | student123 | student | Laura Russo       |
| alessandro.bruno@studenti.polito.it  | student123 | student | Alessandro Bruno  |
| francesca.romano@studenti.polito.it  | student123 | student | Francesca Romano  |
| davide.ricci@studenti.polito.it      | student123 | student | Davide Ricci      |
| chiara.marino@studenti.polito.it     | student123 | student | Chiara Marino     |
| luca.greco@studenti.polito.it        | student123 | student | Luca Greco        |
| valentina.conti@studenti.polito.it   | student123 | student | Valentina Conti   |
| simone.deluca@studenti.polito.it     | student123 | student | Simone De Luca    |
| elena.galli@studenti.polito.it       | student123 | student | Elena Galli       |
| matteo.lombardi@studenti.polito.it   | student123 | student | Matteo Lombardi   |
| sara.moretti@studenti.polito.it      | student123 | student | Sara Moretti      |
| andrea.barbieri@studenti.polito.it   | student123 | student | Andrea Barbieri   |
| martina.fontana@studenti.polito.it   | student123 | student | Martina Fontana   |
| riccardo.serra@studenti.polito.it    | student123 | student | Riccardo Serra    |
| federica.vitale@studenti.polito.it   | student123 | student | Federica Vitale   |
| nicola.pellegrini@studenti.polito.it | student123 | student | Nicola Pellegrini |
| roberta.caruso@studenti.polito.it    | student123 | student | Roberta Caruso    |
| stefano.fiore@studenti.polito.it     | student123 | student | Stefano Fiore     |
| alessia.desantis@studenti.polito.it  | student123 | student | Alessia De Santis |
| emanuele.marini@studenti.polito.it   | student123 | student | Emanuele Marini   |

### Test Data Information

- **Total Users**: 24 (2 teachers + 22 students)
- **Password Security**: All passwords are hashed using Node.js crypto.scrypt with randomly generated salts
  - Teachers use password: `password123`
  - Students use password: `student123`
  - Each user has a unique random salt generated with crypto.randomBytes(8)
  - Password hashes are automatically applied during database initialization
- **Pre-loaded Assignments**: Prof. Mario Rossi has created 2 sample assignments:
  - Assignment #1: "Implement a merge sort algorithm..." (CLOSED - evaluated with score 27/30)
    - Group: Giulia Bianchi, Marco Ferrari, Laura Russo
  - Assignment #2: "Design and implement a library management system..." (OPEN - awaiting student response)
    - Group: Alessandro Bruno, Francesca Romano, Davide Ricci, Chiara Marino
- **Login Format**: Use email as username

### Development Notes

- Database is automatically initialized with secure password hashes when running `npm run init-db`
- Use `npm run reset-db` to restore the database to initial state during development
