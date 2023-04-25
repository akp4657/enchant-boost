let videoIndex = 0;
let videoMax = 350;
let queryString;
let pagedVideos;

// Sending request to handle login
const handleLogin = (e) => {
    e.preventDefault();


    if($("#user").val() == '' || $("#pass").val() == '') {
        alert("ERROR | Username or Password is empty");
        return false;
    }

    sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);
    return false;
};

// Sending request to handle signing up
const handleSignup = (e) => {
    e.preventDefault();
    if($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() =='') {
        alert("ERROR | All fields are required");
        return false;
    }

    if($("#pass").val() !== $("#pass2").val()) {
        alert("ERROR | Passwords do not match");
        return false;
    }

    sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);

    return false;
};

//Sets the values of the players and game to null, then triggers a change to remove the char selects from the form
const handleReset = (e) => {
    e.preventDefault();

    $("#player1Search").val("");
    $("#player2Search").val("");
    $("#gameSearch").val("").prop('selected', true).trigger("change");

    return false;
} 

// Handles the search. Will check for each value in the inputs for the search form to see if they exist.
// If they exist put them into the query string them send it to the server with the GET command
const handleSearch = (player) => {
    //e.preventDefault();
    queryString = `${$('#searchForm').attr('action')}?`;

    // Check if the player is a string. It'll default to an object if it doesn't exist
    // If it is, search for this specific player in DFC:I matches
    if(typeof player === 'string' || player instanceof String) {
        queryString += `player1=${player}`
        queryString += `&version=${2}`
    } else {
        // Check each search field to see if anything is in them. If there is data in them, add it to the querystring
        if($("#player1Search").val()){
            queryString += `player1=${$("#player1Search").val()}`
        }
        if($("#player2Search").val()){
            queryString += `&player2=${$("#player2Search").val()}`
        }
        if($("#char1Search").find(":selected").text() !== 'Char 1' &&
        $("#char1Search").find(":selected").text() !== 'Anyone'){
            console.log($("#char1Search").find(":selected").text() )
            queryString += `&char1=${$("#char1Search").find(":selected").val()}`
        }   
        if($("#char2Search").find(":selected").text() !== 'Char 2' &&
        $("#char2Search").find(":selected").text() !== 'Anyone'){
            queryString += `&char2=${$("#char2Search").find(":selected").val()}`
        }
        if($("#sortSec").val() && $("#sortSec").val() != 'Sort'){
            queryString += `&sort=${$("#sortSec").val()}`
        }
        if($("#typeSec").val() && $("#typeSec").val() != 'Match Type'){
            queryString += `&type=${$("#typeSec").val()}`
        }
    } 

    sendAjax('GET', queryString , null, (data) =>{
        ReactDOM.render(
            <VideoList videos={data.videos} />, document.querySelector("#content")
        );
    });
};

const handleCharacterData = () => {
   // console.log('handling data')

    let characterQuery = `${$('#dataForm').attr('action')}?`;
    
    if($("#charDataSearch").val() != 'undefined') {
        characterQuery += `character=${$("#charDataSearch").val()}`
    }

   // console.log(characterQuery)

    sendAjax('GET', characterQuery, null, (data) =>{
       // console.log('sent query')
        ReactDOM.render(
            <CharacterData character={data.character} />, document.querySelector("#content")
        );
    })
}

// Search form
//Sets up the search form
const SearchForm = () => {


    const sortSelection = <select id = "sortSec" className = 'form-control'>
    <option value="Sort" disabled selected hidden>Sort</option><option value="Oldest">Oldest</option>
    <option value="Newest">Newest</option>
    </select>;

    const typeSelection = <select id = "typeSec" className = 'form-control'>
        <option value="Match Type" disabled selected hidden>Match Type</option>
        <option value="Tournament">Tournament</option>
        <option value="Set">Set</option>
        <option value="Casuals">Casuals</option>
        <option value="Netplay">Netplay</option>
    </select>;

    let char1Select = $("#char1Search").find(":selected").val()
    let char2Select = $("#char2Search").find(":selected").val()

    let char1Src = `/assets/img/Characters/${char1Select}.png`
    let char2Src = `/assets/img/Characters/${char2Select}.png`

    return(
        <form
            id="searchForm"
            onChange={handleSearch}
            onReset={handleReset}
            name="searchForm"
            action="/search"
            method="GET"
            className="searchForm form-inline"
        >
            <table id="searchFormTable" className="table table-sm">
                <tbody>
                    <tr>
                        <td><img id="char1Img" src={char1Src} alt={char1Select}/></td>
                    </tr>
                    <tr>
                        <td>{char1Search}</td>
                        <td><input className="form-control" id="player1Search" type="text" name="player1" placeholder="Name"/></td>
                    </tr>
                    <tr>
                        <td><img id="char2Img" src={char2Src} alt={char2Select}/></td>
                        
                    </tr>
                    <tr>
                        <td>{char2Search}</td>
                        <td><input className="form-control" id="player2Search" type="text" name="player2" placeholder="Name"/></td>
                    </tr>
                    <tr>
                        <td>{sortSelection}</td>
                        <td>{typeSelection}</td>
                    </tr>
                </tbody>
            </table>
        </form>
    )
};

