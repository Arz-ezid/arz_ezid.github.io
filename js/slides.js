/*  

   _____ _       _                 _  _____ 
  / ___/| (*)   | |               | |/ ___/  v 4.0.5
 | (___ | |_  __| | ___ ____      | | (___  
  \___ \| | |/ _` |/ _ / __/  _   | |\___ \ 
  ____) | | | (_| |  __\__ \ | |__| |____) |
 /_____/|_|_|\__,_|\___/___/  \____//_____/ 
                                            
                                            
This file contains scripts required for the proper functionality and display
of your Slides Project. It also requires plugins.js and jquery-3.3.1 to run this script properly.

https://designmodo.com/slides/

*/

window.inAction = 1;
window.allowSlide = 1;
window.blockScroll = 1;
window.effectOffset = 500;
window.effectSpeed = 1000;
window.slideSpeed = 1000;
window.cleanupDelay = 1400;
window.horizontalMode = 0;
window.sidebarShown = 0;
window.loadingProgress = 0;
window.smoothScroll = 0;
window.scrollSpeed = 0.5;
window.preload = 1;
window.setHashLink = 1;
window.hideSidebarOnBodyClick = 1;
window.collectScrolls = 0;
window.sliderStatus = 0;
window.minScrollToSlide = 500;
window.minSwipeToSlide = 4;
window.enableMobileZoom = 0;
window.hideOnScrollSensitivity = 100;
window.allowParallaxOnMobile = 1;
window.hidePopupOnBodyClick = 1;

var $html = $('html');

//On Window load
$(window).on('load', function(){
  window.loaded = 1;
});

//On DOM ready
$(document).ready(function() { "use strict";
  var $body = $('body'); 
  
  //add window a trigger
  setTimeout(function(){
    $(window).trigger('ready');
  },1);
  
  //Redraw
  $body.hide().show(0);
  
  //Detect mode
  window.isScroll = $body.hasClass('scroll');
  window.isSimplifiedMobile = $body.hasClass('simplifiedMobile');
  if (window.isScroll || window.isSimplifiedMobile && window.isMobile) { $html.addClass('scrollable'); }
  
  $html.addClass('page-ready');

  //Set speed
  if ($body.hasClass('fast')){
    //fast 
    window.slideSpeed = 700;  
    window.cleanupDelay = 1200;
    window.effectSpeed = 800;
    window.scrollSpeed = 0.35;
    window.effectOffset = 400;
  } else if ($body.hasClass('slow')){
    //slow
    window.slideSpeed = 1400;  
    window.cleanupDelay = 2000;
    window.effectSpeed = 1400;
    window.effectOffset = 400;
    window.scrollSpeed = .8;
    window.effectOffset = 600;
  }
  
  //How many stages?
  window.stage = 1;
  window.stages = $('.slide').length;
  
  //Horizonal Mode
  if ($body.hasClass('horizontal')){
    window.horizontalMode = 1; 
  }
  
  //Preload
  if ($body.hasClass('noPreload')){
    window.preload = 0; 
  }
  
  //Is it animated?
  if ($body.hasClass('animated')){
    window.isAnimated = "auto";
  } else if ($body.hasClass('animateOnEvent')) {
    window.isAnimated = "animateOnEvent";
    if (window.isMobile) { 
      window.isAnimated = "auto";
      $body.removeClass('animateOnEvent').addClass('animated');
    }
  }

  //Remove animation for Simplified Mobile Option
  if (window.isSimplifiedMobile && window.isMobile) {
    window.isAnimated = false;
    $body.removeClass('animated animateOnEvent');
    $("[class*='ae-']").addClass('done');
  }

  if (!window.isAnimated) {
    window.cleanupDelay = 0;
  }

  //Is scroll hijacked?
  if ($body.hasClass('smoothScroll') && !window.isMobile){
    window.smoothScroll = 1;
  }
  

 //Check hash on start
  function updateHash(){
    var hashLink = window.location.href.split("#")[1];
    if (hashLink) {
      //find a slide
      if ( $('.slide[data-name="' +hashLink+ '"]').length > 0 ){
        //asking for the slide?
        var requestedElement = $('.slide[data-name="' +hashLink+ '"]');

        //scroll to a desired slide
        if ( (window.isMobile && window.isSimplifiedMobile) || window.isScroll ){
          //scroll mode
          if (requestedElement.length) {
            if (!window.preload || window.loaded) {
              $('html,body').stop().clearQueue().animate({scrollTop:requestedElement.position().top},window.effectSpeed);
            } else {
              $(window).on('load', function(){
                $('html,body').stop().clearQueue().animate({scrollTop:requestedElement.position().top},window.effectSpeed);
              });
            }
          }
        } else {
          //slide mode
          window.stage = $('.slide').index(requestedElement) + 1;
          showSlide(window.stage);
        }
      }
    }
  }

  updateHash();
  
  //Listen history changes
  $(window).on('popstate',function(e) {
    setTimeout(function(){
      updateHash();
    },100);
    e.preventDefault();
  });
  
  //Show Progress Bar
  if (window.preload){
    var imgs = [];
    $("*").each(function() { 
      if($(this).css("background-image") !== "none") { 
        imgs.push($(this).css("background-image").replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '')); 
      } else if ($(this).is('img')){
        imgs.push($(this).attr("src")); 
      }
    });

    window.images = imgs.length;
    window.progressBar = $('.progress-bar');

    //preload images (sort of)
    $.cacheImage(imgs, { complete: function () {
      window.loadingProgress++;
      updateProgressBar();
    }});

    //show progress
    function updateProgressBar(){

      //loading
      var progress = window.loadingProgress/window.images;

      // animate
      window.progressBar.css('width',progress * 100 + "%");

      if (window.loadingProgress == window.images) {
        window.progressBar.addClass('loaded');
      }
    }

    updateProgressBar();
  }
 
  //Initiate slide
  showSlide(window.stage); 

  $('.grid.masonry').masonry({
    itemSelector: 'li',
    transitionDuration: '0.1s'
  });

  $('.grid.masonry').imagesLoaded().progress( function() {
    $('.grid.masonry').masonry('layout');
  });
  
  //On page load
  if (!window.preload || !window.images || window.loaded) {
    runTheCode();
  }

  if (!window.loaded) {
    $(window).on('load', function(){
      runTheCode();
    });
  }

  function runTheCode(){
    $html.addClass('page-loaded');
    window.inAction = 0;
    window.blockScroll = 0;
    window.loaded = 1;
    
    setTimeout(function(){
      if (window.isScroll){
        updateScroll();
        updateNavigation();
      } if (window.isMobile && window.isSimplifiedMobile){
        $('.slide').addClass('selected animate active');
        updateScroll();
        updateNavigation();
      } else {
        showSlide(window.stage);
      }
    },500);
  }
  
  
  
  
  
  
  
   
