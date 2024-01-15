#!/usr/bin/env node
import open, { apps } from "open";
import dotenv from "dotenv";
import fs from "fs";
import {
  addFavorite,
  deleteFavorite,
  getFavorite,
  replaceFavorite,
  getFavorites,
} from "./lib/sdk.js";

dotenv.config();

const args = process.argv.slice(2);
const command = args[0];
const favorite = args[1];
const url = args[2];
const favorites = await getFavorites();

function checkBrowser() {
  const browser = process.env?.BROWSER?.toLocaleLowerCase();
  let appName = browser;
  // console.log(appName);
  switch (browser) {
    case "chrome":
      appName = apps.chrome;
      break;
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

function openFavorite(name) {
  const favToOpen = favorites.find((fav) => fav.name === name);

  if (!favToOpen) {
    console.log(`Favorite "${name}" does not exist.`);
    process.exit(1);
  }

  const url = favToOpen.url;
  console.log("Trying", url);
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

const add = async (name, url) => {
  const id = await addFavorite(name, url);

  if (!id) {
    console.log(`Failed to add favorite ${name}`);
    process.exit(1);
  } else console.log("Adding", name, url);
};

const rm = async (name) => {
  const favToDelete = favorites.find((fav) => fav.name === name);

  if (!favToDelete) {
    console.log(`Favorite "${name}" does not exist.`);
    process.exit(1);
  }

  await deleteFavorite(favToDelete.id);
  console.log("Removing", name);
};

const ls = async () => {
  console.log("All favorites:");
  favorites.forEach((favorite) => {
    console.log(`${favorite.name}: ${favorite.url}`);
  });
};

// main

const argCount = args.length;

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

await commands[command].f(favorite, url);

// program end
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
