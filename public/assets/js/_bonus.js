$(document).ready(function()
{  

    "use strict";
    const ratings = 4.7;
    const maxRating = 5;
    const percentRating = (ratings/maxRating)*100;
   // console.log(percentRating);
   // $('.star_inner').style.width = `${Math.round(percentRating/10)*10}`;

   function setRatingValue(point,id) {
       const width = Math.round(point/5)*70;
       $('#course'+id).css('width',`${width}px`);
   }

   $('.main_nav .dropdown .dropdown_content .dropdown_submenu').hover(function(){
     const subId =  $(this).attr('id');
     $('.main_nav .dropdown .dropdown_menu').hide();
     $('#ul'+ subId).show();
 
  });

  $('.dropdown').mouseleave(function(){
     $('.dropdown .dropdown_menu').hide();
  });

  $('.owl-carousel').owlCarousel({
    loop:true,
    margin:20,
    nav:false,
    responsive:{
        0:{
            items:1
        },
        600:{
            items:2
        },
        1000:{
            items:3
        }
    }
  });

});
