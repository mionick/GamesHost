
export class GameLog {

   public eventLog: HTMLTextAreaElement;

   constructor() {
      this.eventLog = document.getElementById("event-log") as HTMLTextAreaElement;
   }

   public logEvent(text: string) {
      //console.log(text);
      this.eventLog.value += "\n" + text;
      this.eventLog.scrollTop = this.eventLog.scrollHeight;
   }
}