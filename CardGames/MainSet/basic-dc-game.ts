import { Card } from "./card";

/**
 * Don’t ever use the types Number, String, Boolean, or Object. These types refer to non-primitive boxed objects that are almost never used appropriately in JavaScript code.

    WRONG
    function reverse(s: String): String;
    Do use the types number, string, and boolean.

    OK
    function reverse(s: string): string;
 */

let card = new Card();
console.log("done")