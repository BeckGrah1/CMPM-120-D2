/**
 * A tiny framework dedicated to tiny adventure games.
 *
 * `AdventureScene` is a Phaser scene that provides:
 *   - an inventory of named string items carried between scenes,
 *   - a transient message box for flavor text,
 *   - faded transitions between scenes,
 *   - a consistent UI layout with fullscreen support.
 *
 * Subclass it and implement {@link AdventureScene#onEnter} to build one
 * location of your adventure. Call the helper methods ({@link AdventureScene#showMessage},
 * {@link AdventureScene#gainItem}, {@link AdventureScene#gotoScene}, etc.) from
 * your interactive objects.
 *
 * @extends {Phaser.Scene}
 */
class AdventureScene extends Phaser.Scene {

    /**
     * Phaser lifecycle: receives data passed by `scene.start(key, data)`.
     * We use this to thread the inventory through scene transitions.
     *
     * @param {{inventory?: string[]}} data
     */
    init(data) {
        this.inventory = data.inventory || [];
    }

    /**
     * @param {string} key  A unique Phaser scene key (e.g. `"tunnel"`).
     * @param {string} name A human-readable name shown in the UI (e.g. `"The Tunnel"`).
     */
    constructor(key, name, sceneJSON) {
        super(key);
        this.sceneKey = key;
        this.name = name;
        this.sceneJSON = sceneJSON;
        this.currentSceneData = null;
        this.sceneObjects = [];
    }

    preload() {
        if (this.sceneJSON) {
            this.load.json(this.sceneKey, this.sceneJSON);
        }
        else {
            console.log("No sceneJSON provided, ruh roh");
        }
    }

    /**
     * Phaser lifecycle: called once when the scene starts.
     * Lays out the UI, then invokes {@link AdventureScene#onEnter}.
     * Subclasses should override `onEnter`, not `create`.
     */
    create() {
        /** @type {number} Duration in ms of scene fade-in / fade-out. */
        this.transitionDuration = 1000;

        /** @type {number} Game width in scaled pixels (nominally 1920). */
        this.w = this.game.config.width;
        /** @type {number} Game height in scaled pixels (nominally 1080). */
        this.h = this.game.config.height;
        /** @type {number} UI spacing unit in scaled pixels (1% of width). Use multiples of `this.s` for text sizes, margins, etc. */
        this.s = this.game.config.width * 0.01;

        this.cameras.main.setBackgroundColor('#444');
        this.cameras.main.fadeIn(this.transitionDuration, 0, 0, 0);

        this.setupUI();
        
        if (this.sceneJSON) {
            this.preloadSceneAssets();
        }

        this.onEnter();

    }

    preloadSceneAssets() {
        const jsonData = this.cache.json.get(this.sceneKey);
        this.currentSceneData = new SceneData(jsonData);
        let imagesToLoad = 0;
        // load all image assests. If you want to load other things later on, you gotta add other types to this
        this.currentSceneData.objects?.forEach(objectData => {
            if (objectData.Type === "image") {
                imagesToLoad++;
                try {
                    this.load.image(objectData.Name, objectData.filePath);
                }
                catch(error) {
                    console.log('Invalid filepath: ${objectData.filePath}')
                }
            };
        })

        // just in case a scene has no images to load
        if (imagesToLoad > 0) {
            // need to make sure assets are done loading before creating objects
            this.load.once('complete', () => {
                this.createObjectsFromData();
            })
            this.load.start();
        }
        else {
            this.createObjectsFromData();
        }
    }

    // should probably just combine this with createObjectFromData, but laziness prevails
    createObjectsFromData() {
        this.currentSceneData.objects?.forEach(objectData => {
            this.createObjectFromData(objectData);
        });
    }

    createObjectFromData(objectData) {
        let gameObject = null;
        if (objectData.Type == "image") {
            gameObject = this.createImageObject(objectData);
        }
        else {
            console.log('Only image objects are supported currently, either implement new object types, or change the object to an image:  ${objectData.Type}');
        }

        if (gameObject) {
            objectData.Actions?.forEach(actionData => {
                const action = new ActionData(actionData);
                this.setupObjectAction(gameObject, action);
            })
        }

    }

