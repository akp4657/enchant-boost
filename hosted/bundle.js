"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//At the top of the file
var _csrf; // Values to help not repeat methods


var pageList = false;
var loopNumber = 1;
var videoKey = 0;
var videoIndex = 0;
var videoMax = 300;
var queryString;
var pagedVideos = []; // ADDING A VIDEO

var handleVideo = function handleVideo(e) {
  videoKey = 0;
  var modValue = 0;
  var charModValue = 0;
  e.preventDefault(); // Create a video object to send to the server

  var videoObj = {}; // For each match a user wants to add, push the object

  for (var i = 0; i < loopNumber; i++) {
    var newObject = {};
    videoObj[i] = newObject;
  } // Find the overall link the user inputted


  $('#videoForm').find('input').each(function () {
    if (this.name === 'videoLink') {
      videoObj.videoLink = this.value;
    }
  }); // If any values are empty

  if ($("#timeStamp").val() == '' || $("#playerOne").val() == '' || $("#playerTwo").val() == '' || $("#videoLink").val() == '' || $("#matchDate").val() == '') {
    alert("ERROR | All fields are required");
    return false;
  } // Check if the error uses the correct link *just copying the url


  if (!$("#videoLink").val().includes('www.youtube.com') && !$("#videoLink").val().includes('www.twitch.tv')) {
    alert("ERROR | Please use a valid YouTube/Twitch link");
    return false;
  } // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Quantifiers
  // https://www.w3schools.com/jsref/jsref_replace.asp


  var regex = /[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/g; /// Putting each input into its own object to send to the server 
  ///

  $('#videoForm').find('td > input').each(function () {
    if (modValue === 0) {
      // Using regex to ensure the timestamp is correct
      if (regex.test(this.value)) {
        var array = this.value.match(regex);
        JSON.stringify(array);
        var newArray = array[0].replace(/:.*?/, "h");
        var newArray2 = newArray.replace(/:.*?/, "m");
        var finalArray = newArray2 + "s";

        if ($("#videoLink").val().includes('www.twitch.tv')) {
          videoObj[videoKey].link = "".concat(videoObj.videoLink, "?t=").concat(finalArray);
        } else {
          videoObj[videoKey].link = "".concat(videoObj.videoLink, "&t=").concat(finalArray);
        }
      } else {
        videoObj[videoKey].link = "".concat(videoObj.videoLink, "&t=").concat(this.value);
      }
    }

    if (modValue === 1) {
      videoObj[videoKey].player1 = this.value;
    }

    if (modValue === 2) {
      // Once the end is reached, add the game from the selection
      // Add characters as well
      // and iterate the videoKey and reset the modification values
      videoObj[videoKey].player2 = this.value;
      videoObj[videoKey].type = $('#videoForm').find('#type').find(":selected").val();
      videoObj[videoKey].matchDate = $('#videoForm').find('#matchDate').val();
      videoKey++;
      modValue = -1;
    }

    modValue++;
  }); // Set the new video key to the loop number for the next loop

  videoKey = loopNumber; // For character selection

  $('#videoForm').find('select').each(function () {
    // One of the selections is for the game version, we don't need that
    // Also, if the key is equal to zero, skip it.
    if (this.id != "type") {
      if (videoKey > 0) {
        if (charModValue === 0) {
          // In order to ensure the object exists, take it from 
          // the loop number and go down what's already been created
          // and add that property to the list
          videoObj[loopNumber - videoKey].char1 = this.value;
        } else if (charModValue === 1) {
          videoObj[loopNumber - videoKey].char2 = this.value;
          charModValue = -1;
          videoKey--;
        }

        charModValue++;
      }
    }
  }); // CSRF is associated with a user, so add a token to the overall object to send to the server

  $('#videoForm').find('input').each(function () {
    if (this.type === 'hidden') {
      videoObj._csrf = this.value;
    }
  }); // Uncomment this to send data
  // Send the object! :diaYay:

  sendAjax('POST', $("#videoForm").attr("action"), videoObj, redirect);
  return false;
}; // Handle deletion of a video


var handleDelete = function handleDelete(e) {
  e.preventDefault();
  var data = {
    uid: e.target.value,
    _csrf: _csrf
  };
  sendAjax('POST', '/delete', data, function () {
    loadVideosFromServer();
  });
  return false;
}; // Handling password change


var handleChange = function handleChange(e) {
  e.preventDefault();

  if ($("#pass").val() == '' || $("#pass2").val() == '') {
    alert("ERROR | All fields are required");
    return false;
  }

  if ($("#pass").val() === $("#pass2").val()) {
    alert("ERROR | Passwords cannot match");
    return false;
  }

  if ($("#pass2").val() !== $("#pass3").val()) {
    alert("ERROR | The new passwords do not match");
    return false;
  }

  sendAjax('POST', $("#changeForm").attr("action"), $("#changeForm").serialize(), redirect);
  return false;
}; //Sets the values of the players and game to null, then triggers a change to remove the char selects from the form


var handleReset = function handleReset(e) {
  e.preventDefault();
  $("#player1Search").val("");
  $("#player2Search").val("");
  return false;
}; // Handles the search. Will check for each value in the inputs for the search form to see if they exist.
// If they exist put them into the query string them send it to the server with the GET command


var handleSearch = function handleSearch(player) {
  //e.preventDefault();
  queryString = "".concat($('#searchForm').attr('action'), "?"); // Check if the player is a string. It'll default to an object if it doesn't exist
  // If it is, search for this specific player in DFC:I matches

  if (typeof player === 'string' || player instanceof String) {
    queryString += "player1=".concat(player);
    queryString += "&version=".concat(2);
  } else {
    // Check each search field to see if anything is in them. If there is data in them, add it to the querystring
    if ($("#player1Search").val()) {
      queryString += "player1=".concat($("#player1Search").val());
    }

    if ($("#player2Search").val()) {
      queryString += "&player2=".concat($("#player2Search").val());
    }

    if ($("#char1Search").find(":selected").text() !== 'Char 1' && $("#char1Search").find(":selected").text() !== 'Anyone') {
      queryString += "&char1=".concat($("#char1Search").find(":selected").val());
    }

    if ($("#char2Search").find(":selected").text() !== 'Char 2' && $("#char2Search").find(":selected").text() !== 'Anyone') {
      queryString += "&char2=".concat($("#char2Search").find(":selected").val());
    }

    if ($("#sortSec").val() && $("#sortSec").val() != 'Sort') {
      queryString += "&sort=".concat($("#sortSec").val());
    }

    if ($("#typeSec").val() && $("#typeSec").val() != 'Match Type' && $("#typeSec").val() && $("#typeSec").val() != 'Any') {
      queryString += "&type=".concat($("#typeSec").val());
    }
  }

  sendAjax('GET', queryString, null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(VideoList, {
      videos: data.videos
    }), document.querySelector("#content"));
  });
};

