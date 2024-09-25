sap.ui.define(
    ["sap/ui/core/UIComponent"],
    function(UIComponent){
        return UIComponent.extend("ey.fin.ap.Component",{
            metadata:{
                manifest: "json"
            },
            init : function(){
                //call the base class constructor because it will offer 
                //many functionality out-of-box -- super->constructor
                UIComponent.prototype.init.apply(this);
                
                //get routing object
                var oRouter = this.getRouter();
                //initialize
                oRouter.initialize();

            },
            // createContent: function(){

            //     ///Root view of our app which is initilized by Component.js
            //     var oAppView = new sap.ui.view({
            //         id: "idAppView",
            //         viewName: "ey.fin.ap.view.App",
            //         type: "XML"
            //     });

            //     ///Create my view1 object
            //     var oView1 = new sap.ui.view({
            //         id: "idView1",
            //         viewName: "ey.fin.ap.view.View1",
            //         type: "XML"
            //     });

            //     //Create the view 2 object also
            //     var oView2 = new sap.ui.view({
            //         id:"idView2",
            //         viewName: "ey.fin.ap.view.View2",
            //         type: "XML"
            //     });

            //     ///Create object of empty view
            //     var oEmpty = new sap.ui.view({
            //         id:"idEmpty",
            //         viewName: "ey.fin.ap.view.Empty",
            //         type: "XML"
            //     });

            //     //Get the object of app container which is inside app view
            //     var oAppCon = oAppView.byId("idAppCon");

            //     //Add a page inside that app con - master(left)
            //     oAppCon.addMasterPage(oView1);
            //     //Add my second view in the app container - detail(right)
            //     oAppCon.addDetailPage(oEmpty).addDetailPage(oView2);

            //     return oAppView;
            //     //return new sap.m.Button({text: "Its working or not?"});
            // },
            destory: function(){

            }
        });
});