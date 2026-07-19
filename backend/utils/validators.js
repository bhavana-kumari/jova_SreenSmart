/**
 * utils/validators.js
 * -------------------
 * Validates Resume JSON and Job Description JSON before screening.
 * Why this exists: Bad or incomplete input must be rejected early with
 * clear HTTP errors — we never invent missing fields or assume data.
 */

/**
 * Checks that a value is a non-null object (not an array).
 */
function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Checks that a value is an array of strings.
 */
function isStringArray(value) {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

/**
 * Validates the Resume JSON shape expected by this module.
 *
 * Expected shape:
 * {
 *   name: string,
 *   email: string,
 *   skills: string[],
 *   experience: number,
 *   certifications: string[]
 * }
 *
 * @param {unknown} resume - Body field from the client
 * @returns {{ valid: true, data: object } | { valid: false, error: string }}
 */
function validateResume(resume) {
  if (resume === undefined || resume === null) {
    return { valid: false, error: "Missing Resume. Provide a 'resume' object in the request body." };
  }

  if (!isPlainObject(resume)) {
    return { valid: false, error: "Invalid Resume. 'resume' must be a JSON object." };
  }

  if (typeof resume.name !== "string" || resume.name.trim() === "") {
    return { valid: false, error: "Invalid Resume. 'name' must be a non-empty string." };
  }

  if (typeof resume.email !== "string" || resume.email.trim() === "") {
    return { valid: false, error: "Invalid Resume. 'email' must be a non-empty string." };
  }

  if (!isStringArray(resume.skills)) {
    return { valid: false, error: "Invalid Resume. 'skills' must be an array of strings." };
  }

  if (typeof resume.experience !== "number" || Number.isNaN(resume.experience) || resume.experience < 0) {
    return {
      valid: false,
      error: "Invalid Resume. 'experience' must be a non-negative number (years).",
    };
  }

  if (!isStringArray(resume.certifications)) {
    return {
      valid: false,
      error: "Invalid Resume. 'certifications' must be an array of strings.",
    };
  }

  return {
    valid: true,
    data: {
      name: resume.name.trim(),
      email: resume.email.trim(),
      skills: resume.skills.map((s) => s.trim()).filter(Boolean),
      experience: resume.experience,
      certifications: resume.certifications.map((c) => c.trim()).filter(Boolean),
    },
  };
}

/**
 * Validates the Job Description JSON shape expected by this module.
 *
 * Expected shape:
 * {
 *   requiredSkills: string[],
 *   preferredSkills: string[],
 *   minimumExperience: number
 * }
 *
 * @param {unknown} jd - Body field from the client
 * @returns {{ valid: true, data: object } | { valid: false, error: string }}
 */
function validateJobDescription(jd) {
  if (jd === undefined || jd === null) {
    return {
      valid: false,
      error: "Missing Job Description. Provide a 'jobDescription' object in the request body.",
    };
  }

  if (!isPlainObject(jd)) {
    return {
      valid: false,
      error: "Invalid Job Description. 'jobDescription' must be a JSON object.",
    };
  }

  if (!isStringArray(jd.requiredSkills) || jd.requiredSkills.length === 0) {
    return {
      valid: false,
      error: "Invalid Job Description. 'requiredSkills' must be a non-empty array of strings.",
    };
  }

  if (!isStringArray(jd.preferredSkills)) {
    return {
      valid: false,
      error: "Invalid Job Description. 'preferredSkills' must be an array of strings.",
    };
  }

  if (
    typeof jd.minimumExperience !== "number" ||
    Number.isNaN(jd.minimumExperience) ||
    jd.minimumExperience < 0
  ) {
    return {
      valid: false,
      error: "Invalid Job Description. 'minimumExperience' must be a non-negative number.",
    };
  }

  return {
    valid: true,
    data: {
      requiredSkills: jd.requiredSkills.map((s) => s.trim()).filter(Boolean),
      preferredSkills: jd.preferredSkills.map((s) => s.trim()).filter(Boolean),
      minimumExperience: jd.minimumExperience,
    },
  };
}

module.exports = {
  validateResume,
  validateJobDescription,
};
