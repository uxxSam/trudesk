/**
      .                              .o8                     oooo
   .o8                             "888                     `888
 .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
   888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
   888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
   888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
   "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 ========================================================================
 Created:    07/24/2016
 Author:     Chris Brame

 **/

define('pages/settingsTicketTypes', [
    'jquery',
    'modules/helpers',
    'datatables',
    'dt_responsive',
    'dt_grouping',
    'dt_scroller',
    'history'

], function($, helpers) {
    var settingsTicketTypesPage = {};

    settingsTicketTypesPage.init = function(callback) {
        $(document).ready(function() {
            var table = $('#ticketTypesTable');
            table.dataTable({
                searching: false,
                bLengthChange: false,
                bPaginate: false,
                bInfo: false,
                bSort: false,
                scrollY: '100%',
                order: [[1, 'desc']],
                columnDefs: [
                    {"width": "50px", "targets": 0},
                    {"width": "100%", "targets": 1}
                    // {"width": "15%", "targets": 2}
                ],
                "oLanguage": {
                    "sEmptyTable": "No tags to display."
                }
            });


            helpers.resizeDataTables('.ticketTypeList');

            if (typeof callback === 'function')
                return callback();
        });
    };

    return settingsTicketTypesPage;
});