import { constants } from "./constants";

export class DrawFiveTrigger {

    public element: HTMLImageElement = null;

    constructor(
        public x: number,
        public y: number,
        public size: number,
        table: HTMLElement 
    ) {
        this.element = document.createElement("img");
        this.element.id = "draw5-btn";
        this.element.src = constants.DRAW_ICON;
        this.element.style.width = size + "px";
        this.element.style.height = size + "px";
        this.element.style.transform =  "translate(" + (this.x) + "px," + (this.y) + "px)"

        table.appendChild(this.element);
    }

    public setVisible(vis: boolean) {
        this.element.style.visibility =  vis ? "visible" : "hidden";
    }
}