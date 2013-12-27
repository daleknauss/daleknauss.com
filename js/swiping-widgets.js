var WidgetSlider = function () {
	var self = this;
	this.swiper = null;
	this.$el = null;
	this.widgets = [];
	this.activeBuffer = [];

	this.init = function (selector) {
		selector = (selector && typeof selector === 'string') ? selector : '.swiper-container';
		this.$el = $(selector);
        
        var startIndex = Utils.getQueryParams().widgetId;
        startIndex = startIndex ? Number(startIndex) : 0;

		this.addWidgetPlaceholders();

		this.swiper = this.$el.swiper({
    		mode:'horizontal',
    		keyboardControl: true,
    		grabCursor: true,
            initialSlide: startIndex,
            speed: 400,
            calculateHeight: true,
            touchRatio: 0.8,
            moveStartThreshold: 100,
    		onSlideChangeStart: this.moveSlide
    	});

        this.addArrowEvents();

        this.appendWidget(startIndex - 1);
        this.appendWidget(startIndex);
        this.appendWidget(startIndex + 1);
	};

    this.addArrowEvents = function () {
        $('.nav-arrow-left').on('click', function () {
            self.swiper.swipePrev()
        });
        $('.nav-arrow-right').on('click', function () {
            self.swiper.swipeNext()
        });

    }

	this.moveSlide = function (swiper) {
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

        Utils.replaceQueryParam('widgetId', activeIndex);
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
		var $container = $('<div>').addClass('swiper-wrapper'),
		    types = ['grid', 'barChart', 'pieChart', 'grid', 'barChart', 'pieChart', 'grid', 'barChart', 'pieChart'],
            i, type, $wrapper;

		for (i = 0; i < types.length; i++) {
			type = types[i];
			$wrapper = this.createWidgetWrapper(type, i+1)

            this.initializeWidget(type, $wrapper)
			$container.append($wrapper);
		}

		this.$el.append($container);
	};

    this.createWidgetWrapper = function (type, index) {
        return $('<div>').addClass('swiper-slide')
                         .addClass(type)
                         .attr('id', 'slide_' + index);
    };

    this.initializeWidget = function (type, $wrapper) {
        var widget = new Widget();
        widget.init(type, $wrapper);
        this.widgets.push(widget);
    };
};

var dataSource = {
	getGridData: function () {
		return new TableCreator(1000).generateLargeData();
	},
	getPieChartData: function () {
		return new TableCreator(1000).generateLargeData();
	},
	getBarChartData: function () {
		return new TableCreator(1000).generateLargeData();
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
            console.error("Type " + type + " does not exist!")
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
		this.renderFunction = this.renderBarChart;
	};

    this.renderBarChart = function () {
        var widget = $('<div>');
        this.$wrapper.append(widget);

            widget = widget.kendoChart({
                title: {
                    text: "Site Visitors Stats"
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
                },
                categoryAxis: {
                    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                }
            });
        this.kendoWidget = widget.data('kendoChart');
    };

	this.initPieChart = function () {
		this.data = this.dataSource.getPieChartData();
		this.renderFunction = this.renderPieChart;
	};

    this.renderPieChart = function () {
        var widget = $('<div>');
        this.$wrapper.append(widget);

        widget = widget.kendoChart({
            title: {
                text: "Share of Internet Population Growth, 2007 - 2012"
            },
            legend: {
                visible: false
            },
            seriesDefaults: {
                labels: {
                    visible: true,
                    template: "#= category #: #= value#%"
                }
            },
            series: [{
                type: "pie",
                data: [{
                    category: "Asia",
                    value: 33.8,
                },{
                    category: "Europe",
                    value: 26.1,
                },{
                    category: "Latin America",
                    value: 21.3,
                },{
                    category: "Africa",
                    value: 9.6,
                },{
                    category: "Middle East",
                    value: 5.2,
                },{
                    category: "North America",
                    value: 3.6,
                }]
            }]
        });
        this.kendoWidget = widget.data('kendoChart');
    }

	this.initGrid = function () {
		this.data = this.dataSource.getGridData()
        this.renderFunction = this.renderGrid;
	};

    this.renderGrid = function () {
        var widget = $('<div>');
        this.$wrapper.append(widget);
        widget = widget.kendoGrid({
            dataSource: {
                data: this.data,
                pageSize: 50,
            },
            height: 600,
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
    };

	this.render = function () {
		this.renderFunction();
		this.isRendered = true;
	};

};

Utils = {
    replaceQueryParam: function (key, value) {
        var params = this.getQueryParams();
        params[key] = value;
        var newQuery = '';
        for (param in params) {
            newQuery += '&' + param + '=' + params[param];
        }
        
        history.replaceState({}, "", '?' + newQuery.substring(1));
    },
    getQueryParams: function () {
        var query, params;

        query = window.location.search.substring(1);

        params = Utils.parseParams(query);

        return params;
    },

    parseParams: function (paramString) {
        var query = paramString,
            params = query.split('&'),
            complete = {};

        if (query.length === 0) return complete;

        for (var i = 0; i < params.length; i++) {
            var pair = params[i].split('=');
            //not all params have an equal sign
            complete[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }

        return complete;
    }
}
            

$(function(){
  new WidgetSlider().init();
});