var handleCharacterData = function handleCharacterData() {
  // console.log('handling data')
  var characterQuery = "".concat($('#dataForm').attr('action'), "?");

  if ($("#charDataSearch").val() != 'undefined') {
    characterQuery += "character=".concat($("#charDataSearch").val());
  } //console.log(characterQuery)


  sendAjax('GET', characterQuery, null, function (data) {
    //console.log('sent query')
    ReactDOM.render( /*#__PURE__*/React.createElement(CharacterData, {
      character: data.character
    }), document.querySelector("#content"));
  });
}; // Search form
//Sets up the search form, will change the select for characters depending on the game selected


var SearchForm = function SearchForm() {
  var sortSelection = /*#__PURE__*/React.createElement("select", {
    id: "sortSec",
    className: "form-control"
  }, /*#__PURE__*/React.createElement("option", {
    value: "Sort",
    disabled: true,
    selected: true,
    hidden: true
  }, "Sort"), /*#__PURE__*/React.createElement("option", {
    value: "Oldest"
  }, "Oldest"), /*#__PURE__*/React.createElement("option", {
    value: "Newest"
  }, "Newest"));
  var typeSelection = /*#__PURE__*/React.createElement("select", {
    id: "typeSec",
    className: "form-control"
  }, /*#__PURE__*/React.createElement("option", {
    value: "Match Type",
    disabled: true,
    selected: true,
    hidden: true
  }, "Match Type"), /*#__PURE__*/React.createElement("option", {
    value: "Any"
  }, "Any"), /*#__PURE__*/React.createElement("option", {
    value: "Tournament"
  }, "Tournament"), /*#__PURE__*/React.createElement("option", {
    value: "Set"
  }, "Set"), /*#__PURE__*/React.createElement("option", {
    value: "Casuals"
  }, "Casuals"), /*#__PURE__*/React.createElement("option", {
    value: "Netplay"
  }, "Netplay"));
  var char1Select = $("#char1Search").find(":selected").val();
  var char2Select = $("#char2Search").find(":selected").val();
  var char1Src = "/assets/img/Characters/".concat(char1Select, ".png");
  var char2Src = "/assets/img/Characters/".concat(char2Select, ".png");
  console.log({
    char1: char1Select,
    char2: char2Select
  });
  return /*#__PURE__*/React.createElement("form", {
    id: "searchForm",
    onChange: handleSearch,
    onReset: handleReset,
    name: "searchForm",
    action: "/search",
    method: "GET",
    className: "searchForm form-inline"
  }, /*#__PURE__*/React.createElement("table", {
    id: "searchFormTable",
    className: "table table-sm"
  }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("img", {
    id: "char1Img",
    src: char1Src,
    alt: char1Select
  }))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, char1Search), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("input", {
    className: "form-control",
    id: "player1Search",
    type: "text",
    name: "player1",
    placeholder: "Name"
  }))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("img", {
    id: "char2Img",
    src: char2Src,
    alt: char2Select
  })), /*#__PURE__*/React.createElement("td", null)), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, char2Search), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("input", {
    className: "form-control",
    id: "player2Search",
    type: "text",
    name: "player2",
    placeholder: "Name"
  }))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, sortSelection), /*#__PURE__*/React.createElement("td", null, typeSelection)))));
}; /// FORM TO SUBMIT NEW DATA
// Don't think the images thing is going to work out
// Just make the page look very nice is probably the only way to go


var VideoForm = function VideoForm(props) {
  var _React$createElement;

  // Rows to dynamically add more matches
  // https://stackoverflow.com/questions/22876978/loop-inside-react-jsx
  var rows = [];
  var charSelection;
  var char2Selection;
  var char1Sel;
  var char2Sel;
  var char1Src;
  var char2Src;

  for (var i = 0; i < loopNumber; i++) {
    var char1ID = "char".concat(i);
    var char2ID = "char0".concat(i);
    char1Select.props.id = char1ID;
    char2Select.props.id = char2ID;
    charSelection = char1Select;
    char2Selection = char2Select; //console.log(char1ID)

    char1Sel = $("#".concat(char1ID)).find(":selected").val();
    char2Sel = $("#".concat(char2ID)).find(":selected").val(); //console.log(char1Sel)

    char1Src = "/assets/img/Characters/".concat(char1Sel, ".png");
    char2Src = "/assets/img/Characters/".concat(char2Sel, ".png");
    /*<td><img id="assist1Img" src={assist1Src} alt={assist1Sel}/>{assist1Selection}</td>
    <td><img id="char1Img" src={char1Src} alt={char1Sel}/>{charSelection}</td>
    <td><img id="char2Img" src={char2Src} alt={char2Sel}/>{char2Selection}</td>
    <td><img id="assist2Img" src={assist2Src} alt={assist2Sel}/>{assist2Selection}</td>*/

    rows.push( /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("input", {
      className: "form-control",
      id: "timestamp",
      type: "text",
      name: "timestamp",
      placeholder: "00:00:00"
    })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("input", {
      className: "form-control",
      id: "playerOne",
      type: "text",
      name: "playerOne",
      placeholder: "Player 1"
    })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("img", {
      id: "char1Img",
      src: char1Src,
      alt: char1Sel
    }), charSelection), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("img", {
      id: "char2Img",
      src: char2Src,
      alt: char2Sel
    }), char2Selection), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("input", {
      className: "form-control",
      id: "playerTwo",
      type: "text",
      name: "playerTwo",
      placeholder: "Player 2"
    })))));
  }

  return /*#__PURE__*/React.createElement("form", {
    id: "videoForm",
    onSubmit: handleVideo,
    name: "videoForm",
    action: "/main",
    method: "POST",
    className: "videoForm"
  }, /*#__PURE__*/React.createElement("div", {
    id: "static"
  }, /*#__PURE__*/React.createElement("input", {
    id: "videoLink",
    className: "form-control",
    type: "text",
    name: "videoLink",
    placeholder: "YouTube Link (https://www.youtube.com/watch?v=***********)"
  }), /*#__PURE__*/React.createElement("select", {
    className: "form-control",
    id: "type",
    placeholder: "Match Type"
  }, /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true,
    selected: true,
    hidden: true
  }, "Match Type"), /*#__PURE__*/React.createElement("option", {
    value: "Tournament"
  }, "Tournament"), /*#__PURE__*/React.createElement("option", {
    value: "Set"
  }, "Set"), /*#__PURE__*/React.createElement("option", {
    value: "Casuals"
  }, "Casuals"), /*#__PURE__*/React.createElement("option", {
    value: "Netplay"
  }, "Netplay")), /*#__PURE__*/React.createElement("input", {
    id: "matchDate",
    className: "form-control",
    type: "text",
    name: "matchDate",
    placeholder: "YYYY-MM-DD"
  }), /*#__PURE__*/React.createElement("table", {
    id: "videoFormTable",
    className: "table table-sm table-dark"
  }, rows), /*#__PURE__*/React.createElement("input", (_React$createElement = {
    className: "makeVideoSubmit"
  }, _defineProperty(_React$createElement, "className", "formSubmit btn mainBtn"), _defineProperty(_React$createElement, "type", "submit"), _defineProperty(_React$createElement, "value", "Add Video"), _React$createElement)), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    id: "addMatchButton",
    className: "formSubmit btn secondBtn",
    type: "button",
    value: "Add Match"
  }), /*#__PURE__*/React.createElement("input", {
    id: "removeMatchButton",
    className: "formSubmit btn thirdBtn",
    type: "button",
    value: "Remove Match"
  })));
}; /// CHANGE PASSWORD WINDOW


