'use strict';

const game = new Phaser.Game(800, 800, Phaser.AUTO);

let cursors,
    floor,
    claudius,
    score = 0,
    scoreText,
    startText,
    startVelocity = 150,
    stalactites = [],
    actionMusic,
    endMusic;

class Action {
    preload () {
        game.load.image('background', 'assets/castle.jpg');
        game.load.image('stalactite', 'assets/stalactite.png');
        game.load.image('floor', 'assets/floor.png');
        game.load.image('cake', 'assets/cake.png');
        game.load.spritesheet('claudius', 'assets/claudius.png', 32, 64);

        game.load.audio('taurus', 'assets/action_music.mp3');
        game.load.audio('cheer', 'assets/end_music.mp3');

        game.scale.pageAlignHorizontally = true;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.disableVisibilityChange = false;
    }

    create () {
        actionMusic = game.add.audio('taurus');
        endMusic = game.add.audio('cheer');
        actionMusic.play();

        game.physics.startSystem(Phaser.Physics.ARCADE);

        const back = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
        back.anchor.set(0.5, 0.5);
        back.scale.setTo(800 / 1920, 800 / 1200);


        floor = game.add.sprite(0, 750, 'floor');
        game.physics.arcade.enable(floor);
        floor.body.immovable = true;

        claudius = game.add.sprite(game.world.centerX, 754, 'claudius');
        game.physics.arcade.enable(claudius);
        claudius.anchor.set(0, 1);
        claudius.body.setSize(20, 56, 6, 4);
        claudius.body.collideWorldBounds = true;
        claudius.body.gravity.y = 300;
        claudius.velocity = startVelocity;
        claudius.bodyWidth = 20;
        claudius.scaleValue = 1;

        claudius.animations.add('left', [14, 15, 16, 17], 10, true);
        claudius.animations.add('right', [20, 21, 22, 23], 10, true);

        game.time.events.loop(1150, () => {
            let s = new Stalactite();
            stalactites.push(s);
        });

        scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });

        startText = game.add.text(220, 300, 'Start!', { font: '250px Microsoft Uighur', fill: '#eee' });

        game.time.events.add(800, () => {
            startText.text = '';
        });

        cursors = game.input.keyboard.createCursorKeys();
    }

    update () {
        game.physics.arcade.collide(claudius, floor);

        claudius.body.velocity.x = 0;
        if (cursors.left.isDown) {
            claudius.body.velocity.x = - claudius.velocity;
            claudius.animations.play('left');
        }
        else if (cursors.right.isDown) {
            claudius.body.velocity.x =  claudius.velocity;
            claudius.animations.play('right');
        }
        else {
            claudius.animations.stop();
            claudius.frame = 0;
        }

        let idx = 0;
        while (idx < stalactites.length) {
            if (stalactites[idx].sprite.y >= 750) {
                score++;
                scoreText.text = 'score: ' + score;
                stalactites.shift();
                claudius.scaleValue += 0.48;
                claudius.scale.setTo(claudius.scaleValue, claudius.scaleValue);
                claudius.velocity = startVelocity * claudius.scaleValue;
                continue;
            }
            let fail = game.physics.arcade.collide(claudius, stalactites[idx++].sprite);
            if (fail && claudius.scaleValue * 56 <= 670) {
                actionMusic.stop();
                game.state.restart(true, false);
                stalactites = [];
                score = 0;
            }
            if (claudius.scaleValue * 56 > 670) {
                setTimeout(() => {
                    endMusic.play();
                    game.paused = false;
                    game.state.start('end');
                }, 1000);
                actionMusic.stop();
                game.time.events.removeAll();
                game.paused = true;
            }
        }
    }

    render () {
        //game.debug.body(claudius);
    }
}

class Stalactite {
    constructor () {
        this.sprite = game.add.sprite(0, 0, 'stalactite');
        let leftBound = claudius.body.x,
            rightBound = claudius.bodyWidth * claudius.scaleValue + leftBound - 20;

        this.sprite.x = leftBound + (rightBound - leftBound) / 2;

        game.physics.arcade.enable(this.sprite);
        this.sprite.body.gravity.y = 1300;
    }
}

class GameEnd {
    create () {
        const back = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
        back.anchor.set(0.5, 0.5);
        back.scale.setTo(800 / 1920, 800 / 1200);

        const cake = game.add.sprite(game.world.centerX, game.world.centerY, 'cake');
        cake.anchor.set(0.5, 0.5);
        cake.scale.setTo(0.5, 0.5);

        let c = game.add.text(180, 150, 'Congratulations!', { font: '100px Microsoft Uighur', fill: '#c51b7d' });
        c.stroke = "#de77ae";
        c.strokeThickness = 16;
        let a = game.add.text(240, 250, 'Your age is:', { font: '100px Microsoft Uighur', fill: '#c51b7d' });
        a.stroke = "#de77ae";
        a.strokeThickness = 16;
        let n = game.add.text(360, 350, `${score}`, { font: '200px Microsoft Uighur', fill: '#c51b7d' });
        n.stroke = "#de77ae";
        n.strokeThickness = 16;
    }
}

game.state.add('action', Action);
game.state.add('end', GameEnd);
game.state.start('action');
