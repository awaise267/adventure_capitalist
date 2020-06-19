import { Business } from './Business';

export class Main {

    static instance : Main = null;
    static readonly defaultRefreshInterval : number = 250; //milliseconds

    refreshInterval : number;
    runningBusinesses : Array<Business>;
    started : boolean;
    intervalId : number; //identifier for setInterval timer

    constructor(refreshInterval? : number) {
        if (refreshInterval === undefined) {
            this.refreshInterval = Main.defaultRefreshInterval;
        } else {
            this.refreshInterval = refreshInterval;
        }
        this.started = false;
        this.runningBusinesses = <any>([]);
    }

    public static getInstance() : Main {
        if (Main.instance == null) {
            Main.instance = new Main();
        }

        return Main.instance;
    }

    public addRunningBusiness(b : Business) {
        ((s, e) => { if(s.indexOf(e)==-1) { s.push(e); return true; } else { return false; } })(this.runningBusinesses, b);
    }

    public removeRunningBusiness(b : Business) {
        (a => { let index = a.indexOf(b); if(index>=0) { a.splice(index, 1); return true; } else { return false; }})(this.runningBusinesses);
    }

    public start() : void {
        if (!this.started) {            
            this.intervalId = window.setInterval(
                () => { this.runningBusinesses.forEach(b => b.nextTick()) },
                this.refreshInterval
            );
        }
    }

    public stop() : void {
        if (this.started) {
            window.clearInterval(this.intervalId);
        }
    }

    public static newInstance() : void {
        // start new instance of game
    }

    public static restoreInstance() : void {
        // TODO: restore instance from local storage
    }
}
