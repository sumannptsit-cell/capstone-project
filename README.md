# My organization — Capstone 1

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

### style.css

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

people
The people array contains information about people and their roles.

groups
The groups array contains group names, periods and leader IDs.

memberships
The memberships array connects people to groups using person_id and group_id.

posts
The posts array contains posts and connects them to groups or leaders using board_type and board_id. 

## Live site

Live site:[https://sumannptsit-cell.github.io/capstone-project/]

## How to run

Open the live site in a browser. Alternatively, download the project files and open `index.html` in a browser. The page needs an internet connection because the application loads data from Google Sheet CSV links.

## Using another sheet

The application uses four Google Sheet tabs:

- People
- Groups
- Memberships
- Posts

The four CSV links are stored as constants at the top of `app.js`.

To use another Google Sheet:

1. Create the same four sheet tabs.
2. Use the same column names.
3. Set the Google Sheet sharing permission to "Anyone with the link - Viewer".
4. Replace the Google Sheet ID in all four CSV links in `app.js`.

No other JavaScript changes are required.

## Design note

### Load - Store - Show

The application loads data from four Google Sheet CSV links using the `loadTab()` function.

The `loadAllData()` function loads the People, Groups, Memberships and Posts data and stores them in four JavaScript arrays.

After loading, the application builds the sidebar menus and displays the selected view using the render functions.

### The four arrays

The `people` array contains information about people and their roles.

The `groups` array contains groups, periods and leader IDs.

The `memberships` array connects people to groups using `person_id` and `group_id`.

The `posts` array contains posts and connects them to groups or leaders using `board_type` and `board_id`.

The application uses IDs to connect records between the arrays instead of hardcoding names.

### How a view is drawn

When a user selects a group, leader or person, the corresponding click event calls a render function.

For example, selecting a group calls `renderRoster()` or `renderGroupBoard()`.

The render function finds the required records, filters and sorts the data, creates the required HTML and places it inside the `content` element.

### One decision I made, and why

I use a `Set` when collecting leaders for the History view.

This prevents the same leader from appearing more than once when a person has belonged to multiple groups led by the same leader.

I also use `getDateValue()` when sorting posts so that invalid or missing dates do not cause the application to fail.