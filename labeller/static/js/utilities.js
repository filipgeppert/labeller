function sendDataAJAX (url, data) {
      $.ajax({
        url: url,
        data: data,
        dataType: 'json',
        success: function (data) {
            console.log("Data saved.")
        }
      });
}
