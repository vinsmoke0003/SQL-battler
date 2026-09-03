import type { QuestionDef } from "./types";

export const mediumQuestions: QuestionDef[] = [
  // ───────────── Company ─────────────
  {
    id: "M001",
    datasetId: "company",
    title: "Average salary by department",
    description:
      "For each department, show department_name and the average salary of its employees rounded to a whole number as avg_salary. Highest average first.",
    difficulty: "medium",
    tags: ["JOIN", "GROUP BY", "AGGREGATION"],
    solution: `SELECT d.department_name, ROUND(AVG(e.salary)) AS avg_salary
FROM employees e
JOIN departments d ON e.department_id = d.department_id
GROUP BY d.department_name
ORDER BY avg_salary DESC`,
    orderMatters: true,
    hints: [
      "Join employees to departments, then GROUP BY department_name.",
      "Use ROUND(AVG(salary)) and ORDER BY that alias DESC.",
    ],
  },
  {
    id: "M002",
    datasetId: "company",
    title: "Best-paid department",
    description:
      "Find the department with the highest average employee salary. Return department_name and the rounded average as avg_salary.",
    difficulty: "medium",
    tags: ["JOIN", "GROUP BY", "LIMIT"],
    solution: `SELECT d.department_name, ROUND(AVG(e.salary)) AS avg_salary
FROM employees e
JOIN departments d ON e.department_id = d.department_id
GROUP BY d.department_name
ORDER BY avg_salary DESC
LIMIT 1`,
    orderMatters: false,
    hints: ["Group by department, order by the average descending, LIMIT 1."],
  },
  {
    id: "M003",
    datasetId: "company",
    title: "Headcount per department",
    description:
      "Show every department with the number of employees in it as employee_count — including departments with nobody. Sort by employee_count descending, then department_name.",
    difficulty: "medium",
    tags: ["LEFT JOIN", "GROUP BY"],
    solution: `SELECT d.department_name, COUNT(e.employee_id) AS employee_count
FROM departments d
LEFT JOIN employees e ON e.department_id = d.department_id
GROUP BY d.department_id, d.department_name
ORDER BY employee_count DESC, d.department_name`,
    orderMatters: true,
    hints: [
      "Start FROM departments and LEFT JOIN employees so empty departments survive.",
      "COUNT(e.employee_id) counts 0 for departments with no match; COUNT(*) would count 1.",
    ],
  },
  {
    id: "M004",
    datasetId: "company",
    title: "Empty departments",
    description:
      "Which departments have no employees at all? Return department_name.",
    difficulty: "medium",
    tags: ["LEFT JOIN", "NULL"],
    solution: `SELECT d.department_name
FROM departments d
LEFT JOIN employees e ON e.department_id = d.department_id
WHERE e.employee_id IS NULL`,
    orderMatters: false,
    hints: ["LEFT JOIN then keep rows where the employee side IS NULL."],
  },
  {
    id: "M005",
    datasetId: "company",
    title: "Who reports to whom",
    description:
      "For every employee who has a manager, show employee_name and manager_name as full names (first and last separated by a space). Sort by employee_name.",
    difficulty: "medium",
    tags: ["SELF JOIN", "STRING FUNCTION"],
    solution: `SELECT e.first_name || ' ' || e.last_name AS employee_name,
       m.first_name || ' ' || m.last_name AS manager_name
FROM employees e
JOIN employees m ON e.manager_id = m.employee_id
ORDER BY employee_name`,
    orderMatters: true,
    hints: [
      "Join employees to itself: e.manager_id = m.employee_id.",
      "Concatenate with || in SQLite.",
    ],
  },
  {
    id: "M006",
    datasetId: "company",
    title: "Effort per project",
    description:
      "For each project, show project_name and the total hours logged as total_hours. Most hours first.",
    difficulty: "medium",
    tags: ["JOIN", "GROUP BY", "AGGREGATION"],
    solution: `SELECT p.project_name, SUM(ep.hours_worked) AS total_hours
FROM projects p
JOIN employee_projects ep ON ep.project_id = p.project_id
GROUP BY p.project_id, p.project_name
ORDER BY total_hours DESC`,
    orderMatters: true,
    hints: ["Join projects to employee_projects and SUM(hours_worked)."],
  },
  {
    id: "M007",
    datasetId: "company",
    title: "Overworked",
    description:
      "Which employees have logged more than 300 hours across all projects? Return first_name and total_hours, most hours first.",
    difficulty: "medium",
    tags: ["JOIN", "GROUP BY", "HAVING"],
    solution: `SELECT e.first_name, SUM(ep.hours_worked) AS total_hours
FROM employees e
JOIN employee_projects ep ON ep.employee_id = e.employee_id
GROUP BY e.employee_id, e.first_name
HAVING SUM(ep.hours_worked) > 300
ORDER BY total_hours DESC`,
    orderMatters: true,
    hints: ["Filter aggregated values with HAVING, not WHERE."],
  },
  {
    id: "M008",
    datasetId: "company",
    title: "Benched",
    description:
      "Find employees who are not assigned to any project. Return first_name and last_name sorted by first name.",
    difficulty: "medium",
    tags: ["LEFT JOIN", "NULL", "SUBQUERY"],
    solution: `SELECT e.first_name, e.last_name
FROM employees e
LEFT JOIN employee_projects ep ON ep.employee_id = e.employee_id
WHERE ep.project_id IS NULL
ORDER BY e.first_name`,
    orderMatters: true,
    hints: ["Either LEFT JOIN ... IS NULL or NOT IN (SELECT employee_id FROM employee_projects)."],
  },
  {
    id: "M009",
    datasetId: "company",
    title: "Heavy payroll",
    description:
      "Show department_name and total_salary (sum of employee salaries) for departments whose payroll exceeds ₹2,00,000. Largest payroll first.",
    difficulty: "medium",
    tags: ["JOIN", "GROUP BY", "HAVING"],
    solution: `SELECT d.department_name, SUM(e.salary) AS total_salary
FROM departments d
JOIN employees e ON e.department_id = d.department_id
GROUP BY d.department_id, d.department_name
HAVING SUM(e.salary) > 200000
ORDER BY total_salary DESC`,
    orderMatters: true,
    hints: ["GROUP BY department and use HAVING SUM(salary) > 200000."],
  },
  {
    id: "M010",
    datasetId: "company",
    title: "Salary bands",
    description:
      "Classify every employee into a salary band: 'High' for ₹1,00,000 or more, 'Mid' for ₹60,000 to ₹99,999, otherwise 'Low'. Return first_name, salary and band, highest salary first.",
    difficulty: "medium",
    tags: ["CASE", "ORDER BY"],
    solution: `SELECT first_name, salary,
       CASE WHEN salary >= 100000 THEN 'High'
            WHEN salary >= 60000 THEN 'Mid'
            ELSE 'Low' END AS band
FROM employees
ORDER BY salary DESC`,
    orderMatters: true,
    hints: ["CASE WHEN ... THEN ... ELSE ... END AS band."],
  },
  {
    id: "M011",
    datasetId: "company",
    title: "Hiring by year",
    description:
      "How many employees were hired in each year? Return hire_year (as text, e.g. '2021') and hires, ordered by year.",
    difficulty: "medium",
    tags: ["DATE FUNCTION", "GROUP BY"],
    solution: `SELECT strftime('%Y', hire_date) AS hire_year, COUNT(*) AS hires
FROM employees
GROUP BY hire_year
ORDER BY hire_year`,
    orderMatters: true,
    hints: ["strftime('%Y', hire_date) extracts the year in SQLite."],
  },
  {
    id: "M012",
    datasetId: "company",
    title: "Above the average",
    description:
      "List employees who earn more than the company-wide average salary. Return first_name and salary, highest first.",
    difficulty: "medium",
    tags: ["SUBQUERY", "AGGREGATION"],
    solution: `SELECT first_name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY salary DESC`,
    orderMatters: true,
    hints: ["Put the AVG in a subquery inside the WHERE clause."],
  },
  {
    id: "M013",
    datasetId: "company",
    title: "Budget by city",
    description:
      "How much project budget is allocated to each office location? Return location and total_budget, largest first.",
    difficulty: "medium",
    tags: ["JOIN", "GROUP BY"],
    solution: `SELECT d.location, SUM(p.budget) AS total_budget
FROM projects p
JOIN departments d ON d.department_id = p.department_id
GROUP BY d.location
ORDER BY total_budget DESC`,
    orderMatters: true,
    hints: ["Projects link to departments, which carry the location."],
  },
  {
    id: "M014",
    datasetId: "company",
    title: "Team leads",
    description:
      "Which employees manage at least two people? Return first_name and reports (number of direct reports), most reports first, then first_name.",
    difficulty: "medium",
    tags: ["SELF JOIN", "GROUP BY", "HAVING"],
    solution: `SELECT m.first_name, COUNT(e.employee_id) AS reports
FROM employees m
JOIN employees e ON e.manager_id = m.employee_id
GROUP BY m.employee_id, m.first_name
HAVING COUNT(e.employee_id) >= 2
ORDER BY reports DESC, m.first_name`,
    orderMatters: true,
    hints: ["Self-join on manager_id and count the report side."],
  },
  {
    id: "M015",
    datasetId: "company",
    title: "Project duration",
    description:
      "For each completed project, show project_name and duration_days (end_date minus start_date in whole days). Longest first.",
    difficulty: "medium",
    tags: ["DATE FUNCTION", "NULL"],
    solution: `SELECT project_name,
       CAST(julianday(end_date) - julianday(start_date) AS INTEGER) AS duration_days
FROM projects
WHERE end_date IS NOT NULL
ORDER BY duration_days DESC`,
    orderMatters: true,
    hints: ["julianday(end_date) - julianday(start_date) gives days; CAST to INTEGER."],
  },

  // ───────────── E-Commerce ─────────────
  {
    id: "M016",
    datasetId: "ecommerce",
    title: "Top spenders",
    description:
      "Who are the three customers with the highest total spend on delivered orders? Return name and total_spent, highest first.",
    difficulty: "medium",
    tags: ["JOIN", "GROUP BY", "LIMIT"],
    solution: `SELECT c.name, SUM(o.total_amount) AS total_spent
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'delivered'
GROUP BY c.customer_id, c.name
ORDER BY total_spent DESC
LIMIT 3`,
    orderMatters: true,
    hints: ["Filter status before grouping, then ORDER BY the sum DESC LIMIT 3."],
  },
  {
    id: "M017",
    datasetId: "ecommerce",
    title: "Orders per customer",
    description:
      "Show every customer with their number of orders as order_count, including customers with none. Sort by order_count descending, then name.",
    difficulty: "medium",
    tags: ["LEFT JOIN", "GROUP BY"],
    solution: `SELECT c.name, COUNT(o.order_id) AS order_count
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
ORDER BY order_count DESC, c.name`,
    orderMatters: true,
    hints: ["LEFT JOIN from customers and COUNT(o.order_id)."],
  },
  {
    id: "M018",
    datasetId: "ecommerce",
    title: "Never ordered",
    description: "Which customers have never placed an order? Return name alphabetically.",
    difficulty: "medium",
    tags: ["LEFT JOIN", "NULL"],
    solution: `SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL
ORDER BY c.name`,
    orderMatters: true,
    hints: ["LEFT JOIN orders and keep the rows with no match."],
  },
  {
    id: "M019",
    datasetId: "ecommerce",
    title: "Revenue by category",
    description:
      "For delivered orders only, compute revenue per product category as the sum of quantity × price from order_items. Return category and revenue, highest first.",
    difficulty: "medium",
    tags: ["JOIN", "GROUP BY", "AGGREGATION"],
    solution: `SELECT p.category, SUM(oi.quantity * oi.price) AS revenue
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.status = 'delivered'
GROUP BY p.category
ORDER BY revenue DESC`,
    orderMatters: true,
    hints: ["Three tables: order_items → orders (for status) and → products (for category)."],
  },
  {
    id: "M020",
    datasetId: "ecommerce",
    title: "Best sellers",
    description:
      "Which five products have sold the most units across all orders? Return product_name and units_sold, highest first, then product_name.",
    difficulty: "medium",
    tags: ["JOIN", "GROUP BY", "LIMIT"],
    solution: `SELECT p.product_name, SUM(oi.quantity) AS units_sold
FROM products p
JOIN order_items oi ON oi.product_id = p.product_id
GROUP BY p.product_id, p.product_name
ORDER BY units_sold DESC, p.product_name
LIMIT 5`,
    orderMatters: true,
    hints: ["SUM(quantity) grouped by product; mind the tie-break on product_name."],
  },
  {
    id: "M021",
    datasetId: "ecommerce",
    title: "Dead stock",
    description:
      "Which products have never appeared in any order? Return product_name alphabetically.",
    difficulty: "medium",
    tags: ["LEFT JOIN", "NULL"],
    solution: `SELECT p.product_name
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.product_id
WHERE oi.order_item_id IS NULL
ORDER BY p.product_name`,
    orderMatters: true,
    hints: ["LEFT JOIN order_items and filter for IS NULL."],
  },
  {
    id: "M022",
    datasetId: "ecommerce",
    title: "Monthly revenue",
    description:
      "Show delivered revenue per month. Return month as 'YYYY-MM' text and revenue (sum of total_amount), in chronological order.",
    difficulty: "medium",
    tags: ["DATE FUNCTION", "GROUP BY"],
    solution: `SELECT strftime('%Y-%m', order_date) AS month, SUM(total_amount) AS revenue
FROM orders
WHERE status = 'delivered'
GROUP BY month
ORDER BY month`,
    orderMatters: true,
    hints: ["strftime('%Y-%m', order_date) gives the month bucket."],
  },
  {
    id: "M023",
    datasetId: "ecommerce",
    title: "Average order by status",
    description:
      "For each order status, show status and the average total_amount rounded to 2 decimals as avg_order_value. Sort by status.",
    difficulty: "medium",
    tags: ["GROUP BY", "AGGREGATION"],
    solution: `SELECT status, ROUND(AVG(total_amount), 2) AS avg_order_value
FROM orders
GROUP BY status
ORDER BY status`,
    orderMatters: true,
    hints: ["GROUP BY status with ROUND(AVG(total_amount), 2)."],
  },
  {
    id: "M024",
    datasetId: "ecommerce",
    title: "Multi-item orders",
    description:
      "Which orders contain two or more distinct line items? Return order_id and item_count, sorted by order_id.",
    difficulty: "medium",
    tags: ["GROUP BY", "HAVING"],
    solution: `SELECT order_id, COUNT(*) AS item_count
FROM order_items
GROUP BY order_id
HAVING COUNT(*) >= 2
ORDER BY order_id`,
    orderMatters: true,
    hints: ["GROUP BY order_id HAVING COUNT(*) >= 2."],
  },
  {
    id: "M025",
    datasetId: "ecommerce",
    title: "Revenue by city",
    description:
      "Which cities generate the most delivered revenue? Return city and revenue (sum of total_amount of delivered orders), highest first.",
    difficulty: "medium",
    tags: ["JOIN", "GROUP BY"],
    solution: `SELECT c.city, SUM(o.total_amount) AS revenue
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.status = 'delivered'
GROUP BY c.city
ORDER BY revenue DESC`,
    orderMatters: true,
    hints: ["Join orders to customers to get the city."],
  },
  {
    id: "M026",
    datasetId: "ecommerce",
    title: "Premium buyers",
    description:
      "List the distinct names of customers who have bought a product priced above ₹5,000 (in any order). Return name alphabetically.",
    difficulty: "medium",
    tags: ["JOIN", "DISTINCT", "SUBQUERY"],
    solution: `SELECT DISTINCT c.name
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE p.price > 5000
ORDER BY c.name`,
    orderMatters: true,
    hints: ["Chain customers → orders → order_items → products, then DISTINCT."],
  },
  {
    id: "M027",
    datasetId: "ecommerce",
    title: "Order size label",
    description:
      "Label each order as 'Large' when total_amount is at least 5000, 'Medium' when at least 2000, otherwise 'Small'. Return order_id, total_amount and size_label ordered by order_id.",
    difficulty: "medium",
    tags: ["CASE", "ORDER BY"],
    solution: `SELECT order_id, total_amount,
       CASE WHEN total_amount >= 5000 THEN 'Large'
            WHEN total_amount >= 2000 THEN 'Medium'
            ELSE 'Small' END AS size_label
FROM orders
ORDER BY order_id`,
    orderMatters: true,
    hints: ["A three-branch CASE expression."],
  },

  // ───────────── University ─────────────
  {
    id: "M028",
    datasetId: "university",
    title: "Enrollment per course",
    description:
      "Show every course with the number of enrolled students as enrolled, including courses with none. Sort by enrolled descending, then course_name.",
    difficulty: "medium",
    tags: ["LEFT JOIN", "GROUP BY"],
    solution: `SELECT c.course_name, COUNT(e.student_id) AS enrolled
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name
ORDER BY enrolled DESC, c.course_name`,
    orderMatters: true,
    hints: ["LEFT JOIN so Microeconomics shows up with 0."],
  },
  {
    id: "M029",
    datasetId: "university",
    title: "A-grade courses",
    description:
      "For each course that has at least one A grade, show course_name and a_grades (number of A grades). Most A's first, then course_name.",
    difficulty: "medium",
    tags: ["JOIN", "GROUP BY", "WHERE"],
    solution: `SELECT c.course_name, COUNT(*) AS a_grades
FROM enrollments e
JOIN courses c ON c.course_id = e.course_id
WHERE e.grade = 'A'
GROUP BY c.course_id, c.course_name
ORDER BY a_grades DESC, c.course_name`,
    orderMatters: true,
    hints: ["Filter grade = 'A' before grouping."],
  },
  {
    id: "M030",
    datasetId: "university",
    title: "Failed a course",
    description:
      "Which students have failed (grade 'F') at least one course? Return each student_name once, alphabetically.",
    difficulty: "medium",
    tags: ["JOIN", "DISTINCT"],
    solution: `SELECT DISTINCT s.student_name
FROM students s
JOIN enrollments e ON e.student_id = s.student_id
WHERE e.grade = 'F'
ORDER BY s.student_name`,
    orderMatters: true,
    hints: ["JOIN enrollments, WHERE grade = 'F', and DISTINCT the names."],
  },
  {
    id: "M031",
    datasetId: "university",
    title: "Department CGPA",
    description:
      "What is the average CGPA per department (ignoring students with no CGPA), rounded to 2 decimals? Return department and avg_cgpa, highest first.",
    difficulty: "medium",
    tags: ["GROUP BY", "AGGREGATION", "NULL"],
    solution: `SELECT department, ROUND(AVG(cgpa), 2) AS avg_cgpa
FROM students
GROUP BY department
ORDER BY avg_cgpa DESC`,
    orderMatters: true,
    hints: ["AVG skips NULLs on its own."],
  },
  {
    id: "M032",
    datasetId: "university",
    title: "Teaching load",
    description:
      "How many courses does each professor teach? Return name and course_count, most courses first, then name.",
    difficulty: "medium",
    tags: ["JOIN", "GROUP BY"],
    solution: `SELECT p.name, COUNT(c.course_id) AS course_count
FROM professors p
JOIN courses c ON c.professor_id = p.professor_id
GROUP BY p.professor_id, p.name
ORDER BY course_count DESC, p.name`,
    orderMatters: true,
    hints: ["Join courses to professors on professor_id."],
  },
  {
    id: "M033",
    datasetId: "university",
    title: "Database Systems roster",
    description:
      "List every student enrolled in 'Database Systems' with their grade. Return student_name and grade, sorted by student_name.",
    difficulty: "medium",
    tags: ["JOIN", "WHERE"],
    solution: `SELECT s.student_name, e.grade
FROM enrollments e
JOIN students s ON s.student_id = e.student_id
JOIN courses c ON c.course_id = e.course_id
WHERE c.course_name = 'Database Systems'
ORDER BY s.student_name`,
    orderMatters: true,
    hints: ["Join all three tables and filter by course_name."],
  },
  {
    id: "M034",
    datasetId: "university",
    title: "Grade distribution",
    description:
      "Count how many enrollments received each grade (ignore enrollments without a grade). Return grade and count as total, ordered by grade.",
    difficulty: "medium",
    tags: ["GROUP BY", "NULL"],
    solution: `SELECT grade, COUNT(*) AS total
FROM enrollments
WHERE grade IS NOT NULL
GROUP BY grade
ORDER BY grade`,
    orderMatters: true,
    hints: ["WHERE grade IS NOT NULL, then GROUP BY grade."],
  },
  {
    id: "M035",
    datasetId: "university",
    title: "Credit load",
    description:
      "For each student with at least one enrollment, show student_name and total_credits (sum of credits of the courses they are enrolled in). Highest first, then student_name.",
    difficulty: "medium",
    tags: ["JOIN", "GROUP BY"],
    solution: `SELECT s.student_name, SUM(c.credits) AS total_credits
FROM students s
JOIN enrollments e ON e.student_id = s.student_id
JOIN courses c ON c.course_id = e.course_id
GROUP BY s.student_id, s.student_name
ORDER BY total_credits DESC, s.student_name`,
    orderMatters: true,
    hints: ["Join students → enrollments → courses and SUM(credits)."],
  },
  {
    id: "M036",
    datasetId: "university",
    title: "Above department average",
    description:
      "Find students whose CGPA is higher than the average CGPA of their own department. Return student_name, department and cgpa, sorted by department then student_name.",
    difficulty: "medium",
    tags: ["SUBQUERY", "AGGREGATION"],
    solution: `SELECT s.student_name, s.department, s.cgpa
FROM students s
WHERE s.cgpa > (SELECT AVG(s2.cgpa) FROM students s2 WHERE s2.department = s.department)
ORDER BY s.department, s.student_name`,
    orderMatters: true,
    hints: ["A correlated subquery: compare with AVG(cgpa) WHERE department matches the outer row."],
  },
];
