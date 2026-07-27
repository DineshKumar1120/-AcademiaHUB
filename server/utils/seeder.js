const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Assignment = require('../models/Assignment');
const AssignmentQuestion = require('../models/AssignmentQuestion');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Notification = require('../models/Notification');

dotenv.config({ path: '../.env' });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college_assignment_db');
    console.log('MongoDB Connected for seeding...');

    await User.deleteMany({});
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Department.deleteMany({});
    await Course.deleteMany({});
    await Subject.deleteMany({});
    await Assignment.deleteMany({});
    await AssignmentQuestion.deleteMany({});
    await AssignmentSubmission.deleteMany({});
    await Notification.deleteMany({});

    console.log('Cleared existing data.');

    // 1. Create Departments
    const deptCS = await Department.create({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science and Software Engineering'
    });
    const deptEE = await Department.create({
      name: 'Electrical Engineering',
      code: 'EE',
      description: 'Department of Electrical & Electronics Engineering'
    });

    // 2. Create Courses
    const courseBTechCS = await Course.create({
      name: 'B.Tech Computer Science',
      code: 'BTECH-CSE',
      departmentId: deptCS._id,
      durationYears: 4
    });

    // 3. Create Users
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@college.edu',
      password: 'Password123!',
      role: 'ADMIN',
      phone: '+1 555-0100'
    });

    const facultyUser = await User.create({
      name: 'Dr. Alan Turing',
      email: 'faculty@college.edu',
      password: 'Password123!',
      role: 'FACULTY',
      phone: '+1 555-0101'
    });

    const studentUser = await User.create({
      name: 'Alex Johnson',
      email: 'student@college.edu',
      password: 'Password123!',
      role: 'STUDENT',
      phone: '+1 555-0102'
    });

    // 4. Profiles
    await Faculty.create({
      userId: facultyUser._id,
      employeeId: 'EMP-1001',
      departmentId: deptCS._id,
      designation: 'Associate Professor',
      specialization: 'Algorithms & AI'
    });

    await Student.create({
      userId: studentUser._id,
      rollNo: 'STU-2024-001',
      departmentId: deptCS._id,
      courseId: courseBTechCS._id,
      semester: 6,
      batchYear: '2022-2026'
    });

    // 5. Subjects
    const subjectAlgo = await Subject.create({
      name: 'Advanced Data Structures & Algorithms',
      code: 'CS601',
      departmentId: deptCS._id,
      courseId: courseBTechCS._id,
      semester: 6,
      facultyId: facultyUser._id
    });

    const subjectDB = await Subject.create({
      name: 'Database Management Systems',
      code: 'CS602',
      departmentId: deptCS._id,
      courseId: courseBTechCS._id,
      semester: 6,
      facultyId: facultyUser._id
    });

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // 6. Create 1 File Assignment
    const fileAssign = await Assignment.create({
      title: 'Graph Algorithms & Shortest Path Implementation',
      description: 'Implement Dijkstra\'s and Floyd-Warshall algorithms. Submit detailed PDF analysis with execution time benchmarking.',
      type: 'FILE',
      subjectId: subjectAlgo._id,
      departmentId: deptCS._id,
      createdBy: facultyUser._id,
      dueDate: nextWeek,
      totalMarks: 100,
      status: 'ACTIVE'
    });

    // 7. Create 1 MCQ Quiz Assignment
    const mcqAssign = await Assignment.create({
      title: 'DBMS Normalization & Relational Algebra Quiz',
      description: 'Test your understanding of 1NF, 2NF, 3NF, BCNF, and relational operators.',
      type: 'MCQ',
      subjectId: subjectDB._id,
      departmentId: deptCS._id,
      createdBy: facultyUser._id,
      dueDate: nextWeek,
      totalMarks: 15,
      timeLimitMinutes: 10,
      status: 'ACTIVE'
    });

    // Add MCQ Questions
    await AssignmentQuestion.create([
      {
        assignmentId: mcqAssign._id,
        questionText: 'Which normal form eliminates partial key dependencies in a relational table?',
        options: [
          { optionLetter: 'A', optionText: 'First Normal Form (1NF)' },
          { optionLetter: 'B', optionText: 'Second Normal Form (2NF)' },
          { optionLetter: 'C', optionText: 'Third Normal Form (3NF)' },
          { optionLetter: 'D', optionText: 'Boyce-Codd Normal Form (BCNF)' }
        ],
        correctOptionLetter: 'B',
        marks: 5
      },
      {
        assignmentId: mcqAssign._id,
        questionText: 'What type of dependency occurs when a non-key attribute depends on another non-key attribute?',
        options: [
          { optionLetter: 'A', optionText: 'Partial Dependency' },
          { optionLetter: 'B', optionText: 'Transitive Dependency' },
          { optionLetter: 'C', optionText: 'Full Dependency' },
          { optionLetter: 'D', optionText: 'Multivalued Dependency' }
        ],
        correctOptionLetter: 'B',
        marks: 5
      },
      {
        assignmentId: mcqAssign._id,
        questionText: 'In relational algebra, which operator performs horizontal filtering of rows?',
        options: [
          { optionLetter: 'A', optionText: 'Projection (π)' },
          { optionLetter: 'B', optionText: 'Selection (σ)' },
          { optionLetter: 'C', optionText: 'Cartesian Product (×)' },
          { optionLetter: 'D', optionText: 'Union (∪)' }
        ],
        correctOptionLetter: 'B',
        marks: 5
      }
    ]);

    // 8. Create 1 Programming Assignment
    const progAssign = await Assignment.create({
      title: 'Two Sum Problem',
      description: 'Find two numbers in an array that add up to a target sum.',
      type: 'PROGRAMMING',
      subjectId: subjectAlgo._id,
      departmentId: deptCS._id,
      createdBy: facultyUser._id,
      dueDate: nextWeek,
      totalMarks: 50,
      problemStatement: 'Given an array of integers space-separated on the first line, and a target integer on the second line, print the 0-based indices of the two numbers that add up to the target.',
      inputFormat: 'Line 1: Space-separated integers (e.g. 2 7 11 15)\nLine 2: Target integer (e.g. 9)',
      outputFormat: 'Space-separated indices (e.g. 0 1)',
      constraints: '2 <= Array length <= 10^4, -10^9 <= target <= 10^9',
      sampleInput: '2 7 11 15\n9',
      sampleOutput: '0 1',
      allowedLanguages: ['python', 'javascript', 'cpp', 'java'],
      testCases: [
        {
          input: '2 7 11 15\n9',
          expectedOutput: '0 1',
          isHidden: false,
          weight: 1
        },
        {
          input: '3 2 4\n6',
          expectedOutput: '1 2',
          isHidden: false,
          weight: 1
        },
        {
          input: '3 3\n6',
          expectedOutput: '0 1',
          isHidden: true,
          weight: 1
        }
      ],
      starterCode: {
        python: `# Two Sum Solution in Python\nimport sys\n\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    if len(lines) < 2: return\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1].strip())\n    \n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            print(f"{lookup[diff]} {i}")\n            return\n        lookup[num] = i\n\nif __name__ == '__main__':\n    main()\n`,
        javascript: `// Two Sum Solution in JavaScript\nconst fs = require('fs');\n\nfunction main() {\n  const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n  if (input.length < 2) return;\n  const nums = input[0].trim().split(/\\s+/).map(Number);\n  const target = Number(input[1].trim());\n  \n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      console.log(\`\${map.get(diff)} \${i}\`);\n      return;\n    }\n    map.set(nums[i], i);\n  }\n}\n\nmain();\n`
      },
      status: 'ACTIVE'
    });

    console.log('Advanced Seeding completed successfully!');
    console.log('Demo Credentials:');
    console.log('Admin:    admin@college.edu   / Password123!');
    console.log('Faculty:  faculty@college.edu / Password123!');
    console.log('Student:  student@college.edu / Password123!');

    process.exit();
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
