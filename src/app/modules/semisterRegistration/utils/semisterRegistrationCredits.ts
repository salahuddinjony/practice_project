import AppError from "../../../errors/handleAppError.js";

type SemesterCredit = Readonly<{ minCredit: number; maxCredit: number }>;
type AcademicSemesterCode = "01" | "02" | "03";

const semesterCreditByCode: Readonly<
  Record<AcademicSemesterCode, SemesterCredit>
> = Object.freeze({
  "01": Object.freeze({ minCredit: 10, maxCredit: 20 }), // Autumn
  "02": Object.freeze({ minCredit: 5, maxCredit: 15 }), // Summer
  "03": Object.freeze({ minCredit: 2, maxCredit: 8 }), // Fall
});

export const getSemesterRegistrationCreditsByCode = (
  academicSemesterCode: string,
) => {
  const creditConfig =
    semesterCreditByCode[academicSemesterCode as AcademicSemesterCode];

  if (!creditConfig) {
    throw new AppError(
      "No credit configuration found for this semester code",
      400,
    );
  }

  validateSemesterRegistrationCredits(
    creditConfig.minCredit,
    creditConfig.maxCredit,
  );

  return creditConfig;
};

export const validateSemesterRegistrationCredits = (
  minCredit: number,
  maxCredit: number,
) => {
  if (minCredit > maxCredit || minCredit < 0 || maxCredit < 0) {
    throw new AppError(
      "Min credit cannot be greater than max credit or negative",
      400,
    );
  }
};
