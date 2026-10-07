# Tentmaker Open — Capstone 1

## Project Description

This project is a read-only web dashboard that displays organization information from a Google Sheet.

The application contains:

- Roster view
- Group Board
- Leader Channel
- History View

The application loads data from four CSV links generated from a Google Sheet.

---

## Technologies

This project uses:

- HTML
- CSS
- JavaScript
- Google Sheets
- CSV
- Fetch API

No framework or build tool is required.

---

## Project Files

### index.html

Contains the structure of the webpage.

### styles.css

Controls the appearance of the webpage.

### app.js

Contains:

- CSV loading
- CSV parsing
- Data storage
- Find functions
- Roster rendering
- Group board rendering
- Leader channel rendering
- History rendering
- Click events

### README.md

Contains project documentation.

---

## Data Flow

The application follows this flow:

Google Sheet

↓

CSV links

↓

fetch()

↓

JavaScript arrays

↓

filter / find / map / sort

↓

HTML

↓

Web page

---

## Data Arrays

The application stores four main arrays:

```javascript
people = [];

groups = [];

memberships = [];

posts = [];

github link https://github.com/sumannptsit-cell/capstone-project/blob/main/README.md