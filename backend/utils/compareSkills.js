/**
 * utils/compareSkills.js
 * ----------------------
 * Thin re-export of the existing skill comparison service.
 * Why this exists: Matches the project utility layout without duplicating
 * compare logic already implemented in services/skillCompareService.js.
 */

const {
  compareSkills,
  normalizeSkill,
  skillIsCovered,
} = require("../services/skillCompareService");

module.exports = {
  compareSkills,
  normalizeSkill,
  skillIsCovered,
};
