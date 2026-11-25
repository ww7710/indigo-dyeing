// jquery-click-scroll
// Enhanced to dynamically support actual anchor href targets

$(document).ready(function(){
    var navLinks = $('.navbar-nav .nav-item .click-scroll');
    
    $(document).scroll(function(){
        var docScroll = $(document).scrollTop();
        navLinks.each(function(index){
            var targetId = $(this).attr('href');
            if (targetId && targetId.startsWith('#') && $(targetId).length) {
                var offsetSection = $(targetId).offset().top - 90;
                if (docScroll + 1 >= offsetSection){
                    navLinks.removeClass('active').addClass('inactive');
                    $(this).addClass('active').removeClass('inactive');
                }
            }
        });
    });
    
    navLinks.each(function(){
        $(this).click(function(e){
            var targetId = $(this).attr('href');
            if (targetId && targetId.startsWith('#') && $(targetId).length) {
                e.preventDefault();
                var offsetClick = $(targetId).offset().top - 84;
                $('html, body').animate({
                    'scrollTop': offsetClick
                }, 300);
            }
        });
    });

    navLinks.addClass('inactive');
    navLinks.eq(0).addClass('active').removeClass('inactive');
});
