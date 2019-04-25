export class Utilities {
    public static mod (m: number, n: number) {
        return ((m % n) + n) % n;
     }
     public static getMachineId(): number {
        let string = navigator.vendorSub + navigator.appVersion + navigator.appCodeName + navigator.platform + navigator.hardwareConcurrency + navigator.userAgent;
        let numbers = string.match(/\d+/g).map(Number);
        return parseInt(numbers.join(""));
     }
     public static  sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
     }
}