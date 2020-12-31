(function ($) {
  "use strict";

  /*==================================================================
    [ Validate ]*/
  let input = $(".validate-input .input100");

  $(".validate-form").on("submit", function (e) {
    e.preventDefault();
    let check = true;

    for (let i = 0; i < input.length; i++) {
      if (validate(input[i]) == false) {
        showValidate(input[i]);
        check = false;
      }
    }
    
    if(check){
        const email = $('#email').val();
        $.getJSON(`/account/is-available?email=${email}`, function (data) {
        if (data === true) {
          $("#frmRegister").off("submit").submit();
        } else {          
          $('#email').parent().attr('data-validate','Email đăng ký đã tồn tại. Vui lòng sử dụng email khác');
          $("#email").parent().addClass("alert-validate");
          return;
        }
     });

    }else
        return check;
  });

  /** Ẩn thông báo lỗi khi focus */
  $(".validate-form .input100").each(function () {
    $(this).focus(function () {
      hideValidate(this);
    });
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
            .match(
              /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ,.'-]+$/i
            ) == null
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
    const thisAlert = $(input).parent();

    $(thisAlert).addClass("alert-validate");
  }
  
  /**Ẩn các thông báo lỗi */
  function hideValidate(input) {
    const thisAlert = $(input).parent();

    $(thisAlert).removeClass("alert-validate");
  }
})(jQuery);
