export class constants {

    static DECK_LIST = "DC_Deck-Building_Game_-_Full_Set_List_v2.0.csv";
    static CARD_ASPECT_RATIO = 802.0 / 598.0; // FROM THE FILE SIZE

    static DEFAULT_SPACING_FRACTION = 0.1;
    static DEFAULT_SPACE = 10; //PX

    static WIDTH = 600;
    static HEIGHT = 600;

    static CARD_WIDTH = 90;
    static CARD_HEIGHT = 100;

    public static initialize(): void {
        // SET CONSTANTS
        let table = document.getElementById("table");

        constants.WIDTH = table.offsetWidth;
        constants.HEIGHT = table.offsetHeight;
        // 7 cards, 8 spaces

        constants.CARD_WIDTH = constants.WIDTH * (1 - constants.DEFAULT_SPACING_FRACTION) / 7;
        constants.CARD_HEIGHT = constants.CARD_WIDTH * constants.CARD_ASPECT_RATIO;

        constants.DEFAULT_SPACE = constants.WIDTH * constants.DEFAULT_SPACING_FRACTION / 8; 

    }
}