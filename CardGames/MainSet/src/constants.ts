export class constants {

    static CARD_ASPECT_RATIO = 802.0 / 598.0; // FROM THE CARDS IMAGE SIZE
    static NUM_KICKS = 20;
    static NUM_WEAKNESSES = 20;
    static NUM_PUNCHES = 7;
    static NUM_VULNERABILITIES = 3;
    static HAND_SIZE = 5;

    static DECK_LEAN_X_FACTOR = 0.2;
    static DECK_LEAN_Y_FACTOR = 0.1;

    static STARTING_VILLAIN = "Ra's al Ghul";
    //"Slade Wilson";
    static BACK_OF_CARD = "back.jpeg";
    static CARDS_FOLDER = "assets/cards/";
    static SHUFFLE_ICON = "assets/shuffle.png";
    static DRAW_ICON = "assets/draw5.png";


    static DEFAULT_SPACING_FRACTION = 0.1;
    static DEFAULT_SPACE = 10; //PX

    static BODY_WIDTH = 600;
    static BODY_HEIGHT = 600;

    static TABLE_WIDTH = 600;
    static TABLE_HEIGHT = 600;

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
        let body = document.getElementById("body");

        constants.BODY_WIDTH = body.offsetWidth;
        constants.BODY_HEIGHT = body.offsetHeight;
        // 7 cards, 8 spaces

        constants.CARD_WIDTH = constants.BODY_WIDTH * (1 - constants.DEFAULT_SPACING_FRACTION) / 7;
        constants.CARD_HEIGHT = constants.CARD_WIDTH * constants.CARD_ASPECT_RATIO;

        constants.DEFAULT_SPACE = constants.BODY_WIDTH * constants.DEFAULT_SPACING_FRACTION / 8; 

        // Those are the desired dimensions, but screen could be too wide. 
        // Need to scale everything down in that case.
        this.TABLE_HEIGHT = 4 * this.CARD_HEIGHT + 5 * this.DEFAULT_SPACE; // want to show hand, work area, ongoing, and lineup.

        if (this.TABLE_HEIGHT > this.BODY_HEIGHT) {
            // Need to scale down.
            let scaleFactor = this.BODY_HEIGHT / this.TABLE_HEIGHT;
            this.CARD_WIDTH = this.CARD_WIDTH * scaleFactor;
            this.CARD_HEIGHT = this.CARD_HEIGHT * scaleFactor;
            this.DEFAULT_SPACE = this.DEFAULT_SPACE * scaleFactor;
            this.TABLE_HEIGHT = this.BODY_HEIGHT;
        }

        this.TABLE_WIDTH = this.CARD_WIDTH * 7 + this.DEFAULT_SPACE * 8;

        let table = document.createElement("div");
        table.id = "table";
        // Then with the adjusted card size, reset the width of table.
        let uiwrapper = document.getElementById("ui-wrapper");
        let uiwrapper2 = document.getElementById("ui-wrapper2");
        uiwrapper.style.width =  this.TABLE_WIDTH + "px";
        uiwrapper2.style.width =  this.TABLE_WIDTH + "px";
        table.style.width = this.TABLE_WIDTH + "px";
        table.style.height = this.TABLE_HEIGHT + "px";

        uiwrapper.appendChild(table)
    }
}