import { CashUpdateListener } from './CashUpdateListener';
import { Business } from './Business';
import { Cash } from './Cash';

export class Manager implements CashUpdateListener {
    name : string;
    cost : number;
    manages : Business;
    hired : boolean;
    available : boolean;

    static instances : object = {};

    public constructor(name : string, cost : number, business : Business) {
        this.hired = false;
        this.available = false;
        this.name = name;
        this.cost = cost;
        this.manages = business;
        this.renderUI();
        Manager.instances[business.type.id] = this;
        Cash.getInstance().addCashUpdateListener(this);
    }

    public static getInstance(id : number) : Manager | null {
        if (Manager.instances[id]) {
            return Manager.instances[id];
        }
        return null;
    }

    public hire() {
        let cash : Cash = Cash.getInstance();

        if (cash.balance < this.cost) {
            return;
        }
        cash.removeCashUpdateListener(this);
        cash.decrement(this.cost);
        this.manages.managerHired();
        this.hired = true;
        this.updateView();
    }

    public cashUpdated(balance : number) {
        if (balance >= this.cost) {
            if (!this.available) {
                this.available = true;
                this.updateView();
            }
        } else {
            if (this.available) {
                this.available = false;
                this.updateView();
            }
        }
    }

    updateView() {
        let el = document.getElementById(`manager-${this.manages.type.id}`);
        if (this.hired) {
            // remove hire manager option from UI
            el.remove();
        } else {
            if (this.available) {
                el.classList.add('available');
                el.setAttribute('onclick', `EntryPoint.Main.hireManager(${this.manages.type.id})`);
            } else {
                el.classList.remove('available');
                el.removeAttribute('onclick');
            }
        }
    }

    renderUI() {
        let el = document.createElement('div');
        el.setAttribute('id', `manager-${this.manages.type.id}`);
        el.classList.add('manager-block');
        el.innerHTML = `<span class="span-center-align">
                            ${this.name} <br/>
                            Salary: ${this.cost}
                        </span>`
        document.getElementById('left-panel').appendChild(el);
    }

}
