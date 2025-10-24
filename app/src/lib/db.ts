// lib/db.ts
import fs from "fs";
import path from "path";

export interface Transaction {
  reference: string;
  userPubkey: string;
  merkleProof: number[];
  amount: number;
  status: string;
}

const DB_PATH = path.resolve("./transactions.json");

// --- Utility functions ---

// Ensure file exists
function ensureDBFile() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
  } else {
    // Check if file is empty or invalid
    try {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      if (!data || data.trim() === "") {
        fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
      }
    } catch (err) {
      // If file is corrupted, recreate it
      fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
    }
  }
}

// Load all transactions
export function loadDB(): Transaction[] {
  ensureDBFile();
  const data = fs.readFileSync(DB_PATH, "utf-8");
  try {
    return JSON.parse(data);
  } catch (err) {
    // If parsing fails, return empty array and reset file
    console.error("Failed to parse DB file, resetting:", err);
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
    return [];
  }
}


// Save all transactions
export function saveDB(db: Transaction[]) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// --- CRUD-style helpers ---

export function addTransaction(reference: string) {
  const db = loadDB();

  // Avoid duplicates
  const exists = db.some((tx) => tx.reference === reference);
  if (!exists) {
    db.push({
      reference,
      userPubkey: "",
      merkleProof: [], 
      amount: 0,
      status: "pending",
    });
    saveDB(db);
  }
}

export function updateTransaction(reference: string, updates: Partial<Transaction>) {
  const db = loadDB();
  const tx = db.find((t) => t.reference === reference);
  if (tx) {
    Object.assign(tx, updates);
    saveDB(db);
  }
}

export function getTransaction(reference: string): Transaction | undefined {
  const db = loadDB();
  return db.find((tx) => tx.reference === reference);
}

export function getAllTransactions(): Transaction[] {
  return loadDB();
}
