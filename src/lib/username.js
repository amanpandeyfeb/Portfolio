const USERNAME_REGEX = /^[a-z0-9-]{3,20}$/;

const RESERVED_USERNAMES = new Set([
  "admin",
  "signup",
  "api",
  "login",
  "logout",
  "privacy",
  "terms",
]);

function normalizeUsername(raw) {
  const safe = typeof raw === "string" ? raw : "";
  return safe.trim().toLowerCase();
}

function isValidUsername(raw) {
  return USERNAME_REGEX.test(normalizeUsername(raw));
}

function isReservedUsername(raw) {
  return RESERVED_USERNAMES.has(normalizeUsername(raw));
}

module.exports = {
  USERNAME_REGEX,
  RESERVED_USERNAMES,
  normalizeUsername,
  isValidUsername,
  isReservedUsername,
};
