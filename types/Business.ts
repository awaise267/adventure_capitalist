import { CashUpdateListener } from './CashUpdateListener';
import { Cash } from './Cash';
import { Main } from './Main';

export class BusinessType {
    static readonly LEMONADE : BusinessType = new BusinessType(1, "Lemonade Stand");
    static readonly NEWSPAPER : BusinessType = new BusinessType(2, "Newspaper Delivery");
    static readonly CAR : BusinessType = new BusinessType(3, "Car Wash");
    static readonly DONUT : BusinessType = new BusinessType(4, "Donut Shop");
    static readonly HOCKEY : BusinessType = new BusinessType(5, "Hockey Team");
    static readonly STUDIO : BusinessType = new BusinessType(6, "Movie Studio");
    static readonly BANK : BusinessType = new BusinessType(7, "Bank");
    static readonly OIL : BusinessType = new BusinessType(8, "Oil Company");

    public id : number;
    public name : string;

    constructor(id : number, name : string) {
        this.id = id;
        this.name = name;
    }
}

export class Business implements CashUpdateListener {
    type : BusinessType;
    baseIncome : number;
    income : number; //current income
    milliSecondsPerRun : number;
    cost : number;
    costIncrementFactor : number;
    level : number;
    active : boolean;
    running : boolean;
    upgradeAvailable : boolean;
    managed : boolean;
    startedAt : number;

    static instances : object = {};

    public constructor(type : BusinessType, secondsPerRun : number, baseCost : number, costIncrementFactor : number) {
        this.type = type;
        this.baseIncome = baseCost;
        this.income = baseCost;
        this.milliSecondsPerRun = secondsPerRun * 1000;
        this.cost = baseCost;
        this.costIncrementFactor = costIncrementFactor;
        this.level = 0;
        this.active = false;
        this.running = false;
        this.upgradeAvailable = false;
        this.managed = false;
        if (type.id === BusinessType.LEMONADE.id) {
            this.income = 1;
            this.baseIncome = 1;
            this.active = true;
            this.level = 1;
        }

        Business.instances[type.id] = this;
        Cash.getInstance().addCashUpdateListener(this);
        this.renderUI();
    }

    public static getInstance(id : number) : Business | null {
        if (Business.instances[id]) {
            return Business.instances[id];
        }
        return null;
    }

    // run a business to earn income
    public run() {
        if (!this.active) {
            return;
        }

        if (!this.running) {
            this.running = true;
            this.startedAt = Date.now();
            Main.getInstance().addRunningBusiness(this);
        }
    }

    // stop running a business after income is earned
    // if manager is hired, this restarts a run
    public endRun() {
        Cash.getInstance().increment(this.income);
        this.running = false;
        this.startedAt = -1;

        if (this.managed) {
            this.run();
        }
    }

    // update UI every Main.refreshInterval seconds
    public nextTick() {
        this.updateProgressBarUI();
        if (!this.running) {
            // do not remove within endRun() to wait for another tick before clearing a full progress bar
            Main.getInstance().removeRunningBusiness(this);
        } else if (Date.now() - this.startedAt >= this.milliSecondsPerRun) {
            this.endRun();
        }
    }

    public managerHired() {
        this.managed = true;

        // if manager is hired before a business is unlocked, we do nothing
        // business has to be unlocked and started at-least once
        // this is also to the original game's behaviour
        if (!this.running && this.active) {
            this.run();
        }
    }

    // CashUpdateListener's event handler
    public cashUpdated(balance : number) {
        let cssClass = "button.btn-secondary";

        if (balance >= this.cost) {
            if (!this.upgradeAvailable) {
                this.upgradeAvailable = true;
                if (!this.active) {
                    cssClass = "div.disabled-business";
                }
                this.toggleUpgradeButtonUI(cssClass);
            }
        } else {
            if (this.upgradeAvailable) {
                this.upgradeAvailable = false;
                if (!this.active) {
                    cssClass = "div.disabled-business";
                }
                this.toggleUpgradeButtonUI(cssClass);
            }
        }
    }

    // called from UI onclick event
    public upgrade() {
        let costOfIncrement : number = this.cost;
        this.incrementCost();
        this.incrementLevel();

        if (!this.active) {
            this.active = true;
            this.renderUI();
        }

        this.upgradeUpdateUI();

        let cash : Cash = Cash.getInstance();
        cash.decrement(costOfIncrement);
    }

