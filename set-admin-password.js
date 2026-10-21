#!/usr/bin/env node
/**
 * Surgronic Control Center — password hash generator
 *
 * Usage:  node set-admin-password.js "YourChosenPassword"
 * Output: SHA-256 hex of (salt + password)
 *
 * 1. Pick a strong password (12+ chars, mixed case, numbers, symbols).
 * 2. Run this script LOCALLY — never paste the password anywhere else.
 * 3. Copy the printed hash into ADMIN_USERS in index.html (passHash field).
 * 4. Delete your shell history entry if it contains the password.
 *
 * The salt for each admin is stored next to their record in index.html.
 * Keep this script; do NOT commit any real password to git.
 */
const crypto = require("crypto");

const password = process.argv[2];
const salt = process.argv[3] || "";

if (!password) {
  console.error('Usage: node set-admin-password.js "YourPassword" [salt]');
  process.exit(1);
}
if (password.length < 12) {
  console.error("WARNING: password is shorter than 12 characters. Use a stronger one.");
}

const hash = crypto.createHash("sha256").update(salt + password, "utf8").digest("hex");
console.log("salt:    " + (salt || "(none — pass the salt from index.html as 2nd arg)"));
console.log("sha256:  " + hash);
console.log("\nPaste the sha256 value into the matching user's passHash in index.html");