const PlayerSearchForm = () => {

    return(
        <form
            id="searchForm"
            onChange={handleSearch}
            onReset={handleReset}
            name="searchForm"
            action="/search"
            method="GET"
            className="searchForm form-inline"
        >
          <table id="searchFormTable" className="table table-sm">
                <tbody>
                    <tr>
                        <td><input className="form-control" id="player1Search" type="text" name="player1" placeholder="Player 1"/></td>
                    </tr>
                    <tr>
                        vs
                    </tr>
                    <tr>
                        <td><input className="form-control" id="player2Search" type="text" name="player2" placeholder="Player 2"/></td>
                    </tr>
                </tbody>
            </table>
        </form>
    )
};

// Render our login window
const LoginWindow = (props) => {
    return ( 
    <form   id="loginForm"
            className="mainForm"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
        >
        <input id="user" type="text" name="username" placeholder="username"/>
        <br></br>
        <br></br>
        <input id="pass" type="password" name="pass" placeholder="password"/>
        <br></br>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="formSubmit btn" type="submit" value="Sign In"/>

    </form>
    );
};

// Render our signup window
const SignupWindow = (props) => {
    return ( 
    <form id="signupForm" name="signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="mainForm"
        >
        <input id="user" type="text" name="username" placeholder="username"/>
        <br></br>
        <br></br>
        <input id="pass" type="password" name="pass" placeholder="password"/>
        <br></br>
        <br></br>
        <input id="pass2" type="password" name="pass2" placeholder="retype password"/>
        <br></br>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="formSubmit btn" type="submit" value="Sign Up"/>

    </form>
    );
};

//#region Home Video Code
const VideoList = function(props) {
    pagedVideos = [];

    if(props.videos.length === 0) {
        return (
            <div className="videoList">
                <h3 className="emptyVideo">No videos found!</h3>
            </div>
        );
    }

    const videoNodes = props.videos.map(function(video) {
        let char1Src;
        let char2Src;

        let charImg1;
        let charImg2;

        char1Src = `/assets/img/Characters/${video.char1}.png`;
        char2Src = `/assets/img/Characters/${video.char2}.png`;

        charImg1 = <img id="char1Img" src={char1Src} alt={video.char1} />
        charImg2 = <img id="char2Img" src={char2Src} alt={video.char2} />
        
        return (
                <tbody>
                    <tr>
                        <td id='tdP1'>{video.player1}</td>
                        <td>{charImg1}</td>
                        <td>{charImg2}</td>
                        <td id='tdP2'>{video.player2}</td>
                        <td>
                            <a href={video.link} className="icons-sm yt-ic" target="_blank"><i className="fab fa-youtube fa-2x"> </i></a>
                        </td>
                        <td>{video.type}</td>
                        <td>{video.matchDate}</td>
                    </tr>
                </tbody>

            
        );
    });
    //console.log(videoNodes.length);
    for(videoIndex; videoIndex < videoMax; videoIndex++) {
        pagedVideos[videoIndex] = videoNodes[videoIndex]; 

        if(videoIndex === videoMax-1) {
            videoIndex = 0;
            break;
        }
    }
    return (
        <div id="pageContainer">
            <div className="table-responsive">
                <table id="videoListTable" className="table table-sm table-dark">
                    {pagedVideos}
                </table>
            </div>
            <button id="nextButton" className="formSubmit btn secondBtn"type="button">View More</button>
        </div>
    );
};

    //#region Home Video Code
