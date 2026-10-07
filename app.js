/* =========================================================
   1. GOOGLE SHEET CSV LINKS
========================================================= */

const PEOPLE_CSV_URL =
    "https://docs.google.com/spreadsheets/d/1V-VSeRAvUNCDR9eh7mYE5c4q6Q9DP5L8wu3OlWr3CFs/gviz/tq?tqx=out:csv&sheet=People&headers=1";

const GROUPS_CSV_URL =
    "https://docs.google.com/spreadsheets/d/1V-VSeRAvUNCDR9eh7mYE5c4q6Q9DP5L8wu3OlWr3CFs/gviz/tq?tqx=out:csv&sheet=Groups&headers=1";

const MEMBERSHIPS_CSV_URL =
    "https://docs.google.com/spreadsheets/d/1V-VSeRAvUNCDR9eh7mYE5c4q6Q9DP5L8wu3OlWr3CFs/gviz/tq?tqx=out:csv&sheet=Memberships&headers=1";

const POSTS_CSV_URL =
    "https://docs.google.com/spreadsheets/d/1V-VSeRAvUNCDR9eh7mYE5c4q6Q9DP5L8wu3OlWr3CFs/gviz/tq?tqx=out:csv&sheet=Posts&headers=1";


/* =========================================================
   2. DATA ARRAYS
========================================================= */

let people = [];
let groups = [];
let memberships = [];
let posts = [];


/* =========================================================
   3. CURRENT VIEW
========================================================= */

let currentView = "roster";

let selectedGroupId = null;
let selectedLeaderId = null;
let selectedPersonId = null;


/* =========================================================
   4. DOM ELEMENTS
========================================================= */

const statusElement =
    document.getElementById("status");

const contentElement =
    document.getElementById("content");

const pageTitleElement =
    document.getElementById("pageTitle");

const pageDescriptionElement =
    document.getElementById("pageDescription");

const groupPicker =
    document.getElementById("groupPicker");

const leaderPicker =
    document.getElementById("leaderPicker");

const personPicker =
    document.getElementById("personPicker");

const rosterViewBtn =
    document.getElementById("rosterViewBtn");

const groupBoardViewBtn =
    document.getElementById("groupBoardViewBtn");

const leaderChannelViewBtn =
    document.getElementById("leaderChannelViewBtn");

const historyViewBtn =
    document.getElementById("historyViewBtn");


/* =========================================================
   5. CSV LOADER
========================================================= */

/*
   Downloads one CSV file and converts it into
   JavaScript objects.

   Example CSV:

   person_id,full_name,role
   P001,Sarah,leader
   P002,Daniel,leader

   becomes:

   [
      {
         person_id: "P001",
         full_name: "Sarah",
         role: "leader"
      },
      {
         person_id: "P002",
         full_name: "Daniel",
         role: "leader"
      }
   ]
*/

async function loadTab(url) {

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            "Could not download CSV data."
        );
    }

    const text = await response.text();

    return parseCSV(text);
}


/* =========================================================
   6. CSV PARSER
========================================================= */

function parseCSV(text) {

    const rows = [];

    let row = [];

    let value = "";

    let insideQuotes = false;


    for (let i = 0; i < text.length; i++) {

        const character = text[i];

        const nextCharacter =
            text[i + 1];


        /*
           Double quote
        */

        if (character === '"') {

            /*
               Two double quotes inside a quoted
               value represent one quote.
            */

            if (
                insideQuotes &&
                nextCharacter === '"'
            ) {
                value += '"';

                i++;

            } else {

                insideQuotes =
                    !insideQuotes;
            }

            continue;
        }


        /*
           Comma outside quotes
        */

        if (
            character === "," &&
            !insideQuotes
        ) {

            row.push(value);

            value = "";

            continue;
        }


        /*
           New line outside quotes
        */

        if (
            (character === "\n" ||
             character === "\r") &&
            !insideQuotes
        ) {

            if (
                character === "\r" &&
                nextCharacter === "\n"
            ) {
                i++;
            }

            row.push(value);

            value = "";

            if (row.some(cell => cell.trim() !== "")) {
                rows.push(row);
            }

            row = [];

            continue;
        }


        value += character;
    }


    /*
       Add final cell.
    */

    if (
        value !== "" ||
        row.length > 0
    ) {
        row.push(value);

        if (
            row.some(cell => cell.trim() !== "")
        ) {
            rows.push(row);
        }
    }


    /*
       No data.
    */

    if (rows.length === 0) {
        return [];
    }


    /*
       First row contains column names.
    */

    const headers =
        rows[0].map(header =>
            header.trim()
        );


    /*
       Convert every remaining row
       into an object.
    */

    return rows.slice(1).map(row => {

        const object = {};

        headers.forEach(
            (header, index) => {

                object[header] =
                    (row[index] || "").trim();
            }
        );

        return object;
    });
}


