import { config } from '../config';

const limits = config.limits;

export function validateCreatePayload(payload: any): { valid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') return { valid: false, error: 'Invalid payload' };
  const name = payload.name;
  if (typeof name !== 'string' || name.trim().length === 0) return { valid: false, error: 'Invalid name' };
  if (name.length > limits.maxNameLength) return { valid: false, error: `Name exceeds maximum length of ${limits.maxNameLength}` };

  const description = payload.description;
  if (description !== undefined && typeof description !== 'string') return { valid: false, error: 'Invalid description' };
  if (typeof description === 'string' && description.length > limits.maxDescriptionLength) {
    return { valid: false, error: `Description exceeds maximum length of ${limits.maxDescriptionLength}` };
  }

  const skills = payload.skills;
  if (skills !== undefined) {
    if (!Array.isArray(skills)) return { valid: false, error: 'Skills must be an array' };
    if (skills.length > limits.maxSkills) return { valid: false, error: `Skills list exceeds maximum length of ${limits.maxSkills}` };
    for (const s of skills) {
      if (typeof s !== 'string' || s.length > limits.maxSkillLength) return { valid: false, error: `Each skill must be a string up to ${limits.maxSkillLength} characters` };
    }
  }

  return { valid: true };
}

export function validateUpdatePayload(payload: any): { valid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') return { valid: false, error: 'Invalid payload' };

  // Only validate fields that are present
  if (payload.name !== undefined) {
    if (typeof payload.name !== 'string' || payload.name.trim().length === 0) return { valid: false, error: 'Invalid name' };
    if (payload.name.length > limits.maxNameLength) return { valid: false, error: `Name exceeds maximum length of ${limits.maxNameLength}` };
  }

  if (payload.description !== undefined) {
    if (typeof payload.description !== 'string') return { valid: false, error: 'Invalid description' };
    if (payload.description.length > limits.maxDescriptionLength) return { valid: false, error: `Description exceeds maximum length of ${limits.maxDescriptionLength}` };
  }

  if (payload.skills !== undefined) {
    if (!Array.isArray(payload.skills)) return { valid: false, error: 'Skills must be an array' };
    if (payload.skills.length > limits.maxSkills) return { valid: false, error: `Skills list exceeds maximum length of ${limits.maxSkills}` };
    for (const s of payload.skills) {
      if (typeof s !== 'string' || s.length > limits.maxSkillLength) return { valid: false, error: `Each skill must be a string up to ${limits.maxSkillLength} characters` };
    }
  }

  return { valid: true };
}

export const VALIDATION_LIMITS = {
  maxNameLength: limits.maxNameLength,
  maxDescriptionLength: limits.maxDescriptionLength,
  maxSkills: limits.maxSkills,
  maxSkillLength: limits.maxSkillLength,
};

export default {
  validateCreatePayload,
  validateUpdatePayload,
  VALIDATION_LIMITS,
};