const CharacterData = function(props) {

    const characterNodes = props.character.map(function(character) {
        let moveText;

        if(character.move) {
            moveText = <h1 id="moveDiv">{character.move}</h1>
        }
        return (
                <tbody>
                    <tr>
                        <td id="moveRow"><div id="moveDivContainer">{moveText}</div></td>
                        <td><div id="ignition">{character.startup}</div></td>
                        <td><div id="ignition">{character.active}</div></td>
                        <td><div id="ignition">{character.frameAdv}</div></td>
                    </tr>
                </tbody>
        );
    });

    return (
        <div id="charDataContainer">
            <div className="table-responsive">
                <table className="table table-sm" id ='characterDataTable'>
                    {characterNodes}
                </table>
            </div>
        </div>
    );
};

//Sets up the search form
const DataSearchForm = () => {
    return(
        <form
            id="dataForm"
            onChange={handleCharacterData}
            name="dataSearchForm"
            action="/getData"
            method="GET"
            className="searchForm form-inline"
        >
          <table id="dataFormTable" className="table table-sm">
                <tbody>
                    <tr>
                        <td>{charDataSearch}</td>
                    </tr>
                </tbody>
            </table>
        </form>
    )
};

const CharacterDataImage = () => {
    let charSelect = $("#charDataSearch").find(":selected").val()

    let charSrc = `/assets/img/characterSprites/${charSelect}.png`

    return (
        <div id ="characterDataDiv">
            <img id="characterData" src={charSrc} alt={charSelect} />
        </div>
    )
}


const Load = () => {
    return (<div className="videoList">
                <h3 className="emptyVideo">Loading videos from the database...</h3>
             </div>)
};

const SiteDown = () => {
    return (
        <div className ='videoList'>
            <h1>Site Down...</h1>
            <img id='iriyaDownImg' src = '/assets/img/iriyaDown.JPG'></img>
        </div>
    )
};

const AssistInfo = () => {
    let selected = $("#assistInfoSelect").find(":selected").text();
    let assistSrc = `/assets/img/assistSprites/${selected}.png`;
    let info;

    // At the bottom of the file, there's an array of HTML objects, each correlating to the 
    // character. Find the one we want and put it here
    assistInfo.forEach(a => {
        if(a.props.value === selected) {
            info = a;
            return;
        }
    })

    //console.log(assistSrc)

    return (
        <div>
            <div className = 'infoList'>
                {assistInfoSelect}
                <img id="assistInfoImg" src={assistSrc}/>
            </div>
            <div className = 'textList' id='textInfo'>
                <h1>{info}</h1>
            </div>
        </div>
    )
};

const GifBack = () => {
    return (
        <img id="gifs" src="/assets/img/background.gif"/>
    )
};


///
/// Functions to render our data on the page depending on what we need ///
///
const loadAllVideosFromServer = () => {
    sendAjax('GET', '/getAllVideos', null, (data) => {
        ReactDOM.render(
            <VideoList videos={data.videos} />, document.querySelector("#content")
        );
        videoMax = 300; 
        const next = document.querySelector("#nextButton");
        /*const reportButton = document.querySelector("#reportButton")
        reportButton.addEventListener("click", (e) => {
            handleReport(e)
        })*/
        next.addEventListener("click", (e) => {
            //console.log(pagedVideos[videoMax-2]);
                if(pagedVideos[videoMax-1] === undefined) {
                    alert("ERROR | No more videos!");
                    return;
                }
            videoMax += 100;
            ReactDOM.render(
                <VideoList videos={data.videos} />, document.querySelector("#content")
        );
        });
    });
};
//#endregion

const createLoginWindow = (csrf) => {
    // Unmount everything
    ReactDOM.unmountComponentAtNode(document.querySelector("#content"));
    ReactDOM.unmountComponentAtNode(document.querySelector("#info"));
    ReactDOM.unmountComponentAtNode(document.querySelector("#search"));

    ReactDOM.render(
        <LoginWindow csrf={csrf} />,
        document.querySelector("#content")
    );

    ReactDOM.unmountComponentAtNode(document.querySelector("#search"));
};

const createSignupWindow = (csrf) => {
    // Unmount everything
    ReactDOM.unmountComponentAtNode(document.querySelector("#content"));
    ReactDOM.unmountComponentAtNode(document.querySelector("#info"));
    ReactDOM.unmountComponentAtNode(document.querySelector("#search"));

    ReactDOM.render(
        <SignupWindow csrf={csrf} />,
        document.querySelector("#content")
    );
};

