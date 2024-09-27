sap.ui.define(
    ["ey/fin/ap/controller/BaseController",
     "sap/ui/model/Filter",
     "sap/ui/model/FilterOperator"
    ],
    function(BaseController,Filter,FilterOperator){
        return BaseController.extend("ey.fin.ap.controller.View1",{
            onInit: function(){
                //Now instead of the App container control, we will use the Router and Routing
                //Router is an object present with our Component.js
                this.oRouter = this.getOwnerComponent().getRouter();
            },
            onNext: function(myFruitId){                

                //Use the Router object to perform the navigation
                this.oRouter.navTo("detail",{
                    fruitId: myFruitId
                });

                //as you know its the mother who will help us to navigate to second child
                //we need the mother object
                //Step 1: get the current view object - view1
                // var oView = this.getView();
                //Step 2: view was added inside container (mother) in Component.js
                //we can obtain the mother object
                //var oAppCon = oView.getParent().getParent();

                //Get the data from search field
                //var sData = this.getView().byId("idSearch").getValue();
                // //Get the object of second view
                // var oView2 = oAppCon.getPages()[1];
                // //Get the page inside of view 2
                // var oPage = oView2.getContent()[0];
                // //Change the title of the page inside the view
                // oPage.setTitle(sData);
                //Step 3: Navigate using the API(function) present in SDK
                //https://ui5.sap.com/#/api/sap.m.NavContainer%23methods/to
                //oAppCon.toDetail("idView2");
            },
            onMultiDelete: function(){
                //Step 1: get all the selected records from list
                var oList = this.getView().byId("idList");
                var aSelected = oList.getSelectedItems();
                //Step 2: loop at each record and delete one by one
                for (let i = 0; i < aSelected.length; i++) {
                    const element = aSelected[i];
                    //Step 3: delete one by one
                    oList.removeItem(element);
                }
            },
            onSelectItem: function(oEvent){
                //Step 1: Get the object of the item on which user press
                var oSelectItem = oEvent.getParameter("listItem");
                //Step 2: From the item object, get the address of the element (like your table)
                var sPath = oSelectItem.getBindingContext().getPath();
                //Step 3: Get the object of second view from parent (like your Simple Form)
                //OLD Code when we use App Container control
                //var oView2 = this.getView().getParent().getPages()[1];
                //NEW code when we use splitapp
                //var oView2 = this.getView().getParent().getParent().getDetailPage("idView2");
                //Step 4: Perform element binding with View2
                //oView2.bindElement(sPath);
                //Call next view

                //extract the index from the path /fruit/3
                var sIndex = sPath.split("/")[sPath.split("/").length - 1];

                this.onNext(sIndex);
            },
            onDeleteItem: function(oEvent){
                //Step 1: get the object of the item which was requested to be deleted
                var oDeleteItem = oEvent.getParameter("listItem");
                //Step 2: get the object of the list control w/o ID
                var oList = oEvent.getSource();
                //Step 3: Use Delete API from list to delete the item
                oList.removeItem(oDeleteItem);
            },
            onAddProduct: function(){
                //call router to load add view route
                this.oRouter.navTo("addProduct");
            },
            onAddOrder: function(){
                //call router to load add view route
                this.oRouter.navTo("addOrder");
            },
            onSearch: function(oEvent){
                //Step 1: get the value user enters in search field
                var sValue = oEvent.getParameter("query");
                //Step 2: create a model filter object
                //a filter is like a IF condition - 2 operands and 1 operator
                //IF con1 OR/AND cond2
                var oFilter1 = new Filter("CATEGORY", FilterOperator.Contains, sValue);
                //var oFilter2 = new Filter("taste", FilterOperator.Contains, sValue);
                var aFilter = [oFilter1];
                //Adding a filter with multiple using OR
                var oFilter = new Filter({
                    filters: aFilter,
                    and: false
                });
                //Step 3: get the binding for items agg.
                var oAggregate = this.getView().byId("idList").getBinding("items");
                //NOT POSSIBLE = var oAggregate = oEvent.getSource().getBinding("items");
                //Step 4: pass the filter to binding
                oAggregate.filter(oFilter);
            }
            

        });
});