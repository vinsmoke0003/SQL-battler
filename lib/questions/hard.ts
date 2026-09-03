import type { QuestionDef } from "./types";

export const hardQuestions: QuestionDef[] = [
  // ───────────── Company ─────────────
  {
    id: "H001",
    datasetId: "company",
    title: "Second-highest salary per department",
    description:
      "For each department, find the employee with the second-highest salary. Return department_name, first_name and salary, sorted by department_name.",
    difficulty: "hard",
    tags: ["WINDOW FUNCTION", "CTE", "JOIN"],
    solution: `WITH ranked AS (
  SELECT d.department_name, e.first_name, e.salary,
         DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS rnk
  FROM employees e
  JOIN departments d ON d.department_id = e.department_id
)
SELECT department_name, first_name, salary
FROM ranked
WHERE rnk = 2
ORDER BY department_name`,
    orderMatters: true,
    hints: [
      "DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC).",
      "Window functions can't go in WHERE — wrap them in a CTE or subquery first.",
    ],
  },
  {
    id: "H002",
    datasetId: "company",
    title: "Salary rank within department",
    description:
      "Rank every employee within their department by salary (1 = highest, ties share a rank). Return department_name, first_name, salary and salary_rank, sorted by department_name then salary_rank then first_name.",
    difficulty: "hard",
    tags: ["WINDOW FUNCTION", "JOIN"],
    solution: `SELECT d.department_name, e.first_name, e.salary,
       RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS salary_rank
FROM employees e
JOIN departments d ON d.department_id = e.department_id
ORDER BY d.department_name, salary_rank, e.first_name`,
    orderMatters: true,
    hints: ["RANK() OVER (PARTITION BY ... ORDER BY salary DESC)."],
  },
  {
    id: "H003",
    datasetId: "company",
    title: "Running payroll",
    description:
      "Order employees by hire date and show a running total of salary as of each hire. Return first_name, hire_date and running_total.",
    difficulty: "hard",
    tags: ["WINDOW FUNCTION", "ORDER BY"],
    solution: `SELECT first_name, hire_date,
       SUM(salary) OVER (ORDER BY hire_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM employees
ORDER BY hire_date`,
    orderMatters: true,
    hints: ["SUM(salary) OVER (ORDER BY hire_date) produces a cumulative sum."],
  },
  {
    id: "H004",
    datasetId: "company",
    title: "Out-earning the boss",
    description:
      "Find employees who earn more than their manager. Return manager_name and employee_name as full names ('First Last'), sorted by employee_name.",
    difficulty: "hard",
    tags: ["SELF JOIN", "STRING FUNCTION"],
    solution: `SELECT m.first_name || ' ' || m.last_name AS manager_name,
       e.first_name || ' ' || e.last_name AS employee_name
FROM employees e
JOIN employees m ON m.employee_id = e.manager_id
WHERE e.salary > m.salary
ORDER BY employee_name`,
    orderMatters: true,
    hints: ["Self-join on manager_id and compare the two salary columns."],
  },
  {
    id: "H005",
    datasetId: "company",
    title: "Payroll share",
    description:
      "For each department, compute its share of the total payroll of all employees assigned to a department. Return department_name, total_salary and pct (percentage rounded to 1 decimal), largest share first.",
    difficulty: "hard",
    tags: ["CTE", "SUBQUERY", "GROUP BY"],
    solution: `WITH dept AS (
  SELECT d.department_name, SUM(e.salary) AS total_salary
  FROM employees e
  JOIN departments d ON d.department_id = e.department_id
  GROUP BY d.department_id, d.department_name
)
SELECT department_name, total_salary,
       ROUND(100.0 * total_salary / (SELECT SUM(total_salary) FROM dept), 1) AS pct
FROM dept
ORDER BY total_salary DESC`,
    orderMatters: true,
    hints: [
      "Multiply by 100.0 (not 100) so SQLite does floating-point division.",
      "Compute per-department totals in a CTE, then divide by the sum of that CTE.",
    ],
  },
  {
    id: "H006",
    datasetId: "company",
    title: "Flagship project",
    description:
      "For each department that has projects, find the project with the largest budget. Return department_name, project_name and budget, sorted by department_name.",
    difficulty: "hard",
    tags: ["WINDOW FUNCTION", "CTE", "JOIN"],
    solution: `WITH ranked AS (
  SELECT d.department_name, p.project_name, p.budget,
         ROW_NUMBER() OVER (PARTITION BY p.department_id ORDER BY p.budget DESC) AS rn
  FROM projects p
  JOIN departments d ON d.department_id = p.department_id
)
SELECT department_name, project_name, budget
FROM ranked
WHERE rn = 1
ORDER BY department_name`,
    orderMatters: true,
    hints: ["ROW_NUMBER() partitioned by department, ordered by budget DESC, keep rn = 1."],
  },
  {
    id: "H007",
    datasetId: "company",
    title: "Cross-department contributors",
    description:
      "Which employees have worked on projects belonging to more than one department? Return first_name and department_count, sorted by first_name.",
    difficulty: "hard",
    tags: ["JOIN", "GROUP BY", "HAVING"],
    solution: `SELECT e.first_name, COUNT(DISTINCT p.department_id) AS department_count
FROM employees e
JOIN employee_projects ep ON ep.employee_id = e.employee_id
JOIN projects p ON p.project_id = ep.project_id
GROUP BY e.employee_id, e.first_name
HAVING COUNT(DISTINCT p.department_id) > 1
ORDER BY e.first_name`,
    orderMatters: true,
    hints: ["COUNT(DISTINCT p.department_id) — the department comes from the project, not the employee."],
  },
  {
    id: "H008",
    datasetId: "company",
    title: "Cumulative hiring",
    description:
      "For each hire year, show hire_year (text), hires (number hired that year) and cumulative_hires (running total of hires up to and including that year), in chronological order.",
    difficulty: "hard",
    tags: ["CTE", "WINDOW FUNCTION", "DATE FUNCTION"],
    solution: `WITH yearly AS (
  SELECT strftime('%Y', hire_date) AS hire_year, COUNT(*) AS hires
  FROM employees
  GROUP BY hire_year
)
SELECT hire_year, hires,
       SUM(hires) OVER (ORDER BY hire_year ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_hires
FROM yearly
ORDER BY hire_year`,
    orderMatters: true,
    hints: ["Aggregate per year in a CTE first, then apply SUM() OVER (ORDER BY hire_year)."],
  },
  {
    id: "H009",
    datasetId: "company",
    title: "Salary gap to department top",
    description:
      "For each employee assigned to a department, show first_name, department_name and gap_to_top: how much less they earn than the highest salary in their department. Sort by department_name, then gap_to_top ascending, then first_name.",
    difficulty: "hard",
    tags: ["WINDOW FUNCTION", "JOIN"],
    solution: `SELECT e.first_name, d.department_name,
       MAX(e.salary) OVER (PARTITION BY e.department_id) - e.salary AS gap_to_top
FROM employees e
JOIN departments d ON d.department_id = e.department_id
ORDER BY d.department_name, gap_to_top, e.first_name`,
    orderMatters: true,
    hints: ["MAX(salary) OVER (PARTITION BY department_id) gives the department maximum on every row."],
  },

  // ───────────── E-Commerce ─────────────
  {
    id: "H010",
    datasetId: "ecommerce",
    title: "Customer value ranking",
    description:
      "Rank customers by total spend on delivered orders (1 = highest, ties share a rank). Return name, total_spent and spend_rank, sorted by spend_rank then name. Only include customers with at least one delivered order.",
    difficulty: "hard",
    tags: ["WINDOW FUNCTION", "CTE", "GROUP BY"],
    solution: `WITH spend AS (
  SELECT c.name, SUM(o.total_amount) AS total_spent
  FROM customers c
  JOIN orders o ON o.customer_id = c.customer_id
  WHERE o.status = 'delivered'
  GROUP BY c.customer_id, c.name
)
SELECT name, total_spent, DENSE_RANK() OVER (ORDER BY total_spent DESC) AS spend_rank
FROM spend
ORDER BY spend_rank, name`,
    orderMatters: true,
    hints: ["Aggregate in a CTE, then DENSE_RANK() OVER (ORDER BY total_spent DESC)."],
  },
  {
    id: "H011",
    datasetId: "ecommerce",
    title: "Second order",
    description:
      "For every customer who has placed at least two orders, find the date of their second order. Return name and second_order_date, sorted by name.",
    difficulty: "hard",
    tags: ["WINDOW FUNCTION", "CTE", "JOIN"],
    solution: `WITH numbered AS (
  SELECT c.name, o.order_date,
         ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.order_date) AS rn
  FROM orders o
  JOIN customers c ON c.customer_id = o.customer_id
)
SELECT name, order_date AS second_order_date
FROM numbered
WHERE rn = 2
ORDER BY name`,
    orderMatters: true,
    hints: ["ROW_NUMBER() partitioned by customer, ordered by order_date; keep rn = 2."],
  },
  {
    id: "H012",
    datasetId: "ecommerce",
    title: "Days between orders",
    description:
      "For every order, show how many days passed since the same customer's previous order (NULL for their first). Return name, order_id and days_since_previous as a whole number, sorted by name then order_date.",
    difficulty: "hard",
    tags: ["WINDOW FUNCTION", "DATE FUNCTION"],
    solution: `SELECT c.name, o.order_id,
       CAST(julianday(o.order_date) - julianday(LAG(o.order_date) OVER (PARTITION BY o.customer_id ORDER BY o.order_date)) AS INTEGER) AS days_since_previous
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
ORDER BY c.name, o.order_date`,
    orderMatters: true,
    hints: [
      "LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) gives the previous order date.",
      "Subtract julianday() values and CAST to INTEGER.",
    ],
  },
  {
    id: "H013",
    datasetId: "ecommerce",
    title: "Category champion",
    description:
      "For each category that has sales, find the product with the most units sold (break ties alphabetically by product_name). Return category, product_name and units_sold, sorted by category.",
    difficulty: "hard",
    tags: ["WINDOW FUNCTION", "CTE", "GROUP BY"],
    solution: `WITH sales AS (
  SELECT p.category, p.product_name, SUM(oi.quantity) AS units_sold
  FROM products p
  JOIN order_items oi ON oi.product_id = p.product_id
  GROUP BY p.product_id, p.category, p.product_name
),
ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY units_sold DESC, product_name) AS rn
  FROM sales
)
SELECT category, product_name, units_sold
FROM ranked
WHERE rn = 1
ORDER BY category`,
    orderMatters: true,
    hints: ["Two CTEs: aggregate units per product, then ROW_NUMBER per category."],
  },
  {
    id: "H014",
    datasetId: "ecommerce",
    title: "Cumulative revenue",
    description:
      "Show delivered revenue per month along with the running total. Return month ('YYYY-MM'), revenue and cumulative_revenue in chronological order.",
    difficulty: "hard",
    tags: ["CTE", "WINDOW FUNCTION", "DATE FUNCTION"],
    solution: `WITH monthly AS (
  SELECT strftime('%Y-%m', order_date) AS month, SUM(total_amount) AS revenue
  FROM orders
  WHERE status = 'delivered'
  GROUP BY month
)
SELECT month, revenue,
       SUM(revenue) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_revenue
FROM monthly
ORDER BY month`,
    orderMatters: true,
    hints: ["Monthly totals in a CTE, then SUM(revenue) OVER (ORDER BY month)."],
  },
  {
    id: "H015",
    datasetId: "ecommerce",
    title: "Perfect record",
    description:
      "Find customers with at least two orders where every order was delivered. Return name and order_count, sorted by name.",
    difficulty: "hard",
    tags: ["GROUP BY", "HAVING", "CASE"],
    solution: `SELECT c.name, COUNT(*) AS order_count
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
HAVING COUNT(*) >= 2 AND COUNT(*) = SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END)
ORDER BY c.name`,
    orderMatters: true,
    hints: ["In HAVING, compare COUNT(*) with a conditional SUM of delivered orders."],
  },
  {
    id: "H016",
    datasetId: "ecommerce",
    title: "Above personal average",
    description:
      "List orders whose total_amount is greater than the average order value of that same customer. Return name, order_id and total_amount, sorted by name then order_id.",
    difficulty: "hard",
    tags: ["WINDOW FUNCTION", "CTE"],
    solution: `WITH with_avg AS (
  SELECT c.name, o.order_id, o.total_amount,
         AVG(o.total_amount) OVER (PARTITION BY o.customer_id) AS customer_avg
  FROM orders o
  JOIN customers c ON c.customer_id = o.customer_id
)
SELECT name, order_id, total_amount
FROM with_avg
WHERE total_amount > customer_avg
ORDER BY name, order_id`,
    orderMatters: true,
    hints: ["AVG(total_amount) OVER (PARTITION BY customer_id) — then filter in an outer query."],
  },
  {
    id: "H017",
    datasetId: "ecommerce",
    title: "Basket buddies",
    description:
      "Find pairs of products that appear together in the same order. Return product_a and product_b (product names, with product_a alphabetically before product_b) and times_together, sorted by times_together descending then product_a, product_b.",
    difficulty: "hard",
    tags: ["SELF JOIN", "GROUP BY"],
    solution: `SELECT pa.product_name AS product_a, pb.product_name AS product_b, COUNT(*) AS times_together
FROM order_items a
JOIN order_items b ON a.order_id = b.order_id AND a.product_id <> b.product_id
JOIN products pa ON pa.product_id = a.product_id
JOIN products pb ON pb.product_id = b.product_id
WHERE pa.product_name < pb.product_name
GROUP BY pa.product_name, pb.product_name
ORDER BY times_together DESC, product_a, product_b`,
    orderMatters: true,
    hints: [
      "Self-join order_items on order_id with different product_ids.",
      "Keep only one direction of each pair with product_a < product_b.",
    ],
  },

  // ───────────── University ─────────────
  {
    id: "H018",
    datasetId: "university",
    title: "Department topper",
    description:
      "Find the student with the highest CGPA in each department (ignore students without a CGPA). Return department, student_name and cgpa, sorted by department.",
    difficulty: "hard",
    tags: ["WINDOW FUNCTION", "CTE"],
    solution: `WITH ranked AS (
  SELECT department, student_name, cgpa,
         ROW_NUMBER() OVER (PARTITION BY department ORDER BY cgpa DESC) AS rn
  FROM students
  WHERE cgpa IS NOT NULL
)
SELECT department, student_name, cgpa
FROM ranked
WHERE rn = 1
ORDER BY department`,
    orderMatters: true,
    hints: ["ROW_NUMBER() partitioned by department, ordered by cgpa DESC."],
  },
  {
    id: "H019",
    datasetId: "university",
    title: "Grade points",
    description:
      "Convert grades to points (A=10, B=8, C=6, D=4, F=0), ignoring ungraded enrollments, and compute each student's average as avg_points rounded to 2 decimals. Return student_name and avg_points, highest first, then student_name.",
    difficulty: "hard",
    tags: ["CASE", "JOIN", "GROUP BY"],
    solution: `SELECT s.student_name,
       ROUND(AVG(CASE e.grade WHEN 'A' THEN 10 WHEN 'B' THEN 8 WHEN 'C' THEN 6 WHEN 'D' THEN 4 ELSE 0 END), 2) AS avg_points
FROM students s
JOIN enrollments e ON e.student_id = s.student_id
WHERE e.grade IS NOT NULL
GROUP BY s.student_id, s.student_name
ORDER BY avg_points DESC, s.student_name`,
    orderMatters: true,
    hints: ["Put the CASE expression inside AVG()."],
  },
  {
    id: "H020",
    datasetId: "university",
    title: "Course popularity within department",
    description:
      "Rank each department's courses by enrollment (1 = most enrolled, ties share a rank), including courses with zero enrollments. Return department, course_name, enrolled and popularity_rank, sorted by department, popularity_rank, course_name.",
    difficulty: "hard",
    tags: ["WINDOW FUNCTION", "LEFT JOIN", "CTE"],
    solution: `WITH counts AS (
  SELECT c.department, c.course_name, COUNT(e.student_id) AS enrolled
  FROM courses c
  LEFT JOIN enrollments e ON e.course_id = c.course_id
  GROUP BY c.course_id, c.department, c.course_name
)
SELECT department, course_name, enrolled,
       RANK() OVER (PARTITION BY department ORDER BY enrolled DESC) AS popularity_rank
FROM counts
ORDER BY department, popularity_rank, course_name`,
    orderMatters: true,
    hints: ["LEFT JOIN + COUNT in a CTE, then RANK() OVER (PARTITION BY department ...)."],
  },
  {
    id: "H021",
    datasetId: "university",
    title: "Took both",
    description:
      "Which students are enrolled in both 'Database Systems' and 'Data Structures'? Return student_name alphabetically.",
    difficulty: "hard",
    tags: ["SET OPERATION", "JOIN", "SUBQUERY"],
    solution: `SELECT s.student_name
FROM students s
WHERE s.student_id IN (
  SELECT e.student_id FROM enrollments e JOIN courses c ON c.course_id = e.course_id WHERE c.course_name = 'Database Systems'
  INTERSECT
  SELECT e.student_id FROM enrollments e JOIN courses c ON c.course_id = e.course_id WHERE c.course_name = 'Data Structures'
)
ORDER BY s.student_name`,
    orderMatters: true,
    hints: ["INTERSECT two sets of student_ids, or self-join enrollments on student_id."],
  },
  {
    id: "H022",
    datasetId: "university",
    title: "Professor report card",
    description:
      "For each professor, compute the average grade points (A=10, B=8, C=6, D=4, F=0) across all graded enrollments in the courses they teach. Return name and avg_points rounded to 2 decimals; professors with no graded enrollments should show NULL. Sort by avg_points descending (NULLs last), then name.",
    difficulty: "hard",
    tags: ["LEFT JOIN", "CASE", "GROUP BY", "NULL"],
    solution: `SELECT p.name,
       ROUND(AVG(CASE e.grade WHEN 'A' THEN 10 WHEN 'B' THEN 8 WHEN 'C' THEN 6 WHEN 'D' THEN 4 WHEN 'F' THEN 0 END), 2) AS avg_points
FROM professors p
LEFT JOIN courses c ON c.professor_id = p.professor_id
LEFT JOIN enrollments e ON e.course_id = c.course_id
GROUP BY p.professor_id, p.name
ORDER BY avg_points IS NULL, avg_points DESC, p.name`,
    orderMatters: true,
    hints: [
      "Two LEFT JOINs keep professors whose courses have no enrollments.",
      "A CASE with no ELSE returns NULL for ungraded rows, and AVG ignores NULLs.",
    ],
  },
];