    // Internal function
    incrementCost() {
        let cost = this.cost;
        cost = ((100 + this.costIncrementFactor) * cost) / 100;
        cost = <number><unknown>cost.toFixed(2);
        if (cost > 20) {
            cost = Math.round(cost);
        }
        this.cost = cost;
    }

    // Internal function
    incrementLevel() {
        this.level += 1;

        // double speed every 25 levels
        if (this.level % 25 === 0) {
            this.milliSecondsPerRun = this.milliSecondsPerRun / 2;
        }

        // for every level up, increase income by base amount
        if (this.level > 1) {
            this.income += this.baseIncome;
        }
    }

    // Internal util function (source: stackoverflow)
    msToTimeFormat(ms : number) {
        let seconds = Math.floor((ms / 1000) % 60);
        let minutes = Math.floor((ms / 1000 / 60) % 60);
        let hours = Math.floor((ms  / 1000 / 3600 ) % 24)

        let formatted = [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');

        return formatted;
    }

    /*  ------------------------------------------------------------------------------
        Hacky UI code below that manipulates the DOM manually. In a typical
        react app this should automatically be handled by React on updating the state
        ------------------------------------------------------------------------------ */

    upgradeUpdateUI() {
        let el = document.getElementById("business-" + this.type.id);
        el.querySelector("button.btn-secondary").innerHTML = 'Upgrade: $' + this.cost;
        el.querySelector("span.business-level").innerHTML = 'Level: ' + this.level;
        el.querySelector("span.business-income").innerHTML = 'Income: $' + this.income;
    }

    toggleUpgradeButtonUI(cssClass : string) {
        let el = document.getElementById("business-" + this.type.id).querySelector(cssClass);
        if (!this.upgradeAvailable && el.classList.contains('available')) {
            el.classList.remove('available');
            el.removeAttribute('onclick');
        } else if (this.upgradeAvailable && !el.classList.contains('available')) {
            el.classList.add('available');
            el.setAttribute('onclick', 'EntryPoint.Main.upgradeBusiness(' + this.type.id + ')');
        }
    }

    updateProgressBarUI() {
        let el = document.getElementById("business-" + this.type.id);
        let progressdiv = el.querySelector("div.progress");
        let bar = progressdiv.querySelector("div.progress-bar");

        if (this.running === false) {
            bar.setAttribute('style', 'width: ' + 0 + '%;');
            bar.setAttribute('aria-valuenow', '' + 0);
            el.querySelector("span.timer-text").innerHTML = '00:00:00';
        } else {
            let progress = (Date.now() - this.startedAt) * 100 / this.milliSecondsPerRun;
            progress = progress > 100 ? 100 : progress;
            bar.setAttribute('style', 'width: ' + progress + '%;');
            bar.setAttribute('aria-valuenow', '' + progress);

            if (progress >= 100) {
                el.querySelector("span.timer-text").innerHTML = '00:00:00';
            } else {
                let remainingTime = this.milliSecondsPerRun - (Date.now() - this.startedAt);
                el.querySelector("span.timer-text").innerHTML = this.msToTimeFormat(remainingTime);
            }
        }
    }

    renderUI() {
        let html = '';
        if (!this.active) {
            html = `<div class="disabled-business">
                            <span class="span-center-align">
                                ${this.type.name}: $${this.cost}
                            </span>
                        </div>`
        } else {
            html = `<div class="business-container">
                        <div class="row">
                            <div class="col-md-4">
                                <div class="business-icon" onclick="EntryPoint.Main.runBusiness(${this.type.id})">
                                    <span class="business-name">${this.type.name}</span><br/>
                                    <span class="business-level">Level: ${this.level} </span><br/>
                                    <span class="business-income">Income: $${this.income}</span>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <div class="row progress-bar-row">
                                    <div class="progress">
                                        <div class="progress-bar bg-success" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                                        </div>
                                    </div>
                                </div>
                                <div class="row buy-button-row">
                                    <div class="col-md-6"><button type="button" class="btn btn-secondary">Upgrade: $${this.cost}</button></div>
                                    <div class="col-md-6"><div class="timer"><span class="timer-text">00:00:00</span></div></div>
                                </div>

                            </div>
                        </div>
                    </div>`;
        }

        let elementId = 'business-' + this.type.id;
        document.getElementById(elementId).innerHTML = html;
    }
}
