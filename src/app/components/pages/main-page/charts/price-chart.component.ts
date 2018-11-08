import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
const Highcharts = require('highcharts');

@Component({
    selector: 'price-chart',
    template: `
        <chart type='StockChart' class='price-chart' [options]='options' (load)='saveInstance($event.context)'></chart>
    `,
    styleUrls: [
        './price-chart.component.scss'
    ]
})

export class PriceChart implements OnInit, OnChanges {
    chart: any;
    options: Object;
    private tooltipData = [];


    @Input()
    currency: string;
    @Input()
    time: any;
    @Input()
    info: any;

    saveInstance(chartInstance) {
        this.chart = chartInstance;
        this.setData(this.time.name.toLowerCase(), 'priceUsd');
    }

    ngOnInit() { }

    constructor() {
        this.updateChart();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.time) {
            this.setData(changes.time.currentValue.name.toLowerCase(), 'priceUsd');
            this.updateChart();
        }
        if (changes.info) {
            this.info = changes.info.currentValue;
            this.updateChart();
        }
    }

    formatCurrency = (num, fraction = 2) => Number(num).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: fraction,
        minimumFractionDigits: fraction
    });

    findPoint = (points, value) => {
        for (let i = 0; i < points.length; i++) {
            if (points[i].x > value) {
                return i ? points[i - 1] : points[0];
            }
        }
        return points[points.length - 1];
    }

    getAverrage = (array) => array.reduce((res, item) => {
        res += item.y / array.length;
        return res;
    }, 0);

    updateChart() {
        const self = this;
        this.options = {
            chart: {
                backgroundColor: 'rgba(255, 255, 255, 0.0)',
                height: 350
                // marginLeft: 16,
                // marginRight: 66,
                // zoomType: 'x'
            },
            rangeSelector: {
                enabled: false,
                inputEnabled: false
            },
            legend: false,
            title: {
                text: null
            },
            scrollbar: {
                rifleColor: '#565b6b',
                minWidth: 6,
                height: 10,
                buttonBorderWidth: 0,
                barBackgroundColor: '#2c3246',
                barBorderWidth: 0,
                barBorderColor: '#2c3246',
                trackBackgroundColor: '#2c3246',
                trackBorderColor: '#2c3246',
                trackBorderWidth: 0,
                buttonBackgroundColor: '#141925',
                buttonArrowColor: '#141925',
            },
            tooltip: {
                useHTML: true,
                formatter: function () {
                    const tooltip = self.findPoint(self.tooltipData, this.x);
                    return `
                    <div class='coinpage-chart-hover-popup'>
                        <strong class='tooltop-header'>${self.getReadableTimeName()}</strong>
                        <span>
                            <span style='color:${this.color}'>●</span>
                            <span class='title'>Market Cap:</span>
                            <span class='value'>${self.formatCurrency(tooltip.market_cap)}</span>
                        </span>
                        <span>
                            <span style='color: #69b456'>●</span>
                            <span class='title'>Price (USD):</span>
                            <span class='value'>${self.formatCurrency(this.y)}</span>
                        </span>
                        <span>
                            <span style='color: rgba(255, 255, 225, 0.6)'>●</span>
                            <span class='title'>24 Vol:</span>
                            <span class='value'>${self.formatCurrency(tooltip.volume_usd)}</span>
                        </span>
                    </div>
                    `
                },
                positioner: function () {
                    return { x: 10, y: 118 };
                },
                fillColor: '#00adff',
                setOpacity: 0.7
            },
            exporting: {
                enabled: false
            },
            xAxis: {
                zIndex: 0,
                crosshair: false,
                minorGridLineWidth: 0,
                gridLineWidth: 1,
                gridLineColor: 'rgba(255, 255, 255, 0.04)',
                tickWidth: 0,
                lineColor: 'rgba(255, 255, 255, 0.04)',
                lineWidth: 1,
                labels: {
                    style: {
                        fontSize: '9px',
                        color: '#a3a4a9',
                        fontfamily: 'SFUIText-Regular'
                    }
                }
            },
            yAxis: {
                opposite: true,
                gridLineWidth: 0,
                lineColor: 'rgba(255, 255, 255, 0.04)',
                lineWidth: 1,
                tickAmount: 5,
                labels: {
                    format: '${value}',
                    align: 'left',
                    x: 15,
                    style: {
                        fontSize: '9px',
                        color: '#a3a4a9',
                        fontfamily: 'SFUIText-Regular'
                    }
                },
                plotLines: [{
                    color: '#e93d3d',
                    dashStyle: 'longdashdot',
                    value: 2000,
                    width: 2,
                    zIndex: 2,
                    label: {
                        useHTML: true,
                        text: `<span class='average-label'>$2000</span>`,
                        align: 'right',
                        y: 0,
                        x: 45
                    }
                }]
            },
            navigator: {
                series: {
                    type: 'spline',
                    fillOpacity: 0.05,
                    dataGrouping: {
                        smoothed: true
                    },
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    }
                }
            },
            series: [{
                type: 'areaspline',
                name: 'PRICE USD',
                lineColor: '#00adff',
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.Color('#00adff').setOpacity(0.5).get('rgba')],
                        [0.75, Highcharts.Color('#00adff').setOpacity(0).get('rgba')]
                    ]
                },
            }]
        };
    }

    getReadableTimeName() {
        let timeName = this.time.name.toLowerCase();
        return timeName.charAt(0).toUpperCase() + timeName.slice(1);
    }

    setData(period: string, currency: string) {
        if (this.info !== undefined) {
            const data = this.info.info.graphInfo[period][currency].map((value, i) => ({
                x: value[0],
                y: value[1],
                market_cap: this.info.info.marketCapUSD,
                volume_usd: this.info.info.volumeUSD24H
            }))

            this.tooltipData = data;
            this.chart.series[0].setData(data);
            const averagePrice = this.getAverrage(this.tooltipData);
            this.chart.yAxis[0].options.plotLines[0].value = averagePrice;
            this.chart.yAxis[0].options.plotLines[0].label.text = `<span class='average-label'>${this.formatCurrency(averagePrice)}</span>`;
            this.chart.yAxis[0].update();
        }
    }
}