/* =========================================================
   7. LOAD ALL DATA
========================================================= */

async function loadAllData() {

    setStatus(
        "Loading data from Google Sheet...",
        "loading"
    );


    try {

        /*
           Load People
        */

        people =
            await loadTab(
                PEOPLE_CSV_URL
            );


        /*
           Load Groups
        */

        groups =
            await loadTab(
                GROUPS_CSV_URL
            );


        /*
           Load Memberships
        */

        memberships =
            await loadTab(
                MEMBERSHIPS_CSV_URL
            );


        /*
           Load Posts
        */

        posts =
            await loadTab(
                POSTS_CSV_URL
            );
    


        /*
           Data loaded successfully.
        */

        setStatus(
            "Data loaded successfully.",
            "success"
        );


        /*
           Build menus from the data.
        */

        buildGroupPicker();

        buildLeaderPicker();

        buildPersonPicker();


        /*
           Select first available group.
        */

        if (groups.length > 0) {

            selectedGroupId =
                groups[0].group_id;

            renderRoster(
                selectedGroupId
            );
        }

    } catch (error) {

        console.error(error);

        setStatus(
            "Error loading data: " +
            error.message,
            "error"
        );

        contentElement.innerHTML = `
            <div class="empty">
                <h2>Unable to load data</h2>

                <p>
                    Check your Google Sheet CSV links
                    and try again.
                </p>
            </div>
        `;
    }
}


/* =========================================================
   8. STATUS MESSAGE
========================================================= */

function setStatus(message, type) {

    statusElement.textContent =
        message;

    statusElement.className =
        "status " + type;
}


/* =========================================================
   9. FIND PERSON
========================================================= */

function findPerson(id) {

    return people.find(
        person =>
            person.person_id === id
    );
}


/* =========================================================
   10. FIND GROUP
========================================================= */

function findGroup(id) {

    return groups.find(
        group =>
            group.group_id === id
    );
}


/* =========================================================
   11. FIND LEADER
========================================================= */

function findLeader(id) {

    return people.find(
        person =>
            person.person_id === id &&
            person.role === "leader"
    );
}


/* =========================================================
   12. BUILD GROUP MENU
========================================================= */

function buildGroupPicker() {

    groupPicker.innerHTML = "";


    groups.forEach(group => {

        const button =
            document.createElement("button");


        button.className =
            "data-button";


        button.innerHTML = `
            <strong>
                ${escapeHTML(group.group_name)}
            </strong>

            <small>
                ${escapeHTML(group.period)}
            </small>
        `;


        button.addEventListener(
            "click",
            () => {

                selectedGroupId =
                    group.group_id;

                renderRoster(
                    group.group_id
                );
            }
        );


        groupPicker.appendChild(button);

    });
}


/* =========================================================
   13. BUILD LEADER MENU
========================================================= */

function buildLeaderPicker() {

    leaderPicker.innerHTML = "";

    const leaders =
        people.filter(
            person =>
                person.role === "leader"
        );

    leaders.forEach(leader => {

        const button =
            document.createElement("button");

        button.className =
            "data-button";

        // Store the leader ID on the button
        button.dataset.leaderId =
            leader.person_id;

        button.textContent =
            leader.full_name;

        button.addEventListener(
            "click",
            () => {

                selectedLeaderId =
                    leader.person_id;

                renderLeaderChannel(
                    leader.person_id
                );
            }
        );

        leaderPicker.appendChild(button);

    });
}
/* =========================================================
   14. BUILD PERSON MENU
========================================================= */

