function preload() {
    font = loadFont('assets/mozart.ttf');
}

function setup() {
    peer = new Peer(prefix + myID);

    createCanvas(windowWidth, windowHeight, WEBGL);
    frameRate(desiredFPS);

    menu = new Menu();

    peer.on('connection', function (conn) {
        conn.on('data', function (data) {
            console.log(data);
        });

        all_connections.push(conn);
        console.log("PARTY CREATE SIDE Connected to " + conn.peer)

        // HACK TO GET THE PLAYER COUNT TO UPDATE PROPERLY
        menu.state = "CLIENTMODE";
        menu.eventHandler("CREATE PARTY");
    });
}

function windowResized() {
    console.log("PLEASE!");
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {

    switch (gameState) {
        case "MENU":
            menu.draw();
            break;
        case "GAME":
            game.draw();
            break;
    }
}

function keyPressed() {
    switch (gameState) {
        case "MENU":
            menu.handleKey(keyCode, key);
    }

    return false;
}
