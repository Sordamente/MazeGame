class Game {
    constructor() {
        this.newMaze();
    }

    newMaze() {
        genMaze(mazeStartWidth, mazeStartHeight, holeProbability, powerUpNum, mazeSeed);
    }

    update() {
        camera.position.x = (friction * camera.position.x + player.position.x) / (friction + 1);
        camera.position.y = (friction * camera.position.y + player.position.y) / (friction + 1);

        updateVelocities();

        for (let spr of allPlayers) {
            if (!(spr == player && isDead)) spr.collide(walls);
            spr.collide(border);
        }

        if (!isDead) {
            player.overlap(monster, die);
            player.collide(exit, this.newMaze);
            minimap.update(floor(player.position.x / scale), floor(player.position.y / scale));
            sendPositionData();
        } else {
            minimap.updateLoc(floor(player.position.x / scale), floor(player.position.y / scale));
        }
    }

    draw() {
        this.update();

        background(0);

        drawMaze(floor(player.position.x / scale), floor(player.position.y / scale));

        drawSprites(powerups);

        drawSprite(exit);
        drawSprite(start);

        drawSprites(allPlayers);

        textAlign(CENTER, BOTTOM);
        fill(gameColors.player)
        textFont(font);
        textSize(32);
        for (let k of Object.keys(playerPos)) {
            if (!playerPos[k].visible) continue;
            text(idToName[k], playerPos[k].position.x, playerPos[k].position.y - playerPos[k].width / 2 - 10);
        }

        camera.off();
        minimap.draw();
    }
}
