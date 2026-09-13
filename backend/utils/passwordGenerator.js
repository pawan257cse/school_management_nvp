/**
 * Auto-generates a secure, memorable password for new users.
 * Format:
 *   STUDENT  → First3Letters + AdmissionNo     e.g. "Rah2024001"
 *   TEACHER  → First3Letters + EmpId + @T      e.g. "Sha001@T"
 *   PRINCIPAL→ First3Letters + @Principal2026  e.g. "Pra@Principal2026"
 *   HEAD     → HEAD sets their own password
 *
 * Passwords are stored as generatedPassword (plain) for admin view
 * AND as passwordHash (bcrypt) for actual login.
 */

/**
 * @param {string} name     - Full name of user
 * @param {string} role     - 'STUDENT' | 'TEACHER' | 'PRINCIPAL' | 'HEAD'
 * @param {string} [id]     - admissionNo (student) or employeeId (teacher)
 * @returns {string}        - plain text auto-generated password
 */
function generatePassword(name, role, id = '') {
  // Take first 3 chars of name, capitalize first, lowercase rest
  const namePart = (name || 'Usr').replace(/\s+/g, '').slice(0, 3);
  const cap = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();

  // Clean id — remove special chars, take last 6 chars max
  const cleanId = (id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6);

  switch (role) {
    case 'STUDENT':
      // e.g. Rah2024001 or Rah@Stu if no admissionNo
      return cleanId ? `${cap}${cleanId}` : `${cap}@Student`;

    case 'TEACHER':
      // e.g. Sha001@T
      return cleanId ? `${cap}${cleanId}@T` : `${cap}@Teacher`;

    case 'PRINCIPAL':
      // e.g. Pra@Principal2026
      return `${cap}@Principal${new Date().getFullYear()}`;

    default:
      return `${cap}@School${new Date().getFullYear()}`;
  }
}

module.exports = { generatePassword };
