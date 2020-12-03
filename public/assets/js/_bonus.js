$(document).ready(function()
{
    "use strict";
    const ratings = 4.7;
    const maxRating = 5;
    const percentRating = (ratings/maxRating)*100;
    console.log(percentRating);
    $('.star_inner').style.width = `${Math.round(percentRating/10)*10}`;

});