function buildPersonPicker() {

    personPicker.innerHTML = "";


    people.forEach(person => {

        const button =
            document.createElement("button");


        button.className =
            "data-button";


        button.textContent =
            person.full_name;


        button.addEventListener(
            "click",
            () => {

                selectedPersonId =
                    person.person_id;

                renderHistory(
                    person.person_id
                );
            }
        );


        personPicker.appendChild(button);

    });
}


/* =========================================================
   15. RENDER ROSTER
========================================================= */

function renderRoster(groupId) {

    currentView = "roster";

    selectedGroupId = groupId;


    const group =
        findGroup(groupId);


    if (!group) {

        showEmpty(
            "Group not found."
        );

        return;
    }


    pageTitleElement.textContent =
        group.group_name;


    pageDescriptionElement.textContent =
        "Roster for " +
        group.group_name +
        " (" +
        group.period +
        ")";


    setActiveButton(
        rosterViewBtn
    );


    /*
       Find the leader.
    */

    const leader =
        findPerson(
            group.leader_id
        );


    /*
       Find members of this group.
    */

    const memberRows =
        memberships.filter(
            membership =>
                membership.group_id ===
                groupId
        );


    /*
       Convert membership records
       into people.
    */

    const members =
        memberRows
            .map(
                membership =>
                    findPerson(
                        membership.person_id
                    )
            )
            .filter(
                person => person
            );


    let html = "";


    /*
       Leader card
    */

    if (leader) {

        html += `
            <div class="card">

                <h2>Group Leader</h2>

                <div class="profile-card">

                    <div class="avatar">
                        ${escapeHTML(
                            getInitials(
                                leader.full_name
                            )
                        )}
                    </div>

                    <div class="profile-info">

                        <h3>
                            ${escapeHTML(
                                leader.full_name
                            )}
                        </h3>

                        <span class="role">
                            Leader
                        </span>

                    </div>

                </div>

            </div>
        `;
    }


    /*
       Members
    */

    html += `
        <div class="card">

            <h2>
                Members
                (${members.length})
            </h2>

            ${
                members.length === 0
                ? `
                    <div class="empty">
                        No members found.
                    </div>
                  `
                : `
                    <table class="data-table">

                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Person ID</th>
                            </tr>
                        </thead>

                        <tbody>

                            ${
                                members.map(
                                    person => `
                                        <tr>

                                            <td>
                                                ${escapeHTML(
                                                    person.full_name
                                                )}
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    person.role
                                                )}
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    person.person_id
                                                )}
                                            </td>

                                        </tr>
                                    `
                                ).join("")
                            }

                        </tbody>

                    </table>
                  `
            }

        </div>
    `;


    contentElement.innerHTML =
        html;
}
function getDateValue(date) {

    const time =
        new Date(date).getTime();

    return Number.isNaN(time)
        ? 0
        : time;
}

/* =========================================================
   16. RENDER GROUP BOARD
========================================================= */

function renderGroupBoard(groupId) {

    currentView = "groupBoard";

    selectedGroupId = groupId;


    const group =
        findGroup(groupId);


    if (!group) {

        showEmpty(
            "Group not found."
        );

        return;
    }


    pageTitleElement.textContent =
        group.group_name +
        " — Board";


    pageDescriptionElement.textContent =
        "Posts for " +
        group.group_name +
        " (" +
        group.period +
        ")";


    setActiveButton(
        groupBoardViewBtn
    );


    /*
       Find posts for this group.
    */

    const groupPosts =
        posts
            .filter(
                post =>
                    post.board_type === "group" &&
                    post.board_id === groupId
            )
            .sort(
                (a, b) =>
                    getDateValue(b.date) -
                    getDateValue(a.date)
            );


    if (groupPosts.length === 0) {

        showEmpty(
            "No posts yet."
        );

        return;
    }


    contentElement.innerHTML =
        groupPosts
            .map(
                post =>
                    createPostHTML(post)
            )
            .join("");
}


/* =========================================================
   17. RENDER LEADER CHANNEL
========================================================= */

