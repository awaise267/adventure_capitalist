import { CashUpdateListener } from './CashUpdateListener';
import { Cash } from './Cash';
import { Main } from './Main';

export class BusinessType {
    static readonly LEMONADE : BusinessType = new BusinessType(1, "Lemonade Stand");
    static readonly NEWSPAPER : BusinessType = new BusinessType(2, "Newspaper Delivery");
    static readonly CAR : BusinessType = new BusinessType(3, "Car Wash");
    static readonly DONUT : BusinessType= new BusinessType(4, "Donut Shop");
    static readonly STUDIO : BusinessType= new BusinessType(5, "Movie Studio");
    static readonly BANK : BusinessType= new BusinessType(6, "Bank");
    static readonly OIL : BusinessType= new BusinessType(7, "Oil Company");

    public id : number;
    public name : string;

    constructor(id : number, name : string) {
        this.id = id;
        this.name = name;
    }
}

export class Business implements CashUpdateListener {
    type : BusinessType;
    income : number;
    milliSecondsPerRun : number;
    cost : number;
    costIncrementFactor : number;
    level : number;
    active : boolean;
    running : boolean;
    upgradeAvailable : boolean;
    managed : boolean;
    startedAt : number;

    public constructor(type : BusinessType, baseIncome : number, secondsPerRun : number, baseCost : number, costIncrementFactor : number) {        
        this.type = type;
        this.income = baseIncome;
        this.milliSecondsPerRun = secondsPerRun * 1000;
        this.cost = baseCost;
        this.costIncrementFactor = costIncrementFactor;
        this.level = 0;
        this.active = false;
        this.running = false;
        this.upgradeAvailable = false;
        this.managed = false;
        if (type.id === BusinessType.LEMONADE.id){
            this.active = true;
            this.level = 1;
        }
        Cash.getInstance().addCashUpdateListener(this);
    }

    public run() {
        if (!this.running){
            this.running = true;
            this.startedAt = Date.now();
            Main.getInstance().addRunningBusiness(this);
        }
    }

    public endRun() {
        Cash.getInstance().increment(this.income);
        this.running = false;
        this.startedAt = -1;
        Main.getInstance().removeRunningBusiness(this);

        if (this.managed){
            this.run();
        }
    }

    public nextTick() {
        if (!this.running){
            return;
        }
        if (Date.now() - this.startedAt >= this.milliSecondsPerRun){
            this.endRun();
        }
        this.updateProgressBar();
    }

    public managerHired() {
        this.managed = true;
        if (!this.running){
            this.run();
        }
    }

    public cashUpdated(balance : number) {
        if (balance >= this.cost){
            if (!this.upgradeAvailable){
                this.upgradeAvailable = true;
                this.updateUpgradeButton();
            }
        } else {
            if (this.upgradeAvailable){
                this.upgradeAvailable = false;
                this.updateUpgradeButton();
            }
        }
    }

    public upgrade() {
        let costOfIncrement : number = this.cost;
        this.incrementCost();
        this.incrementLevel();
        let cash : Cash = Cash.getInstance();
        cash.decrement(costOfIncrement);
    }

    incrementCost() {
        this.cost = (((100 + this.costIncrementFactor) * this.cost) / 100|0);
    }

    incrementLevel() {
        this.level += 1;
        if (this.level % 25 === 0){
            this.milliSecondsPerRun = this.milliSecondsPerRun / 2;
        }
    }

    updateUpgradeButton() {
    }

    updateProgressBar() {
    }
}
