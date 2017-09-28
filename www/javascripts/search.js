$(document).ready(function() {
  content = ""
  initial_number_of_locations = 50
  locations = null
  timer = null
  window.initSearch = function() {
    document.addEventListener("deviceready", function() {
      loadLocations();
      $("#search_box").on('keyup keydown', function() {
        if ($(this).val().length > 0) {
          clearTimeout(timer)
          searchForSubstring($(this).val())
          timer = setTimeout(function(event) {
            window.getDataForLocation(locations.features);
          }, 2000)
        }
        if ($(this).val().length == 0) {
          loadLocations()
        }
      })
    }, true);  
  }
  
  function loadLocations() {
    $.ajax({
      url: "https://potdrive.herokuapp.com/api/map_mobile_data",
      type: "GET",
      success: function(data) {
        locations = data
        content = ""
        setContent()
        myScroll = new IScroll('#search_results_div', { probeType: 3 });
        initScrollEvents(myScroll);
        window.getDataForLocation(locations.features); 
        console.log(data)
      },
      error: function(e) {
        console.log(e)
        alert(e)
      }
    }) 
  }
  
  function initScrollEvents(myScroll) {
    myScroll.on('scrollEnd', function() {
      console.log(this.maxScrollY)
      if (this.directionY == 1 && this.y <= this.maxScrollY) {
        loadMoreLocations();
      }
    })
  }
  
  function loadMoreLocations() {
    number_of_locations = initial_number_of_locations + 50
    content = ""
    $('.ui-last-child').removeClass('ui-last-child')
    $.each(locations.features, function(index, value) {
      if (index > initial_number_of_locations - 1 && index < number_of_locations) {
        addListItem(index, value);
      }
      if (index == number_of_locations - 1) {
        $('#search-results').append(content)
        setTimeout(function() {
          myScroll.refresh()
        }, 100)
        initial_number_of_locations = number_of_locations
        return false
      }
    })
  }
  
  function addListItem(index, location) {
    fullAddress = ""
    fullAddress = location.properties.address
    if (location.properties.city != null && location.properties.city != "") {
      fullAddress = fullAddress + ", " + location.properties.city
    }
    if (location.properties.state != null && location.properties.state != "") {
      fullAddress = fullAddress + ", " + location.properties.state
    }
    if ((content.indexOf(location.properties.name.toLowerCase()) < 0) && index == 0) {
      content = content + "<li class='ui-li-static ui-body-inherit ui-first-child' data-index=" + index + ">" + location.properties.name + "<span class='item'>" + fullAddress + "</span>" + "</li>"
    } else if ((content.indexOf(location.properties.name))) {
      content = content + "<li class='ui-li-static ui-body-inherit' data-index=" + index + ">" + location.properties.name + "<span class='item'>" + fullAddress + "</span>" + "</li>"
    }
  }
  
  function createListItem(index, location) {
    fullAddress = window.setFullAddress(location)
    if (index == 0) {
      content = content + "<li class='ui-li-static ui-body-inherit ui-first-child' data-index=" + index + ">" + location.properties.name + "<span class='item'>" + fullAddress + "</span>" + "</li>"
    } else if (index == locations.length - 1) {
      content = content + "<li class='ui-li-static ui-body-inherit ui-last-child' data-index=" + index + ">" + location.properties.name + "<span class='item'>" + fullAddress + "</span>" + "</li>"
    } else {
      content = content + "<li class='ui-li-static ui-body-inherit' data-index=" + index + ">" + location.properties.name + "<span class='item'>" + fullAddress + "</span>" + "</li>"
    }  
  }
  
  function setContent() {
    $.each(locations.features, function(index, value) {
      if (index < 50) {
        createListItem(index, value);
      } else {
        $('#search-results').empty()
        $('#search-results').html(content)
        return false
      }
    })
    
  }
  
  function searchForSubstring(substring) {
    //refresh scroll when updating search
    if (typeof myScroll !== 'undefined') {
      myScroll.destroy()
    }
    //make the keyword for search lowercase
    substring = substring.toLowerCase()
    $.each(locations.features, function(index, value) {
      //search by name, address and city of location
      //and append the location if it matches
      if (value.properties.name != null) {
        thisName = value.properties.name.toLowerCase()
      }
      if (value.properties.address != null) {
        thisAddress = value.properties.address.toLowerCase()  
      }
      if (value.properties.city != null) {
        thisCity = value.properties.city.toLowerCase()
      }
      if (value.properties.name != null && value.properties.address != null && value.properties.city != null) {
        if (thisName.indexOf(substring) >= 0) {
          addListItem(index, value);
        }
        if (thisAddress.indexOf(substring) >= 0) {
          addListItem(index, value);
        }
        if (thisCity.indexOf(substring) >= 0) {
          addListItem(index, value);
        }
      } else {
        return false;
      }
      
    })
    //update search result and reset
    $('#search-results').empty()
    $('#search-results').append(content)
    content = ""
    //make div scrollable
    myScroll = new IScroll('#search_results_div', { probeType: 3 });
  }
});
