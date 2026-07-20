const ApiError = require('../../utils/ApiError');
const {
  USERNAME_REGEX,
  URL_REGEX,
  BIO_MAX_LENGTH,
  SOCIAL_LINK_MAX_LENGTH,
  MAX_SOCIAL_LINKS,
  ALLOWED_LANGUAGES,
  ALLOWED_THEMES,
  ALLOWED_TIMEZONES,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} = require('./settings.constants');

const validateUpdateProfile = (body) => {
  const allowed = [
    'name',
    'bio',
    'username',
    'location',
    'website',
    'socialLinks',
  ];
  const updates = {};

  for (const key of allowed) {
    if (body[key] === undefined) continue;

    switch (key) {
      case 'name':
        if (
          typeof body.name !== 'string' ||
          body.name.trim().length < 1 ||
          body.name.length > 100
        ) {
          throw new ApiError(400, 'Name must be between 1 and 100 characters.');
        }
        updates.name = body.name.trim();
        break;

      case 'bio':
        if (typeof body.bio !== 'string') {
          throw new ApiError(400, 'Bio must be a string.');
        }
        if (body.bio.trim().length > BIO_MAX_LENGTH) {
          throw new ApiError(
            400,
            `Bio must not exceed ${BIO_MAX_LENGTH} characters.`
          );
        }
        updates.bio = body.bio.trim() || null;
        break;

      case 'username':
        if (
          typeof body.username !== 'string' ||
          !USERNAME_REGEX.test(body.username)
        ) {
          throw new ApiError(
            400,
            'Username must be 3–30 characters and contain only letters, numbers, underscores, and hyphens.'
          );
        }
        updates.username = body.username.toLowerCase();
        break;

      case 'location':
        if (typeof body.location !== 'string') {
          throw new ApiError(400, 'Location must be a string.');
        }
        updates.location = body.location.trim() || null;
        break;

      case 'website':
        if (body.website === null || body.website === '') {
          updates.website = null;
        } else {
          if (
            typeof body.website !== 'string' ||
            !URL_REGEX.test(body.website.trim())
          ) {
            throw new ApiError(
              400,
              'Website must be a valid URL starting with http:// or https://.'
            );
          }
          updates.website = body.website.trim();
        }
        break;

      case 'socialLinks': {
        if (!Array.isArray(body.socialLinks)) {
          throw new ApiError(400, 'Social links must be an array.');
        }
        if (body.socialLinks.length > MAX_SOCIAL_LINKS) {
          throw new ApiError(
            400,
            `Social links must not exceed ${MAX_SOCIAL_LINKS} entries.`
          );
        }
        const validated = [];
        for (const link of body.socialLinks) {
          if (!link.platform || !link.url) {
            throw new ApiError(
              400,
              'Each social link must have a platform and url.'
            );
          }
          if (
            typeof link.platform !== 'string' ||
            typeof link.url !== 'string'
          ) {
            throw new ApiError(400, 'Platform and url must be strings.');
          }
          if (link.url.trim().length > SOCIAL_LINK_MAX_LENGTH) {
            throw new ApiError(
              400,
              `Social link URL must not exceed ${SOCIAL_LINK_MAX_LENGTH} characters.`
            );
          }
          if (!URL_REGEX.test(link.url.trim())) {
            throw new ApiError(
              400,
              `Social link URL for "${link.platform}" must be a valid URL.`
            );
          }
          validated.push({
            platform: link.platform.trim().toLowerCase(),
            url: link.url.trim(),
          });
        }
        updates.socialLinks = validated;
        break;
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No valid fields provided for update.');
  }

  return updates;
};

const validateChangeEmail = (body) => {
  const { newEmail, password } = body;

  if (!newEmail || typeof newEmail !== 'string') {
    throw new ApiError(400, 'New email is required.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail.trim())) {
    throw new ApiError(400, 'Invalid email format.');
  }

  if (!password || typeof password !== 'string' || password.length < 1) {
    throw new ApiError(400, 'Current password is required.');
  }

  return { newEmail: newEmail.trim().toLowerCase(), password };
};

const validateChangePassword = (body) => {
  const { currentPassword, newPassword, confirmPassword } = body;

  if (!currentPassword || typeof currentPassword !== 'string') {
    throw new ApiError(400, 'Current password is required.');
  }

  if (!newPassword || typeof newPassword !== 'string') {
    throw new ApiError(400, 'New password is required.');
  }
  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    throw new ApiError(
      400,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
    );
  }
  if (newPassword.length > PASSWORD_MAX_LENGTH) {
    throw new ApiError(
      400,
      `Password must not exceed ${PASSWORD_MAX_LENGTH} characters.`
    );
  }

  if (!confirmPassword || typeof confirmPassword !== 'string') {
    throw new ApiError(400, 'Confirm password is required.');
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match.');
  }

  return { currentPassword, newPassword };
};

const validateUpdatePrivacy = (body) => {
  const allowed = ['profileVisibility', 'emailVisibility', 'allowFollowers'];
  const updates = {};

  for (const key of allowed) {
    if (body[key] === undefined) continue;

    switch (key) {
      case 'profileVisibility':
        if (
          !['PUBLIC', 'PRIVATE', 'FOLLOWERS_ONLY'].includes(
            body.profileVisibility
          )
        ) {
          throw new ApiError(
            400,
            'Profile visibility must be PUBLIC, PRIVATE, or FOLLOWERS_ONLY.'
          );
        }
        updates.profileVisibility = body.profileVisibility;
        break;

      case 'emailVisibility':
        if (typeof body.emailVisibility !== 'boolean') {
          throw new ApiError(400, 'Email visibility must be a boolean.');
        }
        updates.emailVisibility = body.emailVisibility;
        break;

      case 'allowFollowers':
        if (typeof body.allowFollowers !== 'boolean') {
          throw new ApiError(400, 'Allow followers must be a boolean.');
        }
        updates.allowFollowers = body.allowFollowers;
        break;
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No valid privacy fields provided.');
  }

  return updates;
};

const validateNotificationPreferences = (body) => {
  const allowedKeys = [
    'likes',
    'comments',
    'replies',
    'follows',
    'mentions',
    'systemAnnouncements',
  ];
  const updates = {};

  for (const key of allowedKeys) {
    if (body[key] === undefined) continue;
    if (typeof body[key] !== 'boolean') {
      throw new ApiError(400, `${key} must be a boolean.`);
    }
    updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No valid notification preferences provided.');
  }

  return updates;
};

const validatePreferences = (body) => {
  const updates = {};

  if (body.language !== undefined) {
    if (!ALLOWED_LANGUAGES.includes(body.language)) {
      throw new ApiError(
        400,
        `Unsupported language. Supported: ${ALLOWED_LANGUAGES.join(', ')}`
      );
    }
    updates.language = body.language;
  }

  if (body.timezone !== undefined) {
    if (body.timezone === null) {
      updates.timezone = null;
    } else if (!ALLOWED_TIMEZONES.includes(body.timezone)) {
      throw new ApiError(400, `Unsupported timezone.`);
    } else {
      updates.timezone = body.timezone;
    }
  }

  if (body.themePreference !== undefined) {
    if (!ALLOWED_THEMES.includes(body.themePreference)) {
      throw new ApiError(
        400,
        `Theme must be one of: ${ALLOWED_THEMES.join(', ')}`
      );
    }
    updates.themePreference = body.themePreference;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No valid preferences provided.');
  }

  return updates;
};

const validateDeleteAccount = (body) => {
  if (!body.password || typeof body.password !== 'string') {
    throw new ApiError(400, 'Password is required to delete your account.');
  }
  return body.password;
};

const validateImageType = (file) => {
  const { IMAGE_ALLOWED_TYPES } = require('./settings.constants');
  if (!file) {
    throw new ApiError(400, 'No file provided.');
  }
  if (!IMAGE_ALLOWED_TYPES.includes(file.mimetype)) {
    throw new ApiError(
      400,
      `Invalid file type. Allowed: ${IMAGE_ALLOWED_TYPES.join(', ')}`
    );
  }
};

module.exports = {
  validateUpdateProfile,
  validateChangeEmail,
  validateChangePassword,
  validateUpdatePrivacy,
  validateNotificationPreferences,
  validatePreferences,
  validateDeleteAccount,
  validateImageType,
};
