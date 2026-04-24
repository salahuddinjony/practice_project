import { Grade } from "../enrolledCourse.interface.js";

export type FinalMarkedResult = {
  total: number;
  grade: Grade;
  gradePoints: number;
  status: "PASS" | "FAIL" | "N/A";
  isCourseCompleted: boolean;
};

// syntax -Pick<OriginalType, "key1" | "key2">

type Assessments = Pick<
  import("../enrolledCourse.interface.js").CourseMarks,
  "classTest1" | "midTerm" | "classTest2" | "finalExam"
>;

export const calculateGrade = (totalMarks: number): Grade => {
  if (totalMarks <= 0) return "N/A";
  if (totalMarks >= 80) return "A+";
  if (totalMarks >= 70) return "A";
  if (totalMarks >= 60) return "A-";
  if (totalMarks >= 50) return "B";
  if (totalMarks >= 40) return "C";
  if (totalMarks >= 33) return "D";
  return "F";
};

// CGPA-style point mapping on a 4.00 scale
export const calculateGradePoints = (totalMarks: number): number => {
  if (totalMarks <= 0) return 0;
  if (totalMarks >= 80) return 4.0;
  if (totalMarks >= 70) return 3.75;
  if (totalMarks >= 60) return 3.5;
  if (totalMarks >= 50) return 3.0;
  if (totalMarks >= 40) return 2.5;
  if (totalMarks >= 33) return 2.0;
  return 0;
};

export const calculateStatus = (grade: Grade) => {
  if (grade === "N/A") return "N/A" as const;
  return grade === "F" ? ("FAIL" as const) : ("PASS" as const);
};

export const mergeAssessmentMarks = (
  existingMarks: Assessments,
  incomingMarks: Partial<Assessments>,
): Assessments => ({
  classTest1: incomingMarks.classTest1 ?? existingMarks.classTest1,
  midTerm: incomingMarks.midTerm ?? existingMarks.midTerm,
  classTest2: incomingMarks.classTest2 ?? existingMarks.classTest2,
  finalExam: incomingMarks.finalExam ?? existingMarks.finalExam,
});

export const areAllAssessmentsAvailable = (marks: Assessments): boolean =>
  [marks.classTest1, marks.midTerm, marks.classTest2, marks.finalExam].every(
    (mark) => mark > 0,
  );

export const calculateTotalMarks = (marks: Assessments): number =>
  marks.classTest1 + marks.midTerm + marks.classTest2 + marks.finalExam;

export const evaluateCourseMarks = (marks: Assessments): FinalMarkedResult => {

  const total = calculateTotalMarks(marks);
  const hasAllTestMarks = areAllAssessmentsAvailable(marks);

  if (!hasAllTestMarks) {
    return {
      total,
      grade: "N/A" as Grade,
      gradePoints: 0,
      status: "N/A" as const,
      isCourseCompleted: false,
    };
  }

  //when all the assessments are available, we can calculate the grade, grade points and status
  const grade = calculateGrade(total);
  const gradePoints = calculateGradePoints(total);
  const status = calculateStatus(grade);

  return {
    total,
    grade,
    gradePoints,
    status,
    isCourseCompleted: grade !== "N/A" && status !== "FAIL",
  };
};
