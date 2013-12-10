var TableScroller = function (cols, rows) {
    this.currentPage = 1;
    this.pageCount = -1;
    this.pageBuffer = [];
    this.visibleBuffer = [];
    this.maxPageBuffer = 3;
    this.rows = rows;
    this.columns = cols;
    this.pageSize = 200,
    this.previousTop = 0,
    this.downScroll = true;
    this.rowCount = this.rows.length;
    this.colCount = this.columns.length;
    
    //private variables
    var self = this,
        DEFAULT_ROW_HEIGHT = 42,
        DOM = {};

    this.init = function () {
        var isTouchDevice = this.isOnTouchDevice();
        var events = {
            onStart: isTouchDevice ? 'touchstart' : 'mousedown',
            onMove: isTouchDevice ? 'touchmove' : 'mousemove',
            onEnd: isTouchDevice ? 'touchend' : 'scroll'
        };

        this.pageCount = Math.ceil(this.rowCount / this.pageSize);
        this.rowHeight = this.getRowHeight();

        for (var i = 0; i < self.pageCount; i++) {
            self.pageBuffer[i] = this.rows.slice(i * this.pageSize, (i + 1) * this.pageSize);
        }

        //add reference to dom elements
        DOM.tableWrapper = By.id('tableBody');
        DOM.table = By.id('mainTable');
        DOM.scrollY = By.id('virtualScrollY');

        this.bind(1);
        //set virtual scroll area
        DOM.scrollY.style.height = (this.rows.length * this.rowHeight) + 'px';

        //initialize events
        DOM.tableWrapper.addEventListener(events.onStart, function (e) {
            //todo;put in multitouch check
            if (this.isStarted) {
                e.preventDefault();
                return;
            }
            this.isStarted = true;
            // this.startTime = new Date();
            // this.logger('start:' + this.startTime.getMilliseconds() + ',' + this.isStarted);
        });
        DOM.tableWrapper.addEventListener(events.onEnd, function (e) {
            //todo;put in multitouch check
            self.scroll(e);
            this.isStarted = false;
        });

        DOM.tableWrapper.removeEventListener('scroll');
        DOM.tableWrapper.addEventListener('scroll', function (e) {
            if (isTouchDevice) {

                // this.detectOffset();
                self.scroll(e);
            } else { //desktop
                self.scroll(e);
            }
        });
    }

    this.scroll = function (e) {

        var scrollTop = DOM.tableWrapper.scrollTop,
            pageTop = -1,
            rowTop = -1,
            offsetHeight = 0,
            rowViewTop = 0;


        if (self.previousTop === scrollTop) {
            this.logger('same top figure out to ignore or relevance for ipad');
            //return;
        }

        self.downScroll = this.previousTop < scrollTop;

        self.currentPage = Math.abs(Math.floor(scrollTop / (self.rowHeight * self.pageSize))) + 1;

        this.detectBigScroll(scrollTop);

        //dimension calculations                                
        pageTop = this.inRange() ? scrollTop - offsetHeight * (self.currentPage - 1) : scrollTop;
        rowTop = pageTop / self.rowHeight + 1;
        rowViewTop = (scrollTop / self.rowHeight);

        prevBody = (self.currentPage > 1) ? By.id('page_' + self.currentPage - 1) : null;
        offsetHeight = (prevBody) ? prevBody.offsetHeight : -1; //save height so we can adjust the top later


        // this.logger('onend:' + //self.buffer.length +
        //     ', scrollTop: ' + scrollTop +
        //     ', curr Page: ' + self.currentPage +
        //     ', visible pages: ' + self.visibleBuffer.join(',') +
        //     ', Row on top of Paged: ' + Math.round(rowTop) +
        //     ', Rowtop: ' + rowViewTop.toFixed(2) +
        //     ', Buff PageTop: ' + pageTop);

        if (self.downScroll) {
            if (self.visibleBuffer.indexOf(self.currentPage + 1) < 0) {
                self.append();
            } else {
                this.logger('next page ' + (self.currentPage + 1) + ' is in buffer');
            }
        } else {
            if (self.currentPage > 1 || self.visibleBuffer.indexOf(1) >= 0) {

                if (self.visibleBuffer.indexOf(self.currentPage - 1) < 0) {
                    self.prepend();

                } else {
                    this.logger('prev page ' + (self.currentPage - 1) + ' already in buffer');
                }
            } else {
                if (scrollTop <= 0) {
                    this.adjustForPage(1);
                }
            }
        }
        this.previousTop = DOM.tableWrapper.scrollTop;
    };
    this.houseKeep = function (pageIndex) {
        var DOMPage = By.id('page_' + pageIndex),
            index = self.visibleBuffer.indexOf(pageIndex);

        if (DOMPage && index >= 0) {
            //bufferHeight = DOMPage.offsetHeight;
            DOM.table.removeChild(DOMPage);
            self.visibleBuffer.splice(index, 1); //remove page from vis buffer                    
            // this.logger('housekept page: ' + (pageIndex));
        }
    };
    this.append = function () {
        var pageIndexToRemove = self.visibleBuffer[0],
            newPage = self.currentPage + 1, yAdjustment = 0;

        if (this.inRange() && self.pageBuffer[pageIndexToRemove]) { //within range
            prevBufferEnd = self.pageBuffer[pageIndexToRemove].length; //* self.page //pageIndexToRemove offsetHeight

            if (self.visibleBuffer.length >= this.maxPageBuffer) {
                //do some housekeeping
                yAdjustment = Math.abs(By.id('page_' + pageIndexToRemove).offsetHeight); //save the height for later adjustment
                this.houseKeep(pageIndexToRemove);

                //adjust top position since we lost the height of height of the removed els                
                DOM.table.style.top = (Math.abs(DOM.table.offsetTop) + yAdjustment) + 'px';
                // this.logger('yAdjustment: ' + (DOM.table.offsetTop + yAdjustment) + 'px');
            }
            if (self.visibleBuffer.indexOf(newPage) < 0) {
                self.bind(newPage);
                // this.logger('new page:' + prevBufferEnd + ',' + (prevBufferEnd + self.pageSize));
            }

        } else if (self.currentPage === 1) {
            if (self.visibleBuffer.indexOf(newPage) < 0) {
                self.bind(newPage);
                // this.logger('new page:' + self.pageSize + ',' + (self.pageSize * 2));
            }
        }

    };
    this.prepend = function () {
        var pageIndexToRemove = self.visibleBuffer[this.maxPageBuffer - 1],
            yAdjustment = 0,
            newPageIndex = self.currentPage - 1;


        if (this.inRange()) {    //within range
            if (self.visibleBuffer[0] !== newPageIndex) { //if we don't have the first page in buffer already
                this.logger('pageIndexToRemove: ' + pageIndexToRemove);

                if (self.visibleBuffer.length >= this.maxPageBuffer) {
                    //do some housekeeping                        
                    this.houseKeep(pageIndexToRemove);
                }

                //newPageIndex = self.visibleBuffer[0] - 1;
                self.bind(newPageIndex, false);
                //this.logger('new page:' + self.page + ', ' + prevBufferEnd + 'px,' + (prevBufferEnd + self.pageSize));
                yAdjustment = Math.abs(By.id('page_' + newPageIndex).offsetHeight); //save the height for later adjustment
                DOM.table.style.top = (Math.abs(DOM.table.offsetTop) - yAdjustment) + 'px';
            }
        }
    };
    this.bind = function (page, append) {
        append = append ? append : true;

        if (page > self.pageBuffer.length) { return false; }

        var tbody = this.DOM_Factory('tbody', 'page_' + page);
        tbody.classList.add('pageBuffer');

        for (i = 0; i < this.pageSize; i++) {

            var row = this.DOM_Factory('tr', 'row_' + page + (i + 1));
            row.classList.add('bodyRow');

            for (y = 0; y < this.colCount; y++) {
                var fieldTag = this.columns[y].FieldTag;

                var cell = this.DOM_Factory('td');

                cell.textContent = self.pageBuffer[page - 1][i][fieldTag];
                row.appendChild(cell);
            }

            tbody.appendChild(row);
        }

        if (append) {
            DOM.table.appendChild(tbody); //update dom
            //update, todo add pubsub pattern to visiblebuffer
            if (self.visibleBuffer.indexOf(page) < 0) {
                self.visibleBuffer.push(page);
            }
        } else {
            DOM.table.insertBefore(tbody, DOM.table.childNodes[0]); //update dom
            if (self.visibleBuffer.indexOf(page) < 0) {
                self.visibleBuffer.unshift(page);
            }
        }
        this.logger("New tbody Added");

        //now that we have rendered, find out rowheight  
        
        self.rowHeight = this.getRowHeight();
    }
    this.adjustForPage = function (page) {
        var bufferLength = self.visibleBuffer.length;

        //remove dom pages
        while (bufferLength-- >= 0) {
            this.houseKeep(self.visibleBuffer[bufferLength], false);
        }
        this.bind(page);

        var offsetHeight = (page - 1) * self.pageSize * self.rowHeight;
        DOM.table.style.top = offsetHeight + 'px';
        // this.logger('adjust top: ' + DOM.table.style.top);
    };

    ///private functions
    this.inRange = function () {
        return (self.currentPage > 1 && self.currentPage <= self.pageBuffer.length);
    };

    this.detectBigScroll = function (scrollY) {

        var pageHeight = self.pageSize * self.rowHeight,
            pageJumped = (Math.abs(scrollY - self.previousTop) > pageHeight);

        //Detect if a page has 'jumped' from a continued scrolling range                     
        if (pageJumped) {
            // this.logger('Page out of range! Readjusting: ' + scrollY + ' > ' + (self.currentPage * pageHeight));
            self.currentPage = Math.floor(scrollY / (self.pageSize * self.rowHeight)) + 1;
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

    this.detectOffset = function () {
        var sTop = -1,
            prevBody = By.id('page_' + self.currentPage),
            offsetHeight = this.getRowHeight(),
            scrollTop = DOM.tableWrapper.scrollTop; 

        sTop = scrollTop - offsetHeight * (self.currentPage - 1);

        if (sTop / self.rowHeight > self.pageSize) { //if we the pages has drifted for some reason, readjust page
            self.currentPage = Math.floor(scrollTop / (self.pageSize * self.rowHeight)) + 1;
            // this.logger('Offset exception! Readjusting page ' + self.page);
            self.adjustForPage(self.currentPage);
        }
    };

    this.isOnTouchDevice = function () {
            try {
                document.createEvent("TouchEvent");
                return (typeof Touch == "object") ? true : false; //chrome 
            } catch (e) {
                return false;
            }
    };

    this.DOM_Factory = function (tag, id) {
        var tag = tag || 'div',
            el = document.createElement(tag);

        // if (!el || el instanceof HTMLUnknownElement) { throw 'Tag ' + tag + ' could not be created'; }
        if (id) { el.id = id; }
        return el;
    };

    this.logger =  function (msg) {     
        if (typeof console !== "undefined" && typeof console.log !== "undefined") {
            console.timeStamp(msg);
        }
    };

    this.init();
};