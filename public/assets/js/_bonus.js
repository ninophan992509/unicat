$(document).ready(function () {
  "use strict";
  $(".main_nav .dropdown .dropdown_content .dropdown_submenu").hover(
    function () {
      const subId = $(this).attr("id");
      $(".main_nav .dropdown .dropdown_menu").hide();
      $("#ul" + subId).show();
    }
  );

  $(".dropdown").mouseleave(function () {
    $(".dropdown .dropdown_menu").hide();
  });

  $(".owl-carousel").owlCarousel({
    loop: true,
    margin: 20,
    nav: true,
    navText: [
      "<i class='fa fa-chevron-left' aria-hidden='true'></i>",
      "<i class='fa fa-chevron-right' aria-hidden='true'></i>",
    ],
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 2,
      },
      1000: {
        items: 3,
      },
    },
  });

   $(".nav a").on("click", function () {
    $(".nav").find(".active").removeClass("active");
    $(this).parent().addClass("active");
  });
});
