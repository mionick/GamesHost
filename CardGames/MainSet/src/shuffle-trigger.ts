import { constants } from "./constants";

export class ShuffleTrigger {

    public element: HTMLImageElement = null;

    constructor(
        public x: number,
        public y: number,
        public size: number,
        table: HTMLElement 
    ) {
        this.element = document.createElement("img");
        this.element.id = "shuffle-button";
        this.element.src = constants.SHUFFLE_ICON;
        this.element.style.width = size + "px";
        this.element.style.height = size + "px";
        this.element.style.transform =  "translate(" + (this.x) + "px," + (this.y) + "px)"

        table.appendChild(this.element);
    }

    public setVisible(vis: boolean) {
        this.element.style.display =  vis ? "block" : "none";
    }
}