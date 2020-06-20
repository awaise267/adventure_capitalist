# Adventure Capitalist
This is an attempt to replicate parts of the [browser game "Adventure Capitalist"](http://en.gameslol.net/adventure-capitalist-1086.html) using TypeScript

The game is [hosted on Heroku](https://aventure-capitalist.herokuapp.com/)

# Features implemented
Buying and upgrading businesses
Earning income from running a business
Hiring managers to automatically run business

# Pending features
Store and read state from localstorage/indexeddb to persist across sessions.

# Running locally
Depends on nodejs. All other dependencies are installed by checking out the code and running `npm install`.
To start the server, run `npm start`. Runs on port 3000 by default

# Code Structure
This implementation focuses on the logic layer written using TypeScript. State changes in the classes trigger UI updates which would, in a perfect implementation, have been handled by React. This is my first attempt at TypeScript and React has a steeper learning curve so we will put aside creating a React application for the future. For the sake of simplicity, UI updates are handled by manually updating the DOM.

The logic layer is divided into the following parts:

`Main` class - The entry point to the application. webpack exposes this to `index.html` where we call `Main.newInstance()`. This class runs a timer that updates the UI 4 times in a second.

`Cash` class - This class maintains the user's cash balance in a singleton object. Other classes can register event listeners for cash updates (purchases and income) trigger events using the `CashUpdateListener` interface.

`Business` class - Creates instances for each of the business object. Adds a `CashUpdateListener` that checks if current balance exceeds upgrade cost to enable/disable the upgrade/level up buttons. While a business is running, it also adds a handler to the `Main` class to listen for UI update ticks and uses it to update the progress bar and countdown timer UI elements.

`Manager` class - Instances of this class are initialized after the `Business` class. Adds a `CashUpdateListener` to allow hiring a manager if the balance exceeds the hiring cost.