const createSearchForm = () => {
    ReactDOM.render(
        <SearchForm />, document.querySelector("#search")  
    );

    // If something changes, re-render
    $('#searchForm').find('select').on('change', function() {
        ReactDOM.render(
            <SearchForm />,
            document.querySelector("#search")
        );
    });

    if(queryString != undefined)
    {
        //console.log('query string isnot empty: ' + queryString)
        const next = document.querySelector("#nextButton");
        videoMax = 300;
        next.addEventListener("click", (e) => {
            //console.log(pagedVideos[0])
            if(pagedVideos[videoMax-1] === undefined) {
                alert("ERROR | No more videos!");
                return;
            }
            videoMax += 100;
            sendAjax('GET', queryString , null, (data) =>{
                ReactDOM.render(
                    <VideoList videos={data.videos} />, document.querySelector("#content")
                );
            });
        });
    }
}

const createPlayerSearchForm = () => {
    ReactDOM.render(
        <PlayerSearchForm />, document.querySelector("#searchontent")  
    );


    if(queryString != undefined)
    {
        //console.log('query string isnot empty: ' + queryString)
        const next = document.querySelector("#nextButton");
        videoMax = 300;
        next.addEventListener("click", (e) => {
            //console.log(pagedVideos[0])
            if(pagedVideos[videoMax-1] === undefined) {
                alert("ERROR | No more videos!");
                return;
            }
            videoMax += 100;
            sendAjax('GET', queryString , null, (data) =>{
                ReactDOM.render(
                    <VideoList videos={data.videos} />, document.querySelector("#content")
                );
            });
        });
    }
}

const createDataForm = () => {
    ReactDOM.unmountComponentAtNode(document.querySelector("#content"));
    ReactDOM.unmountComponentAtNode(document.querySelector("#gifSection"));
    ReactDOM.unmountComponentAtNode(document.querySelector("#info"));
    ReactDOM.unmountComponentAtNode(document.querySelector("#search"));
    
    ReactDOM.render(
        <DataSearchForm />, document.querySelector("#search")
    )

    $("#dataForm").find('select').on('change', function() {
        ReactDOM.render(
            <DataSearchForm />, document.querySelector("#search")
        )
        ReactDOM.render(
            <CharacterDataImage />, 
            document.querySelector('#info')
        )
    })
}

const createLoad = () => {
    ReactDOM.render(
        <Load />, document.querySelector("#content")
    );
}

const createSiteDown = () => {
    ReactDOM.render(
        <SiteDown />,
        document.querySelector('#content')
    )
}

const createGifs = () => {
    ReactDOM.render(
        <GifBack />,
        document.querySelector("#gifSection")
    );
}

const createAssistSelect = () => {
    ReactDOM.render(
        <AssistInfo />,
        document.querySelector("#info")
    );

    $('#info').find('select').on('change', function() {
        ReactDOM.render(
            <AssistInfo />,
            document.querySelector("#info")
        );
    });
}


const setup = (csrf) => {
    const loginButton = document.querySelector("#loginButton");
    const signupButton = document.querySelector("#signupButton");
    const homeButton = document.querySelector("#home");
    const reportButton = document.querySelector('#reportButton');
    const reportSubmit = document.querySelector('#reportSubmit');
    //const dataButton = document.querySelector('#dataButton');

    signupButton.addEventListener("click", (e) => {
        e.preventDefault();
        createSignupWindow(csrf); //Uncomment on site up 
        createGifs();
        return false;
    });

    loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        createLoginWindow(csrf); //Uncomment on site up
        createGifs();
        return false;
    });

    reportButton.addEventListener("click", (e) => {
        e.preventDefault();
        alert('Email at enchant-boost.net@gmail.com\n\nPlease be as detailed as possible with your report')
        return false;
    });

    // dataButton.addEventListener("click", (e) => {
    //     e.preventDefault();
    //     createDataForm();
    //     return false;
    // })

    homeButton.addEventListener("click", (e) => {
        e.preventDefault();
        //createSearchForm(); // Uncomment on site up
        //createAssistSelect();
        //createPlayerSearchForm();
        //loadAllVideosFromServer(); // Uncomment on site up
        createSiteDown();
        return false;
    });

    createSearchForm();
    createLoad();
    createAssistSelect();

    //createSiteDown();


    // Player links
    if(window.location.pathname != '/') {
        //console.log('true')
        let player = /[^/]*$/.exec(window.location.pathname)[0]
        handleSearch(player);
    }
    else {
        //console.log('false')
     //   createPlayerSearchForm();
        loadAllVideosFromServer() //Default window Uncomment all on sit up
    }

};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});

