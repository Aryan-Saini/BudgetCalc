const desc = document.querySelector(".add__description");
const value = document.querySelector(".add__value");
const income = document.querySelector(".income__list");
const expenses = document.querySelector(".expenses__list");
const budget = document.querySelector(".budget__income--value");
const budgetExp = document.querySelector(".budget__expenses--value");
const budgetExpPer = document.querySelector(".budget__expenses--percentage");
const monthBud = document.querySelector(".budget__title--month");
const budgetValue = document.querySelector(".budget__value");
const bottom = document.querySelector(".bottom");
const button = document.querySelector(".add__btn");

class Transaction{
  constructor(amount,description,id){
    this.amount = amount;
    this.description = description;
    this.date = moment();
    this.id = id;
  }
}

class TransactionList{
  constructor(){
    this.budgetIncome = 0;
    this.budgetExpenses = 0;
    this.incomeList = [];
    this.expenseList = [];
    this.idCounter = 0;
  }

  addNewTransaction(amount,description){
    if (parseFloat(amount) >= 0){
      this.incomeList.push(new Transaction(parseFloat(amount),description,this.idCounter));
      this.budgetIncome += parseFloat(amount);
      this.idCounter++;
    } else{
      this.expenseList.push(new Transaction(parseFloat(amount),description,this.idCounter));
      this.budgetExpenses += parseFloat(amount);
      this.idCounter++;
    }

    this.redraw();
  } 

  removeTransaction(id,listType){
    if (listType === 0){
      let index = this.incomeList.findIndex(function(e){
          return e.id == id;
      });
      this.budgetIncome -= this.incomeList[index].amount;
      this.incomeList.splice(index,1);
    } else{
      let index = this.expenseList.findIndex(function(e){
        return e.id == id;
      });
      this.budgetExpenses -= this.expenseList[index].amount;
      this.expenseList.splice(index,1);
    }
    
    this.redraw();
  }

  redraw(){
    if ((this.budgetIncome + this.budgetExpenses) >= 0){    
    budgetValue.innerText = this.format(true, (this.budgetIncome + this.budgetExpenses));
    } else {
      budgetValue.innerText = this.format(false, (this.budgetIncome + this.budgetExpenses));
    }
    income.innerHTML = "";
    expenses.innerHTML = "";
    budget.innerText = "$" + this.budgetIncome.toFixed(2);
    budgetExp.innerText = "$" + this.budgetExpenses.toFixed(2);
    let date = moment();
    monthBud.innerText = date.format("MMMM YYYY");
    budgetExpPer.innerText = this.findPercentage(this.budgetExpenses);
    let me = this;
    this.expenseList.forEach(function(e) {
      expenses.insertAdjacentHTML("afterbegin",`
        <div class="item" data-type="exp" data-id="${e.id}">
          <div class="item__description">${e.description}</div>
            <div class="right">
              <div class="item__value">${me.format(false, e.amount)}</div>
              <div class="item__percentage">${me.findPercentage(e.amount)}</div>
              <div class="item__delete">
                <button class="item__delete--btn">
                 <i class="ion-ios-close-outline"></i>
                </button>
              </div>
            </div>
          <div class="item__date">${e.date.format("MMM. Do, YYYY")}</div>
        </div>
      ` );
    });

    this.incomeList.forEach(function(e) {
      income.insertAdjacentHTML("afterbegin",`
        <div class="item" data-type="inc" data-id="${e.id}">
          <div class="item__description">${e.description}</div>
            <div class="right">
              <div class="item__value">${me.format(true, e.amount)}</div>
              <div class="item__delete">
                <button class="item__delete--btn">
                  <i class="ion-ios-close-outline"></i>
                </button>
              </div>
            </div>
          <div class="item__date">${e.date.format("MMM. Do, YYYY")}</div>
        </div>
      ` );
    });
  }

  findPercentage(amount){
    let x = (amount / this.budgetIncome);
    if (amount === 0 || x === -Infinity || x === NaN || x === Infinity){
      x = 0 + "%";
    } else {
      x = Math.floor(x*100) + "%";
    }  
    
    return x;
  }

  format(pos,value){
    let x = value.toFixed(2).toString();
    if (pos) {
      x = x.split("");
      x.splice(0, 0, "+ $")
    } else {
      x = x.split("-");
      x.splice(0, 0, "- $")
      
    }
    x = x.join("");
    return x;
  }

  addTransThroughKeys(keyList){
    console.log(keyList);
    for(let e of keyList){
      console.log(e);
      let x = JSON.parse(localStorage.getItem([e]));
      console.log(x);
      for(let trans of x.incomeList){
        console.log(trans);
        list.addNewTransaction(trans.amount, trans.description);
      } 
    
      for(let trans of x.expenseList){
        console.log(trans);
        list.addNewTransaction(trans.amount, trans.description);
      }
    
      localStorage.removeItem(e);
    };
  }
}

let listOfKeys = [];

window.addEventListener("unload", function(e) { 
  let mon = moment();
  localStorage.setItem(`${mon.format("MMMM-YYYY")}`,JSON.stringify(list));
});

window.addEventListener('load', function(e) {
  let curDate = moment();
  curDate = curDate.format("MMMM-YYYY");
  let keys = Object.keys(localStorage);
  for(let key of keys) {
    if (curDate === key){
      listOfKeys.push(key);
    }
  }
  list.addTransThroughKeys(listOfKeys);
});

let list = new TransactionList;
console.log(listOfKeys);


list.redraw();
button.onclick = function(){
  if (desc.value !== ""){
    if (value.value !== ""){
      list.addNewTransaction(value.value, desc.value)
      value.value = "";
      desc.value = "";
    }
  }
};

bottom.onclick = function(e){
  let close = e.target.closest("div");
  if (close.classList.contains("item__delete")) {
    let parent = e.target.closest("div.item");
    console.log(parent);
    if (parent.dataset.type === "inc"){
      list.removeTransaction(parent.dataset.id, 0);
    } else {
      list.removeTransaction(parent.dataset.id, 1);
    }
  }

} 

