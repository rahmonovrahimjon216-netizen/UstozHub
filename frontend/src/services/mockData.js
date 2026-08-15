import { get, set, KEYS } from './storageService';

const TEACHER_1_ID = 'teacher_001';
const TEACHER_2_ID = 'teacher_002';

const CLASS_1 = 'class_001';
const CLASS_2 = 'class_002';
const CLASS_3 = 'class_003';
const CLASS_4 = 'class_004';

export const initializeMockData = () => {
  if (get(KEYS.INITIALIZED)) return;

  // --- Teachers ---
  set(KEYS.TEACHERS, [
    {
      id: TEACHER_1_ID,
      fullName: 'Alisher Nazarov',
      email: 'teacher@example.com',
      phone: '+998 90 123 45 67',
      password: 'password123',
      avatar: null,
      role: 'teacher',
      createdAt: '2025-01-10T08:00:00Z',
    },
    {
      id: TEACHER_2_ID,
      fullName: 'Malika Yusupova',
      email: 'malika@example.com',
      phone: '+998 91 234 56 78',
      password: 'password123',
      avatar: null,
      role: 'teacher',
      createdAt: '2025-01-15T08:00:00Z',
    },
  ]);

  // --- Classes ---
  set(KEYS.CLASSES, [
    { id: CLASS_1, teacherId: TEACHER_1_ID, name: '9-A', subject: 'JavaScript', room: '301', classCode: 'JS9A-4821', description: 'Advanced JavaScript for 9th grade', schedule: 'Mon, Wed, Fri 09:00-10:30', createdAt: '2025-01-20T08:00:00Z' },
    { id: CLASS_2, teacherId: TEACHER_1_ID, name: '10-B', subject: 'React', room: '302', classCode: 'RC10B-2934', description: 'React.js framework for 10th grade', schedule: 'Tue, Thu 10:30-12:00', createdAt: '2025-01-20T08:00:00Z' },
    { id: CLASS_3, teacherId: TEACHER_1_ID, name: '8-A', subject: 'HTML & CSS', room: '303', classCode: 'HT8A-5517', description: 'Web fundamentals for 8th grade', schedule: 'Mon, Wed 13:00-14:30', createdAt: '2025-01-20T08:00:00Z' },
    { id: CLASS_4, teacherId: TEACHER_2_ID, name: '11-C', subject: 'Python', room: '201', classCode: 'PY11C-7731', description: 'Python programming for 11th grade', schedule: 'Tue, Thu, Fri 09:00-10:30', createdAt: '2025-01-25T08:00:00Z' },
  ]);

  // --- Students (Teacher 1) ---
  const students1 = [
    { fullName: 'Ali Valiyev', classId: CLASS_1, gender: 'male', status: 'active' },
    { fullName: 'Barno Toshmatova', classId: CLASS_1, gender: 'female', status: 'active' },
    { fullName: 'Davron Xolmatov', classId: CLASS_1, gender: 'male', status: 'active' },
    { fullName: 'Gulnora Rashidova', classId: CLASS_1, gender: 'female', status: 'active' },
    { fullName: 'Hasan Karimov', classId: CLASS_1, gender: 'male', status: 'active' },
    { fullName: 'Iroda Yusupova', classId: CLASS_1, gender: 'female', status: 'active' },
    { fullName: 'Jasur Mirzayev', classId: CLASS_1, gender: 'male', status: 'active' },
    { fullName: 'Kamola Saidova', classId: CLASS_1, gender: 'female', status: 'active' },
    { fullName: 'Laziz Xasanov', classId: CLASS_1, gender: 'male', status: 'active' },
    { fullName: 'Mohira Begova', classId: CLASS_1, gender: 'female', status: 'active' },
    { fullName: 'Nodir Ergashev', classId: CLASS_2, gender: 'male', status: 'active' },
    { fullName: 'Oydin Usmonova', classId: CLASS_2, gender: 'female', status: 'active' },
    { fullName: 'Parviz Tursunov', classId: CLASS_2, gender: 'male', status: 'active' },
    { fullName: 'Rano Alieva', classId: CLASS_2, gender: 'female', status: 'active' },
    { fullName: 'Sardor Nazarov', classId: CLASS_2, gender: 'male', status: 'active' },
    { fullName: 'Shahlo Qodirov', classId: CLASS_2, gender: 'female', status: 'active' },
    { fullName: 'Temur Ashrapov', classId: CLASS_3, gender: 'male', status: 'active' },
    { fullName: 'Umida Xolova', classId: CLASS_3, gender: 'female', status: 'active' },
    { fullName: 'Vohid Sobirov', classId: CLASS_3, gender: 'male', status: 'active' },
    { fullName: 'Xilola Tosheva', classId: CLASS_3, gender: 'female', status: 'active' },
    { fullName: 'Yoqubjon Raximov', classId: CLASS_3, gender: 'male', status: 'active' },
    { fullName: 'Zulfiya Ibragimova', classId: CLASS_3, gender: 'female', status: 'active' },
    { fullName: 'Abdulloh Haydarov', classId: CLASS_1, gender: 'male', status: 'inactive' },
    { fullName: 'Bibi Sodiqova', classId: CLASS_2, gender: 'female', status: 'active' },
    { fullName: 'Eldor Fayzullayev', classId: CLASS_3, gender: 'male', status: 'active' },
    { fullName: 'Feruza Xolmatova', classId: CLASS_1, gender: 'female', status: 'active' },
    { fullName: 'Gʻayrat Toshmatov', classId: CLASS_2, gender: 'male', status: 'active' },
    { fullName: 'Holida Karimova', classId: CLASS_3, gender: 'female', status: 'active' },
  ];

  const studentIds = [];
  const allStudents = [];
  const now = new Date();

  students1.forEach((s, i) => {
    const id = `student_t1_${String(i + 1).padStart(3, '0')}`;
    studentIds.push(id);
    allStudents.push({
      id,
      teacherId: TEACHER_1_ID,
      classId: s.classId,
      fullName: s.fullName,
      studentId: `STU-${1000 + i}`,
      phone: `+998 9${i % 4} ${String(100 + i * 7).padStart(3, '0')} ${String(10 + i * 3).padStart(2, '0')} ${String(i * 13 % 99).padStart(2, '0')}`,
      parentName: `${s.fullName.split(' ')[1]}'s parent`,
      parentPhone: `+998 9${(i + 2) % 4} 000 00 ${String(i).padStart(2, '0')}`,
      dateOfBirth: `200${5 + (i % 4)}-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
      gender: s.gender,
      status: s.status,
      notes: '',
      avatar: null,
      createdAt: '2025-09-01T08:00:00Z',
    });
  });

  // Teacher 2 students
  for (let i = 0; i < 5; i++) {
    allStudents.push({
      id: `student_t2_${String(i + 1).padStart(3, '0')}`,
      teacherId: TEACHER_2_ID,
      classId: CLASS_4,
      fullName: `Teacher2 Student ${i + 1}`,
      studentId: `STU-T2-${100 + i}`,
      phone: '+998 99 999 99 99',
      parentName: 'Parent Name',
      parentPhone: '+998 99 999 99 99',
      dateOfBirth: '2006-01-01',
      gender: i % 2 === 0 ? 'male' : 'female',
      status: 'active',
      notes: '',
      avatar: null,
      createdAt: '2025-09-01T08:00:00Z',
    });
  }

  set(KEYS.STUDENTS, allStudents);

  // --- Attendance (last 14 days for Teacher 1) ---
  const attendance = [];
  const statuses = ['present', 'present', 'present', 'present', 'present', 'absent', 'sick', 'late'];
  const classStudents = {
    [CLASS_1]: studentIds.slice(0, 10),
    [CLASS_2]: studentIds.slice(10, 16),
    [CLASS_3]: studentIds.slice(16, 22),
  };

  for (let day = 14; day >= 0; day--) {
    const d = new Date(now);
    d.setDate(d.getDate() - day);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    const dateStr = d.toISOString().split('T')[0];

    Object.entries(classStudents).forEach(([classId, sIds]) => {
      sIds.forEach((sid, idx) => {
        attendance.push({
          id: `att_${dateStr}_${sid}`,
          teacherId: TEACHER_1_ID,
          classId,
          studentId: sid,
          date: dateStr,
          status: statuses[(idx + day) % statuses.length],
          note: '',
          createdAt: new Date(d).toISOString(),
        });
      });
    });
  }
  set(KEYS.ATTENDANCE, attendance);

  // --- Grades ---
  const gradeTypes = ['homework', 'quiz', 'test', 'exam', 'participation'];
  const grades = [];
  studentIds.slice(0, 22).forEach((sid, i) => {
    const classId = i < 10 ? CLASS_1 : i < 16 ? CLASS_2 : CLASS_3;
    gradeTypes.forEach((type, ti) => {
      grades.push({
        id: `grade_${sid}_${type}`,
        teacherId: TEACHER_1_ID,
        classId,
        studentId: sid,
        type,
        score: Math.max(3, Math.min(5, 4 + (((i + ti) % 3) - 1))),
        date: `2026-0${(ti + 1)}-${String((i % 28) + 1).padStart(2, '0')}`,
        note: '',
        createdAt: new Date().toISOString(),
      });
    });
  });
  set(KEYS.GRADES, grades);

  // --- Homework ---
  set(KEYS.HOMEWORK, [
    {
      id: 'hw_001',
      teacherId: TEACHER_1_ID,
      classId: CLASS_1,
      title: 'JavaScript Arrays & Objects',
      description: 'Complete exercises 1-15 from chapter 4. Submit via GitHub.',
      subject: 'JavaScript',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      priority: 'high',
      status: 'active',
      submissions: studentIds.slice(0, 8).map(sid => ({ studentId: sid, status: 'submitted', grade: 5, submittedAt: new Date().toISOString() })),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'hw_002',
      teacherId: TEACHER_1_ID,
      classId: CLASS_2,
      title: 'Build a React Todo App',
      description: 'Create a fully functional todo application using React hooks.',
      subject: 'React',
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      priority: 'high',
      status: 'active',
      submissions: studentIds.slice(10, 14).map(sid => ({ studentId: sid, status: 'submitted', grade: 4, submittedAt: new Date().toISOString() })),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'hw_003',
      teacherId: TEACHER_1_ID,
      classId: CLASS_3,
      title: 'CSS Flexbox Practice',
      description: 'Build the layout from the provided mockup using CSS Flexbox.',
      subject: 'HTML & CSS',
      dueDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      priority: 'medium',
      status: 'overdue',
      submissions: studentIds.slice(16, 20).map(sid => ({ studentId: sid, status: 'submitted', grade: 5, submittedAt: new Date().toISOString() })),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'hw_004',
      teacherId: TEACHER_1_ID,
      classId: CLASS_1,
      title: 'Async JavaScript - Promises',
      description: 'Read chapter 7 and complete the promise exercises.',
      subject: 'JavaScript',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: 'medium',
      status: 'draft',
      submissions: [],
      createdAt: new Date().toISOString(),
    },
  ]);

  // --- Schedule ---
  set(KEYS.SCHEDULE, [
    { id: 'sch_001', teacherId: TEACHER_1_ID, classId: CLASS_1, className: '9-A', subject: 'JavaScript', day: 'monday', startTime: '09:00', endTime: '10:30', room: '301', color: '#7c3aed' },
    { id: 'sch_002', teacherId: TEACHER_1_ID, classId: CLASS_2, className: '10-B', subject: 'React', day: 'monday', startTime: '11:00', endTime: '12:30', room: '302', color: '#2563eb' },
    { id: 'sch_003', teacherId: TEACHER_1_ID, classId: CLASS_3, className: '8-A', subject: 'HTML & CSS', day: 'monday', startTime: '14:00', endTime: '15:30', room: '303', color: '#0891b2' },
    { id: 'sch_004', teacherId: TEACHER_1_ID, classId: CLASS_2, className: '10-B', subject: 'React', day: 'tuesday', startTime: '09:00', endTime: '10:30', room: '302', color: '#2563eb' },
    { id: 'sch_005', teacherId: TEACHER_1_ID, classId: CLASS_1, className: '9-A', subject: 'JavaScript', day: 'tuesday', startTime: '11:00', endTime: '12:30', room: '301', color: '#7c3aed' },
    { id: 'sch_006', teacherId: TEACHER_1_ID, classId: CLASS_1, className: '9-A', subject: 'JavaScript', day: 'wednesday', startTime: '09:00', endTime: '10:30', room: '301', color: '#7c3aed' },
    { id: 'sch_007', teacherId: TEACHER_1_ID, classId: CLASS_3, className: '8-A', subject: 'HTML & CSS', day: 'wednesday', startTime: '13:00', endTime: '14:30', room: '303', color: '#0891b2' },
    { id: 'sch_008', teacherId: TEACHER_1_ID, classId: CLASS_2, className: '10-B', subject: 'React', day: 'thursday', startTime: '10:30', endTime: '12:00', room: '302', color: '#2563eb' },
    { id: 'sch_009', teacherId: TEACHER_1_ID, classId: CLASS_1, className: '9-A', subject: 'JavaScript', day: 'friday', startTime: '09:00', endTime: '10:30', room: '301', color: '#7c3aed' },
    { id: 'sch_010', teacherId: TEACHER_1_ID, classId: CLASS_3, className: '8-A', subject: 'HTML & CSS', day: 'friday', startTime: '11:00', endTime: '12:30', room: '303', color: '#0891b2' },
  ]);

  // --- Notifications ---
  set(KEYS.NOTIFICATIONS, [
    { id: 'notif_001', teacherId: TEACHER_1_ID, title: 'Absence Alert', message: 'Hasan Karimov has been absent for 3 consecutive days.', type: 'warning', isRead: false, createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
    { id: 'notif_002', teacherId: TEACHER_1_ID, title: 'Excellent Grade', message: 'Ali Valiyev received a grade of 5 on the JavaScript test.', type: 'success', isRead: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: 'notif_003', teacherId: TEACHER_1_ID, title: 'Homework Due Soon', message: 'JavaScript Arrays & Objects homework is due in 2 days.', type: 'info', isRead: false, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: 'notif_004', teacherId: TEACHER_1_ID, title: 'Parent Meeting', message: 'Parent-teacher meeting is scheduled for this Friday at 16:00.', type: 'info', isRead: true, createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
    { id: 'notif_005', teacherId: TEACHER_1_ID, title: 'New Student Enrolled', message: 'Feruza Xolmatova has been added to class 9-A.', type: 'success', isRead: true, createdAt: new Date(Date.now() - 48 * 3600000).toISOString() },
    { id: 'notif_006', teacherId: TEACHER_2_ID, title: 'Test Reminder', message: "Don't forget the Python quiz scheduled for tomorrow.", type: 'info', isRead: false, createdAt: new Date().toISOString() },
  ]);

  set(KEYS.INITIALIZED, true);
};

export default { initializeMockData };
