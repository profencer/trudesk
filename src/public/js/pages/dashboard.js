/**
      .                              .o8                     oooo
   .o8                             "888                     `888
 .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
   888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
   888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
   888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
   "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 ========================================================================
 Created:    04/07/2016
 Author:     Chris Brame

 **/

define('pages/dashboard', [
    'jquery',
    'underscore',
    'modules/helpers',
    'countup',
    'c3',
    'd3pie',
    'metricsgraphics',
    'peity',
    'history'

], function($, _, helpers, CountUp, c3, d3pie) {
    var dashboardPage = {};

    dashboardPage.init = function() {
        $(document).ready(function() {
            var testPage = $('#page-content').find('.dashboard');
            if (testPage.length < 1) return;

            helpers.resizeAll();

            var parms = {
                full_width: true,
                height: 250,
                target: '#test',
                x_accessor: 'date',
                y_accessor: 'value',
                y_extended_ticks: true,
                show_tooltips: false,
                aggregate_rollover: true,
                transition_on_update: false,
                colors: ['#2196f3', 'red']
            };

            getData(30);

            $('#select_timespan').on('change', function () {
                var self = $(this);
                getData(self.val());
            });

            function getData(timespan) {
                $.ajax({
                        url: '/api/v1/tickets/stats/' + timespan,
                        method: 'GET',
                        success: function (_data) {
                            parms.data = MG.convert.date(_data.data, 'date');
                            MG.data_graphic(parms);

                            var tCount = _(_data.data).reduce(function (m, x) {
                                return m + x.value;
                            }, 0);
                            var ticketCount = $('#ticketCount');
                            var oldTicketCount = ticketCount.text() == '--' ? 0 : ticketCount.text();
                            var totalTicketText = 'Total Tickets (last ' + timespan + 'd)';
                            if (timespan == 0)
                                totalTicketText = 'Total Tickets (lifetime)';
                            ticketCount.parents('.tru-card-content').find('span.uk-text-small').text(totalTicketText);
                            var theAnimation = new CountUp('ticketCount', oldTicketCount, tCount, 0, 1.5);
                            theAnimation.start();

                            var closedCount = Number(_data.closedCount);
                            var closedPercent = Math.round((closedCount / tCount) * 100);

                            var textComplete = $('#text_complete');
                            var oldTextComplete = textComplete.text() == '--' ? 0 : textComplete.text();
                            var completeAnimation = new CountUp('text_complete', oldTextComplete, closedPercent, 0, 1.5);
                            completeAnimation.start();

                            var pieComplete = $('#pie_complete');
                            pieComplete.text(closedPercent + '/100');
                            pieComplete.peity("donut", {
                                height: 24,
                                width: 24,
                                fill: ["#29b955", "#ccc"]
                            });

                            var responseTime_text = $('#responseTime_text');
                            var responseTime_graph = $('#responseTime_graph');
                            var oldResponseTime = responseTime_text.text() == '--' ? 0 : responseTime_text.text();
                            var responseTime = _data.ticketAvg;
                            var responseTime_animation = new CountUp('responseTime_text', oldResponseTime, responseTime, 0, 1.5);
                            responseTime_animation.start();


                            var lastUpdated = $('#lastUpdated').find('span');
                            lastUpdated.text(_data.lastUpdated);
                        },
                        error: function(err) {
                            console.log('[trudesk:dashboard:getData] Error - ' + err.responseText);
                            helpers.UI.showSnackbar(err.responseText, true);
                        }
                    });
            }
        });
    };

    return dashboardPage;
});