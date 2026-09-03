import type { Dataset } from "./types";

export const university: Dataset = {
  id: "university",
  name: "University",
  description:
    "Students, the courses they enrol in, the grades they earn, and the professors who teach.",
  seed: `
CREATE TABLE professors (
  professor_id INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  department   TEXT NOT NULL
);

CREATE TABLE courses (
  course_id    INTEGER PRIMARY KEY,
  course_name  TEXT NOT NULL,
  department   TEXT NOT NULL,
  credits      INTEGER NOT NULL,
  professor_id INTEGER NOT NULL REFERENCES professors(professor_id)
);

CREATE TABLE students (
  student_id   INTEGER PRIMARY KEY,
  student_name TEXT NOT NULL,
  department   TEXT NOT NULL,
  semester     INTEGER NOT NULL,
  cgpa         REAL
);

CREATE TABLE enrollments (
  student_id INTEGER NOT NULL REFERENCES students(student_id),
  course_id  INTEGER NOT NULL REFERENCES courses(course_id),
  grade      TEXT,
  PRIMARY KEY (student_id, course_id)
);

INSERT INTO professors VALUES
  (1, 'Dr. Ramesh Kumar', 'Computer Science'),
  (2, 'Dr. Sunita Rao',   'Computer Science'),
  (3, 'Dr. Anil Bose',    'Mathematics'),
  (4, 'Dr. Farida Khan',  'Electronics'),
  (5, 'Dr. Vikas Jain',   'Economics'),
  (6, 'Dr. Lata Menon',   'Mathematics');

INSERT INTO courses VALUES
  (1, 'Database Systems',    'Computer Science', 4, 1),
  (2, 'Data Structures',     'Computer Science', 4, 2),
  (3, 'Operating Systems',   'Computer Science', 3, 1),
  (4, 'Linear Algebra',      'Mathematics',      3, 3),
  (5, 'Probability',         'Mathematics',      3, 6),
  (6, 'Digital Circuits',    'Electronics',      4, 4),
  (7, 'Signals and Systems', 'Electronics',      3, 4),
  (8, 'Microeconomics',      'Economics',        2, 5);

INSERT INTO students VALUES
  (1,  'Aarav Sharma',  'Computer Science', 5, 8.7),
  (2,  'Diya Patel',    'Computer Science', 5, 9.1),
  (3,  'Ishaan Verma',  'Computer Science', 3, 7.4),
  (4,  'Myra Singh',    'Mathematics',      3, 8.2),
  (5,  'Vihaan Reddy',  'Electronics',      7, 6.9),
  (6,  'Anika Gupta',   'Electronics',      7, 8.8),
  (7,  'Reyansh Iyer',  'Computer Science', 7, 7.9),
  (8,  'Sara Ali',      'Mathematics',      5, 9.4),
  (9,  'Kabir Nair',    'Electronics',      3, 6.2),
  (10, 'Zoya Khan',     'Computer Science', 1, NULL),
  (11, 'Arnav Joshi',   'Mathematics',      1, NULL),
  (12, 'Navya Rao',     'Computer Science', 3, 8.0),
  (13, 'Yash Mehta',    'Electronics',      5, 7.1),
  (14, 'Riya Das',      'Economics',        5, 8.5),
  (15, 'Om Kulkarni',   'Computer Science', 7, 5.8);

INSERT INTO enrollments VALUES
  (1, 1, 'A'), (1, 2, 'A'), (1, 4, 'B'),
  (2, 1, 'A'), (2, 2, 'A'), (2, 3, 'A'), (2, 5, 'B'),
  (3, 1, 'C'), (3, 2, 'B'),
  (4, 4, 'A'), (4, 5, 'A'), (4, 1, 'B'),
  (5, 6, 'C'), (5, 7, 'D'),
  (6, 6, 'A'), (6, 7, 'A'), (6, 4, 'B'),
  (7, 1, 'B'), (7, 3, 'B'), (7, 2, 'C'),
  (8, 4, 'A'), (8, 5, 'A'), (8, 2, 'A'),
  (9, 6, 'F'), (9, 7, 'D'),
  (10, 2, NULL), (10, 4, NULL),
  (12, 1, 'A'), (12, 3, 'B'),
  (13, 6, 'B'), (13, 7, 'C'),
  (14, 5, 'B'),
  (15, 1, 'D'), (15, 3, 'F'), (15, 2, 'C');
`,
};
