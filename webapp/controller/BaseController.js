sap.ui.define(
    ["sap/ui/core/mvc/Controller"],
    function(Controller){
        return Controller.extend("ey.fin.ap.controller.BaseController",{

            //all the suprt class global variables and fx
            x: "Anubhav",
            myReuseCode: function(){
                alert("i am base controller reuse code");
            }

        });
});