import type { McqQuestion } from "../types";

/**
 * Accenture PYQ Set 1 — MCQ bank.
 *
 * Written to match the six MCQ areas of Accenture's Stage 1 paper: English
 * Ability, Critical Reasoning & Problem Solving, Abstract Reasoning, Common
 * Applications & MS Office, Pseudo Code, and Fundamentals of Networking,
 * Security & Cloud. Pseudocode items follow Accenture's habit of printing a
 * short snippet and asking for the output; the networking/cloud items include
 * the two-statement format Accenture uses heavily.
 */
export const set1Mcq: McqQuestion[] = [
  // ───────────── English Ability ─────────────
  {
    id: "S1-ENG-01",
    prompt:
      "Choose the option that best replaces the underlined part: 'Neither the manager nor the team members __ aware of the revised deadline.'",
    options: ["was", "were", "has been", "is"],
    answerIndex: 1,
    explanation:
      "With 'neither … nor', the verb agrees with the nearer subject. 'Team members' is plural, so 'were' is correct.",
    topic: "Subject–verb agreement",
    difficulty: "easy",
  },
  {
    id: "S1-ENG-02",
    prompt: "Select the word most nearly OPPOSITE in meaning to 'MITIGATE'.",
    options: ["Alleviate", "Aggravate", "Moderate", "Diminish"],
    answerIndex: 1,
    explanation:
      "'Mitigate' means to make less severe. 'Aggravate' means to make worse, so it is the antonym. The other three are near-synonyms.",
    topic: "Vocabulary",
    difficulty: "easy",
  },
  {
    id: "S1-ENG-03",
    code: `Remote work has reshaped how organisations measure productivity. Where managers once
relied on visible presence, they now depend on delivery against agreed outcomes. Critics
argue this shift disadvantages junior employees, who learn informally by watching senior
colleagues. Supporters counter that structured mentoring, deliberately scheduled, teaches
more reliably than accidental observation ever did.`,
    prompt: "According to the passage, what do supporters of remote work argue?",
    options: [
      "Junior employees do not need mentoring at all",
      "Visible presence is the best measure of productivity",
      "Planned mentoring teaches more dependably than informal observation",
      "Remote work removes the need to measure outcomes",
    ],
    answerIndex: 2,
    explanation:
      "The last sentence states supporters counter that deliberately scheduled structured mentoring 'teaches more reliably than accidental observation'.",
    topic: "Reading comprehension",
    difficulty: "medium",
  },
  {
    id: "S1-ENG-04",
    prompt: "Identify the part of the sentence that contains an error: 'The list of items / were sent / to the vendor / yesterday.'",
    options: ["The list of items", "were sent", "to the vendor", "yesterday"],
    answerIndex: 1,
    explanation:
      "The subject is 'The list' (singular); 'of items' is a prepositional phrase. The verb should be 'was sent'.",
    topic: "Error spotting",
    difficulty: "medium",
  },
  {
    id: "S1-ENG-05",
    prompt: "Choose the correctly spelt word.",
    options: ["Accomodation", "Acommodation", "Accommodation", "Acomodation"],
    answerIndex: 2,
    explanation: "'Accommodation' takes a double 'c' and a double 'm'.",
    topic: "Spelling",
    difficulty: "easy",
  },

  // ───────────── Critical Reasoning & Problem Solving ─────────────
  {
    id: "S1-CR-01",
    prompt:
      "A train covers 360 km at a uniform speed. If the speed had been 10 km/h more, it would have taken 3 hours less. What is the original speed?",
    options: ["30 km/h", "40 km/h", "45 km/h", "50 km/h"],
    answerIndex: 0,
    explanation:
      "Let speed = x. Then 360/x − 360/(x+10) = 3 → 3600 = 3x(x+10) → x² + 10x − 1200 = 0 → (x+40)(x−30) = 0 → x = 30 km/h.",
    topic: "Time, speed and distance",
    difficulty: "medium",
  },
  {
    id: "S1-CR-02",
    prompt:
      "All engineers are problem solvers. Some problem solvers are designers. Which conclusion definitely follows?",
    options: [
      "All designers are engineers",
      "Some engineers are designers",
      "No engineer is a designer",
      "None of these conclusions definitely follows",
    ],
    answerIndex: 3,
    explanation:
      "The overlap between problem solvers and designers need not include any engineer, so no definite conclusion about engineers and designers can be drawn.",
    topic: "Syllogism",
    difficulty: "medium",
  },
  {
    id: "S1-CR-03",
    prompt:
      "A can finish a task in 12 days and B in 18 days. They work together for 4 days, then A leaves. How many more days does B need to finish?",
    options: ["6 days", "7 days", "8 days", "9 days"],
    answerIndex: 2,
    explanation:
      "Combined rate = 1/12 + 1/18 = 5/36 per day. In 4 days they finish 20/36 = 5/9. Remaining 4/9 at B's rate of 1/18 takes (4/9) × 18 = 8 days.",
    topic: "Time and work",
    difficulty: "medium",
  },
  {
    id: "S1-CR-04",
    prompt:
      "Pointing to a photograph, Rahul said, 'She is the daughter of my grandfather's only son.' How is the woman related to Rahul?",
    options: ["Sister", "Cousin", "Niece", "Aunt"],
    answerIndex: 0,
    explanation:
      "Rahul's grandfather's only son is Rahul's father. His daughter is therefore Rahul's sister.",
    topic: "Blood relations",
    difficulty: "easy",
  },
  {
    id: "S1-CR-05",
    prompt: "Find the next number in the series: 3, 7, 16, 35, 74, ?",
    options: ["135", "148", "153", "155"],
    answerIndex: 2,
    explanation:
      "Each term follows tₙ = 2 × tₙ₋₁ + n where n increases: 3→7 (×2+1), 7→16 (×2+2), 16→35 (×2+3), 35→74 (×2+4), 74×2+5 = 153.",
    topic: "Number series",
    difficulty: "medium",
  },

  // ───────────── Abstract Reasoning ─────────────
  {
    id: "S1-AR-01",
    prompt:
      "In a certain code, COMPUTER is written as RETUPMOC. How is SOFTWARE written in that code?",
    options: ["ERAWTFOS", "ERAWTFSO", "TFOSERAW", "EAWTRFOS"],
    answerIndex: 0,
    explanation: "The code simply reverses the letters. SOFTWARE reversed is ERAWTFOS.",
    topic: "Coding–decoding",
    difficulty: "easy",
  },
  {
    id: "S1-AR-02",
    prompt: "If in a code MONDAY is written as 123456, and DAY is 456, what does NOM stand for?",
    options: ["213", "231", "321", "312"],
    answerIndex: 2,
    explanation:
      "M=1, O=2, N=3, D=4, A=5, Y=6. So N=3, O=2, M=1, giving 321.",
    topic: "Coding–decoding",
    difficulty: "easy",
  },
  {
    id: "S1-AR-03",
    prompt:
      "A cube is painted red on all faces and cut into 27 equal smaller cubes. How many small cubes have exactly two faces painted?",
    options: ["6", "8", "12", "9"],
    answerIndex: 2,
    explanation:
      "In a 3×3×3 cube, the cubes with exactly two painted faces sit on the edges but not corners: 12 edges × 1 cube each = 12.",
    topic: "Cubes and dice",
    difficulty: "medium",
  },

  // ───────────── Common Applications & MS Office ─────────────
  {
    id: "S1-OFF-01",
    prompt: "What is the result of the formula =AVERAGE(5, 10, 15) in Excel?",
    options: ["5", "10", "15", "30"],
    answerIndex: 1,
    explanation: "AVERAGE sums the arguments and divides by their count: (5+10+15)/3 = 10.",
    topic: "Excel formulas",
    difficulty: "easy",
  },
  {
    id: "S1-OFF-02",
    prompt: 'What does =CONCATENATE("Good", " ", "Morning") return in Excel?',
    options: ["GoodMorning", "Good Morning", "Good, Morning", "#VALUE!"],
    answerIndex: 1,
    explanation:
      "CONCATENATE joins its arguments in order, including the explicit space, giving 'Good Morning'.",
    topic: "Excel formulas",
    difficulty: "easy",
  },
  {
    id: "S1-OFF-03",
    prompt: "Which keyboard shortcut centre-aligns the selected text in MS Word?",
    options: ["Ctrl + E", "Ctrl + R", "Ctrl + L", "Ctrl + J"],
    answerIndex: 0,
    explanation:
      "Ctrl + E centres text. Ctrl + L is left align, Ctrl + R right align and Ctrl + J justify.",
    topic: "Word shortcuts",
    difficulty: "easy",
  },
  {
    id: "S1-OFF-04",
    prompt: "In an email, what is the 'CC' field used for?",
    options: [
      "To include recipients who should be aware but need take no action",
      "To indicate the primary recipients of the message",
      "To hide recipients from one another",
      "To attach a copy of the message to your drafts",
    ],
    answerIndex: 0,
    explanation:
      "CC (carbon copy) keeps people informed without making them the primary recipient. Hiding recipients is BCC.",
    topic: "Email basics",
    difficulty: "easy",
  },
  {
    id: "S1-OFF-05",
    prompt: "In Excel, which reference stays fixed when a formula is copied to another cell?",
    options: ["A1", "$A$1", "A$1", "$A1"],
    answerIndex: 1,
    explanation:
      "$A$1 is an absolute reference: both column and row are locked. A$1 and $A1 lock only one part.",
    topic: "Excel references",
    difficulty: "medium",
  },
  {
    id: "S1-OFF-06",
    prompt: "Which default Windows application is used for editing simple, unformatted text files?",
    options: ["Notepad", "WordPad", "Sticky Notes", "Task Manager"],
    answerIndex: 0,
    explanation:
      "Notepad is the plain-text editor. WordPad supports rich formatting, so it is not 'simple text'.",
    topic: "Common applications",
    difficulty: "easy",
  },

  // ───────────── Pseudo Code ─────────────
  {
    id: "S1-PSE-01",
    code: `Integer fun(Integer a, Integer b)
{
    if (a < b)
        return fun(b, a)
    else if (b != 0)
        return (a * fun(a, b - 1))
    else
        return 1
}
// called as fun(5, 5)`,
    prompt: "What is the output of the above pseudocode?",
    options: ["625", "3125", "15625", "525"],
    answerIndex: 1,
    explanation:
      "Each call multiplies a by the result of fun(a, b−1) until b reaches 0, which returns 1. That is 5 multiplied by itself 5 times = 5⁵ = 3125.",
    topic: "Recursion",
    difficulty: "medium",
  },
  {
    id: "S1-PSE-02",
    code: `Integer arr[5] = {1, 2, 3, 4, 5}
Integer i
for (i = 0; i < 4; i++)
{
    arr[i] = arr[i] + arr[i + 1]
}
print arr[0], arr[1], arr[2], arr[3], arr[4]`,
    prompt: "What does the pseudocode print?",
    options: ["3 5 7 9 5", "1 3 5 7 9", "3 5 7 9 10", "2 4 6 8 5"],
    answerIndex: 0,
    explanation:
      "Each element is replaced by itself plus the next, left to right, and the updated values are not reused because arr[i+1] is always still original when read: 1+2=3, 2+3=5, 3+4=7, 4+5=9, arr[4] untouched = 5.",
    topic: "Arrays and loops",
    difficulty: "medium",
  },
  {
    id: "S1-PSE-03",
    code: `Integer fun(Integer x, Integer y)
{
    while (x > 0)
    {
        x = x - 1
        y = y - 1
    }
    return y
}
// called as fun(5, 7)`,
    prompt: "What value is returned?",
    options: ["0", "2", "5", "7"],
    answerIndex: 1,
    explanation: "The loop runs 5 times, decrementing y each pass: 7 − 5 = 2.",
    topic: "Loops",
    difficulty: "easy",
  },
  {
    id: "S1-PSE-04",
    code: `Character c = 'a'
print c using format "%d"`,
    prompt: "What is printed?",
    options: ["a", "97", "65", "Error"],
    answerIndex: 1,
    explanation:
      "Printing a character with an integer format specifier prints its ASCII value. Lowercase 'a' is 97.",
    topic: "Data types",
    difficulty: "easy",
  },
  {
    id: "S1-PSE-05",
    code: `Integer i = 5
Integer j
j = i++ + ++i
print i, j`,
    prompt: "What is printed?",
    options: ["7 12", "7 11", "6 12", "7 13"],
    answerIndex: 0,
    explanation:
      "i++ yields 5 and makes i = 6; ++i then makes i = 7 and yields 7. So j = 5 + 7 = 12 and i = 7.",
    topic: "Increment operators",
    difficulty: "hard",
  },
  {
    id: "S1-PSE-06",
    code: `Integer a = 12, b = 10
a = a ^ b
b = a ^ b
a = a ^ b
print a, b`,
    prompt: "What is printed?",
    options: ["12 10", "10 12", "0 0", "22 2"],
    answerIndex: 1,
    explanation:
      "This is the classic XOR swap: after the three operations a and b have exchanged values, giving 10 12.",
    topic: "Bitwise operators",
    difficulty: "medium",
  },

  // ───────────── Networking, Security & Cloud ─────────────
  {
    id: "S1-NSC-01",
    code: `Statement I: Virtualization allows multiple operating systems to run on a single physical machine.
Statement II: Virtualization improves hardware utilisation and reduces cost.`,
    prompt: "Which of the statements is/are true?",
    options: [
      "Only Statement I is true",
      "Only Statement II is true",
      "Both Statement I and Statement II are true",
      "Neither statement is true",
    ],
    answerIndex: 2,
    explanation:
      "A hypervisor runs several guest operating systems on one host, and consolidating workloads onto fewer machines raises utilisation and lowers cost. Both are true.",
    topic: "Virtualisation",
    difficulty: "easy",
  },
  {
    id: "S1-NSC-02",
    prompt: "Which encryption method uses a pair of keys — one public, one private?",
    options: ["Symmetric encryption", "Asymmetric encryption", "Hashing", "Steganography"],
    answerIndex: 1,
    explanation:
      "Asymmetric (public-key) encryption uses a public key to encrypt and a matching private key to decrypt. Symmetric uses one shared key; hashing is one-way.",
    topic: "Cryptography",
    difficulty: "easy",
  },
  {
    id: "S1-NSC-03",
    prompt: "Which of the following is a characteristic of the hybrid cloud deployment model?",
    options: [
      "Resources are shared between multiple unrelated organisations",
      "Resources are dedicated solely to a single organisation",
      "A combination of public and private cloud, with data and applications moving between them",
      "Infrastructure is available to the general public only",
    ],
    answerIndex: 2,
    explanation:
      "Hybrid cloud combines private and public cloud so workloads and data can move between them. Option 1 describes community cloud, option 2 private and option 4 public.",
    topic: "Cloud deployment models",
    difficulty: "easy",
  },
  {
    id: "S1-NSC-04",
    prompt: "What is the primary purpose of the Transport Layer Security (TLS) protocol?",
    options: [
      "Encrypting data in transit",
      "Authenticating users against a directory",
      "Balancing load across servers",
      "Monitoring network traffic for intrusions",
    ],
    answerIndex: 0,
    explanation:
      "TLS secures data as it travels across a network, providing confidentiality and integrity. It is what puts the 'S' in HTTPS.",
    topic: "Network security",
    difficulty: "easy",
  },
  {
    id: "S1-NSC-05",
    prompt: "Which of these is an example of Platform as a Service (PaaS)?",
    options: ["Google Drive", "Amazon EC2", "Heroku", "Microsoft Word"],
    answerIndex: 2,
    explanation:
      "Heroku supplies a managed platform where you deploy code without managing servers. Google Drive is SaaS and EC2 is IaaS.",
    topic: "Cloud service models",
    difficulty: "medium",
  },
  {
    id: "S1-NSC-06",
    prompt: "Which security property ensures that data has not been altered during transmission?",
    options: ["Authentication", "Confidentiality", "Integrity", "Availability"],
    answerIndex: 2,
    explanation:
      "Integrity guarantees data is unchanged. Authentication proves identity, confidentiality prevents disclosure and availability keeps a service reachable.",
    topic: "Security fundamentals",
    difficulty: "easy",
  },
];
