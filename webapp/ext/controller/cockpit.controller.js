sap.ui.define(
    ["sap/ui/core/mvc/ControllerExtension", "sap/m/MessageToast"],
    function (ControllerExtension, MessageToast) {
        "use strict";

        return ControllerExtension.extend(
            "cockpit.ext.controller.cockpit",
            {
                //private properties
                _plant: null,
                _site: null,

                _counter: null,

                _semanticObject: null,
                _actionName: null,
                // * Private instance props for

                // * Lifecycle hook: called once on extension init
                override: {
                    onInit: function () {
                        // TODO: add any custom init logic here
                        const oMessageManager = sap.ui.getCore().getMessageManager();
                        oMessageManager.registerObject(this.getView(), true);
                        // this._setDefaultValue();
                    },

                    onAfterRendering: function () {
                        this._setDefaultValue();
                    }
                },
                _setDefaultValue: async function () {
                    const oModel = this.base.getExtensionAPI().getModel();
                    const oContext = this.getView().getBindingContext();
                    const oAction = oModel.bindContext(
                        "/cockpit/com.sap.gateway.srvd.zr_wm101_cockpit.v0001.get_default_parameters(...)",
                        oContext
                    );
                    oAction.execute().then(() => {
                        const oBoundContext = oAction.getBoundContext();
                        var oDefaultParams = oBoundContext.getObject();
                        this._plant = oDefaultParams.plant;
                        this._site = oDefaultParams.site;
                        this._counter = oDefaultParams.counter;
                        var lv_counter = oDefaultParams.check_counter;
                        var oView = this.base.getView();
                        var oFilterBar = oView.byId("fe::FilterBar::cockpit");
                        if (oFilterBar) {
                            var oFilterPlant = oView.byId(
                                "fe::FilterBar::cockpit::FilterField::plant" // GANTI EBELN KE FILTER YANG PENGEN DIPAKE
                            );

                            var oFilterSite = oView.byId(
                                "fe::FilterBar::cockpit::FilterField::site" // GANTI EBELN KE FILTER YANG PENGEN DIPAKE
                            );

                            var oFilterStatus = oView.byId(
                                "fe::FilterBar::cockpit::FilterField::status" // GANTI EBELN KE FILTER YANG PENGEN DIPAKE
                            );

                            var oFilterStatus = oView.byId(
                                "fe::FilterBar::cockpit::FilterField::status" // GANTI EBELN KE FILTER YANG PENGEN DIPAKE
                            );

                            var oFilterCounter = oView.byId(
                                "fe::FilterBar::cockpit::FilterField::counter" // GANTI EBELN KE FILTER YANG PENGEN DIPAKE
                            );

                            if (oFilterPlant) {
                                // Set multiple conditions
                                oFilterPlant.setConditions([
                                    {
                                        operator: "EQ",
                                        values: [this._plant],
                                        validated: "Validated",
                                    }
                                ]);
                            } else {
                                sap.m.MessageBox.error(this._getText('noAuthorizationMsg'));
                            }
                            if (oFilterSite) {
                                if (this._site) {
                                    // Set multiple conditions
                                    oFilterSite.setConditions([
                                        {
                                            operator: "EQ",
                                            values: [this._site],
                                            validated: "Validated",
                                        }
                                    ]);
                                }
                            }
                            if (oFilterCounter) {
                                if (this._counter) {
                                    // Set multiple conditions
                                    oFilterCounter.setConditions([
                                        {
                                            operator: "EQ",
                                            values: [this._counter],
                                            validated: "Validated",
                                        }
                                    ]);
                                }
                            }
                            if (lv_counter) {
                                if (oFilterStatus) {
                                    oFilterStatus.setConditions([
                                        {
                                            operator: "NE",
                                            values: ["X"],
                                            validated: "Validated",
                                        },
                                        {
                                            operator: "NE",
                                            values: ["D"],
                                            validated: "Validated",
                                        },
                                    ]);
                                }
                                // Auto trigger search
                                oFilterBar.triggerSearch();
                            }

                        }
                    });



                },
                // * Utility: fetch text from i18n model by key, with optional params
                _getText: function (sKey, aArgs) {
                    return this.getView()
                        .getModel("i18n")
                        .getResourceBundle()
                        .getText(sKey, aArgs);
                },

                // * Opens the file-upload dialog when user clicks “Upload”
                onAddRequest: async function () {
                    const oModel = this.base.getExtensionAPI().getModel();
                    const oContext = this.getView().getBindingContext();
                    const oAction = oModel.bindContext(
                        "/cockpit/com.sap.gateway.srvd.zr_wm101_cockpit.v0001.add_request(...)",
                        oContext
                    );
                    oAction.execute().then(() => {
                        const oBoundContext = oAction.getBoundContext();
                        var oSemanticObject = oBoundContext.getObject();
                        this._semanticObject = oSemanticObject.semantic_object;
                        this._actionName = oSemanticObject.action_name;
                        var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                        oCrossAppNavigator.toExternal({
                                target: {
                                    semanticObject: oSemanticObject.semantic_object,
                                    action: oSemanticObject.action_name
                                }
                            }).catch((error) => {
                                MessageToast.show("Navigation failed: " + (error.message || "Unknown error"));
                                console.error("Navigation error:", error);
                            });
                    });
                },

                // * Handles “Cancel” in the dialog: close, destroy & clear data
                onCancelPress: function () {
                    this.dialog.close();
                    this.dialog.destroy();
                    // this.resetFileData();
                },


                onCancelCounting: async function (oBindingContext, aSelectedContexts) {

                    // console.log( aSelectedContexts)
                    sap.m.MessageBox.confirm("Would you like to perform the action", {
                        title: this._getText('cancelCounting'),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                        onClose: this.onActionConfirmCancelCounting.bind(this, aSelectedContexts)
                    });
                },

                onActionConfirmCancelCounting: async function (aContexts, sAction) {

                    if (sAction !== sap.m.MessageBox.Action.OK) {
                        return;
                    }

                    if (!aContexts?.length) {
                        sap.m.MessageToast.show("No records selected.");
                        return;
                    }

                    const oModel = aContexts[0].getModel();

                    try {
                        console.log(aContexts)
                        await Promise.all(
                            aContexts.map(async (oContext) => {
                                const sPath = oContext.getPath();
                                const oAction = oModel.bindContext(`${sPath}/com.sap.gateway.srvd.zr_wm101_cockpit.v0001.cancel_counting(...)`);
                                await oAction.execute();
                            })
                        );

                        sap.m.MessageToast.show(this._getText('cancelCountingMsg'));
                        await oModel.refresh();
                    } catch (oError) {
                        console.error(oError);
                        sap.m.MessageBox.error(this._getText('requestFailedMsg'));
                    }

                },



                onCompleteCounting: async function (oBindingContext, aSelectedContexts) {
                    sap.m.MessageBox.confirm("Would you like to perform the action", {
                        title: this._getText('completeCounting'),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                        onClose: this.onConfirmCompleteCounting.bind(this, aSelectedContexts)
                    });
                },

                onConfirmCompleteCounting: async function (aContexts, sAction) {

                    if (sAction !== sap.m.MessageBox.Action.OK) {
                        return;
                    }

                    if (!aContexts?.length) {
                        sap.m.MessageToast.show("No records selected.");
                        return;
                    }

                    const oModel = aContexts[0].getModel();

                    try {
                        console.log(aContexts)
                        await Promise.all(
                            aContexts.map(async (oContext) => {
                                const sPath = oContext.getPath();
                                const oAction = oModel.bindContext(`${sPath}/com.sap.gateway.srvd.zr_wm101_cockpit.v0001.complete_counting(...)`);
                                await oAction.execute();
                            })
                        );

                        sap.m.MessageToast.show(this._getText('completeCountingMsg'));
                        await oModel.refresh();
                    } catch (oError) {
                        console.error(oError);
                        sap.m.MessageBox.error(this._getText('requestFailedMsg'));
                    }

                },
                onCounting: async function (oBindingContext, aSelectedContexts) {

                    // console.log( aSelectedContexts)
                    sap.m.MessageBox.confirm("Would you like to perform the action", {
                        title: this._getText('counting'),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                        onClose: this.onActionConfirmCounting.bind(this, aSelectedContexts)
                    });
                },

                onActionConfirmCounting: async function (aContexts, sAction) {

                    if (sAction !== sap.m.MessageBox.Action.OK) {
                        return;
                    }

                    if (!aContexts?.length) {
                        sap.m.MessageToast.show("No records selected.");
                        return;
                    }

                    const oModel = aContexts[0].getModel();

                    try {
                        const aResults = await Promise.all(
                            aContexts.map(async (oContext) => {
                                const sPath = oContext.getPath();
                                const oAction = oModel.bindContext(`${sPath}/com.sap.gateway.srvd.zr_wm101_cockpit.v0001.counting(...)`);
                                await oAction.execute();
                                const oBoundContext = oAction.getBoundContext();
                                return oBoundContext.getObject();
                            })
                        );
                        await oModel.refresh();
                        this._externalNavigation(aResults[0]);
                    } catch (oError) {
                        console.error(oError);
                        const oMessageManager = sap.ui.getCore().getMessageManager();
                        const aMessages = oMessageManager.getMessageModel().getData();

                        if (aMessages.length) {
                            sap.m.MessageBox.error(
                                aMessages.map(m => m.message).join("\n")
                            );
                            sap.ui.getCore().getMessageManager().removeAllMessages();
                            return;
                        }
                        // console.error(oError);
                        // sap.m.MessageBox.error(this._getText('requestFailedMsg'));
                        return;
                    }
                },

                _externalNavigation: function (oParams) {

                    var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

                    switch (oParams.semantic_object) {
                        case 'zwm316binstock':
                            oCrossAppNavigator.toExternal({
                                target: {
                                    semanticObject: oParams.semantic_object,
                                    action: oParams.action_name
                                },
                                params: {
                                    "p_request_id": oParams.request_id
                                }
                            }).catch((error) => {
                                MessageToast.show("Navigation failed: " + (error.message || "Unknown error"));
                                console.error("Navigation error:", error);
                            });
                            break;
                        case 'zwm314masterbox':
                            oCrossAppNavigator.toExternal({
                                target: {
                                    semanticObject: oParams.semantic_object,
                                    action: oParams.action_name
                                },
                                params: {
                                    "p_group_id": oParams.group_id,
                                    "p_request_id": oParams.request_id,
                                    "p_matnr": oParams.material,
                                    "p_werks": oParams.plant,
                                    "p_lgpla": oParams.storage_bin,
                                }
                            }).catch((error) => {
                                MessageToast.show("Navigation failed: " + (error.message || "Unknown error"));
                                console.error("Navigation error:", error);
                            });
                            break;
                        case 'zcyclecountingim':
                            oCrossAppNavigator.toExternal({
                                target: {
                                    semanticObject: oParams.semantic_object,
                                    action: oParams.action_name
                                },
                                params: {
                                    "request_id": oParams.request_id
                                }
                            }).catch((error) => {
                                MessageToast.show("Navigation failed: " + (error.message || "Unknown error"));
                                console.error("Navigation error:", error);
                            });
                            break;
                        case 'zwm311countreq':
                            oCrossAppNavigator.toExternal({
                                target: {
                                    semanticObject: oParams.semantic_object,
                                    action: oParams.action_name
                                }
                            }).catch((error) => {
                                MessageToast.show("Navigation failed: " + (error.message || "Unknown error"));
                                console.error("Navigation error:", error);
                            });
                            break;
                        default:
                            break;
                    }
                    //     if (oParams.semantic_object = 'zwm316binstock'){
                    //     oCrossAppNavigator.toExternal({
                    //         target: {
                    //             semanticObject: oParams.semantic_object,
                    //             action: oParams.action_name
                    //         },
                    //         params: {
                    //             "p_request_id": oParams.request_id,
                    //             "p_bin": oParams.storage_bin,
                    //             "p_site": oParams.site,
                    //             "p_location": oParams.location,
                    //             "p_deadline_date": oParams.deadline_datetime,
                    //             "p_warehouse": oParams.warehouse,
                    //             "p_request_status": oParams.status, 
                    //         }
                    //     }).catch((error) => {
                    //         MessageToast.show("Navigation failed: " + (error.message || "Unknown error"));
                    //         console.error("Navigation error:", error);
                    //     });
                    // } else if (oParams.semantic_object = 'zwm314masterbox') {
                    //      oCrossAppNavigator.toExternal({
                    //         target: {
                    //             semanticObject: oParams.semantic_object,
                    //             action: oParams.action_name
                    //         },
                    //         params: {
                    //             "p_group_id" : oParams.group_id,
                    //             "p_request_id": oParams.request_id,
                    //             "p_matnr": oParams.material,
                    //             "p_werks": oParams.plant,
                    //             "p_lgpla": oParams.storage_bin,
                    //         }
                    //     }).catch((error) => {
                    //         MessageToast.show("Navigation failed: " + (error.message || "Unknown error"));
                    //         console.error("Navigation error:", error);
                    //     });
                    // } else if (oParams.semantic_object = 'zcyclecountingim') {
                    //      oCrossAppNavigator.toExternal({
                    //         target: {
                    //             semanticObject: oParams.semantic_object,
                    //             action: oParams.action_name
                    //         }
                    //     }).catch((error) => {
                    //         MessageToast.show("Navigation failed: " + (error.message || "Unknown error"));
                    //         console.error("Navigation error:", error);
                    //     });
                    // }
                }

            }
        );
    }
);
