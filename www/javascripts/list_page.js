document.addEventListener("deviceready", function() {
  content = ""
  locations = null
  window.initList = function() {
    document.addEventListener("deviceready", function(){
      locationData()
    }, true);  
  }
  
  function locationData() {
    if (typeof myScroll !== 'undefined') {
      myScroll.destroy()
    }
    locations = window.list_page_data.sort(function(a, b) {
      return a.properties.name.localeCompare(b.properties.name)
    })
    content = ""
    $('#wrapper').css('padding-top', '16px');
    setContent();
    myScroll = new IScroll('#wrapper', { probeType: 3 });
    window.getDataForLocation(locations); 
  }
  
  function setContent() {
    $.each(locations, function(index, value) {
      createListItem(value, index);
    })
    $('#list-view').empty()
    $('#list-view').html(content)
  }
  
  function createListItem(location, index) {
    fullAddress = window.setFullAddress(location)
    image = null
    if (location.properties.image != null && location.properties.image != "") {
      image = location.properties.image
    } else {
      image = "images/image_placeholder.png"
    }
    if (index == 0) {
      content = content + "<li class='ui-li-static ui-body-inherit ui-first-child' data-index=" + index + ">" + "<img src='" + image + "' class='list_image' />" + "<span class='list_content'>" + location.properties.name + "<span class='item'>" + fullAddress + "</span>" + "</span>" + "</li>"
    } else if (index == locations.length - 1) {
      content = content + "<li class='ui-li-static ui-body-inherit ui-last-child' data-index=" + index + ">" + "<img src='" + image + "' class='list_image' />" + "<span class='list_content'>" + location.properties.name + "<span class='item'>" + fullAddress + "</span>" + "</span>" + "</li>"
    } else {
      content = content + "<li class='ui-li-static ui-body-inherit' data-index=" + index + ">" + "<img src='" + image + "' class='list_image' />" + "<span class='list_content'>" + location.properties.name + "<span class='item'>" + fullAddress + "</span>" + "</span>" + "</li>"
    }  
  }
}, true);
