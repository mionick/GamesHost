export class constants {

    static CARD_ASPECT_RATIO = 802.0 / 598.0; // FROM THE CARDS IMAGE SIZE
    static NUM_KICKS = 20;
    static NUM_WEAKNESSES = 20;
    static NUM_PUNCHES = 7;
    static NUM_VULNERABILITIES = 3;
    static HAND_SIZE = 5;

    static DECK_LEAN_X_FACTOR = 0.5;
    static DECK_LEAN_Y_FACTOR = 0.3;

    static STARTING_VILLAIN = "Ra's al Ghul";
    static BACK_OF_CARD = "Back.jpg";
    static CARDS_FOLDER = "assets/cards/";


    static DEFAULT_SPACING_FRACTION = 0.1;
    static DEFAULT_SPACE = 10; //PX

    static WIDTH = 600;
    static HEIGHT = 600;

    static CARD_WIDTH = 90;
    static CARD_HEIGHT = 100;

    static CARD_TYPES = {
        SUPER_HERO: "Super Hero",
        HERO: "Hero",
        VILLAIN: "Villain",
        SUPER_VILLAIN: "Super-Villain",
        STARTER: "Starter",
        SUPER_POWER: "Super Power",
        EQUIPMENT: "Equipment",
        WEAKNESS: "Weakness",
        LOCATION: "Location"
    }

    static CARD_NAMES = {
        KICK: "Kick",
        PUNCH: "Punch",
        VULNERABILITY: "Vulnerability"
    }

    public static initialize(): void {
        // SET CONSTANTS
        let table = document.getElementById("table");

        constants.WIDTH = table.offsetWidth;
        constants.HEIGHT = table.offsetHeight;
        // 7 cards, 8 spaces

        constants.CARD_WIDTH = constants.WIDTH * (1 - constants.DEFAULT_SPACING_FRACTION) / 7;
        constants.CARD_HEIGHT = constants.CARD_WIDTH * constants.CARD_ASPECT_RATIO;

        constants.DEFAULT_SPACE = constants.WIDTH * constants.DEFAULT_SPACING_FRACTION / 8; 

        // Those are the desired dimensions, but screen could be too wide. 
        // Need to scale everything down in that case.
        let desiredHeight = 4 * this.CARD_HEIGHT + 5 * this.DEFAULT_SPACE; // want to show hand, work area, ongoing, and lineup.

        if (desiredHeight > this.HEIGHT) {
            // Need to scale down.
            let scaleFactor = this.HEIGHT / desiredHeight;
            this.CARD_WIDTH = this.CARD_WIDTH * scaleFactor;
            this.CARD_HEIGHT = this.CARD_HEIGHT * scaleFactor;
            this.DEFAULT_SPACE = this.DEFAULT_SPACE * scaleFactor;
        }

    }
}