var ChangeWindow = function ChangeWindow(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "changeForm",
    name: "changeForm",
    onSubmit: handleChange,
    action: "/passChange",
    method: "POST",
    className: "mainForm"
  }, /*#__PURE__*/React.createElement("input", {
    id: "pass",
    type: "password",
    name: "pass",
    placeholder: "old password"
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("input", {
    id: "pass2",
    type: "password",
    name: "pass2",
    placeholder: "new password"
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("input", {
    id: "pass3",
    type: "password",
    name: "pass3",
    placeholder: "re-type password"
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit btn",
    type: "submit",
    value: "Change"
  }));
};

var CharacterData = function CharacterData(props) {
  var characterNodes = props.character.map(function (character) {
    var moveText;

    if (character.move) {
      moveText = /*#__PURE__*/React.createElement("h1", {
        id: "moveDiv"
      }, character.move);
    }

    return /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      id: "moveRow"
    }, /*#__PURE__*/React.createElement("div", {
      id: "moveDivContainer"
    }, moveText)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      id: "ignition"
    }, character.startup)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      id: "ignition"
    }, character.active)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      id: "ignition"
    }, character.frameAdv))));
  });
  return /*#__PURE__*/React.createElement("div", {
    id: "charDataContainer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-responsive"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table table-sm",
    id: "characterDataTable"
  }, characterNodes)));
}; //Sets up the search form


var DataSearchForm = function DataSearchForm() {
  return /*#__PURE__*/React.createElement("form", {
    id: "dataForm",
    onChange: handleCharacterData,
    name: "dataSearchForm",
    action: "/getData",
    method: "GET",
    className: "searchForm form-inline"
  }, /*#__PURE__*/React.createElement("table", {
    id: "dataFormTable",
    className: "table table-sm"
  }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, charDataSearch)))));
};

var CharacterDataImage = function CharacterDataImage() {
  var charSelect = $("#charDataSearch").find(":selected").val();
  var charSrc = "/assets/img/characterSprites/".concat(charSelect, ".png");
  return /*#__PURE__*/React.createElement("div", {
    id: "characterDataDiv"
  }, /*#__PURE__*/React.createElement("img", {
    id: "characterData",
    src: charSrc,
    alt: charSelect
  }));
};

var Load = function Load() {
  return /*#__PURE__*/React.createElement("div", {
    className: "videoList"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "emptyVideo"
  }, "Loading videos from the database..."));
};

var SiteDown = function SiteDown() {
  return /*#__PURE__*/React.createElement("div", {
    className: "videoList"
  }, /*#__PURE__*/React.createElement("h1", null, "Site Down..."), /*#__PURE__*/React.createElement("img", {
    id: "iriyaDownImg",
    src: "/assets/img/iriyaDown.JPG"
  }));
};

var SideVideo = function SideVideo() {
  var link = $("#videoLink").val();
  var videoSource = sourceObj;
  var embedLink = link.replace('watch?v=', 'embed/'); // console.log(embedLink)

  videoSource.props.src = "".concat(embedLink); //console.log(videoSource)

  return /*#__PURE__*/React.createElement("div", {
    id: "videoDiv"
  }, videoSource);
};

var AssistInfo = function AssistInfo() {
  var selected = $("#assistInfoSelect").find(":selected").text();
  var assistSrc = "/assets/img/assistSprites/".concat(selected, ".png");
  var info; // At the bottom of the file, there's an array of HTML objects, each correlating to the 
  // character. Find the one we want and put it here

  assistInfo.forEach(function (a) {
    if (a.props.value === selected) {
      info = a;
      return;
    }

    console.dir(info);
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "infoList"
  }, assistInfoSelect, /*#__PURE__*/React.createElement("img", {
    id: "assistInfoImg",
    src: assistSrc,
    alt: selected
  })), /*#__PURE__*/React.createElement("div", {
    className: "textList",
    id: "textInfo"
  }, /*#__PURE__*/React.createElement("h1", null, info)));
};

var GifBack = function GifBack() {
  return /*#__PURE__*/React.createElement("img", {
    id: "gifs",
    src: "/assets/img/background.gif"
  });
}; /// RENDERING THE LIST
/// Render the list depending on if it's a page list or the full list


