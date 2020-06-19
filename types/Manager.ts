import { CashUpdateListener } from './CashUpdateListener';
import { Business } from './Business';
import { Cash } from './Cash';

export class Manager implements CashUpdateListener {
    name : string;
    cost : number;
    manages : Business;
    hired : boolean;
    available : boolean;

    public constructor(name : string, cost : number, business : Business) {
        this.hired = false;
        this.name = name;
        this.cost = cost;
        this.manages = business;
        Cash.getInstance().addCashUpdateListener(this);
    }

    public hire() {
        let cash : Cash = Cash.getInstance();
        cash.removeCashUpdateListener(this);
        cash.decrement(this.cost);
        this.manages.managerHired();
        this.hired = true;
        this.updateView();
    }

    updateView() {
        if (this.hired) {
            // remove hire manager option from UI
        } else {
            // enable disable hire button
        }
    }

    public cashUpdated(balance : number) {
        if (balance >= this.cost){
            if (!this.available){
                this.available = true;
                this.updateView();
            }
        } else {
            if (this.available){
                this.available = false;
                this.updateView();
            }
        }
    }
}
