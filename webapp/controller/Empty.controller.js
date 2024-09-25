sap.ui.define(
    ["ey/fin/ap/controller/BaseController",
     "sap/m/MessageBox",
     "sap/m/MessageToast"
    ],
    function(BaseController,MessageBox, MessageToast){
        return BaseController.extend("ey.fin.ap.controller.Empty",{
            onBack: function(){
                this.getView().getParent().to("idView1");
            }
        });
});