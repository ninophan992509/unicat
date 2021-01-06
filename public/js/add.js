$(document).ready(function () {

  function loadPlugin() {
    $(".input-video").fileinput({
      showUpload: false,
      showUploadStats: true,
      dropZoneEnabled: true,
      maxFileCount: 1,
      allowedFileTypes: ["mp4"],
      mainClass: "input-group-lg",
      maxFileSize: 15000,
      required: true,
    });
    $(".file-loading .btn-file .hidden-xs").html("Tải video lên");
    $(".file-loading .fileinput-remove .hidden-xs").html("Hủy");

    tinymce.init({
      selector: ".txt_description",
      plugins:
        "a11ychecker advcode casechange formatpainter linkchecker autolink lists checklist media mediaembed pageembed permanentpen powerpaste table advtable tinycomments tinymcespellchecker",
      //  toolbar: 'a11ycheck addcomment showcomments casechange checklist code formatpainter pageembed permanentpen table',
      toolbar_mode: "floating",
      tinycomments_mode: "embedded",
      tinycomments_author: "Unicat",
      menubar: false,
    });

    
  }

  $(".btn-remove-chapter").on("click", function () {
    const btn = this;
    const stt = $(btn).parents(".chapter").data("stt");
    $.ajax({
      global: false,
      type: "POST",
      url: "/teacher/courses/remove-chapter",
      dataType: "html",
      data: {
        stt: stt,
      },
      success: function (data) {
        const ret = JSON.parse(data);
        if (ret === true) {
          $(btn).parents(".chapter").remove();
          $(".chapter").each(function () {
            let chapter_stt = $(this).data("stt");
            if (+chapter_stt > stt) {
              $(this).attr("data-stt", `${+chapter_stt - 1}`);
              $(this)
                .find(".chapter-name .form-group .chapter_stt")
                .html(`${+chapter_stt - 1}`);
            }
          });
        }
      },
      error: function (request, status, error) {
        serviceError();
      },
    });
  });

  $(".btn-add-lesson").on("click", function () {
    const less_stt = $(this).parents(".chapter").data("stt");
    const btn = this;
    $.ajax({
      global: false,
      type: "POST",
      url: "/teacher/courses/new-lesson",
      dataType: "html",
      data: {
        stt: less_stt,
      },
      success: function (data) {
        if (data !== null) {
          const newLesson = $.parseHTML(data);
          const insertLesson = $(btn)
            .parents(".chapter")
            .children(".insert-lesson");

          if ($(insertLesson).children().length === 0) {
            $(insertLesson).append($(newLesson));
          } else {
            $(newLesson).insertAfter($(".lesson").last());
          }
          loadPlugin();
        
        } else {
          alert("null");
        }
      },
      error: function (request, status, error) {
        serviceError();
      },
    });
  });
});
