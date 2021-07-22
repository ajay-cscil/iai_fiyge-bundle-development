document.write( '<div id="div1" class="navbar navbar-fixed-top">');
            document.write('<div class="navbar-inner">');
                document.write('<div>');
                    document.write('<button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">');
                        document.write('<span class="icon-bar"></span>');
                        document.write('<span class="icon-bar"></span>');
                        document.write('<span class="icon-bar"></span>');
                    document.write('</button>');
                    document.write('<div class="nav-collapse collapse">');
                        document.write('<ul class="nav">');
                           document.write('<li class="divider-vertical">');
                                document.write('<a style="font-size: 25px" class="brand" href="http://www.maaxframe.com/index.html">Maaxframe</a>');
                            document.write('</li>');
                            document.write('<li class="dropdown">');
                                document.write('<a style="font-size: 18px" class="dropdown-toggle" data-toggle="dropdown">Products</a>');
                            document.write('<ul class="dropdown-menu myTab">');
                                document.write('<li><a href="http://www.maaxframe.com/sales.html">Sales Cloud</a></li>');
                                 document.write('<li><a href="http://www.maaxframe.com/service.html">Service Cloud</a></li>');
                                document.write('<li><a href="http://www.maaxframe.commanufacturing.html">Manufacturing Cloud</a></li>');
                                document.write('<li><a href="http://www.maaxframe.com/marketing.html">Marketing Cloud</a></li>');
                                  document.write('<li><a href="http://www.maaxframe.com/accounting.html">Accounting Cloud</a></li>');
                                  document.write('<li><a href="http://www.maaxframe.com/maaxplatform.html">Maax Platform</a></li>');
                                  document.write('<li><a href="http://www.maaxframe.com/social.html">Social, Mobile ERP</a></li>');
                            document.write('</ul>');
                            document.write('</li>');
                            document.write('<li class="dropdown">');
                                document.write('<a href="" style="font-size: 18px" class="dropdown-toggle" data-toggle="dropdown">Why Maax?</a>');
                            document.write('<ul class="dropdown-menu myTab">');
                                 document.write('<li><a href="http://www.maaxframe.com/comparison.html">Comparison</a></li>');
                                document.write('<li><a href="http://www.maaxframe.com/success.html">Success Stories</a></li>');
                             document.write('</ul>');
                            document.write('</li>');
                            document.write('<li style="cursor: hand; cursor: pointer;">');
                                document.write('<a href="http://www.maaxframe.com/pricing.html" style="font-size: 18px">Pricing</a>');
                            document.write('</li>');
                            document.write('<li class="dropdown">');
                                document.write('<a href="" style="font-size: 18px" class="dropdown-toggle" data-toggle="dropdown">Developer</a>');
                            document.write('<ul class="dropdown-menu myTab">');
                                 document.write('<li><a href="http://console.maaxframe.com/faq/faq/__index/">FAQ</a></li>');
                                document.write('<li><a href="http://console.maaxframe.com/documentation/related_topics/__index/">Documentation</a></li>');
                             document.write('</ul>');
                            document.write('</li>');
                            document.write('<li class="dropdown">');
                                document.write('<a style="font-size: 18px" class="dropdown-toggle" data-toggle="dropdown">Services & Support</a>');
                            document.write('<ul class="dropdown-menu myTab">');
                                 document.write('<li><a href="http://www.maaxframe.com/support.html">24/7 Support</a></li>');
                                document.write('<li><a href="http://www.maaxframe.com/training.html">Training</a></li>');
                                document.write('<li><a href="http://www.maaxframe.com/consulting.html">Consulting</a></li>');
                             document.write('</ul>');
                            document.write('</li>');
                            document.write('<li style="cursor: hand; cursor: pointer;">');
                                document.write('<a href="http://www.maaxframe.com/aboutus.html" style="font-size: 18px">About Us</a>');
                            document.write('</li>');
                            document.write('<li style="cursor: hand; cursor: pointer;">');
                                document.write('<a href="http://www.maaxframe.com/contactus.html" style="font-size: 18px">Contact Us</a>');
                            document.write('</li>');
                            document.write('<li style="cursor: hand; cursor: pointer;">');
                                document.write('<a href="http://www.maaxframe.com/free.html" style="font-size: 18px">Free Trial</a>');
                            document.write('</li>');
                        document.write('</ul>');
                        
                    document.write('</div>');
                document.write('</div>');
            document.write('</div>');
        document.write('</div>');
        (function ($, window, delay) {
  var theTimer = 0;
  var theElement = null;
    var theLastPosition = {x:0,y:0};
  $('[data-toggle]')
    .closest('li')
    .on('mouseenter', function (inEvent) {
    if (theElement) theElement.removeClass('open');
    window.clearTimeout(theTimer);
    theElement = $(this);

    theTimer = window.setTimeout(function () {
      theElement.addClass('open');
    }, delay);
  })
    .on('mousemove', function (inEvent) {
        if(Math.abs(theLastPosition.x - inEvent.ScreenX) > 4 || 
           Math.abs(theLastPosition.y - inEvent.ScreenY) > 4)
        {
            theLastPosition.x = inEvent.ScreenX;
            theLastPosition.y = inEvent.ScreenY;
            return;
        }
        
    if (theElement.hasClass('open')) return;
    window.clearTimeout(theTimer);
    theTimer = window.setTimeout(function () {
      theElement.addClass('open');
    }, delay);
  })
    .on('mouseleave', function (inEvent) {
    window.clearTimeout(theTimer);
    theElement = $(this);
    theTimer = window.setTimeout(function () {
      theElement.removeClass('open');
    }, delay);
  });
})(jQuery, window, 200);