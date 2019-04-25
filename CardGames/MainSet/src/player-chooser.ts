import { Deck } from "./deck";

export class PlayerChooser {

    public element : HTMLElement;

    constructor(machineId: number, name: string, heroes: Deck, includedPlayers: Map<number, number>) {
        this.element = document.createElement("div");
        // creating checkbox element 
        var checkbox = document.createElement('input');
    
        // Assigning the attributes 
        // to created checkbox 
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "id";
        checkbox.checked = true;
    
        // creating label for checkbox 
        var label = document.createElement('label');
    
        // assigning attributes for  
        // the created label tag  
        label.htmlFor = "id";
    
        // appending the created text to  
        // the created label tag  
        label.appendChild(document.createTextNode(name));
    
        // appending the checkbox 
        // and label to div 
        this.element.appendChild(checkbox);
        this.element.appendChild(label);

        includedPlayers.set(machineId, 0);
    
        let heroChooser = this.getHeroChooser(heroes) as HTMLSelectElement;
        heroChooser.addEventListener("change", function (event) {
            if (includedPlayers.has(machineId)) {
                includedPlayers.set(machineId, parseInt((this as any).value));
            }
        });
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                includedPlayers.set(machineId, parseInt(heroChooser.options[heroChooser.selectedIndex].value));
            } else {
                includedPlayers.delete(machineId);
            }
        });
    
    
        this.element.appendChild(heroChooser);
    }


    private getHeroChooser(heroes: Deck): HTMLElement {
        //Create and append select list
        let selectList = document.createElement("select");
        selectList.id = "mySelect";

        //Create and append the options
        for (var i = 0; i < heroes.cards.length; i++) {
            var option = document.createElement("option");
            option.value = heroes.cards[i].id + "";
            option.text = heroes.cards[i].cardInfo.CardName;
            selectList.appendChild(option);
        }

        return selectList;
    }
}