import { Business } from './Business';
import { BusinessType } from './Business';
import { Manager } from './Manager';

export class Main {
    static instance : Main = null;
    static readonly defaultRefreshInterval : number = 100; //milliseconds

    refreshInterval : number;
    runningBusinesses : Array<Business>;
    started : boolean;
    intervalId : number; //identifier for setInterval timer if we want to clear it

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

    // update UI every 'refreshInterval' millisecs
    start() {
        if (!this.started) {
            this.intervalId = window.setInterval(
                () => { this.runningBusinesses.forEach(b => b.nextTick()) },
                this.refreshInterval
            );
            this.started = true;
        }
    }

    // update UI every 'refreshInterval' millisecs
    stop() {
        if (this.started) {
            window.clearInterval(this.intervalId);
            this.started = false;
        }
    }

    public addRunningBusiness(b : Business) {
        if (this.runningBusinesses.indexOf(b) == -1) {
            this.runningBusinesses.push(b);
        }
    }

    public removeRunningBusiness(b : Business) {
        let index = this.runningBusinesses.indexOf(b);
        if (index >= 0) {
            this.runningBusinesses.splice(index, 1);
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
        Main.startBusinesses();
        Main.startManagers();
        Main.getInstance().start();
    }

    static startBusinesses() {
        // we'll increase upgrade cost by 7% for first 4 business and by 14% for the other 4.
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
