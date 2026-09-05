import type { McqQuestion } from "../types";

/**
 * Accenture PYQ Set 2 — MCQ bank. Same six areas as Set 1, different questions,
 * with the technical sections leaning slightly harder.
 */
export const set2Mcq: McqQuestion[] = [
  // ───────────── English Ability ─────────────
  {
    id: "S2-ENG-01",
    prompt:
      "Fill in the blank: 'The committee has still not arrived __ a decision about the proposal.'",
    options: ["on", "at", "to", "in"],
    answerIndex: 1,
    explanation: "The fixed collocation is 'arrive at a decision'.",
    topic: "Prepositions",
    difficulty: "easy",
  },
  {
    id: "S2-ENG-02",
    prompt: "Choose the word closest in meaning to 'PRUDENT'.",
    options: ["Reckless", "Cautious", "Generous", "Indifferent"],
    answerIndex: 1,
    explanation: "'Prudent' means showing care and thought for the future — i.e. cautious.",
    topic: "Vocabulary",
    difficulty: "easy",
  },
  {
    id: "S2-ENG-03",
    code: `Automation in customer service began as a cost-cutting measure. Chatbots handled the
simple, repetitive queries that once consumed most of an agent's day. The unintended
consequence was that the remaining human workload became uniformly difficult: agents now
face only the complex, emotionally charged cases. Retention has fallen, and several firms
have started routing a share of easy queries back to humans purely to relieve the strain.`,
    prompt: "Why do some firms route easy queries back to human agents?",
    options: [
      "Because chatbots cannot answer simple questions accurately",
      "To reduce the cost of running automation software",
      "To relieve the strain of handling only difficult cases",
      "Because customers refuse to speak to chatbots",
    ],
    answerIndex: 2,
    explanation:
      "The passage says firms route easy queries back to humans 'purely to relieve the strain' created by a uniformly difficult workload.",
    topic: "Reading comprehension",
    difficulty: "medium",
  },
  {
    id: "S2-ENG-04",
    prompt:
      "Choose the option that correctly rearranges the sentence: (P) the new policy (Q) was rejected (R) by the board (S) unanimously",
    options: ["P Q R S", "P Q S R", "P S Q R", "Q P R S"],
    answerIndex: 1,
    explanation:
      "'The new policy was rejected unanimously by the board' reads naturally, placing the adverb before the agent: P Q S R.",
    topic: "Sentence rearrangement",
    difficulty: "medium",
  },
  {
    id: "S2-ENG-05",
    prompt: "Identify the error: 'Each of the participants / have submitted / their assignment / on time.'",
    options: ["Each of the participants", "have submitted", "their assignment", "on time"],
    answerIndex: 1,
    explanation: "'Each' is singular, so the verb must be 'has submitted'.",
    topic: "Error spotting",
    difficulty: "medium",
  },

  // ───────────── Critical Reasoning & Problem Solving ─────────────
  {
    id: "S2-CR-01",
    prompt:
      "A shopkeeper marks an item 40% above cost and then gives a 25% discount. What is the profit percentage?",
    options: ["5%", "10%", "15%", "12.5%"],
    answerIndex: 0,
    explanation:
      "Let cost = 100. Marked price = 140. After 25% discount, selling price = 105. Profit = 5 on 100 = 5%.",
    topic: "Profit and loss",
    difficulty: "medium",
  },
  {
    id: "S2-CR-02",
    prompt:
      "In a class of 60 students, 35 play cricket, 30 play football and 15 play both. How many play neither?",
    options: ["5", "10", "15", "20"],
    answerIndex: 1,
    explanation:
      "Students playing at least one = 35 + 30 − 15 = 50. Neither = 60 − 50 = 10.",
    topic: "Sets and Venn diagrams",
    difficulty: "medium",
  },
  {
    id: "S2-CR-03",
    prompt:
      "Statement: All keys are locks. No lock is a door. Conclusion I: No key is a door. Conclusion II: Some locks are keys. Which follows?",
    options: [
      "Only Conclusion I follows",
      "Only Conclusion II follows",
      "Both conclusions follow",
      "Neither conclusion follows",
    ],
    answerIndex: 2,
    explanation:
      "All keys are locks and no lock is a door, so no key can be a door (I follows). 'All keys are locks' also implies some locks are keys (II follows).",
    topic: "Syllogism",
    difficulty: "medium",
  },
  {
    id: "S2-CR-04",
    prompt:
      "The average age of 5 members is 28 years. A new member joins and the average becomes 27. What is the new member's age?",
    options: ["21 years", "22 years", "23 years", "24 years"],
    answerIndex: 1,
    explanation:
      "Original total = 140. New total = 27 × 6 = 162. New member's age = 162 − 140 = 22.",
    topic: "Averages",
    difficulty: "easy",
  },
  {
    id: "S2-CR-05",
    prompt: "Complete the series: 5, 11, 23, 47, 95, ?",
    options: ["190", "191", "189", "193"],
    answerIndex: 1,
    explanation: "Each term is double the previous plus 1: 95 × 2 + 1 = 191.",
    topic: "Number series",
    difficulty: "easy",
  },

  // ───────────── Abstract Reasoning ─────────────
  {
    id: "S2-AR-01",
    prompt:
      "If TABLE is coded as 20112125 using letter positions, how is CAT coded?",
    options: ["3120", "3121", "312", "1320"],
    answerIndex: 0,
    explanation: "C = 3, A = 1, T = 20, concatenated gives 3120.",
    topic: "Coding–decoding",
    difficulty: "easy",
  },
  {
    id: "S2-AR-02",
    prompt:
      "Find the odd one out: 8, 27, 64, 100, 125",
    options: ["27", "64", "100", "125"],
    answerIndex: 2,
    explanation:
      "8, 27, 64 and 125 are perfect cubes (2³, 3³, 4³, 5³). 100 is a perfect square, not a cube.",
    topic: "Odd one out",
    difficulty: "easy",
  },
  {
    id: "S2-AR-03",
    prompt:
      "A man walks 5 km north, turns right and walks 3 km, turns right again and walks 5 km. How far is he from the starting point?",
    options: ["3 km", "5 km", "8 km", "13 km"],
    answerIndex: 0,
    explanation:
      "He ends level with his start on the north–south axis, displaced only by the 3 km eastward leg. Distance = 3 km.",
    topic: "Direction sense",
    difficulty: "medium",
  },

  // ───────────── Common Applications & MS Office ─────────────
  {
    id: "S2-OFF-01",
    prompt: "Which Excel function counts only the cells in a range that meet a given condition?",
    options: ["COUNT", "COUNTA", "COUNTIF", "SUMIF"],
    answerIndex: 2,
    explanation:
      "COUNTIF counts cells matching a criterion. COUNT counts numeric cells, COUNTA counts non-empty cells and SUMIF adds rather than counts.",
    topic: "Excel formulas",
    difficulty: "easy",
  },
  {
    id: "S2-OFF-02",
    prompt: "In MS Word, which shortcut applies underline to the selected text?",
    options: ["Ctrl + B", "Ctrl + I", "Ctrl + U", "Ctrl + D"],
    answerIndex: 2,
    explanation: "Ctrl + U underlines. Ctrl + B is bold and Ctrl + I is italic.",
    topic: "Word shortcuts",
    difficulty: "easy",
  },
  {
    id: "S2-OFF-03",
    prompt: "What does the Excel formula =VLOOKUP(A2, D2:F10, 3, FALSE) return?",
    options: [
      "The value from the 3rd column of D2:F10 where the first column exactly matches A2",
      "The value from the 3rd row of D2:F10",
      "The nearest approximate match to A2 in column D",
      "An error, because the last argument must be TRUE",
    ],
    answerIndex: 0,
    explanation:
      "VLOOKUP searches the first column of the range for A2 and returns the value in the 3rd column of that row. FALSE requests an exact match.",
    topic: "Excel formulas",
    difficulty: "medium",
  },
  {
    id: "S2-OFF-04",
    prompt: "In PowerPoint, which view is best suited to reordering slides quickly?",
    options: ["Normal view", "Slide Sorter view", "Reading view", "Presenter view"],
    answerIndex: 1,
    explanation:
      "Slide Sorter shows thumbnails of every slide so they can be dragged into a new order.",
    topic: "PowerPoint",
    difficulty: "easy",
  },
  {
    id: "S2-OFF-05",
    prompt: "What is the difference between 'Save' and 'Save As'?",
    options: [
      "'Save As' always creates a PDF",
      "'Save' overwrites the existing file; 'Save As' writes to a new name or location",
      "'Save' works only on new files",
      "There is no difference",
    ],
    answerIndex: 1,
    explanation:
      "'Save' updates the current file in place. 'Save As' lets you choose a new name, location or format, leaving the original intact.",
    topic: "Common applications",
    difficulty: "easy",
  },
  {
    id: "S2-OFF-06",
    prompt: "Which keyboard shortcut opens the Find and Replace dialog in MS Word?",
    options: ["Ctrl + F", "Ctrl + H", "Ctrl + R", "Ctrl + P"],
    answerIndex: 1,
    explanation:
      "Ctrl + H opens Find and Replace. Ctrl + F opens Find only.",
    topic: "Word shortcuts",
    difficulty: "medium",
  },

  // ───────────── Pseudo Code ─────────────
  {
    id: "S2-PSE-01",
    code: `Integer i, sum = 0
for (i = 1; i <= 5; i++)
{
    if (i % 2 == 0)
        continue
    sum = sum + i
}
print sum`,
    prompt: "What is printed?",
    options: ["6", "9", "15", "10"],
    answerIndex: 1,
    explanation:
      "'continue' skips the even values, so only 1 + 3 + 5 are added, giving 9.",
    topic: "Loops and control flow",
    difficulty: "easy",
  },
  {
    id: "S2-PSE-02",
    code: `Integer fib(Integer n)
{
    if (n <= 1)
        return n
    return fib(n - 1) + fib(n - 2)
}
print fib(6)`,
    prompt: "What is the output?",
    options: ["5", "8", "13", "6"],
    answerIndex: 1,
    explanation:
      "The sequence from fib(0) is 0, 1, 1, 2, 3, 5, 8 — so fib(6) = 8.",
    topic: "Recursion",
    difficulty: "medium",
  },
  {
    id: "S2-PSE-03",
    code: `Integer arr[6] = {3, 2, 1, 7, 5, 4}
Integer i, j, temp
for (i = 0; i < 5; i++)
{
    for (j = 0; j < 5 - i; j++)
    {
        if (arr[j] > arr[j + 1])
        {
            temp = arr[j]
            arr[j] = arr[j + 1]
            arr[j + 1] = temp
        }
    }
}
print arr[0], arr[5]`,
    prompt: "What is printed?",
    options: ["3 4", "1 7", "1 4", "7 1"],
    answerIndex: 1,
    explanation:
      "This is bubble sort, which leaves the array as 1 2 3 4 5 7. The first element is 1 and the last is 7.",
    topic: "Sorting",
    difficulty: "medium",
  },
  {
    id: "S2-PSE-04",
    code: `Integer x = 10
Integer fun()
{
    Static Integer count = 0
    count = count + 1
    return count
}
print fun(), fun(), fun()`,
    prompt: "What is printed?",
    options: ["1 1 1", "1 2 3", "3 3 3", "0 1 2"],
    answerIndex: 1,
    explanation:
      "A static local variable keeps its value between calls, so count increments across the three calls: 1 2 3.",
    topic: "Static variables",
    difficulty: "medium",
  },
  {
    id: "S2-PSE-05",
    code: `String s = "accenture"
Integer i, count = 0
for (i = 0; i < length(s); i++)
{
    if (s[i] == 'a' OR s[i] == 'e' OR s[i] == 'i' OR s[i] == 'o' OR s[i] == 'u')
        count = count + 1
}
print count`,
    prompt: "What is printed?",
    options: ["3", "4", "5", "6"],
    answerIndex: 1,
    explanation:
      "The vowels in 'accenture' are a, e, u, e — four in total.",
    topic: "Strings",
    difficulty: "easy",
  },
  {
    id: "S2-PSE-06",
    code: `Integer a = 5, b = 2
print a / b, a % b, a * 1.0 / b`,
    prompt: "Assuming integer division for integer operands, what is printed?",
    options: ["2 1 2.5", "2.5 1 2.5", "2 1 2", "2.5 0 2.5"],
    answerIndex: 0,
    explanation:
      "5/2 with two integers truncates to 2; 5%2 leaves remainder 1; multiplying by 1.0 promotes to floating point, giving 2.5.",
    topic: "Operators and type promotion",
    difficulty: "hard",
  },

  // ───────────── Networking, Security & Cloud ─────────────
  {
    id: "S2-NSC-01",
    code: `Statement I: Cloud storage provides a scalable solution for data storage.
Statement II: Cloud storage requires significant on-premises hardware investment.`,
    prompt: "Which of the statements is/are true?",
    options: [
      "Only Statement I is true",
      "Only Statement II is true",
      "Both statements are true",
      "Neither statement is true",
    ],
    answerIndex: 0,
    explanation:
      "Cloud storage scales on demand (I is true), and its central selling point is avoiding on-premises hardware spend, so II is false.",
    topic: "Cloud fundamentals",
    difficulty: "easy",
  },
  {
    id: "S2-NSC-02",
    prompt: "Which factors are critical for ensuring high availability in cloud computing?",
    options: [
      "Load balancing only",
      "Data redundancy only",
      "Both load balancing and data redundancy",
      "Network latency",
    ],
    answerIndex: 2,
    explanation:
      "High availability needs traffic spread across healthy nodes (load balancing) and data surviving a node loss (redundancy). Latency is a performance concern, not availability.",
    topic: "Cloud architecture",
    difficulty: "medium",
  },
  {
    id: "S2-NSC-03",
    prompt: "What is the primary benefit of edge computing in IoT applications?",
    options: [
      "Reduced data storage costs",
      "Reduced latency by processing data near its source",
      "Improved encryption strength",
      "Increased bandwidth capacity",
    ],
    answerIndex: 1,
    explanation:
      "Edge computing processes data close to where it is generated, cutting the round trip to a distant data centre and therefore latency.",
    topic: "Edge computing",
    difficulty: "medium",
  },
  {
    id: "S2-NSC-04",
    prompt: "Which device operates at Layer 3 of the OSI model and forwards packets between networks?",
    options: ["Hub", "Switch", "Router", "Repeater"],
    answerIndex: 2,
    explanation:
      "A router works at the network layer using IP addresses. Switches operate at Layer 2 and hubs/repeaters at Layer 1.",
    topic: "Networking devices",
    difficulty: "easy",
  },
  {
    id: "S2-NSC-05",
    prompt: "In a phishing attack, what is the attacker primarily trying to do?",
    options: [
      "Overwhelm a server with traffic",
      "Trick a user into revealing credentials or sensitive data",
      "Encrypt files and demand payment",
      "Intercept traffic between two hosts silently",
    ],
    answerIndex: 1,
    explanation:
      "Phishing uses deceptive messages to make the victim hand over information. Flooding is DoS, encryption for payment is ransomware and silent interception is man-in-the-middle.",
    topic: "Security threats",
    difficulty: "easy",
  },
  {
    id: "S2-NSC-06",
    prompt: "Under the cloud shared responsibility model for IaaS, who is responsible for patching the guest operating system?",
    options: [
      "The cloud provider",
      "The customer",
      "Neither party — patching is automatic",
      "A third-party auditor",
    ],
    answerIndex: 1,
    explanation:
      "With IaaS the provider secures the physical infrastructure and hypervisor; everything from the guest OS upward, including patching, belongs to the customer.",
    topic: "Cloud security",
    difficulty: "hard",
  },
];
