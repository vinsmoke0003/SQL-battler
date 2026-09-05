import type { CodingQuestion } from "../types";

/**
 * Accenture coding-round questions, taken from the problems that recur in
 * previous papers. Accenture gives 3 problems in 60 minutes and expects two
 * fully working solutions plus one partial.
 *
 * Solutions are written and run as JavaScript in a sandboxed worker; the real
 * round accepts C/C++/Java/Python/JS, but the logic being tested is identical.
 */
export const codingQuestions: CodingQuestion[] = [
  {
    id: "COD-RATS",
    title: "Rat count house",
    statement:
      "A colony of rats must be fed. Each rat eats exactly `unit` units of food. Houses are visited in order and all the food in a house is taken. Return the minimum number of houses needed to feed every rat. If the houses together do not hold enough food, return 0. If the array is null or empty, return -1.",
    functionName: "minHouses",
    signature: "function minHouses(r, unit, arr)",
    constraints: [
      "r = number of rats, unit = food eaten per rat",
      "arr = food available in each house, visited left to right",
      "Return 0 when the total food is insufficient, -1 when arr is null/empty",
    ],
    starterCode: `function minHouses(r, unit, arr) {
  // r: number of rats, unit: food per rat, arr: food in each house

}`,
    testCases: [
      { input: [7, 2, [2, 8, 3, 5, 7, 4, 1, 2]], expected: 4 },
      { input: [5, 3, [1, 2, 3, 4, 5]], expected: 5 },
      { input: [10, 2, [1, 1, 1]], expected: 0 },
      { input: [3, 1, null], expected: -1, hidden: true },
      { input: [1, 4, [10]], expected: 1, hidden: true },
      { input: [4, 5, [20, 1]], expected: 1, hidden: true },
    ],
    solution: `function minHouses(r, unit, arr) {
  if (!arr || arr.length === 0) return -1;
  const needed = r * unit;
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
    if (total >= needed) return i + 1;
  }
  return 0;
}`,
    explanation:
      "Total food required is r × unit. Walk the houses accumulating food and return the index (1-based) at which the running total first covers the requirement. Falling off the end means there was never enough, so return 0.",
    topic: "Arrays, prefix sums",
    difficulty: "medium",
  },
  {
    id: "COD-BINOPS",
    title: "Binary string operations",
    statement:
      "You are given a string of binary digits separated by operator letters: A means AND, B means OR and C means XOR. Evaluate the expression strictly from left to right, ignoring normal operator precedence, and return the resulting bit.",
    functionName: "evaluateBinary",
    signature: "function evaluateBinary(s)",
    constraints: [
      "The string alternates digit, operator, digit, operator, … digit",
      "Operators: A = AND, B = OR, C = XOR",
      "Evaluate left to right with no precedence",
    ],
    starterCode: `function evaluateBinary(s) {
  // e.g. "1C0C1C1A0B1" -> evaluate left to right

}`,
    testCases: [
      { input: ["0C1A1B1C1C1B0A0"], expected: 0 },
      { input: ["1C0C1C1A0B1"], expected: 1 },
      { input: ["1A1"], expected: 1 },
      { input: ["1B0"], expected: 1, hidden: true },
      { input: ["1C1"], expected: 0, hidden: true },
      { input: ["0"], expected: 0, hidden: true },
    ],
    solution: `function evaluateBinary(s) {
  let result = Number(s[0]);
  for (let i = 1; i < s.length; i += 2) {
    const op = s[i];
    const operand = Number(s[i + 1]);
    if (op === 'A') result = result & operand;
    else if (op === 'B') result = result | operand;
    else if (op === 'C') result = result ^ operand;
  }
  return result;
}`,
    explanation:
      "Seed the accumulator with the first digit, then step through the string two characters at a time — operator followed by operand — applying each operation immediately so evaluation stays strictly left to right.",
    topic: "Strings, bitwise operators",
    difficulty: "medium",
  },
  {
    id: "COD-PASSWORD",
    title: "Password validator",
    statement:
      "Validate a password. It is valid when it is at least 4 characters long, contains at least one digit, contains at least one uppercase letter, contains no space and no forward slash, and does not start with a digit. Return 1 if valid and 0 otherwise.",
    functionName: "validatePassword",
    signature: "function validatePassword(pwd)",
    constraints: [
      "Minimum length 4",
      "At least one digit and one uppercase letter",
      "No space and no '/' character",
      "Must not begin with a digit",
    ],
    starterCode: `function validatePassword(pwd) {
  // return 1 if valid, 0 otherwise

}`,
    testCases: [
      { input: ["aA1_67"], expected: 1 },
      { input: ["abc"], expected: 0 },
      { input: ["1aA234"], expected: 0 },
      { input: ["aA1 67"], expected: 0, hidden: true },
      { input: ["aA1/67"], expected: 0, hidden: true },
      { input: ["abcd1"], expected: 0, hidden: true },
      { input: ["Ab1x"], expected: 1, hidden: true },
    ],
    solution: `function validatePassword(pwd) {
  if (!pwd || pwd.length < 4) return 0;
  if (pwd[0] >= '0' && pwd[0] <= '9') return 0;
  let hasDigit = false, hasUpper = false;
  for (const ch of pwd) {
    if (ch === ' ' || ch === '/') return 0;
    if (ch >= '0' && ch <= '9') hasDigit = true;
    if (ch >= 'A' && ch <= 'Z') hasUpper = true;
  }
  return hasDigit && hasUpper ? 1 : 0;
}`,
    explanation:
      "Check the cheap disqualifiers first (length, leading digit), then scan once, rejecting forbidden characters and recording whether a digit and an uppercase letter were seen.",
    topic: "Strings, conditionals",
    difficulty: "easy",
  },
  {
    id: "COD-CARRIES",
    title: "Count carries in addition",
    statement:
      "When two numbers are added by hand, digit by digit from the right, a carry may be generated at each column. Given two non-negative integers, return the total number of carries produced while adding them.",
    functionName: "countCarries",
    signature: "function countCarries(a, b)",
    constraints: ["Both numbers are non-negative", "Add digit by digit from the least significant end"],
    starterCode: `function countCarries(a, b) {
  // e.g. 451 + 349 produces 2 carries

}`,
    testCases: [
      { input: [451, 349], expected: 2 },
      { input: [123, 456], expected: 0 },
      { input: [999, 1], expected: 3 },
      { input: [0, 0], expected: 0, hidden: true },
      { input: [1234, 5678], expected: 2, hidden: true },
      { input: [55, 45], expected: 2, hidden: true },
    ],
    solution: `function countCarries(a, b) {
  let carry = 0, count = 0;
  while (a > 0 || b > 0) {
    const sum = (a % 10) + (b % 10) + carry;
    carry = sum > 9 ? 1 : 0;
    if (carry) count++;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return count;
}`,
    explanation:
      "Peel one digit off each number at a time, add them with the incoming carry, and count every column whose sum exceeds 9. Continue until both numbers are exhausted.",
    topic: "Numbers, digit manipulation",
    difficulty: "medium",
  },
  {
    id: "COD-DIFFSUM",
    title: "Difference of sums",
    statement:
      "For every integer from 1 to m, split them into those divisible by n and those not. Return the absolute difference between the sum of the numbers not divisible by n and the sum of those divisible by n.",
    functionName: "differenceOfSums",
    signature: "function differenceOfSums(n, m)",
    constraints: ["Consider the range 1 to m inclusive", "Return the absolute difference"],
    starterCode: `function differenceOfSums(n, m) {

}`,
    testCases: [
      { input: [4, 20], expected: 90 },
      { input: [2, 10], expected: 5 },
      { input: [3, 9], expected: 9, hidden: true },
      { input: [5, 5], expected: 5, hidden: true },
      { input: [1, 5], expected: 15, hidden: true },
    ],
    solution: `function differenceOfSums(n, m) {
  let divisible = 0, notDivisible = 0;
  for (let i = 1; i <= m; i++) {
    if (i % n === 0) divisible += i;
    else notDivisible += i;
  }
  return Math.abs(notDivisible - divisible);
}`,
    explanation:
      "Walk 1 to m once, adding each number to one of two running totals depending on divisibility by n, then return the absolute difference.",
    topic: "Loops, arithmetic",
    difficulty: "easy",
  },
  {
    id: "COD-HYPHEN",
    title: "Move hyphens to the front",
    statement:
      "Given a string, move every hyphen to the front of the string while keeping the order of all remaining characters unchanged. Return the resulting string.",
    functionName: "moveHyphens",
    signature: "function moveHyphens(s)",
    constraints: ["Preserve the relative order of non-hyphen characters"],
    starterCode: `function moveHyphens(s) {
  // "String-Compare" -> "-StringCompare"

}`,
    testCases: [
      { input: ["String-Compare"], expected: "-StringCompare" },
      { input: ["-abc-def-"], expected: "---abcdef" },
      { input: ["nohyphen"], expected: "nohyphen" },
      { input: ["---"], expected: "---", hidden: true },
      { input: [""], expected: "", hidden: true },
      { input: ["a-b"], expected: "-ab", hidden: true },
    ],
    solution: `function moveHyphens(s) {
  let hyphens = '', rest = '';
  for (const ch of s) {
    if (ch === '-') hyphens += ch;
    else rest += ch;
  }
  return hyphens + rest;
}`,
    explanation:
      "Make one pass collecting hyphens into one buffer and everything else into another, preserving order, then concatenate the hyphens in front.",
    topic: "Strings",
    difficulty: "easy",
  },
];
