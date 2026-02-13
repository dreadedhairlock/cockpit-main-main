sap.ui.define(["sap/m/MessageToast"], function (MessageToast) {
  "use strict";

  return {
    /**
     * Generated event handler.
     *
     * @param oEvent the event object provided by the event provider.
     */
    onPressRequestId: async function (oEvent) {
      try {
        // Get the context from the clicked link
        var oLink = oEvent.getSource();
        var oContext = oLink.getBindingContext();

        if (!oContext) {
          MessageToast.show("No context found.");
          return;
        }

        // Execute counting action directly
        const oModel = oContext.getModel();
        const sPath = oContext.getPath();

        // Bind and execute the action
        const oAction = oModel.bindContext(
          `${sPath}/com.sap.gateway.srvd.zr_wm101_cockpit.v0001.counting(...)`,
        );

        await oAction.execute();
        const oBoundContext = oAction.getBoundContext();
        const oResult = oBoundContext.getObject();

        if (oResult) {
          var oCrossAppNavigator = sap.ushell.Container.getService(
            "CrossApplicationNavigation",
          );

          switch (oResult.semantic_object) {
            case "zwm316binstock":
              oCrossAppNavigator
                .toExternal({
                  target: {
                    semanticObject: oResult.semantic_object,
                    action: oResult.action_name,
                  },
                  params: {
                    p_request_id: oResult.request_id,
                  },
                })
                .catch((error) => {
                  MessageToast.show(
                    "Navigation failed: " + (error.message || "Unknown error"),
                  );
                  console.error("Navigation error:", error);
                });
              break;

            case "zwm314masterbox":
              oCrossAppNavigator
                .toExternal({
                  target: {
                    semanticObject: oResult.semantic_object,
                    action: oResult.action_name,
                  },
                  params: {
                    p_group_id: oResult.group_id,
                    p_request_id: oResult.request_id,
                    p_matnr: oResult.material,
                    p_werks: oResult.plant,
                    p_lgpla: oResult.storage_bin,
                  },
                })
                .catch((error) => {
                  MessageToast.show(
                    "Navigation failed: " + (error.message || "Unknown error"),
                  );
                  console.error("Navigation error:", error);
                });
              break;

            case "zcyclecountingim":
              oCrossAppNavigator
                .toExternal({
                  target: {
                    semanticObject: oResult.semantic_object,
                    action: oResult.action_name,
                  },
                  params: {
                    request_id: oResult.request_id,
                  },
                })
                .catch((error) => {
                  MessageToast.show(
                    "Navigation failed: " + (error.message || "Unknown error"),
                  );
                  console.error("Navigation error:", error);
                });
              break;

            case "zwm311countreq":
              oCrossAppNavigator
                .toExternal({
                  target: {
                    semanticObject: oResult.semantic_object,
                    action: oResult.action_name,
                  },
                })
                .catch((error) => {
                  MessageToast.show(
                    "Navigation failed: " + (error.message || "Unknown error"),
                  );
                  console.error("Navigation error:", error);
                });
              break;

            default:
              console.log(
                "No navigation mapping for:",
                oResult.semantic_object,
              );
              break;
          }
        }
      } catch (oError) {
        console.error(oError);

        // Handle errors
        const oMessageManager = sap.ui.getCore().getMessageManager();
        const aMessages = oMessageManager.getMessageModel().getData();

        if (aMessages.length) {
          sap.m.MessageBox.error(aMessages.map((m) => m.message).join("\n"));
          sap.ui.getCore().getMessageManager().removeAllMessages();
        } else {
          sap.m.MessageBox.error(
            "Action failed: " + (oError.message || "Unknown error"),
          );
        }
      }
    },
  };
});