function renderLeaderChannel(leaderId) {

    currentView = "leaderChannel";

    selectedLeaderId = leaderId;

    const leader =
        findLeader(leaderId);

    if (!leader) {

        showEmpty(
            "Leader not found."
        );

        return;
    }

    /*
       Highlight the leader that is
       currently being viewed.
    */

    const leaderButtons =
    leaderPicker.querySelectorAll(
        ".data-button"
    );

leaderButtons.forEach(button => {

    button.classList.toggle(
        "active",
        button.dataset.leaderId === leaderId
    );

});

    pageTitleElement.textContent =
        leader.full_name +
        " — Leader Channel";

    pageDescriptionElement.textContent =
        "Posts from " +
        leader.full_name +
        " across their groups and periods.";

    setActiveButton(
        leaderChannelViewBtn
    );

    /*
       Leader channel posts use
       the leader's person_id
       as board_id.
    */

    const leaderPosts =
        posts
            .filter(
                post =>
                    post.board_type === "leader" &&
                    post.board_id === leaderId
            )
            .sort(
                (a, b) =>
                    getDateValue(b.date) -
                    getDateValue(a.date)
            );

    if (leaderPosts.length === 0) {

        showEmpty(
            "No posts yet."
        );

        return;
    }

    contentElement.innerHTML =
        leaderPosts
            .map(
                post =>
                    createPostHTML(post)
            )
            .join("");
}
/* =========================================================
   18. CREATE POST HTML
========================================================= */

function createPostHTML(post) {

    const author =
        findPerson(
            post.author_id
        );


    const authorName =
        author
        ? author.full_name
        : "Unknown author";


    const attachment =
        post.attachment_label;


    return `
        <article class="card post">

            <div class="post-header">

                <span class="post-author">
                    ${escapeHTML(
                        authorName
                    )}
                </span>

                <span class="post-date">
                    ${escapeHTML(
                        post.date
                    )}
                </span>

            </div>


            <div class="post-text">
                ${escapeHTML(
                    post.text
                )}
            </div>


            ${
                attachment
                ? `
                    <span class="attachment">
                        📎
                        ${escapeHTML(
                            attachment
                        )}
                    </span>
                  `
                : ""
            }

        </article>
    `;
}


/* =========================================================
   19. RENDER HISTORY
========================================================= */

function renderHistory(personId) {

    currentView = "history";

    selectedPersonId = personId;


    const person =
        findPerson(personId);


    if (!person) {

        showEmpty(
            "Person not found."
        );

        return;
    }


    pageTitleElement.textContent =
        person.full_name +
        " — History";


    pageDescriptionElement.textContent =
        "Groups this person has belonged to and leader channels they keep.";


    setActiveButton(
        historyViewBtn
    );


    /*
       PART A
       Find all memberships belonging
       to this person.
    */

    const theirMemberships =
        memberships.filter(
            membership =>
                membership.person_id ===
                personId
        );


    /*
       Convert memberships into groups.
    */

    const theirGroups =
        theirMemberships
            .map(
                membership =>
                    findGroup(
                        membership.group_id
                    )
            )
            .filter(
                group => group
            );


    /*
       Sort groups by period.
    */

    theirGroups.sort(
        (a, b) =>
            Number(a.period) -
            Number(b.period)
    );


    /*
       PART B
       Find all leaders connected
       to those groups.
    */

    const leaderIds =
        new Set(
            theirGroups.map(
                group =>
                    group.leader_id
            )
        );


    const leaders =
        Array.from(
            leaderIds
        )
        .map(
            leaderId =>
                findPerson(
                    leaderId
                )
        )
        .filter(
            leader => leader
        );


    /*
       Build page.
    */

    let html = "";


    html += `
        <div class="card">

            <div class="profile-card">

                <div class="avatar">
                    ${escapeHTML(
                        getInitials(
                            person.full_name
                        )
                    )}
                </div>

                <div class="profile-info">

                    <h2>
                        ${escapeHTML(
                            person.full_name
                        )}
                    </h2>

                    <span class="role">
                        ${escapeHTML(
                            person.role
                        )}
                    </span>

                </div>

            </div>

        </div>
    `;


    /*
       PART A — Groups
    */

    html += `
        <div class="card">

            <h2>
                Group History
            </h2>

            <br>

            ${
                theirGroups.length === 0
                ? `
                    <div class="empty">
                        No group history found.
                    </div>
                  `
                :
                    theirGroups.map(
                        group => `
                            <div class="history-group">

                                <h3>
                                    ${escapeHTML(
                                        group.group_name
                                    )}
                                </h3>

                                <p>
                                    Period:
                                    ${escapeHTML(
                                        group.period
                                    )}
                                </p>

                                <p>
                                    Leader:
                                    ${
                                        findPerson(
                                            group.leader_id
                                        )
                                        ? escapeHTML(
                                            findPerson(
                                                group.leader_id
                                            ).full_name
                                          )
                                        : "Unknown"
                                    }
                                </p>

                            </div>
                        `
                    ).join("")
            }

        </div>
    `;


    /*
       PART B — Leader channels
    */

    html += `
        <div class="card">

            <h2>
                Leader Channels
            </h2>

            <br>

            ${
                leaders.length === 0
                ? `
                    <div class="empty">
                        No leader channels found.
                    </div>
                  `
                :
                    leaders.map(
                        leader => `
                            <div class="history-group">

                                <h3>
                                    ${escapeHTML(
                                        leader.full_name
                                    )}
                                </h3>

                                <p>
                                    This person keeps
                                    access to the leader
                                    channel because they
                                    were previously in
                                    this leader's group.
                                </p>

                                <button
                                    class="nav-button"
                                    onclick="
                                        renderLeaderChannel(
                                            '${escapeAttribute(
                                                leader.person_id
                                            )}'
                                        )
                                    "
                                >
                                    Open Leader Channel
                                </button>

                            </div>
                        `
                    ).join("")
            }

        </div>
    `;


    contentElement.innerHTML =
        html;
}


