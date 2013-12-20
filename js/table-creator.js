var TableCreator = function () {
	this.noRows = 200;
	var self = this;

    this.columnSettings = [
        { "FieldTag": "ID", "Caption": "ID", "BasicType": "Int", "UIType": "Int", "Sequence": 0, "Aggregate": "Max", "Width": 60, "IsHidden": false, "IsCustomizable": true },
        { "FieldTag": "Category", "Caption": "Category", "BasicType": "String", "UIType": "UILabel", "Sequence": 7, "Width": 100, "IsHidden": false, "IsCustomizable": true },
        { "FieldTag": "ActualValue", "Caption": "Value", "BasicType": "Float", "UIType": "Currency", "Sequence": 3, "Aggregate": "Sum", "Width": 150, "IsHidden": false, "IsCustomizable": true },
        { "FieldTag": "Portfolio", "Caption": "Portfolio", "BasicType": "String", "UIType": "UILabel", "Sequence": 1, "Width": 220, "IsHidden": false, "IsCustomizable": true }
    ];

    this.init = function () {
    	window.ts = new TableScroller(self.columnSettings, self.generateLargeData());
    };

    this.createRow = function (i) {
    	var row = {}
	    row.ID = i + 1;
	    row.Description = (Math.floor(Math.random() * (100000))).toString() + " Longer description with an growing id..";

	    if (i % 2 === 0) {
	        row.Category = 'Passed';
	    } else if (i % 3 === 0) {
	        row.Category = 'Warning';
	    } else {
	        row.Category = 'Error';
	    }

	    if (i < (window.noRows - window.noRows * 2 / 3)) {
	        row.Type = 'Portfolio';
	    } else if (i > (window.noRows - window.noRows * 2 / 3) && i < (window.noRows - window.noRows / 3)) {
	        row.Type = 'Group';
	    } else {
	        row.Type = 'Composite Group';
	    }

	    row.DriftPer = Math.round((Math.random() * 33));
	    row.ActualValue = Math.floor(Math.random() * (100000)) + Math.round((Math.random() * 100)) / 100; 

	    if (i % 2 === 0) {
	        row.Portfolio = 'MARIA DRINAN';
	    } else if (i % 3 === 0) {
	        row.Portfolio = 'HUGH L PRATHER, III';
	    } else if (i % 5 === 0) {
	        row.Portfolio = 'SAMUEL A THOMPSON IRA';
	    } else {
	        row.Portfolio = 'SUTTON A. MACQUEEN ';
	    }

	    row.Shares = Math.round(Math.random() * 1000);
	    row.Date = new Date(Math.floor(Math.random() * (1350000000000)));
	    row.Time = row.Date;

	    return row;
	};

	this.generateLargeData = function () {
        var i = 0;

        var rows = [];
        while (i < this.noRows) {
            rows.push(this.createRow(i));
            i++;
        };
        return rows;
    };

};

// document.addEventListener('DOMContentLoaded', new TableCreator().init);
