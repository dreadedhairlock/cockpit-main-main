sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'cockpit/test/integration/FirstJourney',
		'cockpit/test/integration/pages/cockpitList',
		'cockpit/test/integration/pages/cockpitObjectPage'
    ],
    function(JourneyRunner, opaJourney, cockpitList, cockpitObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('cockpit') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThecockpitList: cockpitList,
					onThecockpitObjectPage: cockpitObjectPage
                }
            },
            opaJourney.run
        );
    }
);