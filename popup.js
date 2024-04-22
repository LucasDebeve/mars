document.addEventListener("DOMContentLoaded", function () {
  searchInfo();
  document.getElementById("addBookmark").addEventListener("click", addBookmark);
});

async function getCurrentTabUrl() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab.url;
}

// Search for a bookmark by Regex url
// async function searchBookmark(query) {
//   return new Promise((resolve, reject) => {
//     chrome.bookmarks.search(query, function (bookmarks) {
//       resolve(bookmarks);
//     });
//   });
// }

// Get the number from url
function getNumber(url) {
  let numbers = url.match(/\d+/g);
  return numbers;
}

async function searchBookmark(query = {}, res = "1") {
  let match_id = [];
  const gettingTree = chrome.bookmarks.getSubTree(res);
  document.getElementById("debug").innerHTML =
    "<strong>" + query.url + "</strong></br>";
  return gettingTree.then((bookmarkItems) => {
    bookmarkItems[0].children.forEach(
      (element) => {
        document
          .getElementById("debug")
          .append(
            document.createTextNode(
              (element.url || element.title) + " - " + element.id
            )
          );
        document.getElementById("debug").append(document.createElement("br"));
        // regex search
        if (
          (element.url && element.url.match(query.url)) ||
          (element.title && element.title.match(query.url))
        ) {
          match_id.push(element.id);
        }
      },
      (error) => {
        document.getElementById(
          "debug"
        ).innerHTML = `An error: ${error.message} </br>`;
        document.getElementById("debug").style = "background-color: lightred";
      }
    );
    return match_id;
  });
}

function searchInfo() {
  getCurrentTabUrl().then((url) => {
    // Find if there is a bookmark with the same url without the number after the third slash
    const urlBeforeThirdSlash = url.split("/").slice(0, 3).join("/");
    const urlAfterThirdSlash = url.split("/").slice(3).join("/");
    // Replace the numbers with a regex [0-9]*
    const query =
      urlBeforeThirdSlash + "/" + urlAfterThirdSlash.replace(/\d+/g, "[0-9]*");
    searchBookmark({ url: query }, "88").then((match_id) => {
      document.getElementById("debug").innerHTML = match_id;
      // Display the results
      chrome.bookmarks.get(match_id, (bookmarks) => {
        document.getElementById("results").innerHTML = "";
        bookmarks.forEach((element) => {
          let result = document.createElement("div");
          result.id = element.id;
          result.innerHTML =
            "<input name='title' type='text' value='" +
            element.title +
            "'><input name='url' type='text' value='" +
            element.url +
            "'><button onclick='' >Save</button>";
          document.getElementById("results").appendChild(result);
        });
      });
    });
  });
}

function addBookmark() {
  document.getElementById("number").innerHTML = "";
  getCurrentTabUrl().then((url) => {
    document.getElementById("url").innerHTML = url;
    getNumber(url).forEach((element, i) => {
      // Create a radio button
      const elem = document.createElement("input");
      elem.type = "radio";
      elem.name = "number";
      elem.value = element;
      // Select by default the first number
      if (i === 0) {
        elem.checked = true;
      }
      // Create the label
      const label = document.createElement("label");
      label.htmlFor = element;
      label.appendChild(elem);
      label.appendChild(document.createTextNode(element));
      // Add the label to the page
      document.getElementById("number").appendChild(label);
    });

    // chrome.bookmarks.create({
    //   'parentId': '1',
    //   'title': 'test',
    //   'url': url
    // });
  });
}
