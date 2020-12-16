(function ($) {
  "use strict";

  /*==================================================================
    [ Validate ]*/
  var input = $(".validate-input .input100");

  $(".validate-form").on("submit", function (e) {
    e.preventDefault();
    var check = true;

    for (var i = 0; i < input.length; i++) {
      if (validate(input[i]) == false) {
        showValidate(input[i]);
        check = false;
      }
    }

    if ($("select").val() === null) {
      $("select").parent().addClass("alert-validate");
      check = false;
    }

    alert(check);
    return check;
  });

  /** Ẩn thông báo lỗi khi focus */
  $(".validate-form .input100").each(function () {
    $(this).focus(function () {
      hideValidate(this);
    });
  });

  $("select").focus(function () {
    $("select").parent().removeClass("alert-validate");
  });

  /**Hàm validate các input */
  function validate(input) {
    if ($(input).attr("type") == "email" || $(input).attr("name") == "Email") {
      if (
        $(input)
          .val()
          .trim()
          .match(
            /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/
          ) == null
      )
        return false;
    } else {
      if ($(input).attr("name") == "Username") {
        if (
          $(input)
            .val()
            .match(/^[a-z ,.'-]+$/i) == null
        )
          return false;
      }

      if ($(input).attr("type") == "password") {
        if (
          $(input)
            .val()
            .match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,}$/) == null
        )
          return false;
      }

      if ($(input).val().trim() == "") {
        return false;
      }
    }
  }
  
  /**Hiện các thông báo lỗi */
  function showValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).addClass("alert-validate");
  }
  
  /**Ẩn các thông báo lỗi */
  function hideValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).removeClass("alert-validate");
  }
})(jQuery);
