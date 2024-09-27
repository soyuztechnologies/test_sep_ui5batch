sap.ui.define(
    ["ey/fin/ap/controller/BaseController",
     "sap/m/MessageBox",
     "sap/m/MessageToast",
     "sap/ui/core/routing/History",
     "sap/ui/core/Fragment",
     "sap/ui/model/Filter",
     "sap/ui/model/FilterOperator",
     "sap/ui/model/json/JSONModel"
    ],
    function(BaseController,MessageBox, MessageToast, History, Fragment, Filter, FilterOperator, JSONModel){
        return BaseController.extend("ey.fin.ap.controller.AddOrder",{
            onInit: function(){
                ///Step 1: get the router object
                this.oRouter = this.getOwnerComponent().getRouter();
                //Step 2: Attach the event = RMH event
                //we also need to pass our controller object explicitly to herculis function
                this.oRouter.getRoute("addOrder").attachMatched(this.herculis, this);

                //Create a local json model
                this.oLocalModel = new JSONModel();
                this.setDefaultDataToModel();
                this.getView().setModel(this.oLocalModel,"local");
            },
            setDefaultDataToModel: function(){
                this.oLocalModel.setData({
                    "orderData": {
                        "SoId" : "",
                        "Note" : "Anubhav wala sales order",
                        "BuyerId" : "100000004",
                        "BuyerName" : "Panorama Studios",
                        "CurrencyCode" : "EUR",
                        "GrossAmount" : "0",
                        "NetAmount" : "0",
                        "TaxAmount" : "0",
                        "To_Items" : []
                    },
                    "itemTemplate":{
                        "SoId" : "",
                        "ProductId" : "HT-1031",
                        "Note" : "<Add Note>",
                        "GrossAmount" : "0.00",
                        "Quantity" : "0",
                        "QuantityUnit" : "EA"
                    }
                });
            },
            onAddItemRow: function(){
                var aItems = this.oLocalModel.getProperty("/orderData/To_Items");
                var refPayloadItem = this.oLocalModel.getProperty("/itemTemplate");
                //deepcopy of item
                aItems.push(JSON.parse(JSON.stringify(refPayloadItem)));
                this.oLocalModel.setProperty("/orderData/To_Items",aItems);
            },
            onSave: function(){
                //Extract the payload from local model
                var payload = this.oLocalModel.getProperty("/orderData");
                //get the odata model object 
                var oDataModel = this.getOwnerComponent().getModel();

                var that = this;
                //send the call to sap backend
                oDataModel.create("/SalesOrderSet", payload,{
                    success: function(data){
                        debugger;
                        MessageToast.show("Wallah! The order was POSTed to SAP now!");
                        that.oLocalModel.setProperty("/orderData", data);
                    },
                    error: function(oErr){
                        debugger;
                        MessageBox.error(JSON.parse(oErr.responseText).error.innererror.errordetails[0].message);
                    }
                });

                
            },
            onDeleteItem: function(oEvent){
                //Step 1: get the object of table
                var oTable = oEvent.getSource();
                //Step 2: get the item which was pressed to be deleted
                var oItemToBeDeleted = oEvent.getParameter("listItem");
                var sPath = oItemToBeDeleted.getBindingContextPath();
                var sIndex = sPath.split("/")[sPath.split("/").length - 1];
                //Step 3: Remove the item from table
                var aItems = this.oLocalModel.getProperty("/orderData/To_Items");
                aItems.splice(sIndex,1);
                this.oLocalModel.setProperty("/orderData/To_Items",aItems);

            },
            oProductPopup: null,
            oTableCell: null,
            onF4Product: function(oEvent){
                this.oTableCell = oEvent.getSource();
                //Step 1: Create a brand new object of our fragment
                //Step: Checking if the supplier popup was already created or not
                //      like in ABAP we check IF go_alv IS NOT BOUND
                var that = this;
                if(!this.oProductPopup){
                    Fragment.load({
                        id: 'product',
                        fragmentName: 'ey.fin.ap.fragments.popup',
                        controller: this
                    })
                    ///Step 2: This is a promise which will fulfill when the fragment is loaded
                    //         https://www.youtube.com/watch?v=zY6gnfxgb9I&pp=ygUScHJvbWlzZSBpbiBzYXAgdWk1
                    //In the promise funtion we wont have access to this pointer, we need to create a 
                    //copy of global this pointer to local variable - line 41
                    .then(function(oFragment){
                        //here we can access the controller object because we created a local variable
                        that.oProductPopup = oFragment;
                        that.oProductPopup.setMultiSelect(false);
                        //Step: Bind the data with supplier popup - 4th binding syntax
                        that.oProductPopup.bindAggregation("items",{
                            path: '/ProductSet',
                            template: new sap.m.StandardListItem({
                                icon: 'sap-icon://product',
                                title: '{PRODUCT_ID}',
                                description: '{NAME}'
                            })
                        });
                        
                        //Change the title 
                        that.oProductPopup.setTitle("Select Product");
                        //Giving access of resources (model) to the fragment
                        that.getView().addDependent(that.oProductPopup);
                        oFragment.open();
                    });
                }else{
                    this.oProductPopup.open();
                }
            },
            oSupplierPopup: null,
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
                        that.oSupplierPopup.setMultiSelect(false);
                        //Step: Bind the data with supplier popup - 4th binding syntax
                        that.oSupplierPopup.bindAggregation("items",{
                            path: '/SupplierSet',
                            template: new sap.m.StandardListItem({
                                icon: 'sap-icon://supplier',
                                title: '{BP_ID}',
                                description: '{COMPANY_NAME}'
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
            onConfirmPopup: function(oEvent){
                    var sId = oEvent.getSource().getId();    
                    //Step 1: Get the selected item from event
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    //Step 2: get the title of selected item - cityname
                    var sObjectId = oSelectedItem.getTitle();
                    if(sId.indexOf("product") !== -1){
                        //Step 3: Set the data back to same field
                        this.oTableCell.setValue(sObjectId);
                    }else{
                        
                        var sSuppName = oSelectedItem.getDescription();
                        //Step 3: Set the data back to same field
                        this.oLocalModel.setProperty("/orderData/BuyerId", sObjectId);
                        this.oLocalModel.setProperty("/orderData/BuyerName", sSuppName);
                    }                   
                              
            },
            onClear: function(){
                this.setDefaultDataToModel();
                this.setMode("Create");
            },
            onDelete: function(){
                var that = this;
                this.getOwnerComponent().getModel().remove("/ProductSet('" + this.prodId + "')",{
                    success: function(){
                        that.onClear();
                        MessageToast.show("Birader! the task is done");
                    }
                });
            },
            mode: "Create",
            setMode: function(sMode){
                this.mode = sMode;
                if(sMode === "Create"){
                    this.getView().byId("prodId").setEnabled(true);
                    this.getView().byId("idSave").setText("Save");
                    this.getView().byId("idDelete").setEnabled(false);
                }else{
                    this.getView().byId("prodId").setEnabled(false);
                    this.getView().byId("idSave").setText("Update");
                    this.getView().byId("idDelete").setEnabled(true);
                }
            },
            prodId: null,
            onSearchProduct: function(oEvent){
                //Step 1: Extarct the product id entered by user
                this.prodId = oEvent.getParameter("value");
                //local variable to be accessed into callback
                //https://www.youtube.com/watch?v=RMsTYQe_3Jg&pp=ygUPdmFyIHRoYXQgPSB0aGlz
                var that = this;
                //Step 2: get the odata object
                var oDataModel = this.getOwnerComponent().getModel();
                //Step 3: Make a call to backend to read single product data
                oDataModel.read("/ProductSet('" + this.prodId + "')",{
                    success: function(data){
                        //if product found then we get data
                        //Set this data to local json model
                        that.oLocalModel.setProperty("/orderData", data);
                        that.setMode("Update");
                    },
                    error: function(oErr){
                        ///handle the error if product not found
                        MessageToast.show("No luck, please try again!");
                    }
                });

            },
            //this is our event handler function to event Route Matched
            //which will trigger every time whenever
            // Route change in the Url
            // Because user navigate to a product
            // Because user use back and forward button
            // Manually changed by user
            // App loaded a route
            herculis: function(oEvent){
                


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
            }
        });
});