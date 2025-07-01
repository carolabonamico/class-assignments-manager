-- Database for the assignment management system
-- System that manages assignments assigned to groups of students

-- Drop existing tables to ensure clean initialization
DROP TABLE IF EXISTS "assignment_groups";
DROP TABLE IF EXISTS "assignments";
DROP TABLE IF EXISTS "users";

-- Users table (students and teachers)
CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "role" TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
    PRIMARY KEY("id")
);

-- Assignments table
CREATE TABLE IF NOT EXISTS "assignments" (
    "id" INTEGER NOT NULL UNIQUE,
    "question" TEXT NOT NULL,
    "created_date" TEXT NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'closed')),
    "answer" TEXT,
    "score" INTEGER CHECK(score >= 0 AND score <= 30),
    PRIMARY KEY("id"),
    FOREIGN KEY("teacher_id") REFERENCES "users"("id")
);

-- Groups table (student-assignment association)
CREATE TABLE IF NOT EXISTS "assignment_groups" (
    "assignment_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    PRIMARY KEY("assignment_id", "student_id"),
    FOREIGN KEY("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE,
    FOREIGN KEY("student_id") REFERENCES "users"("id")
);

-- Test data insertion

-- Teachers insertion (password with salt)
INSERT INTO users (name, email, password, salt, role) VALUES 
('Prof. Mario Rossi', 'mario.rossi@polito.it', '3da409b79dd2f30028e33b07d3b05d2e', 'b5467aac119fec66', 'teacher'),
('Prof.ssa Anna Verdi', 'anna.verdi@polito.it', 'ca3168778c31abfb7ae2c754249e62c2', 'f220730f55075a15', 'teacher');

-- Students insertion (all with password: "student123")
INSERT INTO users (name, email, password, salt, role) VALUES 
('Giulia Bianchi', 'giulia.bianchi@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt001', 'student'),
('Marco Ferrari', 'marco.ferrari@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt002', 'student'),
('Laura Russo', 'laura.russo@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt003', 'student'),
('Alessandro Bruno', 'alessandro.bruno@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt004', 'student'),
('Francesca Romano', 'francesca.romano@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt005', 'student'),
('Davide Ricci', 'davide.ricci@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt006', 'student'),
('Chiara Marino', 'chiara.marino@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt007', 'student'),
('Luca Greco', 'luca.greco@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt008', 'student'),
('Valentina Conti', 'valentina.conti@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt009', 'student'),
('Simone De Luca', 'simone.deluca@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt010', 'student'),
('Elena Galli', 'elena.galli@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt011', 'student'),
('Matteo Lombardi', 'matteo.lombardi@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt012', 'student'),
('Sara Moretti', 'sara.moretti@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt013', 'student'),
('Andrea Barbieri', 'andrea.barbieri@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt014', 'student'),
('Martina Fontana', 'martina.fontana@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt015', 'student'),
('Riccardo Serra', 'riccardo.serra@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt016', 'student'),
('Federica Vitale', 'federica.vitale@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt017', 'student'),
('Nicola Pellegrini', 'nicola.pellegrini@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt018', 'student'),
('Roberta Caruso', 'roberta.caruso@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt019', 'student'),
('Stefano Fiore', 'stefano.fiore@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt020', 'student'),
('Alessia De Santis', 'alessia.desantis@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt021', 'student'),
('Emanuele Marini', 'emanuele.marini@studenti.polito.it', 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', 'salt022', 'student');

-- Example assignments insertion
-- Assignment 1: CLOSED (with answer and evaluation)
INSERT INTO assignments (question, created_date, teacher_id, status, answer, score) VALUES 
('Implement a merge sort algorithm in JavaScript and explain the time complexity.', 
 '2025-06-01T10:00:00.000Z', 
 1, 
 'closed', 
 'function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    let result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
}

The time complexity is O(n log n) in the best, average and worst case, where n is the number of elements to sort.',
 27);

-- Assignment 2: OPEN (no answer yet)
INSERT INTO assignments (question, created_date, teacher_id, status) VALUES 
('Design and implement a library management system with React and Express. The system must allow managing books, users and loans.',
 '2025-06-10T14:00:00.000Z',
 1,
 'open');

-- Group assignment for assignment 1 (3 students: Giulia, Marco, Laura)
INSERT INTO assignment_groups (assignment_id, student_id) VALUES 
(1, 3), -- Giulia Bianchi
(1, 4), -- Marco Ferrari  
(1, 5); -- Laura Russo

-- Group assignment for assignment 2 (4 students: Alessandro, Francesca, Davide, Chiara)
INSERT INTO assignment_groups (assignment_id, student_id) VALUES 
(2, 6), -- Alessandro Bruno
(2, 7), -- Francesca Romano
(2, 8), -- Davide Ricci
(2, 9); -- Chiara Marino