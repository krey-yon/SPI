// lib/users.ts
import fs from "fs";
import path from "path";

const USERS_PATH = path.resolve("./users.json");

// --- Utility functions ---

// Ensure file exists
function ensureUsersFile() {
  if (!fs.existsSync(USERS_PATH)) {
    fs.writeFileSync(USERS_PATH, JSON.stringify([], null, 2));
  } else {
    try {
      const data = fs.readFileSync(USERS_PATH, "utf-8");
      if (!data || data.trim() === "") {
        fs.writeFileSync(USERS_PATH, JSON.stringify([], null, 2));
      }
    } catch (err) {
      fs.writeFileSync(USERS_PATH, JSON.stringify([], null, 2));
    }
  }
}

// Load all users
export function loadUsers(): string[] {
  ensureUsersFile();
  const data = fs.readFileSync(USERS_PATH, "utf-8");
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to parse users file, resetting:", err);
    fs.writeFileSync(USERS_PATH, JSON.stringify([], null, 2));
    return [];
  }
}

// Save all users
export function saveUsers(users: string[]) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

// --- CRUD-style helpers ---

export function addUser(pubkey: string) {
  const users = loadUsers();

  // Avoid duplicates
  if (!users.includes(pubkey)) {
    users.push(pubkey);
    saveUsers(users);
  }
}

export function removeUser(pubkey: string) {
  const users = loadUsers().filter((u) => u !== pubkey);
  saveUsers(users);
}

export function getAllUsers(): string[] {
  return loadUsers();
}

export function clearUsers() {
  saveUsers([]);
}