/* =========================================================
   20. EMPTY MESSAGE
========================================================= */

function showEmpty(message) {

    contentElement.innerHTML = `
        <div class="empty">
            <h2>
                Nothing to show
            </h2>

            <p>
                ${escapeHTML(message)}
            </p>
        </div>
    `;
}


/* =========================================================
   21. VIEW BUTTONS
========================================================= */

rosterViewBtn.addEventListener(
    "click",
    () => {

        if (selectedGroupId) {

            renderRoster(
                selectedGroupId
            );

        } else if (groups.length > 0) {

            renderRoster(
                groups[0].group_id
            );
        }
    }
);


groupBoardViewBtn.addEventListener(
    "click",
    () => {

        if (selectedGroupId) {

            renderGroupBoard(
                selectedGroupId
            );

        } else if (groups.length > 0) {

            renderGroupBoard(
                groups[0].group_id
            );
        }
    }
);


leaderChannelViewBtn.addEventListener(
    "click",
    () => {

        if (selectedLeaderId) {

            renderLeaderChannel(
                selectedLeaderId
            );

        } else {

            const leader =
                people.find(
                    person =>
                        person.role ===
                        "leader"
                );

            if (leader) {

                renderLeaderChannel(
                    leader.person_id
                );
            }
        }
    }
);


historyViewBtn.addEventListener(
    "click",
    () => {

        if (selectedPersonId) {

            renderHistory(
                selectedPersonId
            );

        } else {

            showEmpty(
                "Please select a person to view their history."
            );
        }
    }
);


/* =========================================================
   22. ACTIVE NAVIGATION
========================================================= */

function setActiveButton(activeButton) {

    const buttons = [
        rosterViewBtn,
        groupBoardViewBtn,
        leaderChannelViewBtn,
        historyViewBtn
    ];


    buttons.forEach(
        button =>
            button.classList.remove(
                "active"
            )
    );


    activeButton.classList.add(
        "active"
    );
}


/* =========================================================
   23. GET INITIALS
========================================================= */

function getInitials(name) {

    const parts = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return "?";
    }

    return parts
        .slice(0, 2)
        .map(
            word =>
                word[0]
        )
        .join("")
        .toUpperCase();
}


/* =========================================================
   24. HTML SECURITY HELPERS
========================================================= */

function escapeHTML(value) {

    if (value === undefined ||
        value === null) {

        return "";
    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");
}


/* =========================================================
   25. START APPLICATION
========================================================= */

loadAllData();
