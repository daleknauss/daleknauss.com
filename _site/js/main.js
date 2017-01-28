
var settings,
    app = {
        init: function() {
            // initalize
            this.initalizers();
            this.bindUiActions();
        },
        bindUiActions: function (){
            // Should include all JS user interactions
            var self = this;

            $('.select-posts, .select-categories').on('click', function () {
                self.homePostsCatSwitch();
            });

            $('.social-icon').on('click', function () {
                return self.socialIconClick( $(this) );
            });

        },
        initalizers: function (){
            // Fast Click for Mobile - removes 300ms delay - https://github.com/ftlabs/fastclick
            FastClick.attach(document.body);
        },
        homePostsCatSwitch: function() {
            // Toggles between showing the categories and posts on the homepage
            $('.home-page-posts').toggleClass("hide");
            $('.home-page-categories').toggleClass("hide");
            $('.select-posts').toggleClass("active");
            $('.select-categories').toggleClass("active");
            $('.home-footer').toggleClass("hide");
        },
        socialIconClick: function(el) {
            // Post page social Icons
            // When Clicked pop up a share dialog
            var platform = el.data('platform'),
                message,
                url;

            if (platform === 'mail'){
                // Let mail use default browser behaviour
                return true;
            } else {
                message = el.data('message');
                url = el.data('url');
                this.popItUp(platform, message, url);
                return false;
            }
        },
        popItUp : function (platform, message, url) {
            // Create the popup with the correct location URL for sharing
            var popUrl,
                newWindow;

            if (platform == 'twitter') {
                popUrl = 'http://twitter.com/home?status=' + encodeURI(message) + '+' + url;

            } else if (platform == 'facebook') {
                popUrl = 'http://www.facebook.com/share.php?u' + url + '&amp;title=' + encodeURI(message);
            }

            newWindow = window.open(popUrl,'name','height=500,width=600');
            if (window.focus) { newWindow.focus(); }
            return false;
        }
    };

$(document).ready(function(){
    app.init();
});
