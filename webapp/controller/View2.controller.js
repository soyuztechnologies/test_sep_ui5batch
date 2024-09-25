sap.ui.define(
    ["ey/fin/ap/controller/BaseController",
     "sap/m/MessageBox",
     "sap/m/MessageToast",
     "sap/ui/core/routing/History",
     "sap/ui/core/Fragment",
     "sap/ui/model/Filter",
     "sap/ui/model/FilterOperator"
    ],
    function(BaseController,MessageBox, MessageToast, History, Fragment, Filter, FilterOperator){
        return BaseController.extend("ey.fin.ap.controller.View2",{
            onInit: function(){
                ///Step 1: get the router object
                this.oRouter = this.getOwnerComponent().getRouter();
                //Step 2: Attach the event = RMH event
                //we also need to pass our controller object explicitly to herculis function
                this.oRouter.getRoute("detail").attachMatched(this.herculis, this);
            },
            //this is our event handler function to event Route Matched
            //which will trigger every time whenever
            // Route change in the Url
            // Because user navigate to a product
            // Because user use back and forward button
            // Manually changed by user
            // App loaded a route

            herculis: function(oEvent){
                //Extract the fruit ID for selection
                var myFruitId = oEvent.getParameter("arguments").fruitId;
                //Reconstruct the element path
                var sPath = "/" + myFruitId;
                //Now we bind here itself for our view2
                this.getView().bindElement(sPath,{
                    expand: 'To_Supplier'
                });

                //Replace productset with productimgset for image - /ProductSet('HT-1011')
                var sImagePath = myFruitId.replace("ProductSet","ProductImgSet");
                //Prepare the path for image - servicePath+image+/$value
                debugger;
                var sServicePath = this.getOwnerComponent().getMetadata().getManifestEntry("sap.app").dataSources.anubhavService.uri;
                var imageUrl = sServicePath + sImagePath + "/$value";
                this.getView().byId("zkas").setSrc(imageUrl);


            },
            oCityPopup: null,
            oField: null,
            onF4Help: function(oEvent){
                //take a snapshot of the field on which f4 was pressed out of all fields in table
                this.oField = oEvent.getSource();
                //Step 1: Create a brand new object of our fragment
                //Step: Checking if the supplier popup was already created or not
                //      like in ABAP we check IF go_alv IS NOT BOUND
                var that = this;
                if(!this.oCityPopup){
                    Fragment.load({
                        id: 'city',
                        fragmentName: 'ey.fin.ap.fragments.popup',
                        controller: this
                    })
                    ///Step 2: This is a promise which will fulfill when the fragment is loaded
                    //         https://www.youtube.com/watch?v=zY6gnfxgb9I&pp=ygUScHJvbWlzZSBpbiBzYXAgdWk1
                    //In the promise funtion we wont have access to this pointer, we need to create a 
                    //copy of global this pointer to local variable - line 41
                    .then(function(oFragment){
                        //here we can access the controller object because we created a local variable
                        that.oCityPopup = oFragment;
                        that.oCityPopup.setMultiSelect(false);
                        //Step: Bind the data with supplier popup - 4th binding syntax
                        that.oCityPopup.bindAggregation("items",{
                            path: '/cities',
                            template: new sap.m.StandardListItem({
                                icon: 'sap-icon://product',
                                title: '{name}',
                                description: '{state}'
                            })
                        });
                        
                        //Change the title 
                        that.oCityPopup.setTitle("Select City");
                        //Giving access of resources (model) to the fragment
                        that.getView().addDependent(that.oCityPopup);
                        oFragment.open();
                    });
                }else{
                    this.oCityPopup.open();
                }
            },
            oSupplierPopup: null,
            onConfirmPopup: function(oEvent){
                //get the id of the popup @ runtime to know what cause this select event
                var sId = oEvent.getSource().getId();
                ///check if this is because of the city popup
                if(sId.indexOf("city") !== -1){
                    //Step 1: Get the selected item from event
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    //Step 2: get the title of selected item - cityname
                    var sCity = oSelectedItem.getTitle();
                    //Step 3: Set the data back to same field
                    this.oField.setValue(sCity);
                }else{
                    var aFilter = [];
                    //Step 1: Get the selected item from event
                    var aSelectedItems = oEvent.getParameter("selectedItems");
                    //Step 2: Get the title for each to construct a filter
                    for (let i = 0; i < aSelectedItems.length; i++) {
                        const element = aSelectedItems[i];
                        var sTitle = element.getTitle();
                        var oFilter = new Filter("name", FilterOperator.EQ, sTitle);
                        //Inside array add the filter object one by one
                        aFilter.push(oFilter);
                    }
                    //Get the table object
                    var oTable = this.getView().byId("myTable");
                    //Set the filter to table
                    oTable.getBinding("items").filter(aFilter);
                }               
            },
            onPopupSearch: function(oEvent){
                //https://ui5.sap.com/#/api/sap.m.SelectDialog%23events/search
                var sVal = oEvent.getParameter("value");
                //Get the object of select dialog
                var oDialog = oEvent.getSource();
                //Get the binding
                var oBinding = oDialog.getBinding("items");
                //Construct filter
                var oFilter = new Filter("name", FilterOperator.Contains, sVal);
                //Inject the binding
                oBinding.filter(oFilter);
            },
            onFilter: function(oEvent){
                //Step 1: Create a brand new object of our fragment
                //Step: Checking if the supplier popup was already created or not
                //      like in ABAP we check IF go_alv IS NOT BOUND
                var that = this;
                if(!this.oSupplierPopup){
                    Fragment.load({
                        id: 'supplier',
                        fragmentName: 'ey.fin.ap.fragments.popup',
                        controller: this
                    })
                    ///Step 2: This is a promise which will fulfill when the fragment is loaded
                    //         https://www.youtube.com/watch?v=zY6gnfxgb9I&pp=ygUScHJvbWlzZSBpbiBzYXAgdWk1
                    //In the promise funtion we wont have access to this pointer, we need to create a 
                    //copy of global this pointer to local variable - line 41
                    .then(function(oFragment){
                        //here we can access the controller object because we created a local variable
                        that.oSupplierPopup = oFragment;
                        //Step: Bind the data with supplier popup - 4th binding syntax
                        that.oSupplierPopup.bindAggregation("items",{
                            path: '/supplier',
                            template: new sap.m.StandardListItem({
                                icon: 'sap-icon://supplier',
                                title: '{name}',
                                description: '{sinceWhen}'
                            })
                        });
                        
                        //Change the title 
                        that.oSupplierPopup.setTitle("Select Supplier");
                        //Giving access of resources (model) to the fragment
                        that.getView().addDependent(that.oSupplierPopup);
                        oFragment.open();
                    });
                }else{
                    this.oSupplierPopup.open();
                }
                
            },
            onDropdown: function(oEvent){
                var oSel = oEvent.getParameter("selectedItem");
                MessageBox.confirm(oSel.getKey());
            },
            onRowSelect: function(oEvent){
                //Step 1: get to know the selected supplier object
                var oSelectedRow = oEvent.getParameter("listItem");
                //Step 2: Extract the path of the element - /supplier/3
                var sPath = oSelectedRow.getBindingContext().getPath();
                //Step 3: Extarct the index from the path - split by / and extrat 3
                var sIndex = sPath.split("/")[sPath.split("/").length - 1];
                //Step 4: Call Router to navigate to next screen
                this.oRouter.navTo("supplier",{
                    suppId: sIndex
                });
            },
            onBack: function(){
                //this.getView().getParent().to("idView2");
                //Check the browser history and use that for navigation so have the
                //same feature as browser back button, for that SAP UI5 provide History
                const oHistory = History.getInstance();
                const sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    const oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("start", {}, true);
                }
            },
            onSave: function(){
                MessageBox.confirm("Would you like to save?",{
                    onClose: function(){
                        //this pointer is not accessing the controller object
                        //hence this line is dumping in console
                        this.getView().setBusy(true);
                        //Option 2: create a local variable in caller function
                        //this local variable holds a copy of this pointer - controller object
                        //it will be a way to access controller inside event handler
                        var that = this;
                        setTimeout(function(){
                            that.getView().setBusy(false);
                            MessageToast.show("Dost! your order was saved 👍");
                        },5000);
                    }
                    //here we are explicitly passing controller object from outside to event handler
                    //Hey my event handler, can you PLEASE :) take my controller object and 
                    //offer it to me when i need it
                    .bind(this)
                });
            },
            onCancel: function(){

            }
        });
});