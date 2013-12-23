var TableScroller = function (cols, rows) {
    this.currentPage = 1;
    this.pageBuffer = [];
    this.visibleBuffer = [];
    this.maxPageBuffer = 3;
    this.rows = rows;
    this.columns = cols;
    this.pageSize = 200;
    this.previousTop = 0;
    this.rowCount = this.rows.length;
    this.colCount = this.columns.length;
    this.reuseableTbodies = [];
    this.myScroll = null;
    
    //private variables
    var self = this,
        DEFAULT_ROW_HEIGHT = 42,
        DOM = {};

    this.init = function () {
        var pageCount = Math.ceil(this.rowCount / this.pageSize);
        var rowHeight = this.getRowHeight();

        // Adds all rows to a pageBuffer
        for (var i = 0; i < pageCount; i++) {
            this.pageBuffer[i] = this.rows.slice(i * this.pageSize, (i + 1) * this.pageSize);
        }

        //add reference to dom elements
        DOM.tableWrapper = By.id('tableBody');
        DOM.table = By.id('mainTable');
        DOM.fakeTop = By.id('fakeTop');

        this.bind(1);

        DOM.table.style.height = (this.rows.length * rowHeight) + 'px';

        window.addEventListener('load', self.loadScroll, false);
    };

    this.loadScroll = function () { 
        // if (self.isOnTouchDevice()) {
            self.myScroll = new IScroll('#tableBody', { 
                customMaxScrollX: self.rows.length * self.getRowHeight()
            });
            self.myScroll.on('scrollEnd', function () { 
                self.scroll();
            });
        //  } else {
        // DOM.tableWrapper.removeEventListener('scroll');
        // DOM.tableWrapper.addEventListener('scroll', self.scroll);
        // }
    };


    this.scroll = function () {
        var newY = Math.abs(self.myScroll.y);

        self.setCurrentPage(newY)

        // self.detectBigScroll(newY);

        self.myScroll.directionY >= 0 ? self.append() : self.prepend();
    };


    this.removePage = function (pageIndex) {
        if (!pageIndex) return;

        var table = DOM.table,
            DOMPage,
            index = self.visibleBuffer.indexOf(pageIndex);

            DOMPage = By.id('page_' + pageIndex);

        if (DOMPage && index >= 0) {
            this.addReuseableTbody(DOMPage);
            DOM.table.removeChild(DOMPage);

            self.visibleBuffer.splice(index, 1); //remove page from visible buffer                    
        }
    };

    this.removeAllPages = function () {
        var DOMPage;
        while (this.visibleBuffer.length > 0) {
            DOMPage = By.id('page_' + this.visibleBuffer.shift());
            if (DOMPage) {
                this.addReuseableTbody(DOMPage);
                DOM.table.removeChild(DOMPage);
            }
        }
    };

    this.addReuseableTbody = function (tbody) {
        if (typeof tbody === "object") {
            this.reuseableTbodies.push(tbody);
        }
    };

    this.append = function (page) {
        var pageIndexToRemove = self.visibleBuffer[0],
            newPage = page || self.currentPage + 1,
            bufferFull = this.visibleBufferFull();

        if (!self.pageNotInBuffer(newPage)) return;

        if (this.inRange() && self.pageBuffer[pageIndexToRemove]) { //within range

            if (bufferFull) {
                this.removePage(pageIndexToRemove);

                DOM.fakeTop.style.height = parseInt(DOM.fakeTop.style.height) + this.getPageHeight() + 'px';

                //adjust top position since we lost the height of height of the removed els                
                // this.changeTableTop(Math.abs(DOM.table.offsetTop) + this.getPageHeight());
            }

            if (this.pageNotInBuffer(newPage)) self.bind(newPage);

        } else if (self.currentPage === 1) {
                self.bind(newPage);
        }

    };
    this.prepend = function () {
        var pageIndexToRemove = self.visibleBuffer[this.maxPageBuffer - 1],
            newPage = self.currentPage - 1,
            bufferFull = this.visibleBufferFull();

        if (!self.pageNotInBuffer(newPage)) return;

        if (this.inRange()) {    //within range
            if (self.visibleBuffer[0] !== newPage) { //if we don't have the first page in buffer already

                if (bufferFull) this.removePage(pageIndexToRemove);

                self.bind(newPage, false);

                DOM.fakeTop.style.height = parseInt(DOM.fakeTop.style.height) - this.getPageHeight() + 'px';

                // this.changeTableTop(Math.abs(DOM.table.offsetTop) - this.getPageHeight());
            }
        }
    };

    this.bind = function (page, append) {
        if (page > self.pageBuffer.length) return false; // is page number higher than maximum
        if (append === void 0) append = true; // append by default

        var tbody = this.createTbody(page);

        var pageNotInBuffer = this.pageNotInBuffer(page)

        if (append) {
            DOM.table.appendChild(tbody); //update dom
            if (pageNotInBuffer) self.visibleBuffer.push(page);
        } else {
            DOM.table.insertBefore(tbody, DOM.fakeTop.nextSibling); //update dom
            if (pageNotInBuffer) self.visibleBuffer.unshift(page);
        }
        
        if (self.myScroll) self.myScroll.refresh();
    };

    this.createTbody = function (page) {
        return (this.reuseableTbodies.length > 0) ? this.reuseTbody(page) : this.createNewTbody(page);
    };

    this.reuseTbody = function (page) {
        if(this.reuseableTbodies.length < 1) {
            console.error('reusableTbodies is empty, can not reuse');
        }
        
        var tbody = this.reuseableTbodies.shift();
        
        if (typeof tbody === 'undefined') {
            console.error('tbody is undefined', this.reuseableTbodies.length);
        }
        
        var rowsToCreate = this.pageBuffer[page - 1].length;
        if (rowsToCreate < 200) {
            console.log("Too few rows!")
        }

        var i, y, startId, row, rowData, cell, fieldTag;
        tbody.id = "page_" + page;

        for (i = 0; i < rowsToCreate; i++) {
            row = tbody.children[i];
            startId = page === 1 ? 0 : (page - 1) * 200;
            row.id = "row_" + (startId + (i + 1)) ;
            rowData = self.pageBuffer[page - 1][i];

            for (y = 0; y < this.colCount; y++) {
                fieldTag = this.columns[y].FieldTag;
                cell = row.children[y];

                cell.textContent = rowData[fieldTag];
            }
        }
        return tbody;
    };

    this.createNewTbody = function (page) {
        var tbody = this.DOM_Factory('div', 'page_' + page);
        tbody.classList.add('pageBuffer');
        // get real page length to avoid issue with last page being too short
        var rowsToCreate = self.pageBuffer[page - 1].length

        for (var i = 0; i < rowsToCreate; i++) {
            var row = this.createRow(page, i);
            tbody.appendChild(row);
        }
        return tbody;   
    };

    this.createRow = function (page, i) {
        var startId, row, y, fieldTag, cell;
        
        startId = page === 1 ? 0 : (page - 1) * 200;
        row = this.DOM_Factory('div', 'row_' + (startId + (i + 1)));
        row.classList.add('bodyRow');

        for (y = 0; y < this.colCount; y++) {
            fieldTag = this.columns[y].FieldTag;
            cell = this.DOM_Factory('div');

            cell.textContent = self.pageBuffer[page - 1][i][fieldTag];
            row.appendChild(cell);
        }
        return row;
    };

    this.adjustForPage = function (page) {
        this.removeAllPages();
        this.bind(page);
        this.changeTableTop((page - 1) * this.getPageHeight());
    };

    this.inRange = function () {
        return (self.currentPage > 1 && self.currentPage <= self.pageBuffer.length);
    };

    this.pageNotInBuffer = function (pageNumber) {
        return self.visibleBuffer.indexOf(pageNumber) < 0
    };

    this.detectBigScroll = function (scrollTop) {
        var pageHeight = this.getPageHeight(),
            pageJumped = (Math.abs(scrollTop - self.previousTop) > pageHeight);

        //Detect if a page has 'jumped' from a continued scrolling range                     
        if (pageJumped) {
            self.setCurrentPage(scrollTop);
            self.adjustForPage(self.currentPage);
        }
    };

    this.visibleBufferFull = function () {
        return self.visibleBuffer.length >= this.maxPageBuffer;
    };

    this.getRowHeight = function () {
        return DEFAULT_ROW_HEIGHT;
    };

    this.getPageHeight = function () {
        return this.pageSize * this.getRowHeight();
    };

    this.getCurrentPage = function (scrollTop) {
        return Math.abs(Math.floor(scrollTop / self.getPageHeight())) + 1;
    };

    this.setCurrentPage = function (scrollTop) {
        self.currentPage = self.getCurrentPage(scrollTop);
        console.log("Page" + self.currentPage);
    };

    this.changeTableTop = function (top) {
        DOM.table.style.top = top + 'px';
    };

    this.DOM_Factory = function (tag, id) {
        var tag = tag || 'div',
            el = document.createElement(tag);

        if (id) el.id = id;
        return el;
    };

    this.isOnTouchDevice = function () {
        try {
            document.createEvent("TouchEvent");
            return (typeof Touch == "object") ? true : false; //chrome 
        } catch (e) {
            return false;
        }
    };

    this.logger =  function (msg) {     
        if (typeof console !== "undefined" && typeof console.log !== "undefined") {
            console.timeStamp(msg);
        }
    };

    this.init();
};
document.addEventListener('DOMContentLoaded', new TableCreator().init);