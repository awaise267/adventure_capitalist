import { Business } from './Business';
import { BusinessType } from './Business';
import { Manager } from './Manager';

export class Main {
    static instance : Main = null;
    static readonly defaultRefreshInterval : number = 100; //milliseconds

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

    public start() {
        if (!this.started) {
            this.intervalId = window.setInterval(
                () => { this.runningBusinesses.forEach(b => b.nextTick()) },
                this.refreshInterval
            );
        }
    }

    public stop() {
        if (this.started) {
            window.clearInterval(this.intervalId);
        }
    }

    public static runBusiness(id : number) {
        Business.getInstance(id).run();
    }

    public static upgradeBusiness(id: number) {
        Business.getInstance(id).upgrade();
    }

    public static hireManager(id: number) {
        Manager.getInstance(id).hire();
    }

    // start new instance of game
    public static newInstance() {
        let main = Main.getInstance();
        Main.startBusinesses();
        Main.startManagers();
        main.start();
    }

    public static restoreInstance() {
        // TODO: restore instance from local storage
    }

    static startBusinesses() {
        new Business(BusinessType.LEMONADE, 1, 4, 7);
        new Business(BusinessType.NEWSPAPER, 3, 60, 7);
        new Business(BusinessType.CAR, 6, 720, 7); //car wash
        new Business(BusinessType.DONUT, 12, 8640, 7);
        new Business(BusinessType.HOCKEY, 24, 103680, 14);
        new Business(BusinessType.STUDIO, 48, 1244160, 14);
        new Business(BusinessType.BANK, 96, 14929920, 14);
        new Business(BusinessType.OIL, 192, 179159040, 14);
    }

    static startManagers() {
        for (let i = 1; i <= 8; i++) {
            let b : Business = Business.instances[i];
            new Manager(b.type.name + ' manager', 1000 * Math.pow(10, i-1), b);
        }
    }
}
