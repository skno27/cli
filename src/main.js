#!/usr/bin/env node
import open, { apps } from "open";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import fs from "fs";

dotenv.config();

const args = process.argv.slice(2);
const command = args[0];
const favorite = args[1];
const url = args[2];

let db;
const dbPath = "favorites.db";

function init() {
  console.log("initializing databse...");
  db = new Database(dbPath);

  const createTable = `
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL
    )
  `;

  db.exec(createTable);

  const data = [
    { name: "goog", url: "https://google.com" },
    { name: "social", url: "https://instagram.com" },
    { name: "news", url: "https://yahoo.com" },
  ];

  const insertData = db.prepare(
    "INSERT INTO favorites (name, url) VALUES (?, ?)"
  );

  data.forEach((favorite) => {
    insertData.run(favorite.name, favorite.url);
  });
}

function checkBrowser() {
  const browser = process.env?.BROWSER?.toLocaleLowerCase();
  let appName = browser;
  // console.log(appName);
  switch (browser) {
    case "chrome":
      appName = apps.chrome;
      breaks;
    case "firefox":
      appName = apps.firefox;
      break;
    case "edge":
      appName = apps.edge;
      break;
    case "private":
      appName = apps.browserPrivate;
      break;
    case "def":
      appName = apps.browser;
      break;
  }
  return appName;
}

function displayMenu() {
  console.log("ls                     : List all saved favorites"); //
  console.log("open <favorite>        : Open a saved favorite"); //
  console.log("add <favorite> <url>   : Add a new favorite for some URL"); //
  console.log("rm <favorite>          : Remove a saved favorite"); //
}

function openFavorite(favorite) {
  const row = db
    .prepare("SELECT * FROM favorites WHERE name = ?")
    .get(favorite);

  if (!row) {
    console.log("favorite not found !!!");
    process.exit(1);
  }

  const url = row.url;
  const appName = checkBrowser();
  if (appName) {
    open(url, { app: { name: appName } });
  } else {
    open(url);
  }
  if (appName === undefined) {
    console.log("Opening with your default browser");
  } else {
    console.log("Opening with", appName);
  }
  console.log("...Navigating to", url);
}

function add(favorite, url) {
  db.prepare("INSERT INTO favorites (name, url) VALUES (?, ?)").run(
    favorite,
    url
  );
  console.log("Adding", favorite, url);
}

function rm(favorite) {
  db.prepare("DELETE FROM favorites WHERE name = ?").run(favorite);
  console.log("Removing", favorite);
}

function ls() {
  const favorites = db.prepare("SELECT * FROM favorites").all();
  console.log("All favorites:");
  favorites.forEach((favorite) => {
    console.log(`${favorite.name}: ${favorite.url}`);
  });
}

if (!fs.existsSync(dbPath)) {
  init();
} else {
  db = new Database(dbPath);
}

// main

const argCount = args.length;
/*
if (argCount === 0 || !["ls", "open", "rm", "add"].includes(command)) {
  console.log("Improper usage...");
  console.log("Here is some help: \n");
  displayMenu();
  process.exit(1);
}
switch (command) {
  case "ls":
    ls();
    break;
  case "open":
    if (argCount < 2) {
      displayMenu();
      process.exit(1);
    }
    openFavorite(favorite);
    break;
  case "add":
    if (argCount < 3) {
      displayMenu();
      break;
    }
    add(favorite, url);
    break;
  case "rm":
    if (argCount < 2) {
      displayMenu();
      process.exit(1);
    }
    rm(favorite);
    break;
    
}
*/

const commands = {
  ls: { f: ls, argCount: 1 },
  open: { f: openFavorite, argCount: 2 },
  rm: { f: rm, argCount: 2 },
  add: { f: add, argCount: 3 },
};

if (
  argCount === 0 ||
  !commands[command] ||
  argCount < commands[command].argCount
) {
  displayMenu();
  process.exit(1);
}

commands[command].f(favorite, url);
