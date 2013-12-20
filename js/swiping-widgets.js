$(function(){
  new WidgetSlider();
})

var WidgetSlider = function () {
	var self = this;
	this.swiper = null;
	this.$el = null;
	this.widgets = [];
	this.activeBuffer = [];

	this.init = function (selector) {
		selector = (selector && typeof selector === 'string') ? selector : '.swiper-container';
		this.$el = $(selector);

		this.addWidgetPlaceholders();

		this.swiper = this.$el.swiper({
    		mode:'horizontal',
    		keyboardControl: true,
    		grabCursor: true,
    		resistance: '100%',
            speed: 600,
            calculateHeight: true,
    		onSlideChangeStart: this.moveSlide
    	});
    	this.appendWidget(0);
    	this.appendWidget(1);
	};

	this.moveSlide = function (swiper) {
        setTimeout(function () {
            var activeIndex = swiper.activeIndex;
            var previousIndex = swiper.previousIndex

            if  (activeIndex === previousIndex) {
                return;
            } else if (activeIndex > previousIndex) {
                self.appendWidget(activeIndex + 1);
                self.removeWidget(previousIndex - 1);
            } else {
                self.prependWidget(activeIndex - 1);
                self.removeWidget(previousIndex + 1);
            }
        }, 100)
    };


	this.appendWidget = function (index) {
		if (this.widgetExists(index) && !this.inActiveBuffer(index)) {
			this.activeBuffer.push(index);
			this.renderWidget(index);
		}
	};


	this.prependWidget = function (index) {
		if (this.widgetExists(index) && !this.inActiveBuffer(index)) {
			this.activeBuffer.unshift(index);
			this.renderWidget(index);
		}
	};

	this.removeWidget = function (index) {
		if (this.widgetExists(index) && this.inActiveBuffer(index)) {
			var bufferIndex = this.activeBuffer.indexOf(index);
			this.activeBuffer.splice(bufferIndex, 1);
			this.widgets[index].removeFromView();
		}		
	};

	this.inActiveBuffer = function (index) {
		return this.activeBuffer.indexOf(index) >= 0;
	};

	this.widgetExists = function (index) {
		return !!this.widgets[index]
	};

	this.renderWidget = function (index) {
		var widget = this.widgets[index];
		if (!widget.isRendered) {
			widget.render();
		}
	};

	this.addWidgetPlaceholders = function () {
		var wrapper = $('<div>').addClass('swiper-wrapper');
		var types = ['grid', 'barChart', 'pieChart', 'grid', 'barChart', 'pieChart'];
        // var types = ['grid','grid','grid','grid','grid','grid']
		for (var i = 0; i < 6; i++) {
			var type = types[i];
			var placeholder = $('<div>').addClass('swiper-slide')
										.addClass(type)
										.attr('id', 'slide_' + i);

			var widget = new Widget();
			widget.init(type, placeholder);
			this.widgets.push(widget);

			wrapper.append(placeholder);
		}
		this.$el.append(wrapper);
	};

	this.init();
};

var dataSource = {
	getGridData: function () {
		return new TableCreator().generateLargeData();
	},
	getPieChartData: function () {
		return new TableCreator().generateLargeData();
	},
	getBarChartData: function () {
		return new TableCreator().generateLargeData();
	},
}

var Widget = function () {
	this.type = null;
	this.data = null;
	this.isRendered = false;
	this.renderFunction = null;
	this.$wrapper = null;
	this.kendoWidget = null;
	this.dataSource = dataSource;

	this.init = function (type, $wrapper) {
		this.type = type;
		this.$wrapper = $wrapper;
		switch (type) {
		case 'barChart':
			this.initBarChart();
			break;
		case 'pieChart':
			this.initPieChart();
			break;
		case 'grid':
			this.initGrid();
			break;
		default:
		}
	}

	this.removeFromView = function () {
		this.isRendered = false;
		
		(this.type === 'barChart' || this.type === 'pieChart') 
		this.kendoWidget.destroy();
		this.kendoWidget = null;
		this.$wrapper.html('');
	}

	this.initBarChart = function () {
		this.data = this.dataSource.getBarChartData();
		this.renderFunction = function () {
			var widget = $('<div>');
        	this.$wrapper.append(widget);

			widget = widget.kendoChart({
                title: {
                    text: "Site Visitors Stats /thousands/"
                },
                legend: {
                    visible: false
                },
                seriesDefaults: {
                    type: "bar"
                },
                series: [{
                    name: "Total Visits",
                    data: [56000, 63000, 74000, 91000, 117000, 138000]
                }, {
                    name: "Unique visitors",
                    data: [52000, 34000, 23000, 48000, 67000, 83000]
                }],
                valueAxis: {
                    max: 140000,
                    line: {
                        visible: false
                    },
                    minorGridLines: {
                        visible: true
                    }
                },
                categoryAxis: {
                    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    majorGridLines: {
                        visible: false
                    }
                },
                tooltip: {
                    visible: true,
                    template: "#= series.name #: #= value #"
                }
            });
			this.kendoWidget = widget.data('kendoChart');
		}
	};

	this.initPieChart = function () {
		this.data = this.dataSource.getPieChartData();
		this.renderFunction = function () {
			var widget = $('<div>');
        	this.$wrapper.append(widget);

			widget = widget.kendoChart({
                title: {
                    position: "bottom",
                    text: "Share of Internet Population Growth, 2007 - 2012"
                },
                legend: {
                    visible: false
                },
                chartArea: {
                    background: ""
                },
                seriesDefaults: {
                    labels: {
                        visible: true,
                        background: "transparent",
                        template: "#= category #: #= value#%"
                    }
                },
                series: [{
                    type: "pie",
                    startAngle: 150,
                    data: [{
                        category: "Asia",
                        value: 53.8,
                        color: "#9de219"
                    },{
                        category: "Europe",
                        value: 16.1,
                        color: "#90cc38"
                    },{
                        category: "Latin America",
                        value: 11.3,
                        color: "#068c35"
                    },{
                        category: "Africa",
                        value: 9.6,
                        color: "#006634"
                    },{
                        category: "Middle East",
                        value: 5.2,
                        color: "#004d38"
                    },{
                        category: "North America",
                        value: 3.6,
                        color: "#033939"
                    }]
                }],
                tooltip: {
                    visible: true,
                    format: "{0}%"
                }
            });
			this.kendoWidget = widget.data('kendoChart');
		}
	};

	this.initGrid = function () {
		this.data = this.dataSource.getGridData()
        
        this.renderFunction = function () {
        	var widget = $('<div>');
        	this.$wrapper.append(widget);
        	widget = widget.kendoGrid({
            	dataSource: {
            		data: this.data,
                    pageSize: 50,
            		schema: {
            			model: {
            				fields: {
            					Type: { type: "string" },
            					Portfolio: { type: "string" },
            					Category: { type: "string" },
            					ActualValue: { type: "number" },
            					Shares: { type: "number" }
            				}
            			}
            		}
            	},
                scrollable: {
                    virtual: true
                },
                columns: [{
                    field: "Type",
                }, {
                    field: "Portfolio",
                }, {
                    field: "Category",
                    title: "Company Name"
                }, {
                    field: "ActualValue",
                    title: "Actual Value"
                }, {
                	field: "Shares"
                }]
            });
			this.kendoWidget = widget.data('kendoGrid');
		}
	};

	this.render = function () {
		this.renderFunction();
		this.isRendered = true;
	};

};