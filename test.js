// knockout-js-infinite-scroll (common usage)
ViewModel = function () {
    var self = this;

    self.items = ko.observableArray();
    self.filteredItems = ko.observableArray();
    self.filteredItems.extend({
        infinitescroll: {}
    });

    // detect resize
    $(window).resize(function() {
        updateViewportDimensions();
    });

    // detect scroll
    $(items).scroll(function() {
        self.filteredItems.infinitescroll.scrollY($(items).scrollTop());
        
        // add more items if scroll reaches the last 100 items
        if (self.filteredItems.peek().length - self.filteredItems.infinitescroll.lastVisibleIndex.peek() <= 100) {
            populateItems(100);
        }
    });

    // update dimensions of infinite-scroll viewport and item
    function updateViewportDimensions() {
        var itemsRef = $('#items'),
            itemRef = $('.item').first(),
            itemsWidth = itemsRef.width(),
            itemsHeight = itemsRef.height(),
            itemWidth = itemRef.outerWidth(),
            itemHeight = itemRef.outerHeight();

        self.filteredItems.infinitescroll.viewportWidth(itemsWidth);
        self.filteredItems.infinitescroll.viewportHeight(itemsHeight);
        self.filteredItems.infinitescroll.itemWidth(itemWidth);
        self.filteredItems.infinitescroll.itemHeight(itemHeight);

    }
    updateViewportDimensions();

    // init items
    function populateItems(numTotal) {
        var existingItems = self.filteredItems(),
            item = '',
            alphabet = 'abcdefghijklmnopqrstuvwxyz',
            numTotal = numTotal || 500;

        for (var i = 0; i < numTotal; i++) {
            item = '';
            for( var j = 0; j < Math.floor(Math.random() * 20) + 1; j++ ) {
                item += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            }
            existingItems.push(item);
        }
        self.filteredItems(existingItems);
    }
    populateItems();
}

ko.applyBindings(new ViewModel());