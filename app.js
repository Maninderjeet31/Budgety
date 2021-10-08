//BUDGET CONTROLLER
var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);   
        }
        else{
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentages = function(){
      return this.percentage;  
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function(type){
        var sum = 0;
        
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    };
    
    var allExpenses = [];
    var allIncomes = [];
    var totalExpenses = 0;
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type,des, val){
            var newItem, ID;
            
            //Create new ID 
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;   
            }
            else {
                ID = 0;
            }
            
            //New item based on type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);   
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            //push into data structure
            data.allItems[type].push(newItem);
            
            //Return the new element
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            
            // if id = 3
            // wrong aproach if id not in order -> data.allItems[type][id]
            ids = data.allItems[type].map(function(current) {
                return current.id;    
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        
        calculateBudget: function(){
            
            // 1. Caluculate income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //2. Calculate the budget: income / expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            //3. Calculate percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);    
            }
            else{
                data.percentage = -1;
            }
            
        },
        
        calculatePercentages: function(){
            
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);    
            });
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
               return cur.getPercentages(); 
            });
            
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }    
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
})();


//UI CONTROLLER
var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',    
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };
    
    var formatNumber = function(num, type){
            
            var numSplit, int, dec, type;
          
            // + or - before number to be added
            //exactly 2 decimal points, if required use round
            //comma separating thousands
            
            num = Math.abs(num);    // overrriding num argument, removes any + or - from number
            num = num.toFixed(2);
            
            //split number into decimal part and integer part using split method
            numSplit = num.split('.');
            
            int = numSplit[0];
        
            //add coma if necessary
            if(int.length > 3) {
                
                //subString -> return part of string
                /*int = int.substr(0, 1) + ',' + int.substr(1,3);
                //0,1 -> read from index 0 and read 1 number
                //1,3 -> read from index 1 and read total 3 numbers
                //if input is 2310 then output -> 2,310 
                but that code is hard coded cz what if number exceede the length of 3. Therefor we use the code below.
                */
                
                int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3,3);           
            }
            
            dec = numSplit[1];
            
            
            return (type === 'exp' ?  '-' : '+') + ' ' + int + '.' + dec;
        };
    
    var NodeListForEach = function(list, callback){
                for(var i = 0; i < list.length; i++)
                    {
                        callback(list[i], i);
                    }
            };
    
    return {
        getInput: function(){
            return{
                type : document.querySelector(DOMstrings.inputType).value,  //will be either 'inc' or 'exp' as value in response.
                description:   document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type){
            
            //1. Create HTML string with placeholder text
            var html, newHtml, element;
            
            if(type === 'inc')
                {
                    //console.log('entered');
                    element = DOMstrings.incomeContainer;
                    
                    html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
            else if(type === 'exp')
                {
                    element = DOMstrings.expensesContainer;
                    
                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
            
            //2. Replace placeholder text with actual input received data
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //3. Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID){
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function(){
            var fields, fieldsArray;
            
          fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);  
            
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current, index, array){
                current.value = "";
            });
            
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj){
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber((obj.totalInc), 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else
                {
                    document.querySelector(DOMstrings.percentageLabel).textContent = '---';
                }
        },
        
        displayPercentages: function(percentages){
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            NodeListForEach(fields, function(current, index){
                if(percentages[index] > 0)
                    {
                        current.textContent = percentages[index] + '%'; 
                    }
                else
                    {
                        current.textContent = '---';
                    }
            });
        },
        
        displayMonth: function(){
            var now, year, month, months;
            now = new Date();   // now retrieves current date and month.
            /* or
            var christmas = new Date(2016,11,25);
            */
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            
            month = now.getMonth();
            
            year = now.getFullYear();     //returns current year
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function(){
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            NodeListForEach(fields, function(cur){
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
        getDOMstrings: function(){
            return DOMstrings;
        }
    };
    
})();


//GLOBAL CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAdditem);
    
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAdditem();
            }
        
        });
        
     document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    
    var updateBudget = function()
    {
        //1. Calculate the budget.
        budgetCtrl.calculateBudget();
        
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        //3. Display budget on UI
        UICtrl.displayBudget(budget);
    };
    
    updatePercentages = function(){
        
        //1. Calculate percentages
        budgetController.calculatePercentages();
        
        //2. read from budget controller
        var percentages = budgetController.getPercentages();
        
        //3. read and updae UI with new Percentage
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAdditem = function(){
        var input, newItem;
        
        //1. Get Input Data
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //2. Add item to budget Controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            //3. Add new item to UI
            UICtrl.addListItem(newItem, input.type);
        
            //4 Clear the fields
            UICtrl.clearFields();
        
            //calculate and update budget
            updateBudget();
            
            // Calc and update percentage
            updatePercentages();
        }   
    };
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            
            //inc-1 input
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1. Dlt item from data structure
            budgetController.deleteItem(type, ID);
            
            //2. Dlt item from UI
            UIController.deleteListItem(itemID);
            
            //3. Update and show new budget 
            updateBudget();
            
            //calc and update percentages
            updatePercentages();
        }
    };
    
    return{
        init: function() {
            console.log('Application has started.!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1    
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

controller.init();
