var TableScroller = function (cols, rows) {
    this.currentPage = 1;
    this.pageCount = -1;
    this.pageBuffer = [];
    this.visibleBuffer = [];
    this.maxPageBuffer = 3;
    this.rows = rows;
    this.columns = cols;
    this.pageSize = 200;
    this.previousTop = 0;
    this.rowCount = this.rows.length;
    this.colCount = this.columns.length;
    this.waitingToScroll = false;
    this.scrollTimeout = null;
    
    //private variables
    var self = this,
        DEFAULT_ROW_HEIGHT = 42,
        WAITING_TIME = 200, // milliseconds
        DOM = {};

    this.init = function () {
        var isTouchDevice = this.isOnTouchDevice();
        var events = {
            onStart: isTouchDevice ? 'touchstart' : 'mousedown',
            onMove: isTouchDevice ? 'touchmove' : 'mousemove',
            onEnd: isTouchDevice ? 'touchend' : 'scroll'
        };

        this.pageCount = Math.ceil(this.rowCount / this.pageSize);
        var rowHeight = this.getRowHeight();

        // Adds all rows to a pageBuffer
        for (var i = 0; i < this.pageCount; i++) {
            this.pageBuffer[i] = this.rows.slice(i * this.pageSize, (i + 1) * this.pageSize);
        }

        //add reference to dom elements
        DOM.tableWrapper = By.id('tableBody');
        DOM.table = By.id('mainTable');
        DOM.scrollY = By.id('virtualScrollY');

        this.bind(1);
        //set virtual scroll area
        DOM.scrollY.style.height = (this.rows.length * rowHeight) + 'px';

        DOM.tableWrapper.removeEventListener(events.onEnd);
        DOM.tableWrapper.addEventListener(events.onEnd, function (e) {

            // var startScroll = function (e) {
            //     self.scrollTimeout = setTimeout(function () {
            //         self.scroll(e);
            //         self.waitingToScroll = false;
            //     }, WAITING_TIME)
            // };

            // if (self.waitingToScroll) {
            //     clearTimeout(self.scrollTimeout);
            //     startScroll(e);
            // } else {
            //     startScroll(e);
            //     self.waitingToScroll = true;
            // }
            self.scroll(e);
            // }
        });
    }

    this.scroll = function (e) {

        var scrollTop = DOM.tableWrapper.scrollTop;

        if (self.previousTop === scrollTop) return;

        var downScroll = this.previousTop < scrollTop;

        self.setCurrentPage(scrollTop)

        self.detectBigScroll(scrollTop);

        if (downScroll) {
            self.scrollDown();
        } else {
            self.scrollUp(scrollTop);
        }

        this.previousTop = scrollTop;
    };

    this.scrollUp = function (scrollTop) {
        if (self.currentPage > 1 || !self.pageNotInBuffer(1)) {
            if (self.pageNotInBuffer(self.currentPage - 1)) {
                self.prepend();
            }

        } else if (scrollTop <= 0) {
            self.adjustForPage(1);
        }
    };

    this.scrollDown = function () {
        if (self.pageNotInBuffer(self.currentPage + 1)) {
            self.append();
        }
    };

    this.removePage = function (pageIndex) {
        var DOMPage = By.id('page_' + pageIndex),
            index = self.visibleBuffer.indexOf(pageIndex);

        if (DOMPage && index >= 0) {
            //bufferHeight = DOMPage.offsetHeight;
            var oldPage = DOM.table.removeChild(DOMPage);
            oldPage = null;
            self.visibleBuffer.splice(index, 1); //remove page from vis buffer                    
            // this.logger('housekept page: ' + (pageIndex));
        }
    };
    this.append = function () {
        var pageIndexToRemove = self.visibleBuffer[0],
            newPage = self.currentPage + 1;

        if (this.inRange() && self.pageBuffer[pageIndexToRemove]) { //within range

            if (self.visibleBuffer.length >= this.maxPageBuffer) {
                this.removePage(pageIndexToRemove);

                //adjust top position since we lost the height of height of the removed els                
                this.changeTableTop(Math.abs(DOM.table.offsetTop) + this.getPageHeight());
            }

            if (this.pageNotInBuffer(newPage)) {
                self.bind(newPage);
            }

        } else if (self.currentPage === 1) {
            if (this.pageNotInBuffer(newPage)) {
                self.bind(newPage);
            }
        }

    };
    this.prepend = function () {
        var pageIndexToRemove = self.visibleBuffer[this.maxPageBuffer - 1],
            yAdjustment = 0,
            newPageIndex = self.currentPage - 1;


        if (this.inRange()) {    //within range
            if (self.visibleBuffer[0] !== newPageIndex) { //if we don't have the first page in buffer already
                // this.logger('pageIndexToRemove: ' + pageIndexToRemove);

                if (self.visibleBuffer.length >= this.maxPageBuffer) {
                    //do some housekeeping                        
                    this.removePage(pageIndexToRemove);
                }

                //newPageIndex = self.visibleBuffer[0] - 1;
                self.bind(newPageIndex, false);
                //this.logger('new page:' + self.page + ', ' + prevBufferEnd + 'px,' + (prevBufferEnd + self.pageSize));
                this.changeTableTop(Math.abs(DOM.table.offsetTop) - this.getPageHeight());
            }
        }
    };

    this.bind = function (page, append) {
        if (append === void 0) append = true;

        if (page > self.pageBuffer.length) return false;

        var tbody = this.createTbody(page);

        var pageNotInBuffer = this.pageNotInBuffer(page)
        if (append) {
            DOM.table.appendChild(tbody); //update dom
            if (pageNotInBuffer) self.visibleBuffer.push(page);
        } else {
            DOM.table.insertBefore(tbody, DOM.table.childNodes[0]); //update dom
            if (pageNotInBuffer) self.visibleBuffer.unshift(page);
        }

        //now that we have rendered, find out rowheight  
        self.rowHeight = this.getRowHeight();
    };

    this.createTbody = function (page) {
        var tbody = this.DOM_Factory('tbody', 'page_' + page);
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
        var row = this.DOM_Factory('tr', 'row_' + page + (i + 1));
            row.classList.add('bodyRow');

        for (var y = 0; y < this.colCount; y++) {
            var fieldTag = this.columns[y].FieldTag;
            var cell = this.DOM_Factory('td');

            cell.textContent = self.pageBuffer[page - 1][i][fieldTag];
            row.appendChild(cell);
        }
        return row;
    };

    this.adjustForPage = function (page) {
        var bufferLength = self.visibleBuffer.length;

        //remove dom pages
        while (bufferLength-- >= 0) {
            this.removePage(self.visibleBuffer[bufferLength], false);
        }
        this.bind(page);

        var offsetHeight = (page - 1) * this.getPageHeight();
        this.changeTableTop(offsetHeight);
        // this.logger('adjust top: ' + DOM.table.style.top);
    };

    ///private functions
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
            // this.logger('Page out of range! Readjusting: ' + scrollTop + ' > ' + (self.currentPage * pageHeight));
            self.setCurrentPage(scrollTop);
            self.adjustForPage(self.currentPage);
        }
    };

    this.getRowHeight = function () {
        // if (!this.bodyRowHeight) {
        //     var bodyRow = By.css('bodyRow')
        //     this.bodyRowHeight = (bodyRow.length > 0) ? bodyRow[0].offsetHeight : DEFAULT_ROW_HEIGHT;
        // }
        // return this.bodyRowHeight
        return DEFAULT_ROW_HEIGHT;
    };

    this.getPageHeight = function () {
        return this.pageSize * this.getRowHeight();
    };

    this.detectOffset = function () {
        var sTop = -1,
            prevBody = By.id('page_' + self.currentPage),
            offsetHeight = this.getRowHeight(),
            scrollTop = DOM.tableWrapper.scrollTop; 

        sTop = scrollTop - offsetHeight * (self.currentPage - 1);

        if (sTop / self.rowHeight > self.pageSize) { //if we the pages has drifted for some reason, readjust page
            self.setCurrentPage(scrollTop)
            // this.logger('Offset exception! Readjusting page ' + self.page);
            self.adjustForPage(self.currentPage);
        }
    };

    this.getCurrentPage = function (scrollTop) {
        return Math.abs(Math.floor(scrollTop / self.getPageHeight())) + 1;
    };

    this.setCurrentPage = function (scrollTop) {
        self.currentPage = self.getCurrentPage(scrollTop);
    };

    this.changeTableTop = function (top) {
        DOM.table.style.top = top + 'px';
    };

    this.DOM_Factory = function (tag, id) {
        var tag = tag || 'div',
            el = document.createElement(tag);

        // if (!el || el instanceof HTMLUnknownElement) { throw 'Tag ' + tag + ' could not be created'; }
        if (id) { el.id = id; }
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