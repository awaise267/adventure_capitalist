import { CashUpdateListener } from './CashUpdateListener';

export class Cash {
    balance : number;
    listeners : Array<CashUpdateListener>;
    static instance : Cash = null;

    constructor(b : number) {
        if(this.balance===undefined) this.balance = 0;
        if(this.listeners===undefined) this.listeners = null;
        this.balance = b;
        this.listeners = <any>([]);
        this.render();
    }

    public static getInstance() : Cash {
        if (Cash.instance == null) {
            Cash.instance = new Cash(0);
        }
        return Cash.instance;
    }

    public increment(by : number) {
        this.updateBalance(by);
    }

    public decrement(by : number) {
        this.updateBalance(-by);
    }

    public addCashUpdateListener(l : CashUpdateListener) {
        ((s, e) => { if(s.indexOf(e)==-1) { s.push(e); return true; } else { return false; } })(this.listeners, l);
    }

    public removeCashUpdateListener(l : CashUpdateListener) {
        (a => { let index = a.indexOf(l); if(index>=0) { a.splice(index, 1); return true; } else { return false; }})(this.listeners);
    }

    updateBalance(by : number) {
        this.balance = Math.round(this.balance + by);
        this.render();
        for(let idx=0; idx < this.listeners.length; idx++) {
            let l = this.listeners[idx];
            {
                l.cashUpdated(this.balance);
            }
        }
    }

    render() {
        document.getElementById('cash').innerHTML = 'Cash: $' + this.balance;
    }
}
