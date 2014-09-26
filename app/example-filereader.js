/**
 * ImglyKit
 * integration example
 *
 * Copyright (c) 2013-2014 img.ly
 */

$(function () {
  var fileInput = document.getElementById("file")
    , renderButton = $("#renderButton")
    , imgly = new ImglyKit({
        container: "#container",
        ratio: 4 / 3
      });

  // As soon as the user selects a file...
  fileInput.addEventListener("change", function (event) {
    var file;

    // Find the selected file
    if(event.target.files) {
      file = event.target.files[0];
    } else {
      file = event.target.value;
    }

    // Use FileReader to turn the selected
    // file into a data url. ImglyKit needs
    // a data url or an image
    var reader = new FileReader();
    reader.onload = (function(file) {
      return function (e) {
        data = e.target.result;

        // Run ImglyKit with the selected file
        try {
          imgly.run(data);
          //$('#file').removeAttr("style");
        } catch (e) {
          if(e.name == "NoSupportError") {
            alert("Your browser does not support canvas.");
          } else if(e.name == "InvalidError") {
            //$('#file').css('background-color', 'red');
          }
        }
      };
    })(file);
    reader.readAsDataURL(file);
  });

  // As soon as the user clicks the render button...
  // Listen for "Render final image" click
  renderButton.click(function (event) {
    var dataUrl;

    // dataUrl = imgly.renderToDataURL("png", function (err, dataUrl) {});
    // `dataUrl` now contains the full-sized rendered image
    // Caution: This string will probably exceed the maximum
    // dataURL size of 2M. You will not be able to set location.href
    // or an <img> tag's `src` attribute to this dataUrl.

    // dataUrl = imgly.renderToDataURL("png", { maxSize: "100x100" }, function (err, dataUrl) {});
    // `dataUrl` now contains a resized rendered image that
    // does not exceed 100x100 while keeping the ratio

    // dataUrl = imgly.renderToDataURL("png", { size: "100x100" }, function (err, dataUrl) {});
    // `dataUrl` now contains a resized rendered image with
    // a size of 100x100 pixels while _not_ keeping the ratio

    imgly.renderToDataURL("png", { size: "1280" }, function (err, dataUrl) {
      // `dataUrl` now contains a resized rendered image with
      // a width of 300 pixels while keeping the ratio

      var image = $("<img><br>").attr({
        src: dataUrl
      });

      image.appendTo($(".result"))
      $button = $('<button class="btn btn-default remove">')
            .text('Remove')
            .on('click', function () {
                image.remove();
                $(this).remove();
                return false;
            });
        $button.appendTo($(".result"));;

    });
  });
});