var VideoList = function VideoList(props) {
  // Do we need to show deletion or not
  var deleteButton;

  if (props.videos.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: "videoList"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "emptyVideo"
    }, "No videos found!"));
  }

  var videoNodes = props.videos.map(function (video) {
    var char1Src;
    var char2Src;
    var charImg1;
    var charImg2;
    char1Src = "/assets/img/Characters/".concat(video.char1, ".png");
    char2Src = "/assets/img/Characters/".concat(video.char2, ".png");
    charImg1 = /*#__PURE__*/React.createElement("img", {
      id: "char1Img",
      src: char1Src,
      alt: video.char1
    });
    charImg2 = /*#__PURE__*/React.createElement("img", {
      id: "char2Img",
      src: char2Src,
      alt: video.char2
    });
    return /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      id: "tdP1"
    }, video.player1), /*#__PURE__*/React.createElement("td", null, charImg1), /*#__PURE__*/React.createElement("td", null, charImg2), /*#__PURE__*/React.createElement("td", {
      id: "tdP2"
    }, video.player2), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("a", {
      href: video.link,
      className: "icons-sm yt-ic",
      target: "_blank"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fab fa-youtube fa-2x"
    }, " "))), /*#__PURE__*/React.createElement("td", null, video.type), /*#__PURE__*/React.createElement("td", null, video.matchDate)));
  }); //console.log(videoNodes.length);

  for (videoIndex; videoIndex < videoMax; videoIndex++) {
    pagedVideos[videoIndex] = videoNodes[videoIndex];

    if (videoIndex === videoMax - 1) {
      videoIndex = 0;
      break;
    }
  } //console.log(pagedVideos.length);


  return /*#__PURE__*/React.createElement("div", {
    id: "pageContainer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-responsive"
  }, /*#__PURE__*/React.createElement("table", {
    id: "videoListTable",
    className: "table table-sm table-dark"
  }, pagedVideos)), /*#__PURE__*/React.createElement("button", {
    id: "nextButton",
    className: "formSubmit btn secondBtn",
    type: "button"
  }, "View More"));
};

var loadVideosFromServer = function loadVideosFromServer() {
  loopNumber = 1;
  pageList = true;
  sendAjax('GET', '/getVideos', null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(VideoList, {
      videos: data.videos
    }), document.querySelector("#content"));
  });
}; // Display all videos for home page


var loadAllVideosFromServer = function loadAllVideosFromServer() {
  loopNumber = 1;
  pageList = false;
  createSearchForm();
  sendAjax('GET', '/getAllVideos', null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(VideoList, {
      videos: data.videos
    }), document.querySelector("#content"));
    videoMax = 300;
    var next = document.querySelector("#nextButton");
    next.addEventListener("click", function (e) {
      // console.log(pagedVideos);
      if (pagedVideos[videoMax - 2] === undefined) {
        alert("ERROR | No more videos!");
        return;
      }

      videoMax += 100;
      ReactDOM.render( /*#__PURE__*/React.createElement(VideoList, {
        videos: data.videos
      }), document.querySelector("#content"));
    });
  });
};

var createPassChangeWindow = function createPassChangeWindow(csrf) {
  // Unmount everything
  ReactDOM.unmountComponentAtNode(document.querySelector("#content"));
  ReactDOM.unmountComponentAtNode(document.querySelector("#info"));
  ReactDOM.unmountComponentAtNode(document.querySelector("#search"));
  loopNumber = 1;
  ReactDOM.render( /*#__PURE__*/React.createElement(ChangeWindow, {
    csrf: csrf
  }), document.querySelector("#content"));
};

var createAddWindow = function createAddWindow(csrf) {
  ReactDOM.unmountComponentAtNode(document.querySelector("#content"));
  ReactDOM.unmountComponentAtNode(document.querySelector("#info"));
  ReactDOM.unmountComponentAtNode(document.querySelector("#search"));
  ReactDOM.unmountComponentAtNode(document.querySelector("#gifSection"));
  ReactDOM.render( /*#__PURE__*/React.createElement(VideoForm, {
    csrf: csrf
  }), document.querySelector("#content"));
  var contentDiv = document.querySelector("#content");
  contentDiv.style.width = "58%"; //If something changes, re-render for picture purposes

  $('#videoFormTable').find('select').each(function () {
    this.onchange = function () {
      ReactDOM.render( /*#__PURE__*/React.createElement(VideoForm, {
        csrf: csrf
      }), document.querySelector("#content"));
    };
  });
  var removeMatchButton = document.querySelector("#removeMatchButton");
  removeMatchButton.addEventListener("click", function (e) {
    if (loopNumber !== 1) {
      loopNumber--; //If it's clicked, just re-render

      ReactDOM.render( /*#__PURE__*/React.createElement(VideoForm, {
        csrf: csrf
      }), document.querySelector("#content"));
      $('#videoFormTable').find('select').each(function () {
        this.onchange = function () {
          ReactDOM.render( /*#__PURE__*/React.createElement(VideoForm, {
            csrf: csrf
          }), document.querySelector("#content"));
        };
      });
    } else {
      alert("ERROR | Cannot remove last match");
    }
  }); // Get the button that was made in the videoForm

  var addMatchButton = document.querySelector("#addMatchButton");
  addMatchButton.addEventListener("click", function (e) {
    loopNumber++; //If it's clicked, just re-render

    ReactDOM.render( /*#__PURE__*/React.createElement(VideoForm, {
      csrf: csrf
    }), document.querySelector("#content"));
    $('#videoFormTable').find('select').each(function () {
      this.onchange = function () {
        ReactDOM.render( /*#__PURE__*/React.createElement(VideoForm, {
          csrf: csrf
        }), document.querySelector("#content"));
      };
    });
  });
  var videoInput = document.querySelector("#videoLink");
  videoInput.addEventListener("focusout", function (e) {
    // console.log('Hello')
    ReactDOM.render( /*#__PURE__*/React.createElement(SideVideo, null), document.querySelector("#search")); //$('vidSrc').hide().show();
  });
  ReactDOM.render( /*#__PURE__*/React.createElement("div", {
    id: "videoDiv"
  }, /*#__PURE__*/React.createElement("div", {
    id: "videoPreview"
  }, "Video Preview")), document.querySelector("#search"));
};

var createSearchForm = function createSearchForm() {
  ReactDOM.render( /*#__PURE__*/React.createElement(SearchForm, null), document.querySelector("#search")); // If something changes, re-render

  $('#searchForm').find('select').on('change', function () {
    ReactDOM.render( /*#__PURE__*/React.createElement(SearchForm, null), document.querySelector("#search"));
  });

  if (queryString != undefined) {
    // console.log('query string isnot empty: ' + queryString)
    var next = document.querySelector("#nextButton");
    videoMax = 300;
    next.addEventListener("click", function (e) {
      // console.log(pagedVideos[0])
      if (pagedVideos[videoMax - 1] === undefined) {
        alert("ERROR | No more videos!");
        return;
      }

      videoMax += 100;
      sendAjax('GET', queryString, null, function (data) {
        ReactDOM.render( /*#__PURE__*/React.createElement(VideoList, {
          videos: data.videos
        }), document.querySelector("#content"));
      });
    });
  }
};

