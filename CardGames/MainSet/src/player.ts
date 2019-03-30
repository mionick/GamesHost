import { Deck } from "./deck";
import { Field } from "./field";
import { constants } from "./constants";
import { Card } from "./card";
import { CardContainer } from "./card-container";

export class Player {

    public id: number = null;
    public name: string = "";

    public superHeros: Deck;
    public discard: Deck;
    public deck: Deck;
    public hand: Field;
    public workArea: Field;
    public ongoing: Field;

    private fields: CardContainer[] = [];

    constructor(
        table: HTMLElement,
        fieldIndex: CardContainer[],
        name: string,
        id: number
    ) {

        this.name = name;
        this.id = id;

        this.superHeros = new Deck(true, table, fieldIndex, this.name + "'s Super Heros");
        this.discard = new Deck(true, table, fieldIndex, this.name + "'s Discard");
        this.deck = new Deck(false, table, fieldIndex, this.name + "'s Deck");
        this.hand = new Field(true, table, fieldIndex, this.name + "'s Hand");
        this.workArea = new Field(true, table, fieldIndex, this.name + "'s Work Area");
        this.ongoing = new Field(true, table, fieldIndex, this.name + "'s Ongoing Field");

        this.fields.push(this.superHeros);
        this.fields.push(this.discard);
        this.fields.push(this.deck);
        this.fields.push(this.hand);
        this.fields.push(this.workArea);
        this.fields.push(this.ongoing);
    }

    public drawHand(): void {
        for (let i = 0; i < constants.HAND_SIZE; i++) {
            this.hand.addCard(this.deck.draw());
        }
    }

    public setVisible(vis: boolean) {
        this.superHeros.setVisible(vis);
        this.discard.setVisible(vis);
        this.deck.setVisible(vis);
        this.hand.setVisible(vis);
        this.workArea.setVisible(vis);
        this.ongoing.setVisible(vis);
    }

    public getVP() : string {
        let sum = 0;
        let stars = "";

        this.fields.forEach( field => {
            field.cards.forEach(element => {
                if (element.cardInfo.VP) {
                    let vp = parseInt(element.cardInfo.VP)
                    if (!isNaN(vp)) {
                        sum += vp;
                    } else {
                        stars += element.cardInfo.VP;
                    }
                }
            });
        })

        return sum + stars;
    }
}