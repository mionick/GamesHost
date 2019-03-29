import { Card } from "./card";

export abstract class CardContainer {

    public name = "";
    public cards : Card[] = [];

    // In pixels
    protected x : number = 0;
    protected y : number = 0;
    protected w : number = 0;
    protected h : number = 0;

    protected visible = true;
    public element: HTMLElement;

    constructor(name: string) {
        this.name =  name;
    }
    
    public setXY(x: number, y : number) : void {
        this.x = x;
        this.y = y;
        this.element.style.transform = "translate(" + ( x ) + "px," + ( y ) + "px)";
        this.adjustCards();
    }

    public setVisible(vis : boolean) : void {
        this.visible = vis;
        if (vis) {
            this.element.style.display = "block";
        } else {
            this.element.style.display = "none";
        }
        this.adjustCards();
    }

    public contains(x: number, y : number) : boolean {
        return (this.x < x && 
        this.x + this.w > x &&
        this.y < y &&
        this.y + this.h > y);
    }

    public take(id: number) : Card {
        let index = this.cards.findIndex( x => x.id === id);
        let result =index < 0 ? null : this.cards.splice( index , 1 )[0];
        this.adjustCards();
        if(result) {
            result.field = null;
        }
        return result;
    }

    public isVisible(): boolean {
        return this.visible;
    }
    
    abstract adjustCards() : void;    
    abstract addCard(card : Card): void;
    abstract getTouchedCard(x: number, y: number): Card;

}