var createDataForm = function createDataForm() {
  ReactDOM.unmountComponentAtNode(document.querySelector("#content"));
  ReactDOM.unmountComponentAtNode(document.querySelector("#gifSection"));
  ReactDOM.unmountComponentAtNode(document.querySelector("#info"));
  ReactDOM.unmountComponentAtNode(document.querySelector("#search"));
  ReactDOM.render( /*#__PURE__*/React.createElement(DataSearchForm, null), document.querySelector("#search"));
  $("#dataForm").find('select').on('change', function () {
    ReactDOM.render( /*#__PURE__*/React.createElement(DataSearchForm, null), document.querySelector("#search"));
    ReactDOM.render( /*#__PURE__*/React.createElement(CharacterDataImage, null), document.querySelector('#info'));
  });
};

var createLoad = function createLoad() {
  ReactDOM.render( /*#__PURE__*/React.createElement(Load, null), document.querySelector("#content"));
};

var createSiteDown = function createSiteDown() {
  ReactDOM.render( /*#__PURE__*/React.createElement(SiteDown, null), document.querySelector('#content'));
};

var createGifs = function createGifs() {
  ReactDOM.render( /*#__PURE__*/React.createElement(GifBack, null), document.querySelector("#gifSection"));
};

var createAssistSelect = function createAssistSelect() {
  ReactDOM.render( /*#__PURE__*/React.createElement(AssistInfo, null), document.querySelector("#info"));
  $('#info').find('select').on('change', function () {
    ReactDOM.render( /*#__PURE__*/React.createElement(AssistInfo, null), document.querySelector("#info"));
  });
};

var setup = function setup(csrf) {
  var homeButton = document.querySelector("#home"); //const pageButton = document.querySelector("#myPage");

  var addButton = document.querySelector("#addVideo");
  var passChangeButton = document.querySelector("#passChangeButton");
  var reportButton = document.querySelector('#reportButton');
  var reportSubmit = document.querySelector('#reportSubmit'); //const dataButton = document.querySelector('#dataButton');

  passChangeButton.addEventListener("click", function (e) {
    e.preventDefault();
    createGifs();
    createPassChangeWindow(csrf); //Uncomment on site up

    return false;
  });
  addButton.addEventListener("click", function (e) {
    e.preventDefault();
    createAddWindow(csrf); //Uncomment on site up

    return false;
  });
  reportButton.addEventListener("click", function (e) {
    e.preventDefault();
    alert('Email at enchant-boost.net@gmail.com\n\nPlease be as detailed as possible with your report');
    return false;
  }); // dataButton.addEventListener("click", (e) => {
  //     e.preventDefault();
  //     createDataForm();
  //     return false;
  // })

  homeButton.addEventListener("click", function (e) {
    e.preventDefault();
    createSearchForm();
    loadAllVideosFromServer(); //Uncomment on site up

    return false;
  });
  /*pageButton.addEventListener("click", (e) => {
      e.preventDefault();
      createSearchForm();
      loadVideosFromServer();
      return false;
  });*/

  createSearchForm();
  createLoad();
  createAssistSelect(); // Player links

  if (window.location.pathname != '/main') {
    // console.log('true')
    var player = /[^/]*$/.exec(window.location.pathname)[0]; // console.log(player)

    handleSearch(player);
  } else {
    // console.log('false')
    loadAllVideosFromServer(); //Default window Uncomment all on sit up
  } //createSiteDown();

}; //And set it in getToken


var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    _csrf = result.csrfToken;
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
}); //#region Character Forms
//Separated the character forms for ease of reference and readability in above code

