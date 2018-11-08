import { Component } from '@angular/core';

const Highcharts = require('highcharts');

@Component({
    selector: 'course-chart',
    template: `
        <div class="price_block">
            <div class="text">Price of bitcoin to dollar</div>
            <div class="wrap">
                            <div class="item green">MARKET CUP</div>
                            <div class="item dark_blue">PRICE USD</div>
            </div>
        </div>
        <chart type="StockChart" [options]="options"></chart>
    `
})
export class CourseChart {
    height = 400;
    constructor() {
        if (document.documentElement.clientHeight < 800) {
            this.height = 300;
        }
        this.options = {
            chart: {
                height: this.height,
                marginLeft: 34,
                marginRight: 34,
                backgroundColor: 'rgba(255,255,255,0)',
            },

            rangeSelector: {
                enabled: false,
                inputEnabled: false

            },
            legend: {
                borderRadius: 0,
                enabled: false,
                backgroundColor: '#1a212f',
                align: 'right',
                verticalAlign: 'top',
                itemStyle: { "color": "gray" },
                symbolRadius: 0,
                itemHoverStyle: {
                    color: 'lightgray'
                }
            },
            title: {
                text: null
            },
            plotOptions: {
                areaspline: {
                    showInNavigator: true,
                    pointStart: Date.UTC(2017, 5),
                    pointInterval: 3600 * 1000 * 24 * 2,
                },

            },
            tooltip: {
                useHTML: true,
                valueSuffix: ' USD ',
                headerFormat: '<span class="header_chart"style="font-size:14px; color:#009ee3;font-weight:600;">{point.key}, 00:00-08:00 GMT</span><table>',
                footerFormat: '<tr><td class="btc"><i class="fa fa-circle" aria-hidden="true"></i></td><td style="color:lightgray">Price(BTC):</td><td style="color:white">0.684616 USD</td></tr><tr><td class="vol"><i class="fa fa-circle" aria-hidden="true"></i></td><td style="color:lightgray">24 Vol</td><td style="color:white">0.46464 USD</td></tr></table>',
                positioner: function () {
                    return { x: 45, y: 168 };

                }
            },            
            series: [{
                marker: {
                    shape: 'circle',
                    radius: 3,
                    lineColor: 'white',
                    lineWidth: 1.5
                },
                data: [0, 1, 2, 5, 6, 7, 8, 0, 4, 2, 7],
                type: 'areaspline',
                name: 'MARKET CAP',
                lineColor: '#00cec2',
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, "rgba(0, 206, 194, 0.2)"],
                        [1, "rgba(0, 206, 194, 0)"]
                    ]
                },
                tooltip: {
                    useHTML: true,
                    valueSuffix: ' USD ',

                    pointFormat: '<tr><td class="mark"><i class="fa fa-circle" aria-hidden="true"></i></td><td style="color:lightgray">Market Cap:</td><td><span style="color:white">{point.y}</span></td></tr><br/>',

                    fillColor: '#202639',

                }

            }, {
                tooltip: {
                    useHTML: true,
                    valueSuffix: ' USD ',

                    pointFormat: '<tr><td class="price"><i class="fa fa-circle " aria-hidden="true"></i></td><td style="color:lightgray">Price(USD):</td><td><span style="color:white">{point.y}</span></td></tr>',


                    fillColor: '#202639',

                },
                data: [5, 2, 6, 8, 3, 5, 6, 8, 3, 5, 2],
                type: 'areaspline',
                name: 'PRICE USD',
                lineColor: '#00c3ff',
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.Color('#00c3ff').setOpacity(0.2).get('rgba')],
                        [1, Highcharts.Color('#00c3ff').setOpacity(0).get('rgba')]
                    ]
                }

            }],
            colors: ['#00cec2', '#00c3ff'],
            credits: { text: "" },
            navigator: {
                enabled: true,
                height: 40,
                outlineWidth: 0,
                handles: {
                    backgroundColor: '#007ccd',
                    borderColor: '#141925',
                },
                xAxis: {
                    gridLineWidth: 0
                },
                maskFill: 'rgba(102,133,194,0.1)'
            },
            scrollbar: {

                rifleColor: '#007ccd',
                minWidth: 6,
                height: 5,
                buttonBorderWidth: 0,
                barBackgroundColor: '#007ccd',
                barBorderWidth: 0,
                barBorderColor: '#007ccd',
                trackBackgroundColor: '#141925',
                trackBorderColor: '#141925',
                trackBorderWidth: 0,
                buttonBackgroundColor: '#141925',
                buttonArrowColor: '#141925',
            },
            exporting: {
                enabled: false,
            },
            xAxis: {
                zIndex: 0,
                crosshair: false,

                gridLineWidth: 0.1,
                tickWidth: 0,
                lineWidth: 0

            },
            yAxis: {

                gridLineWidth: 0,
                plotLines: [{
                    value: 6,
                    color: 'red',
                    dashStyle: 'LongDashDot',
                    width: 2
                }],
                opposite: false,
                labels: {
                    format: '{value}$'
                }

            }
        };
    }
    options: Object;
}