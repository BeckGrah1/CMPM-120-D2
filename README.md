A simple adventure game by {who?} based on a simple adventure game engine by [Adam Smith](https://github.com/rndmcnlly).

Code requirements:
- **4+ scenes based on `AdventureScene`**:
    - Kitchen1Scene
    - Kitchen2Scene
    - FridgeScene
    - BedroomScnene
- **2+ scenes *not* based on `AdventureScene`**:
    - StartScene
    - WinScene
- **2+ methods or other enhancement added to the adventure game engine to simplify my scenes**:
    - SetupObjectAction(gameObejct, action)
        - Takes an object an an action (taken from scene json files) and sets up all the
        things it needs to run
    - checkStatusItemsAndFlags(gameObject, action)
        - Checks object status, flags, and player items, called by SetupObjectAction to 
        ensure the action only happens when the requirements are met

Experience requirements:
- **4+ locations in the game world**:
    - Kitchen1Scene
    - Kitchen2Scene
    - FridgeScene
    - BedroomScnene
- **2+ interactive objects in most scenes**:
    - plenty of objects in every scene
- **Many objects have `pointerover` messages**: unsatisfied (describe two examples)
    - basically every object has pointer over stuff
- **Many objects have `pointerdown` effects**: unsatisfied (describe two examples)
    - All cooking related objects have pointerdown stuff for pickup, opening cabinets, etc
- **Some objects are themselves animated**: unsatisfied (describe two examples)
    - Objects can swap states to reflect player changes, ie the beef cooking, or a plate being taken

Asset sources:
- For each image/audio/video asset used, describe how it was created. What tool did you use to create it? Was it based on another work? If so, how did you change it, and where can we learn more about the original work for comparison?
    - All image assets (sprites, cursors, etc) made by me without reference
        - made in Pixelorma: https://pixelorama.org
    - Audio:
        * background music by davo32: https://freesound.org/people/davo32/sounds/628445/
        * win sound effect made by EVRetro: https://freesound.org/people/EVRetro/sounds/535840/
Code sources:
- `adventure.js` and `index.html` were created for this project [Adam Smith](https://github.com/rndmcnlly) and edited by me.
- `game.js` was sketched by [Adam Smith](https://github.com/rndmcnlly) and rewritten by me.