var char1Select = /*#__PURE__*/React.createElement("select", {
  id: "char1Select",
  className: "form-control"
}, /*#__PURE__*/React.createElement("option", {
  value: "Arthur"
}, "Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Bisclavret"
}, "Bisclavret"), /*#__PURE__*/React.createElement("option", {
  value: "EternalFlame"
}, "Eternal Flame"), /*#__PURE__*/React.createElement("option", {
  value: "Iai"
}, "Iai Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Iori"
}, "Iori"), /*#__PURE__*/React.createElement("option", {
  value: "Koume"
}, "Koume"), /*#__PURE__*/React.createElement("option", {
  value: "Nimue"
}, "Nimue"), /*#__PURE__*/React.createElement("option", {
  value: "Nitou"
}, "Nitou Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Riesz"
}, "Riesz"), /*#__PURE__*/React.createElement("option", {
  value: "SnowWhite"
}, "Snow White"), /*#__PURE__*/React.createElement("option", {
  value: "Thief"
}, "Thief Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Yamaneko"
}, "Yamaneko Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Zex"
}, "Zex Siegfried"));
var char2Select = /*#__PURE__*/React.createElement("select", {
  id: "char2Select",
  className: "form-control"
}, /*#__PURE__*/React.createElement("option", {
  value: "Arthur"
}, "Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Bisclavret"
}, "Bisclavret"), /*#__PURE__*/React.createElement("option", {
  value: "EternalFlame"
}, "Eternal Flame"), /*#__PURE__*/React.createElement("option", {
  value: "Iai"
}, "Iai Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Iori"
}, "Iori"), /*#__PURE__*/React.createElement("option", {
  value: "Koume"
}, "Koume"), /*#__PURE__*/React.createElement("option", {
  value: "Nimue"
}, "Nimue"), /*#__PURE__*/React.createElement("option", {
  value: "Nitou"
}, "Nitou Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Riesz"
}, "Riesz"), /*#__PURE__*/React.createElement("option", {
  value: "SnowWhite"
}, "Snow White"), /*#__PURE__*/React.createElement("option", {
  value: "Thief"
}, "Thief Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Yamaneko"
}, "Yamaneko Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Zex"
}, "Zex Siegfried"));
var char1Search = /*#__PURE__*/React.createElement("select", {
  id: "char1Search",
  className: "form-control"
}, /*#__PURE__*/React.createElement("option", {
  value: "undefined",
  disabled: true,
  selected: true,
  hidden: true
}, "Char 1"), /*#__PURE__*/React.createElement("option", {
  value: "Anyone"
}, "Anyone"), /*#__PURE__*/React.createElement("option", {
  value: "Arthur"
}, "Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Bisclavret"
}, "Bisclavret"), /*#__PURE__*/React.createElement("option", {
  value: "EternalFlame"
}, "Eternal Flame"), /*#__PURE__*/React.createElement("option", {
  value: "Iai"
}, "Iai Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Iori"
}, "Iori"), /*#__PURE__*/React.createElement("option", {
  value: "Koume"
}, "Koume"), /*#__PURE__*/React.createElement("option", {
  value: "Nimue"
}, "Nimue"), /*#__PURE__*/React.createElement("option", {
  value: "Nitou"
}, "Nitou Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Riesz"
}, "Riesz"), /*#__PURE__*/React.createElement("option", {
  value: "SnowWhite"
}, "Snow White"), /*#__PURE__*/React.createElement("option", {
  value: "Thief"
}, "Thief Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Yamaneko"
}, "Yamaneko Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Zex"
}, "Zex Siegfried"));
var char2Search = /*#__PURE__*/React.createElement("select", {
  id: "char2Search",
  className: "form-control"
}, /*#__PURE__*/React.createElement("option", {
  value: "undefined",
  disabled: true,
  selected: true,
  hidden: true
}, "Char 2"), /*#__PURE__*/React.createElement("option", {
  value: "Anyone"
}, "Anyone"), /*#__PURE__*/React.createElement("option", {
  value: "Arthur"
}, "Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Bisclavret"
}, "Bisclavret"), /*#__PURE__*/React.createElement("option", {
  value: "EternalFlame"
}, "Eternal Flame"), /*#__PURE__*/React.createElement("option", {
  value: "Iai"
}, "Iai Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Iori"
}, "Iori"), /*#__PURE__*/React.createElement("option", {
  value: "Koume"
}, "Koume"), /*#__PURE__*/React.createElement("option", {
  value: "Nimue"
}, "Nimue"), /*#__PURE__*/React.createElement("option", {
  value: "Nitou"
}, "Nitou Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Riesz"
}, "Riesz"), /*#__PURE__*/React.createElement("option", {
  value: "SnowWhite"
}, "Snow White"), /*#__PURE__*/React.createElement("option", {
  value: "Thief"
}, "Thief Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Yamaneko"
}, "Yamaneko Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Zex"
}, "Zex Siegfried"));
var assistInfoSelect = /*#__PURE__*/React.createElement("select", {
  id: "assistInfoSelect",
  className: "form-control"
}, /*#__PURE__*/React.createElement("option", {
  value: "",
  disabled: true,
  selected: true,
  hidden: true
}, "Ast Info"), /*#__PURE__*/React.createElement("option", {
  value: "Aife"
}, "Aife"), /*#__PURE__*/React.createElement("option", {
  value: "Balin"
}, "Balin"), /*#__PURE__*/React.createElement("option", {
  value: "Claire"
}, "Claire"), /*#__PURE__*/React.createElement("option", {
  value: "Constantine"
}, "Constantine"), /*#__PURE__*/React.createElement("option", {
  value: "Cu"
}, "Cu"), /*#__PURE__*/React.createElement("option", {
  value: "Elle"
}, "Elle"), /*#__PURE__*/React.createElement("option", {
  value: "Enide"
}, "Enide"), /*#__PURE__*/React.createElement("option", {
  value: "Evaine"
}, "Evaine"), /*#__PURE__*/React.createElement("option", {
  value: "Faye"
}, "Faye"), /*#__PURE__*/React.createElement("option", {
  value: "Galahad"
}, "Galahad"), /*#__PURE__*/React.createElement("option", {
  value: "Gawain"
}, "Gawain"), /*#__PURE__*/React.createElement("option", {
  value: "Grey"
}, "Grey"), /*#__PURE__*/React.createElement("option", {
  value: "Guinevere"
}, "Guinevere"), /*#__PURE__*/React.createElement("option", {
  value: "Hawkeye"
}, "Hawkeye"), /*#__PURE__*/React.createElement("option", {
  value: "Jaku"
}, "Jaku"), /*#__PURE__*/React.createElement("option", {
  value: "Kaguya"
}, "Kaguya"), /*#__PURE__*/React.createElement("option", {
  value: "Kriemhild"
}, "Kriemhild"), /*#__PURE__*/React.createElement("option", {
  value: "Lancelot"
}, "Lancelot"), /*#__PURE__*/React.createElement("option", {
  value: "Mercenary"
}, "Mercenary"), /*#__PURE__*/React.createElement("option", {
  value: "Millionaire Arthur"
}, "Millionaire Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Mordred"
}, "Mordred"), /*#__PURE__*/React.createElement("option", {
  value: "Peridod"
}, "Peridod"), /*#__PURE__*/React.createElement("option", {
  value: "Pharsalia"
}, "Pharsalia"), /*#__PURE__*/React.createElement("option", {
  value: "Reafe"
}, "Reafe"), /*#__PURE__*/React.createElement("option", {
  value: "Scathach"
}, "Scathach"), /*#__PURE__*/React.createElement("option", {
  value: "Sorcery King"
}, "Sorcery King"), /*#__PURE__*/React.createElement("option", {
  value: "Tecno-Smith"
}, "Tecno-Smith"), /*#__PURE__*/React.createElement("option", {
  value: "Tor"
}, "Tor"), /*#__PURE__*/React.createElement("option", {
  value: "Urthach"
}, "Urthach"), /*#__PURE__*/React.createElement("option", {
  value: "Utahime"
}, "Utahime"));
var charDataSearch = /*#__PURE__*/React.createElement("select", {
  id: "charDataSearch",
  className: "form-control"
}, /*#__PURE__*/React.createElement("option", {
  value: "undefined",
  disabled: true,
  selected: true,
  hidden: true
}, "Char"), /*#__PURE__*/React.createElement("option", {
  value: "Anyone"
}, "Anyone"), /*#__PURE__*/React.createElement("option", {
  value: "Arthur"
}, "Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Bisclavret"
}, "Bisclavret"), /*#__PURE__*/React.createElement("option", {
  value: "EternalFlame"
}, "Eternal Flame"), /*#__PURE__*/React.createElement("option", {
  value: "Iai"
}, "Iai Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Iori"
}, "Iori"), /*#__PURE__*/React.createElement("option", {
  value: "Koume"
}, "Koume"), /*#__PURE__*/React.createElement("option", {
  value: "Nimue"
}, "Nimue"), /*#__PURE__*/React.createElement("option", {
  value: "Nitou"
}, "Nitou Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Riesz"
}, "Riesz"), /*#__PURE__*/React.createElement("option", {
  value: "SnowWhite"
}, "Snow White"), /*#__PURE__*/React.createElement("option", {
  value: "Thief"
}, "Thief Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Yamaneko"
}, "Yamaneko Arthur"), /*#__PURE__*/React.createElement("option", {
  value: "Zex"
}, "Zex Siegfried"));
var sourceObj = /*#__PURE__*/React.createElement("iframe", {
  height: "550",
  width: "1100",
  id: "vidSrc"
});
var assistInfo = [/*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Faye"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Standard fireball."), /*#__PURE__*/React.createElement("p", null, "Good for pressure and has quick enough recovery that attempts to roll through the fireball can generally be punished.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Jaku"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Will cause the opponent to enter a stagger state into knockdown. Significantly increased untechable time. "), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Nice Chin Chin! Elle will run across the ground. On contact with the opponent, she will hit them, forcing standing state."), /*#__PURE__*/React.createElement("p", null, "Too reactable to be a mixup but is seen in some combos due to the restand.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Balin"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Balin will drop her sword in an arcing attack. Will slightly track the opponent."), /*#__PURE__*/React.createElement("p", null, "Very good all-purpose support. Fast with a great hitbox, Balin can control neutral extremely well functioning as both an anti-ground and at times, an anti-air tool. Fast characters can sometimes run past Balin's tracking to make it whiff mid-run.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Gawain"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Untechable Knockdown. Counter-hit effect carries through both hits."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Attacks from the ground below the player's position. Gawain does a two part attack. First attacking along the ground before summoning a large fire pillar."), /*#__PURE__*/React.createElement("p", null, "Primarily used in combos and blockstrings. Weak hit-box for neutral but has high untechable time and high base damage.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Mercenary"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Untechable knockdown. Counter-hit effect carries throughout the shockwave."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Mercenary will be summoned above the player character and slam directly downwards. Upon reaching the ground, he will cause a shockwave, carrying the opponent across the screen. Startup is 28F when performed on the ground against grounded opponents."), /*#__PURE__*/React.createElement("p", null, "Amazing support all-round. Good screen control, can function as an anti-air, good combo filler, good frame advantage, has great synergy with a large amount of characters.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Claire"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Claire will throw a proximity-triggered mine infront of her. It will trigger automatically when the opponent is in a vulnerable state (i.e hittable) when they are within range."), /*#__PURE__*/React.createElement("p", null, "Can control the placement of the mine by holding \u2B60 or \u2B62 when summoning."), /*#__PURE__*/React.createElement("p", null, "Decent assist on paper. Generally not seen because she fails to control air space. Used for okizeme or screen control.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Hawkeye"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Hawkeye performs a delayed rising attack at the opponents position. Reaches extremely high and tracks slightly before becoming active."), /*#__PURE__*/React.createElement("p", null, "Has use in neutral to control the opponent's movement in neutral. Due to its delay attack and tracking, it has some use in combos as well.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Mordred"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Mordred shoots a wide laser 45\xB0 diagonally upwards. Can force launch on knocked down opponents."), /*#__PURE__*/React.createElement("p", null, "Only seen on fire element characters for maximising damage off EB combos.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Cu"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, " Untechable knockdown. Counter-hit effect carries."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "After a long delay, Chulainn throws his spear at a downward angle. Upon collission with the ground, it will summon a fire pillar that reaches full screen."), /*#__PURE__*/React.createElement("p", null, "Generally not used due to its long startup. Has synergy with some characters with elemental counter-hit.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Elle"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased freeze time. Slightly increased untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Standard fireball."), /*#__PURE__*/React.createElement("p", null, "Good for pressure and has quick enough recovery that attempts to roll through the fireball can generally be punished.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Evaine"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased freeze time. Increased untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Summoned above the player character. Evaine smacks a watermelon at an angle. This will bounce off walls a maximum of 3 times. Frame data is if the ball strikes the opponent instantly after it is hit."), /*#__PURE__*/React.createElement("p", null, "Amazing assist. Cheap cost, Good angle, fast projectile speed and can control space extremely well with the wall bounce. Synergises extremely well with a lot of characters and can also be used as okizeme in certain situations.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Sorcery King"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased freeze time. Untechable knockdown on clean hit. Increased untechable time on non-clean hit."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Mage-Guild Arthur be summoned at the player's position and then rush across the screen extremely quickly. Will clean hit if the opponent is hit close to the player character on summon, causing a knockdown. On further away hits, will cause a sliding effect."), /*#__PURE__*/React.createElement("p", null, "Generally all round useful assist. Great neutral assist due to its fast speed and long range. Good synergy with elemental counters due to long freeze time and untechable knockdown. Naturally increased untechable time for Ice Supports allows it to be used in combos for most characters.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Lancelot"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Lancelot is summoned on the ground at the player's position. Bracing his shield, he will either activate as a counter when struck, or after time, striking a large area in front of him. Will only block one attack and will gain a collision hitbox on activation."), /*#__PURE__*/React.createElement("p", null, "Guard point is active from 23F onwards, Will automatically strike at 75F."), /*#__PURE__*/React.createElement("p", null, "Amazing assist with unique purposes. Can be used to deter opponents from poking in neutral or be used as okizeme. High scaling limits his use in combos however.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Tor"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Untechable Knockdown on clean hit. Increased untechable time on non-clean hit."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Tor will spawn on the player character and kick upwards at a 30* angle. Will clean hit within a certain distance, causing exteremely long hit-stop and untechable time. On non-clean hit, the opponent will wall bounce with signifcant untechable time."), /*#__PURE__*/React.createElement("p", null, "Extremely good assist on paper. Fast summon, high base damage with significant untechable time making it very easy to combo off on any hit. Although the hitbox is larger than it looks, it is still only let down by its angle of attack.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Constantine"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Constantine is summoned at the player's position. Spawns a slow moving ice ball. Will trigger within proximity of the opponent and freeze them for a long period of time on hit. Will automatically explode if not triggered within an extremely long amount of time."), /*#__PURE__*/React.createElement("p", null, "Great okizeme tool due to spawning above trigger range when done grounded. Can set up unblockables with command grabs. Great neutral tool as it presents a slow moving hitbox but can be invalidated by attacks which can clash/delete projectiles.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Kriemhild"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time. Second hit will cause ground bounce."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Azia will do a two part rising attack from the ground. She will first do a rising attack before performing a followup that will pull the opponent downwards towards the player. This can side swap at certain range."), /*#__PURE__*/React.createElement("p", null, "Fast enough to function as an anti-air with long untechable times, making confirms very easy. Has some use in combos for certain characters.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Pharsalia"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Untechable knockdown."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Pharsalia shoots a large laser across the screen."), /*#__PURE__*/React.createElement("p", null, "Very easy to combo into and from due to its Ice element. Has high compatibility with multiple characters due to being a reliable super cancel but most primarily seen as an ender to Ice Character's EB combos.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Peridod"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Peridod throws her scythe across the screen before returning like a boomerang."), /*#__PURE__*/React.createElement("p", null, "Good for establishing screen control but its high cost limits its usage. Slower startup and smaller hitbox limits her ability to be used in combos.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Reafe"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Standard fireball. Less untechable time than Fire/Ice variants."), /*#__PURE__*/React.createElement("p", null, "Has more blockstun but sees comparitively less use due to being wind element with low untechable time.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Enide"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Enide creates an explosion directly infront of the player."), /*#__PURE__*/React.createElement("p", null, "With a fast startup, large hitbox and low cost, Enide is very good at controlling space in neutral. However due to the wallbounce, without counter-hit, it may be difficult to convert off stray hits.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Tecno-Smith"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Untechable knockdown."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Rising attack from the ground."), /*#__PURE__*/React.createElement("p", null, "With an extremely fast startup and a high reaching hitbox, Techno-Smith can be used as an anti-air however without a counter-hit, it's almost impossible to combo off. Occasionally seen as a combo ender utilizing its element counter untechable knockdown.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Galahad"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Galahad rushes across the screen while performing many rapid strikes. Will slowly stop travelling upon collision with the opponent."), /*#__PURE__*/React.createElement("p", null, "Decent startup and reaches far across the screen makes Galahad useful for controlling space. Due to having long hit-stop, she has use in DP into Galahad combos.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Utahime"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased hit-stop and untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Diva Arthur will perform a 360* attack on the ground at the player's position. Will launch the opponent away on hit. will heal the user 5 times after being used, in 1-2 second intervals.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Scathach"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Scathach summons a wind pillar below the oppponent, launching them."), /*#__PURE__*/React.createElement("p", null, "Primarily used as a neutral tool due to its tracking and low combo-ability. Landing this raw will restore a noticeable amount of HP.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Aife"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Untechable knockdown. Counter-hit effect will carry through to the second hit."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Aife strikes down at a slanted angle in front of the player before striking across the screen at a slight upwards angle."), /*#__PURE__*/React.createElement("p", null, "Fairly fast startup and controls a large amount of space makes Aife a very good neutral support. Unfortunately due to knocking the opponent away, many characters struggle to combo off stray Aife hits.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Uasaha"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Uathach summons a wind vortex infront of the player. Will vacuum nearby opponents and restores a considerable amount of HP on hit. This effect is also able to vacuum grounded opponents for full damage."), /*#__PURE__*/React.createElement("p", null, "Used in EB combos for wind characters. Its ability to vacuum and relaunch grounded opponents can add flexibility for a bit more damage in situations other supports wouldn't be able to.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Kaguya"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased untechable time."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Kaguya summons two revolving orbs around the player character which can collide with opponents for damage. After a delay, the projectiles will fire across the screen. Low untechable time and will disappear if the player is struck."), /*#__PURE__*/React.createElement("p", null, "Its low damage and unique nature leaves this solely used as a neutral tool to force the player's advantage. Can be used as an invincible approaching hitbox by combining it with rolls.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Grey"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Significantly increased hitstun."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Little Grey tracks the opponent and performs multiple hits which cause a significant amount of hitstun or blockstun. On hit, will scale combos significantly."), /*#__PURE__*/React.createElement("p", null, "Strong assist on paper but due to its inability to be cancelled into from specials and the significant combo scaling it causes, it sees limited use.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Millionaire Arthur"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "N/A"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Grants super armor to the next attack the player performs. Multi-part attacks (e.g rekkas) will retain the super armor. Super armor is only active during the first attack performed after summoning. Will be wasted if the player is hit before use.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Akira"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Untechable knockdown on the last hit."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Akira kicks an arcade cab at the opponent. Significant frame advantage and corner carry. Will launch on final hit. Can be delayed by holding the button used to summon her. Will strike 27F after button release."), /*#__PURE__*/React.createElement("p", null, "Last hit is not a solid blockstring and can be used to set up unblockable command grab setups.")), /*#__PURE__*/React.createElement("div", {
  id: "aInfo",
  value: "Guinevere"
}, /*#__PURE__*/React.createElement("h2", null, "Counter Effect"), /*#__PURE__*/React.createElement("p", null, "Increased Hitstun."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("p", null, "Strikes the opponent in an area in front of the player on the ground. On hit, will increase the current mana cost of the opponent's support cards by 1 for the next use. This affects each support individually and can stack up to a maximum of 5."), /*#__PURE__*/React.createElement("p", null, "While it does not offer high damage potential, Guinevere's unique ability to raise the cost of supports can significantly influence the match. Very effective against characters/players who use low cost or multiple supports in tandem as the effect is only removed upon use for that particular support."))]; //#endregion
"use strict";

// https://stackoverflow.com/questions/32704027/how-to-call-bootstrap-alert-with-jquery
var handleError = function handleError(message) {
  $("#dangerAlert").text(message);
  $("#dangerAlert").show();
  $("#dangerAlert").addClass('in');
  $("#dangerAlert").delay(2000).fadeOut('slow');
  return false;
};

var handleSuccess = function handleSuccess(message) {
  $("#successAlert").text(message);
  $("#successAlert").show();
  $("#successAlert").addClass('in');
  $("#successAlert").delay(2000).fadeOut('slow');
  return false;
};

var redirect = function redirect(response) {
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: 'json',
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      alert(messageObj.error);
    }
  });
};
