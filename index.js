"use strict";

if (!openDatabase) {
  alert("Your browser doesn't support WebSQL");
}

/**
 * @type {HTMLTextAreaElement}
 */
const inputEl = document.getElementById("input");
inputEl.value = "SELECT tbl_name, sql from sqlite_master WHERE type = 'table';";

/**
 * @type {HTMLTextAreaElement}
 */
const outputEl = document.getElementById("output");

/**
 * @type {Database}
 */
const db = openDatabase("mydb", "1.0", "Test DB", 2 * 1024 * 1024);

const errorHandler = (err) => {
  console.error(err);

  const errorEl = document.createElement("p");
  errorEl.className = "error";
  if (err.message) {
    errorEl.innerText = err.message;
  } else {
    if (typeof err === "string") {
      errorEl.innerText = err;
    } else {
      errorEl.innerText = JSON.stringify(err);
    }
  }
  outputEl.appendChild(errorEl);
};

const triggerRun = () => {
  // is selection in inputEl ?
  if (inputEl.selectionStart !== inputEl.selectionEnd) {
    // get selection
    const selection = inputEl.value.substring(
      inputEl.selectionStart,
      inputEl.selectionEnd
    );
    // run selection
    run(selection);
  } else {
    // run whole inputEl
    run(inputEl.value);
  }

  inputEl.focus();
};

/**
 * @param {string} script
 */
const run = (script) => {
  outputEl.innerHTML = "";
  db.transaction((tx) => {
    let first = true;

    for (const query of script.split(";")) {
      if (query.trim().length === 0) {
        continue;
      }

      tx.executeSql(
        query,
        [],
        (_, rs) => {
          if (!first) {
            outputEl.appendChild(document.createElement("hr"));
          }
          first = false;

          const affectedRowsEl = document.createElement("span");
          affectedRowsEl.innerText = `${rs.rows.length} rows affected`;
          outputEl.appendChild(affectedRowsEl);

          if (rs.rows.length > 0) {
            const tableEl = document.createElement("table");

            const theadEl = document.createElement("thead");
            const headerRow = document.createElement("tr");
            for (const key in rs.rows.item(0)) {
              const thEl = document.createElement("th");
              thEl.innerText = key;
              headerRow.appendChild(thEl);
            }
            theadEl.appendChild(headerRow);
            tableEl.appendChild(theadEl);

            const tbodyEl = document.createElement("tbody");
            for (let i = 0; i < rs.rows.length; i++) {
              const rowEl = document.createElement("tr");
              for (const key in rs.rows.item(i)) {
                const tdEl = document.createElement("td");
                tdEl.innerText = rs.rows.item(i)[key];
                tdEl.dataset.key = key;
                rowEl.appendChild(tdEl);
              }
              tbodyEl.appendChild(rowEl);
            }
            tableEl.appendChild(tbodyEl);
            outputEl.appendChild(tableEl);
          }
        },
        errorHandler
      );
    }
  }, errorHandler);
};
