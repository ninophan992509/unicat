$("#videoSourceWrapper").hide();
$("#videoSourceWrapper .progress").hide();

$("#uploadVideoFile").on("change", function () {
  const fileInput = document.getElementById("uploadVideoFile");
  const maxSize = 31457280;

  if ("files" in fileInput) {
    if (fileInput.files.length === 0) {
      alert("Select a file to upload");
    } else {
      if (fileInput.files[0].size > maxSize) {
        alert("Tệp quá lớn!");
      } else {
        let $source = $("#videoSource");
        $source[0].src = URL.createObjectURL(this.files[0]);
        $source.parent()[0].load();
        $("#videoSourceWrapper").show();
        UploadVideo(fileInput.files[0]);
      }
    }
  } else {
    console.log('No found "files" property');
  }
});

function UploadVideo(file) {
  let loaded = 0;
  const chunkSize = 1000000;
  const total = file.size;
  let reader = new FileReader();
  let slice = file.slice(0, chunkSize);

  // Reading a chunk to invoke the 'onload' event
  reader.readAsBinaryString(slice);
  console.log('Started uploading file "' + file.name + '"');
  $("#uploadVideoProgressBar").show();

  reader.onload = function (e) {
    setTimeout(function () {
      loaded += chunkSize;
      let percentLoaded = Math.min((loaded / total) * 100, 100);

      $("#uploadVideoProgressBar").attr("aria-valuenow", `${percentLoaded}`);
      $("#uploadVideoProgressBar").css("width", `${percentLoaded}%`);
      $("#uploadVideoProgressBar").html(Math.floor(percentLoaded) + "%");
      //Read the next chunk and call 'onload' event again
      if (loaded <= total) {
        slice = file.slice(loaded, loaded + chunkSize);
        reader.readAsBinaryString(slice);
      } else {
        loaded = total;
      }
    }, 200);
  };
}
