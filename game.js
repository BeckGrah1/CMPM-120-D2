class Kitchen1Scene extends AdventureScene {
    constructor() {
        super("Kitchen1", "Kitchen West", "json/kitchen1.json");
    }
}

class FridgeScene extends AdventureScene {
    constructor() {
        super("Fridge", "The Fridge", "json/fridge.json");
    }
}

class Kitchen2Scene extends AdventureScene {
    constructor() {
        super("Kitchen2", "Kitchen East", "json/kitchen2.json");
    }
}

class BedroomScene extends AdventureScene {
    constructor() {
        super("Bedroom", "My room", "json/bedroom.json");
    }
}

class PantryScene extends AdventureScene {
    constructor() {
        super("Pantry", "Pantry", "json/pantry.json");
    }
}

class WinScene extends Phaser.Scene {
    constructor() {
        super("WinScene")
    }

    preload() {
        this.load.image("button", "assets/button.png")
    }

    create() {
        this.game.canvas.style.cursor = 'auto';
        const button = this.add.image(1000, 540, "button").setInteractive().setDisplaySize(600, 200);
        button.on('pointerdown', () => {
            window.location.reload();
        })
        this.add.text(600, 300, "Thanks for playing!").setStyle({ fontSize: `70px`, color: '#eea' })
        this.add.text(780, 500, "Play again?").setStyle({ fontSize: `70px`, color: '#eea' })
    }
}

class StartScene extends Phaser.Scene {
    constructor() {
        super("StartScene")
    }

    preload() {
        this.load.image("button", "assets/button.png")
    }

    create() {
        const button = this.add.image(960, 540, "button").setInteractive().setScale(10);
        button.on('pointerdown', () => {
            this.scene.start('Kitchen1');
        })
        this.add.text(600, 300, "Goal: Make dinner").setStyle({ fontSize: `70px`, color: '#eea' })
        this.add.text(880, 520, "Start?").setStyle({ fontSize: `50px`, color: '#eea' })
    }
}

class Demo1 extends AdventureScene {
    constructor() {
        super("demo1", "First Room");
    }

    onEnter() {

        let clip = this.add.text(this.w * 0.3, this.w * 0.3, "📎 paperclip")
            .setFontSize(this.s * 2)
            .setInteractive()
            .on('pointerover', () => this.showMessage("Metal, bent."))
            .on('pointerdown', () => {
                this.showMessage("No touching!");
                this.tweens.add({
                    targets: clip,
                    x: '+=' + this.s,
                    repeat: 2,
                    yoyo: true,
                    ease: 'Sine.inOut',
                    duration: 100
                });
            });

        let key = this.add.text(this.w * 0.5, this.w * 0.1, "🔑 key")
            .setFontSize(this.s * 2)
            .setInteractive()
            .on('pointerover', () => {
                this.showMessage("It's a nice key.")
            })
            .on('pointerdown', () => {
                this.showMessage("You pick up the key.");
                this.gainItem('key');
                this.tweens.add({
                    targets: key,
                    y: `-=${2 * this.s}`,
                    alpha: { from: 1, to: 0 },
                    duration: 500,
                    onComplete: () => key.destroy()
                });
            })

        let door = this.add.text(this.w * 0.1, this.w * 0.15, "🚪 locked door")
            .setFontSize(this.s * 2)
            .setInteractive()
            .on('pointerover', () => {
                if (this.hasItem("key")) {
                    this.showMessage("You've got the key for this door.");
                } else {
                    this.showMessage("It's locked. Can you find a key?");
                }
            })
            .on('pointerdown', () => {
                if (this.hasItem("key")) {
                    this.loseItem("key");
                    this.showMessage("*squeak*");
                    door.setText("🚪 unlocked door");
                    this.gotoScene('demo2');
                }
            })
    }
}

class Demo2 extends AdventureScene {
    constructor() {
        super("demo2", "The second room has a long name (it truly does).");
    }
    onEnter() {
        this.add.text(this.w * 0.3, this.w * 0.4, "just go back")
            .setFontSize(this.s * 2)
            .setInteractive()
            .on('pointerover', () => {
                this.showMessage("You've got no other choice, really.");
            })
            .on('pointerdown', () => {
                this.gotoScene('demo1');
            });

        let finish = this.add.text(this.w * 0.6, this.w * 0.2, '(finish the game)')
            .setInteractive()
            .on('pointerover', () => {
                this.showMessage('*giggles*');
                this.tweens.add({
                    targets: finish,
                    x: this.s + (this.h - 2 * this.s) * Math.random(),
                    y: this.s + (this.h - 2 * this.s) * Math.random(),
                    ease: 'Sine.inOut',
                    duration: 500
                });
            })
            .on('pointerdown', () => this.gotoScene('outro'));
    }
}

class Intro extends Phaser.Scene {
    constructor() {
        super('intro')
    }
    create() {
        this.add.text(50,50, "Adventure awaits!").setFontSize(50);
        this.add.text(50,100, "Click anywhere to begin.").setFontSize(20);
        this.input.on('pointerdown', () => {
            this.cameras.main.fade(1000, 0,0,0);
            this.time.delayedCall(1000, () => this.scene.start('demo1'));
        });
    }
}

class Outro extends Phaser.Scene {
    constructor() {
        super('outro');
    }
    create() {
        this.add.text(50, 50, "That's all!").setFontSize(50);
        this.add.text(50, 100, "Click anywhere to restart.").setFontSize(20);
        this.input.on('pointerdown', () => this.scene.start('intro'));
    }
}


const game = new Phaser.Game({
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
    scene: [StartScene, WinScene, Kitchen1Scene, Kitchen2Scene, BedroomScene, FridgeScene],
    render: {
        pixelArt: true,
        antialias: false
    },
    title: "Adventure Game",
});