//#region Character Forms
//Separated the character forms for ease of reference and readability in above code
const char1Search = <select id = "char1Search" className='form-control'>
    <option value="undefined" disabled selected hidden>Char 1</option><option value="Anyone">Anyone</option>
    <option value="BladeProtector">Blade Protector</option><option value="Bisclavret">Bisclavret</option>
    <option value="EternalFlame">Eternal Flame</option><option value="Iai">Iai Arthur</option><option value="Iori">Iori</option>
    <option value="Koume">Koume</option><option value="Nimue">Nimue</option><option value="Nitou">Nitou Arthur</option>
    <option value="Riesz">Riesz</option><option value="SnowWhite">Snow White</option><option value="Thief">Thief Arthur</option>
    <option value="Yamaneko">Yamaneko Arthur</option><option value="Zex">Zex Siegfried</option>
    </select>;

const char2Search= <select id = "char2Search" className='form-control'>
    <option value="undefined" disabled selected hidden>Char 2</option><option value="Anyone">Anyone</option>
    <option value="BladeProtector">Blade Protector</option><option value="Bisclavret">Bisclavret</option>
    <option value="EternalFlame">Eternal Flame</option><option value="Iai">Iai Arthur</option><option value="Iori">Iori</option>
    <option value="Koume">Koume</option><option value="Nimue">Nimue</option><option value="Nitou">Nitou Arthur</option>
    <option value="Riesz">Riesz</option><option value="SnowWhite">Snow White</option><option value="Thief">Thief Arthur</option>
    <option value="Yamaneko">Yamaneko Arthur</option><option value="Zex">Zex Siegfried</option>
    </select>;

const assistInfoSelect = <select id = "assistInfoSelect" className='form-control'>
    <option value="" disabled selected hidden>Ast Info</option>
    <option value="Aife">Aife</option><option value="Balin">Balin</option><option value="Claire">Claire</option>
    <option value="Constantine">Constantine</option><option value="Cu">Cu</option><option value="Elle">Elle</option>
    <option value="Enide">Enide</option><option value="Evaine">Evaine</option><option value="Faye">Faye</option>
    <option value="Galahad">Galahad</option><option value="Gawain">Gawain</option><option value="Grey">Grey</option>
    <option value="Guinevere">Guinevere</option><option value="Hawkeye">Hawkeye</option><option value="Jaku">Jaku</option>
    <option value="Kaguya">Kaguya</option><option value="Kriemhild">Kriemhild</option><option value="Lancelot">Lancelot</option>
    <option value="Mercenary">Mercenary</option><option value="Millionaire Arthur">Millionaire Arthur</option><option value="Mordred">Mordred</option>
    <option value="Peridod">Peridod</option><option value="Pharsalia">Pharsalia</option>
    <option value="Reafe">Reafe</option><option value="Scathach">Scathach</option><option value="Sorcery King">Sorcery King</option>
    <option value="Tecno-Smith">Tecno-Smith</option><option value="Tor">Tor</option><option value="Urthach">Urthach</option>
    <option value="Utahime">Utahime</option>
    </select>;

const charDataSearch = <select id = "charDataSearch" className='form-control'>
    <option value="undefined" disabled selected hidden>Char</option><option value="Anyone">Anyone</option>
    <option value="BladeProtector">Blade Protector</option><option value="Bisclavret">Bisclavret</option>
    <option value="EternalFlame">Eternal Flame</option><option value="Iai">Iai Arthur</option><option value="Iori">Iori</option>
    <option value="Koume">Koume</option><option value="Nimue">Nimue</option><option value="Nitou">Nitou Arthur</option>
    <option value="Riesz">Riesz</option><option value="SnowWhite">Snow White</option><option value="Thief">Thief Arthur</option>
    <option value="Yamaneko">Yamaneko Arthur</option><option value="Zex">Zex Siegfried</option>
    </select>;

