class Menu {
    constructor() {
        this.state = "CLIENTMODE";
        this.currentMenu = new MenuOptions("HUNTER'S MAZE", "use w, s, and enter to navigate the menus", [
            "CREATE PARTY",
            "JOIN PARTY"
        ]);
    }

    eventHandler(data) {

        if (!data) return;

        if (this.state == "CLIENTMODE") {

            if (data == "CREATE PARTY") {

                this.state = "CREATEPARTY";
                this.currentMenu = new MenuOptions("ID: " + myID + ", " + (allConnections.length + 1) + "P", "share this id with those you want in your party", [
                    "READY TO START",
                    "BACK"
                ]);
            } else {
                this.state = "JOINPARTY";
                this.currentMenu = new MenuPrompt("JOIN PARTY", "ask your party leader for the party id", "ENTER PARTY ID");
            }

        } else if (this.state == "CREATEPARTY") {

            if (data == "READY TO START") {
                gameState = "GAME";
                mazeSeed = Date.now();

                game = new Game();

                for (let c in allConnections) {
                    if (allConnections[c] && allConnections[c].open) {
                        allConnections[c].send('id,' + peer.id);
                        for (let c2 in allConnections) {
                            if (allConnections[c2] && allConnections[c2].open && allConnections[c] != allConnections[c2]) {
                                allConnections[c].send('id,' + allConnections[c2].peer);
                            }
                        }
                        allConnections[c].send('start,' + mazeSeed);
                    }
                }

            } else {
                this.state = "CLIENTMODE";
                this.currentMenu = new MenuOptions("HUNTER'S MAZE", "use w, s, and enter to navigate the menus", [
                    "CREATE PARTY",
                    "JOIN PARTY"
                ]);
            }

        } else if (this.state == "JOINPARTY") {
            for (let c in allConnections) {
                if (allConnections[c]) {
                    allConnections[c].close();
                }
            }

            let conn = peer.connect(prefix + data);

            conn.on('open', function () {
                allConnections.push(conn);
                conn.send('trash');
            });

            conn.on('data', function (data) {
                let splitData = data.split(",");
                if (splitData[0] == 'start') {
                    gameState = "GAME";

                    mazeSeed = +splitData[1];
                    game = new Game();
                }

                if (splitData[0] == 'pos') {
                    let pID = splitData[1];
                    let pX = +splitData[2];
                    let pY = +splitData[3];
                    playerPos[pID].position.x = pX;
                    playerPos[pID].position.y = pY;
                }

                if (splitData[0] == 'id') {
                    let otherPlayer = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
                    playerPos[splitData[1]] = otherPlayer;
                }

            });
        }
    }

    handleKey(code, key) {
        this.eventHandler(this.currentMenu.handleKey(code, key));
    }

    draw() {
        this.currentMenu.draw();
    }
}

class MenuPrompt {
    constructor(header, subtitle, placeholder) {
        this.header = header;
        this.subtitle = subtitle;
        this.placeholder = placeholder;
        this.input = "";
        this.maxBackspaceDelay = 15;
        this.backspaceDelay = this.maxBackspaceDelay;
    }

    handleKey(code, key) {
        if (code == 8 && this.input != "") {
            this.input = this.input.substring(0, this.input.length - 1);
            this.backspaceDelay = this.maxBackspaceDelay;
        }

        if (code == 13) return this.input;

        if (validCharacters.includes(key)) this.input += key;
        return 0;
    }

    draw() {
        if (keyIsDown(8)) {
            this.backspaceDelay--;
            if (this.backspaceDelay < 0) {
                this.backspaceDelay = 1;
                this.input = this.input.substring(0, this.input.length - 1);
            }
        }

        background(gameColors.wall);
        noStroke();
        textFont(font);
        fill(255);

        camera.position.x = windowWidth/2;
        camera.position.y = windowHeight/2;

        const bottom = windowHeight;
        const left = 0;
        const right = windowWidth;
        const pad = 20;

        textAlign(LEFT, BOTTOM);
        textSize(64);
        text(this.header, left + pad, bottom - pad - 32);
        textSize(32);
        text(this.subtitle, left + pad, bottom - pad);

        textAlign(RIGHT, BOTTOM);
        textSize(64);
        if (this.input == "") {
            fill(140);
            text(this.placeholder, right - pad, bottom - pad);
        } else {
            text(this.input, right - pad, bottom - pad);
        }
    }
}

class MenuOptions {
    constructor(header, subtitle, options, enterHandler) {
        this.header = header;
        this.subtitle = subtitle;
        this.options = options;
        this.currentOption = 0;
        this.enterHandler = enterHandler;
    }

    handleKey(code, key) {
        switch (code) {
            case 87: //W
                this.currentOption++;
                this.currentOption %= this.options.length;
                return 0;
            case 83: //S
                this.currentOption--;
                if (this.currentOption < 0) this.currentOption = this.options.length - 1;
                return 0;
            case 13: //ENTER
                return this.options[this.currentOption];
        }
    }

    draw() {
        background(gameColors.wall);
        noStroke();
        textFont(font);
        fill(255);

        camera.position.x = windowWidth/2;
        camera.position.y = windowHeight/2;

        const bottom = windowHeight;
        const left = 0;
        const right = windowWidth;
        const pad = 20;

        textAlign(LEFT, BOTTOM);
        textSize(64);
        text(this.header, left + pad, bottom - pad - 32);
        textSize(32);
        text(this.subtitle, left + pad, bottom - pad);

        textAlign(RIGHT, BOTTOM);
        textSize(64);
        for (let i = 0; i < this.options.length; i++) {
            text((i == this.currentOption ? "> " : "") + this.options[i], right - pad, bottom - pad - 64 * i);
        }
    }
}
