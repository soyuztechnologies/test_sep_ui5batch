sap.ui.define(
    ["ey/fin/ap/controller/BaseController",
     "sap/m/MessageBox",
     "sap/m/MessageToast",
     "sap/ui/core/routing/History"
    ],
    function(BaseController,MessageBox, MessageToast, History){
        return BaseController.extend("ey.fin.ap.controller.Supplier",{
            onInit: function(){
                ///Step 1: get the router object
                this.oRouter = this.getOwnerComponent().getRouter();
                //Step 2: Attach the event = RMH event
                //we also need to pass our controller object explicitly to herculis function
                this.oRouter.getRoute("supplier").attachMatched(this.herculis, this);
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
                var mySuppId = oEvent.getParameter("arguments").suppId;
                //Reconstruct the element path
                var sPath = "/supplier/" + mySuppId;
                //Now we bind here itself for our view2
                this.getView().bindElement(sPath);
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
        });
});