    createImageObject(objectData) {
        const obj  = this.add.image(
            objectData.Position[0],
            objectData.Position[1],
            objectData.Name
        ).setScale(objectData.Scale);

        return obj;
    }

    setupObjectAction(gameObject, action) {
        switch(action.actionType) {
            case "showHoverText":
                if (!gameObject.input) {
                    gameObject.setInteractive();
                }
                gameObject.on('pointerover', () => {
                    this.showMessage(action.actionAssociatedText);
                })
            break;

            case "changeScene":
                gameObject.setInteractive( { useHandCursor: true } );
                gameObject.on('pointerdown', () => {
                    this.gotoScene(action.actionTargetScene);
                })
            break;

            case "giveItemDeleteObject":
                gameObject.setInteractive( { useHandCursor: true } );
                gameObject.on('pointerdown', () => {
                    this.gainItem(action.actionItemName);

                    // visual feedback tween, destroys the item on complete
                    this.tweens.add({
                        targets: gameObject,
                        alpha: 0,
                        scale: 0,
                        duration: 300,
                        onComplete: () => {
                            gameObject.destroy();
                        }
                    })
                })
            break;
        }
    }

    // moved old code down here so Create() doesn't look so messy
    setupUI() {
        this.add.rectangle(this.w * 0.75, 0, this.w * 0.25, this.h).setOrigin(0, 0).setFillStyle(0);
        this.add.text(this.w * 0.75 + this.s, this.s)
            .setText(this.name)
            .setStyle({ fontSize: `${3 * this.s}px` })
            .setWordWrapWidth(this.w * 0.25 - 2 * this.s);

        this.messageBox = this.add.text(this.w * 0.75 + this.s, this.h * 0.33)
            .setStyle({ fontSize: `${2 * this.s}px`, color: '#eea' })
            .setWordWrapWidth(this.w * 0.25 - 2 * this.s);

        this.inventoryBanner = this.add.text(this.w * 0.75 + this.s, this.h * 0.66)
            .setStyle({ fontSize: `${2 * this.s}px` })
            .setText("Inventory")
            .setAlpha(0);

        this.inventoryTexts = [];
        this.updateInventory();

        this.add.text(this.w-3*this.s, this.h-3*this.s, "📺")
            .setStyle({ fontSize: `${2 * this.s}px` })
            .setInteractive({useHandCursor: true})
            .on('pointerover', () => this.showMessage('Fullscreen?'))
            .on('pointerdown', () => {
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                } else {
                    this.scale.startFullscreen();
                }
            });
    }

    /**
     * Briefly flash a message in the UI message box. The message fades out
     * over a few seconds.
     *
     * @param {string} message The text to show.
     */
    showMessage(message) {
        this.messageBox.setText(message);
        this.tweens.add({
            targets: this.messageBox,
            alpha: { from: 1, to: 0 },
            easing: 'Quintic.in',
            duration: 4 * this.transitionDuration
        });
    }

    /**
     * Re-render the inventory panel. Called automatically by
     * {@link AdventureScene#gainItem} and {@link AdventureScene#loseItem};
     * you generally do not need to call this yourself.
     */
    updateInventory() {
        if (this.inventory.length > 0) {
            this.tweens.add({
                targets: this.inventoryBanner,
                alpha: 1,
                duration: this.transitionDuration
            });
        } else {
            this.tweens.add({
                targets: this.inventoryBanner,
                alpha: 0,
                duration: this.transitionDuration
            });
        }
        if (this.inventoryTexts) {
            this.inventoryTexts.forEach((t) => t.destroy());
        }
        this.inventoryTexts = [];
        let h = this.h * 0.66 + 3 * this.s;
        this.inventory.forEach((e, i) => {
            let text = this.add.text(this.w * 0.75 + 2 * this.s, h, e)
                .setStyle({ fontSize: `${1.5 * this.s}px` })
                .setWordWrapWidth(this.w * 0.75 + 4 * this.s);
            h += text.height + this.s;
            this.inventoryTexts.push(text);
        });
    }

    /**
     * Test whether the player is currently carrying an item.
     *
     * @param {string} item Item name.
     * @returns {boolean}
     */
    hasItem(item) {
        return this.inventory.includes(item);
    }

    /**
     * Add an item to the player's inventory (no-op with a console warning
     * if the item is already held). The inventory panel animates the new entry in.
     *
     * @param {string} item Item name. Short and consistent works best (e.g. `"key"`, not `"a shiny key"`).
     */
    gainItem(item) {
        if (this.inventory.includes(item)) {
            console.warn('gaining item already held:', item);
            return;
        }
        this.inventory.push(item);
        this.updateInventory();
        for (let text of this.inventoryTexts) {
            if (text.text == item) {
                this.tweens.add({
                    targets: text,
                    x: { from: text.x - 20, to: text.x },
                    alpha: { from: 0, to: 1 },
                    ease: 'Cubic.out',
                    duration: this.transitionDuration
                });
            }
        }
    }

    /**
     * Remove an item from the player's inventory (no-op with a console warning
     * if the item is not held). The inventory panel animates the entry out.
     *
     * @param {string} item Item name. Must match the name passed to {@link AdventureScene#gainItem}.
     */
    loseItem(item) {
        if (!this.inventory.includes(item)) {
            console.warn('losing item not held:', item);
            return;
        }
        for (let text of this.inventoryTexts) {
            if (text.text == item) {
                this.tweens.add({
                    targets: text,
                    x: { from: text.x, to: text.x + 20 },
                    alpha: { from: 1, to: 0 },
                    ease: 'Cubic.in',
                    duration: this.transitionDuration
                });
            }
        }
        this.time.delayedCall(500, () => {
            this.inventory = this.inventory.filter((e) => e != item);
            this.updateInventory();
        });
    }

    /**
     * Fade out the camera and transition to another scene by key, carrying
     * the current inventory with us.
     *
     * @param {string} key The Phaser scene key of the destination scene.
     */
    gotoScene(key) {
        this.cameras.main.fade(this.transitionDuration, 0, 0, 0);
        this.time.delayedCall(this.transitionDuration, () => {
            this.scene.start(key, { inventory: this.inventory });
        });
    }

    /**
     * Subclass hook: called at the end of {@link AdventureScene#create}, after
     * the message box and inventory panel exist. Override this in your scene
     * to add your location's interactive objects.
     *
     * @example
     * onEnter() {
     *     this.add.text(100, 100, "a rock")
     *         .setInteractive()
     *         .on('pointerover', () => this.showMessage("It's a rock."))
     *         .on('pointerdown', () => this.gotoScene('next_room'));
     * }
     */
    onEnter() {
        
    }
}


class SceneData {
    constructor(data = {}) {
        try {
            // set sceneKey to the first key name in scenes.json
            this.sceneKey = Object.keys(data)[0];

            const sceneContent = data[this.sceneKey];
            this.objects = sceneContent.Objects;
        }
        catch(error) {
            console.log("Error creating scene data, bro did not correctly format his json", error);
        }
    }
}

class ObjectData {
    constructor(data = {}) {
        try {
            this.objectName = data.Name;
            this.objectType = data.Type;
            this.assetFilePath = data.filePath;
            this.objectPosition = data.Position;
            this.objectScale = data.Scale;
            this.objectActions = data.Actions;
        }
        catch(error) {
            console.log("Error creating object data, bro did not correctly format his json", error);
        }
    }
}

class ActionData {
    constructor(data = {}) {
        try {
            this.actionType = data.Type;
            if (this.actionType === "changeScene") {
                this.actionTargetScene = data.targetScene;
            }
            if (this.actionType === "giveItemDeleteObject") {
                this.actionItemName = data.itemName;
            }
            this.actionAssociatedText = data.associatedText;
        }
        catch(error) {
            console.log("Error creating action data, bro did not correctly format his json", error);
        }
    }
}