const assistInfo = [
    <div id = 'aInfo' value ='Faye'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time</p>
        <br></br>
        <p>Standard fireball.</p>
        <p>Good for pressure and has quick enough recovery that attempts to roll through the fireball can generally be punished.</p>
    </div>,
    <div id = 'aInfo' value ='Jaku'>
        <h2>Counter Effect</h2>
        <p>Will cause the opponent to enter a stagger state into knockdown. Significantly increased untechable time. </p>
        <br></br>
        <p>Nice Chin Chin! Elle will run across the ground. On contact with the opponent, she will hit them, forcing standing state.</p>
        <p>Too reactable to be a mixup but is seen in some combos due to the restand.</p>
    </div>,
    <div id = 'aInfo' value ='Balin'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time</p>
        <br></br>
        <p>Balin will drop her sword in an arcing attack. Will slightly track the opponent.</p>
        <p>Very good all-purpose support. Fast with a great hitbox, Balin can control neutral extremely well functioning as both an anti-ground and at times, an anti-air tool. Fast characters can sometimes run past Balin's tracking to make it whiff mid-run.</p>
    </div>,
    <div id = 'aInfo' value ='Gawain'>
        <h2>Counter Effect</h2>
        <p>Untechable Knockdown. Counter-hit effect carries through both hits.</p>
        <br></br>
        <p>Attacks from the ground below the player's position. Gawain does a two part attack. First attacking along the ground before summoning a large fire pillar.</p>
        <p>Primarily used in combos and blockstrings. Weak hit-box for neutral but has high untechable time and high base damage.</p>
    </div>,
    <div id = 'aInfo' value ='Mercenary'>
        <h2>Counter Effect</h2>
        <p>Untechable knockdown. Counter-hit effect carries throughout the shockwave.</p>
        <br></br>
        <p>Mercenary will be summoned above the player character and slam directly downwards. Upon reaching the ground, he will cause a shockwave, carrying the opponent across the screen. Startup is 28F when performed on the ground against grounded opponents.</p>
        <p>Amazing support all-round. Good screen control, can function as an anti-air, good combo filler, good frame advantage, has great synergy with a large amount of characters.</p>
    </div>,
    <div id = 'aInfo' value ='Claire'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time.</p>
        <br></br>
        <p>Claire will throw a proximity-triggered mine infront of her. It will trigger automatically when the opponent is in a vulnerable state (i.e hittable) when they are within range.</p>
        <p>Can control the placement of the mine by holding ⭠ or ⭢ when summoning.</p>
        <p>Decent assist on paper. Generally not seen because she fails to control air space. Used for okizeme or screen control.</p>
    </div>,
    <div id = 'aInfo' value ='Hawkeye'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time.</p>
        <br></br>
        <p>Hawkeye performs a delayed rising attack at the opponents position. Reaches extremely high and tracks slightly before becoming active.</p>
        <p>Has use in neutral to control the opponent's movement in neutral. Due to its delay attack and tracking, it has some use in combos as well.</p>
    </div>,
    <div id = 'aInfo' value ='Mordred'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time.</p>
        <br></br>
        <p>Mordred shoots a wide laser 45° diagonally upwards. Can force launch on knocked down opponents.</p>
        <p>Only seen on fire element characters for maximising damage off EB combos.</p>
    </div>,
    <div id = 'aInfo' value ='Cu'>
        <h2>Counter Effect</h2>
        <p> Untechable knockdown. Counter-hit effect carries.</p>
        <br></br>
        <p>After a long delay, Chulainn throws his spear at a downward angle. Upon collission with the ground, it will summon a fire pillar that reaches full screen.</p>
        <p>Generally not used due to its long startup. Has synergy with some characters with elemental counter-hit.</p>
    </div>,
    <div id = 'aInfo' value ='Elle'>
        <h2>Counter Effect</h2>
        <p>Increased freeze time. Slightly increased untechable time.</p>
        <br></br>
        <p>Standard fireball.</p>
        <p>Good for pressure and has quick enough recovery that attempts to roll through the fireball can generally be punished.</p>
    </div>,
    <div id = 'aInfo' value ='Evaine'>
        <h2>Counter Effect</h2>
        <p>Increased freeze time. Increased untechable time.</p>
        <br></br>
        <p>Summoned above the player character. Evaine smacks a watermelon at an angle. This will bounce off walls a maximum of 3 times. Frame data is if the ball strikes the opponent instantly after it is hit.</p>
        <p>Amazing assist. Cheap cost, Good angle, fast projectile speed and can control space extremely well with the wall bounce. Synergises extremely well with a lot of characters and can also be used as okizeme in certain situations.</p>
    </div>,
    <div id = 'aInfo' value ='Sorcery King'>
        <h2>Counter Effect</h2>
        <p>Increased freeze time. Untechable knockdown on clean hit. Increased untechable time on non-clean hit.</p>
        <br></br>
        <p>Mage-Guild Arthur be summoned at the player's position and then rush across the screen extremely quickly. Will clean hit if the opponent is hit close to the player character on summon, causing a knockdown. On further away hits, will cause a sliding effect.</p>
        <p>Generally all round useful assist. Great neutral assist due to its fast speed and long range. Good synergy with elemental counters due to long freeze time and untechable knockdown. Naturally increased untechable time for Ice Supports allows it to be used in combos for most characters.</p>
    </div>,
    <div id = 'aInfo' value ='Lancelot'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time.</p>
        <br></br>
        <p>Lancelot is summoned on the ground at the player's position. Bracing his shield, he will either activate as a counter when struck, or after time, striking a large area in front of him. Will only block one attack and will gain a collision hitbox on activation.</p>
        <p>Guard point is active from 23F onwards, Will automatically strike at 75F.</p>
        <p>Amazing assist with unique purposes. Can be used to deter opponents from poking in neutral or be used as okizeme. High scaling limits his use in combos however.</p>
    </div>,
    <div id = 'aInfo' value ='Tor'>
        <h2>Counter Effect</h2>
        <p>Untechable Knockdown on clean hit. Increased untechable time on non-clean hit.</p>
        <br></br>
        <p>Tor will spawn on the player character and kick upwards at a 30* angle. Will clean hit within a certain distance, causing exteremely long hit-stop and untechable time. On non-clean hit, the opponent will wall bounce with signifcant untechable time.</p>
        <p>Extremely good assist on paper. Fast summon, high base damage with significant untechable time making it very easy to combo off on any hit. Although the hitbox is larger than it looks, it is still only let down by its angle of attack.</p>
    </div>,
    <div id = 'aInfo' value ='Constantine'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time.</p>
        <br></br>
        <p>Constantine is summoned at the player's position. Spawns a slow moving ice ball. Will trigger within proximity of the opponent and freeze them for a long period of time on hit. Will automatically explode if not triggered within an extremely long amount of time.</p>
        <p>Great okizeme tool due to spawning above trigger range when done grounded. Can set up unblockables with command grabs. Great neutral tool as it presents a slow moving hitbox but can be invalidated by attacks which can clash/delete projectiles.</p>
    </div>,
    <div id = 'aInfo' value ='Kriemhild'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time. Second hit will cause ground bounce.</p>
        <br></br>
        <p>Azia will do a two part rising attack from the ground. She will first do a rising attack before performing a followup that will pull the opponent downwards towards the player. This can side swap at certain range.</p>
        <p>Fast enough to function as an anti-air with long untechable times, making confirms very easy. Has some use in combos for certain characters.</p>
    </div>,
    <div id = 'aInfo' value ='Pharsalia'>
        <h2>Counter Effect</h2>
        <p>Untechable knockdown.</p>
        <br></br>
        <p>Pharsalia shoots a large laser across the screen.</p>
        <p>Very easy to combo into and from due to its Ice element. Has high compatibility with multiple characters due to being a reliable super cancel but most primarily seen as an ender to Ice Character's EB combos.</p>
    </div>,
    <div id = 'aInfo' value ='Peridod'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time.</p>
        <br></br>
        <p>Peridod throws her scythe across the screen before returning like a boomerang.</p>
        <p>Good for establishing screen control but its high cost limits its usage. Slower startup and smaller hitbox limits her ability to be used in combos.</p>
    </div>,
    <div id = 'aInfo' value ='Reafe'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time.</p>
        <br></br>
        <p>Standard fireball. Less untechable time than Fire/Ice variants.</p>
        <p>Has more blockstun but sees comparitively less use due to being wind element with low untechable time.</p>
    </div>,
    <div id = 'aInfo' value ='Enide'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time.</p>
        <br></br>
        <p>Enide creates an explosion directly infront of the player.</p>
        <p>With a fast startup, large hitbox and low cost, Enide is very good at controlling space in neutral. However due to the wallbounce, without counter-hit, it may be difficult to convert off stray hits.</p>
    </div>,
    <div id = 'aInfo' value ='Tecno-Smith'>
        <h2>Counter Effect</h2>
        <p>Untechable knockdown.</p>
        <br></br>
        <p>Rising attack from the ground.</p>
        <p>With an extremely fast startup and a high reaching hitbox, Techno-Smith can be used as an anti-air however without a counter-hit, it's almost impossible to combo off. Occasionally seen as a combo ender utilizing its element counter untechable knockdown.</p>
    </div>,
    <div id = 'aInfo' value ='Galahad'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time.</p>
        <br></br>
        <p>Galahad rushes across the screen while performing many rapid strikes. Will slowly stop travelling upon collision with the opponent.</p>
        <p>Decent startup and reaches far across the screen makes Galahad useful for controlling space. Due to having long hit-stop, she has use in DP into Galahad combos.</p>
    </div>,
    <div id = 'aInfo' value ='Utahime'>
        <h2>Counter Effect</h2>
        <p>Increased hit-stop and untechable time.</p>
        <br></br>
        <p>Diva Arthur will perform a 360* attack on the ground at the player's position. Will launch the opponent away on hit. will heal the user 5 times after being used, in 1-2 second intervals.</p>
    </div>,
    <div id = 'aInfo' value ='Scathach'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time.</p>
        <br></br>
        <p>Scathach summons a wind pillar below the oppponent, launching them.</p>
        <p>Primarily used as a neutral tool due to its tracking and low combo-ability. Landing this raw will restore a noticeable amount of HP.</p>
    </div>,
    <div id = 'aInfo' value ='Aife'>
        <h2>Counter Effect</h2>
        <p>Untechable knockdown. Counter-hit effect will carry through to the second hit.</p>
        <br></br>
        <p>Aife strikes down at a slanted angle in front of the player before striking across the screen at a slight upwards angle.</p>
        <p>Fairly fast startup and controls a large amount of space makes Aife a very good neutral support. Unfortunately due to knocking the opponent away, many characters struggle to combo off stray Aife hits.</p>
    </div>,
    <div id = 'aInfo' value ='Uasaha'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time.</p>
        <br></br>
        <p>Uathach summons a wind vortex infront of the player. Will vacuum nearby opponents and restores a considerable amount of HP on hit. This effect is also able to vacuum grounded opponents for full damage.</p>
        <p>Used in EB combos for wind characters. Its ability to vacuum and relaunch grounded opponents can add flexibility for a bit more damage in situations other supports wouldn't be able to.</p>
    </div>,
    <div id = 'aInfo' value ='Kaguya'>
        <h2>Counter Effect</h2>
        <p>Increased untechable time.</p>
        <br></br>
        <p>Kaguya summons two revolving orbs around the player character which can collide with opponents for damage. After a delay, the projectiles will fire across the screen. Low untechable time and will disappear if the player is struck.</p>
        <p>Its low damage and unique nature leaves this solely used as a neutral tool to force the player's advantage. Can be used as an invincible approaching hitbox by combining it with rolls.</p>
    </div>,
    <div id = 'aInfo' value ='Grey'>
        <h2>Counter Effect</h2>
        <p>Significantly increased hitstun.</p>
        <br></br>
        <p>Little Grey tracks the opponent and performs multiple hits which cause a significant amount of hitstun or blockstun. On hit, will scale combos significantly.</p>
        <p>Strong assist on paper but due to its inability to be cancelled into from specials and the significant combo scaling it causes, it sees limited use.</p>
    </div>,
    <div id = 'aInfo' value ='Millionaire Arthur'>
        <h2>Counter Effect</h2>
        <p>N/A</p>
        <br></br>
        <p>Grants super armor to the next attack the player performs. Multi-part attacks (e.g rekkas) will retain the super armor. Super armor is only active during the first attack performed after summoning. Will be wasted if the player is hit before use.</p>
    </div>,
    <div id = 'aInfo' value ='Akira'>
        <h2>Counter Effect</h2>
        <p>Untechable knockdown on the last hit.</p>
        <br></br>
        <p>Akira kicks an arcade cab at the opponent. Significant frame advantage and corner carry. Will launch on final hit. Can be delayed by holding the button used to summon her. Will strike 27F after button release.</p>
        <p>Last hit is not a solid blockstring and can be used to set up unblockable command grab setups.</p>
    </div>,
    <div id = 'aInfo' value ='Guinevere'>
        <h2>Counter Effect</h2>
        <p>Increased Hitstun.</p>
        <br></br>
        <p>Strikes the opponent in an area in front of the player on the ground. On hit, will increase the current mana cost of the opponent's support cards by 1 for the next use. This affects each support individually and can stack up to a maximum of 5.</p>
        <p>While it does not offer high damage potential, Guinevere's unique ability to raise the cost of supports can significantly influence the match. Very effective against characters/players who use low cost or multiple supports in tandem as the effect is only removed upon use for that particular support.</p>
    </div>,
]
//#endregion