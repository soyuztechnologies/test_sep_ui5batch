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
        return BaseController.extend("ey.fin.ap.controller.Add",{
            onInit: function(){
                ///Step 1: get the router object
                this.oRouter = this.getOwnerComponent().getRouter();
                //Step 2: Attach the event = RMH event
                //we also need to pass our controller object explicitly to herculis function
                this.oRouter.getRoute("addProduct").attachMatched(this.herculis, this);

                //Create a local json model
                this.oLocalModel = new JSONModel();
                this.setDefaultDataToModel();
                this.getView().setModel(this.oLocalModel,"local");
            },
            setDefaultDataToModel: function(){
                this.oLocalModel.setData({
                    "prodData": {
                        "PRODUCT_ID" : "",
                        "TYPE_CODE" : "PR",
                        "CATEGORY" : "Notebooks",
                        "NAME" : "",
                        "DESCRIPTION" : "",
                        "SUPPLIER_ID" : "0100000052",
                        "SUPPLIER_NAME" : "Asia High tech",
                        "TAX_TARIF_CODE" : "1 ",
                        "MEASURE_UNIT" : "EA",
                        "PRICE" : "0.00",
                        "CURRENCY_CODE" : "USD",
                        "DIM_UNIT" : "CM",
                        "PRODUCT_PIC_URL" : "/sap/public/bc/NWDEMO_MODEL/IMAGES/"
                    }
                });
            },
            onSave: function(){
                //Extract the payload from local model
                var payload = this.oLocalModel.getProperty("/prodData");
                //Validate the data here itself before sending to Fiori
                if(!payload.PRODUCT_ID){
                    MessageBox.error("There is an issue with product id 😊");
                    return;
                }
                if(!payload.NAME){
                    MessageBox.error("There is an issue with name 😊");
                    return;
                }
                if(!payload.SUPPLIER_ID){
                    MessageBox.error("There is an issue with supplier id 😊");
                    return;
                }
                //get the odata model object 
                var oDataModel = this.getOwnerComponent().getModel();

                if(this.mode === "Create"){
                    //Prepration of the data
                    payload.PRODUCT_PIC_URL = payload.PRODUCT_PIC_URL + payload.PRODUCT_ID + ".jpg";
                    //send the call to sap backend
                    oDataModel.create("/ProductSet", payload,{
                        success: function(data){
                            MessageToast.show("Wallah! The product was POSTed to SAP now!");
                        },
                        error: function(oErr){
                            debugger;
                            MessageBox.error(JSON.parse(oErr.responseText).error.innererror.errordetails[0].message);
                        }
                    });
                }else{
                    oDataModel.update("/ProductSet('" + this.prodId + "')", payload,{
                        success: function(data){
                            MessageToast.show("Wallah! The product was Updated to SAP now!");
                        },
                        error: function(oErr){
                            debugger;
                            MessageBox.error(JSON.parse(oErr.responseText).error.innererror.errordetails[0].message);
                        }
                    });
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
                    //Step 1: Get the selected item from event
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    //Step 2: get the title of selected item - cityname
                    var sId = oSelectedItem.getTitle();
                    var sSuppName = oSelectedItem.getDescription();
                    //Step 3: Set the data back to same field
                    this.oLocalModel.setProperty("/prodData/SUPPLIER_ID", sId);
                    this.oLocalModel.setProperty("/prodData/SUPPLIER_NAME", sSuppName);
                              
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
                        that.oLocalModel.setProperty("/prodData", data);
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