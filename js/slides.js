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
  
  
  
  
  
  
  
   
/***
 *       _____ _ _     _         _____ _                            
 *      / ____| (_)   | |       / ____| |                           
 *     | (___ | |_  __| | ___  | |    | |__   __ _ _ __   __ _  ___ 
 *      \___ \| | |/ _` |/ _ \ | |    | '_ \ / _` | '_ \ / _` |/ _ \
 *      ____) | | | (_| |  __/ | |____| | | | (_| | | | | (_| |  __/
 *     |_____/|_|_|\__,_|\___|  \_____|_| |_|\__,_|_| |_|\__, |\___|
 *                                                        __/ |     
 *     Slide Appearance Manager                          |___/      
 */
     
  function showSlide(requested){
    
    requested = parseInt(requested);
    
    if ( window.isMobile && window.isSimplifiedMobile || window.isScroll ){
      return;
    }
    
    updateNavigation();
    
    var newSlide = $('.slide').eq(requested - 1),
        currenSlide = $('.slide.selected'),
        currenSlideIndex = currenSlide.index('.slide') + 1;
        
    //cleanup
    hideDropdown();
    unzoomImage();
    hideSidebar();
    window.allowSlide = 1;
    
    //reset 
    $body.removeClass('sidebarShown lastSlide firstSlide hidePanel-top hidePanel-bottom');

    //It it first or last stage?
    if (window.setStageClasses != 0) {
      if (window.stage === 1){
        $body.addClass('firstSlide');
      }
      if ((window.stages === window.stage)&&(window.stages !== 1)) {
        $body.addClass('lastSlide');
      }
      
      $body.removeClassByPrefix("stage-").addClass('stage-'+window.stage);
    }
    
    //white slide?
    if ( newSlide.hasClass('whiteSlide') ){
      $body.addClass('whiteSlide');
    } else {
      $body.removeClass('whiteSlide');
    }
    
    //prepare slides for transporting
    if (currenSlideIndex !== requested && window.setStageClasses != 0){
      currenSlide.removeClass('selected').addClass('active');
      newSlide.removeClass('before after').addClass('selected active');
      
      //set order
      newSlide.prevAll('.slide').addClass('before').removeClass('after');
      newSlide.nextAll('.slide').addClass('after').removeClass('before');
      
      //set a trigger
      $(window).trigger("slideChange", [parseInt(requested), newSlide]);
    }
    
    //set hash
    if (window.setHashLink){
      if (newSlide.attr('data-name') || newSlide.attr('id')) { 
        window.location.hash = (newSlide.attr('data-name')) ? newSlide.attr('data-name') : newSlide.attr('id');
      } else if ((window.location.toString().indexOf('#')>0)&&(location.protocol !== "file:")&&(location.href.split('#')[0])){        
        if (history.pushState) {
          window.history.pushState("", "", location.href.split('#')[0]); 
        } else {
          window.location.hash = "";
        }
      }
    }
    
    //prepare to show slide
    newSlide.find('.content, .container').scrollTop(0);

    if (window.loaded){
      //wait for animation
      window.blockScroll = 1;
      
      setTimeout(function(){
        if (currenSlideIndex !== requested){
          currenSlide.removeClass('active animate');
        }

        //avoid accident scrolls
        window.blockScroll = 0;
      },window.effectSpeed);
      
      if (window.effectOffset > window.slideSpeed) { window.effectOffset = window.slideSpeed; }
      
      setTimeout(function(){
        newSlide.addClass('animate');
      },window.slideSpeed - window.effectOffset);
      
        
      //clear element animation on done
      $('.done').removeClass('done');
      
      clearTimeout(window.clearElementAnimation);
      window.clearElementAnimation = setTimeout(function(){
        $(".slide.selected [class*='ae-']").addClass('done');
      }, window.slideSpeed + window.effectSpeed + window.cleanupDelay);
    }
    //end showSlide();
  }
  
  //remove animation from a clickable element
  $(".animated").on("click", "[class*='ae-']:not('.done')", function(){ $(this).addClass('done'); });
  
  //Change slide
  window.changeSlide = function(n){
    if (n === "increase"){
      if ((window.stage + 1) >= window.stages){
        n = window.stages;
      } else {
        n = window.stage + 1;
      }
    } else if (n === "decrease"){
      if ((window.stage - 1) < 1){
        n = 1;
      } else {
        n = window.stage - 1;
      }
    }
    
    if ( window.isMobile && window.isSimplifiedMobile || window.isScroll ){
      window.stage = n;
      var requestedElement = $('.slide:eq('+ (window.stage - 1) +')'),
          finalPosition = $(requestedElement).offset().top;

      $('html,body').stop().clearQueue().animate({scrollTop:finalPosition},1000);
    } else {
      if ((n !== window.stage)&&( n <= window.stages)){
        if (window.inAction !== 1){  
          window.inAction = 1;
          window.stage = n;

          var delay = 0;
          if ($('.zoom-overlay-open').length > 0) {
            unzoomImage();
            delay = 550;
          }

          setTimeout(function(){
            showSlide(window.stage);
            setTimeout(function(){ window.inAction = 0; }, window.slideSpeed);
          }, delay);
        }
      }
    }
  };
  
  $('.nextSlide').on('click', function(){
    window.changeSlide('increase');
  });
  
  $('.prevSlide').on('click', function(){
    window.changeSlide('decrease');
  });
  
  $('.toFirstSlide').on('click', function(){
    window.changeSlide(1);
    if (history.pushState) {
      window.history.pushState("", "", location.href.split('#')[0]); 
    } else {
      window.location.hash = "";
    }
    
    hideSidebar();
  });
  
  $('.toLastSlide').on('click', function(){
    window.changeSlide(window.stages);
    if (history.pushState) {
      window.history.pushState("", "", location.href.split('#')[0]); 
    } else {
      window.location.hash = "";
    }
    hideSidebar();
  });
  
  $('[class*="toSlide-"]').on('click', function(){
    var num = parseInt($(this).attr('class').split('toSlide-')[1].split(' ')[0]);
    window.changeSlide(num);
    hideSidebar();
  });
  
  //zoom out image
  function unzoomImage(type){
    if ($('.zoom-overlay-open').length > 0){
      $('.zoom-img').click();

      if (type) {
        $('.zoom-img-wrap, .zoom-overlay').remove();
      }
    }
  }

  //set
  $(window).on('resize load ready',function(){
    //cleanup after image zoom 
    $('[data-action="zoom"]').removeAttr('style');
    if ($('.zoom-overlay').length > 0){
      unzoomImage('fast');
    }

    //common stuff
    window.windowHeight = $(window).height();
    window.windowWidth = $(window).width();
    window.documentHeight = $(document).height();
  });
