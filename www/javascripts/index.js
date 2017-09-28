document.addEventListener("deviceready", function() {
  
  initMap();
  
  $('#menu_googlemaps_btn').on("click", function() {
    $('#menu_googlemaps_btn a').addClass('ui-btn-active');
    $('#menu_list_btn a').removeClass('ui-btn-active');
    $('#menu_search_btn a').removeClass('ui-btn-active');
    $('#header .nav_title').html('MAP')
    $('#list_page').addClass('hide');
    $('#googlemaps_page').removeClass('hide');
    $('#search_page').addClass('hide');
    $('i.fa.fa-refresh').removeClass('hide')
    if ($('#location_data').hasClass('hide')) {
      initMap();
    } else {
      $('#location_data').addClass('hide')
      $('i.fa.fa-chevron-left').addClass('hide')
    }
  })
  
  $('#menu_list_btn').on("click", function() {
    if (window.list_page_data.length === 0) {
      alert('Currently there are no locations visible on the map')
      return false;
    } else {
      setListHeight();
      initList();
      $('#menu_googlemaps_btn a').removeClass('ui-btn-active');
      $('#menu_list_btn a').addClass('ui-btn-active');
      $('#menu_search_btn a').removeClass('ui-btn-active');
      $('#header .nav_title').html('LIST')
      $('#list_page').removeClass('hide');
      $('#googlemaps_page').addClass('hide');
      $('#search_page').addClass('hide');
      if (!$('i.fa.fa-refresh').hasClass('hide')) {
        $('i.fa.fa-refresh').addClass('hide')
      }
      if ($('#location_data').hasClass('hide')) {
        // hideMap();
        initList();
      } else {
        $('#location_data').addClass('hide')
        $('i.fa.fa-chevron-left').addClass('hide')
      }
    }
  });
  
  $('#menu_search_btn').on("click", function() {
    window.setSearchResultsListHeight();
    initSearch()
    $('#menu_googlemaps_btn a').removeClass('ui-btn-active');
    $('#menu_list_btn a').removeClass('ui-btn-active');
    $('#menu_search_btn a').addClass('ui-btn-active');
    $('#header .nav_title').html('SEARCH')
    $('#list_page').addClass('hide');
    $('#googlemaps_page').addClass('hide');
    $('#search_page').removeClass('hide');
    if (!$('i.fa.fa-refresh').hasClass('hide')) {
      $('i.fa.fa-refresh').addClass('hide')
    }
    if ($('#location_data').hasClass('hide')) {
      // hideMap();
    } else {
      $('#location_data').addClass('hide')
      $('i.fa.fa-chevron-left').addClass('hide')
    }
  })
  
  window.setListHeight = function() {
    height = $(window).height() - $('#header').height() - $('#footer').height() - 15;
    $('#wrapper').css('height', height + 'px');
  }
  
  window.setSearchResultsListHeight = function() {
    height = $(window).height() - $('#header').height() - $('#footer').height() - $('.search_box').height() - 15;
    $('#search_results_div').css('height', height + 'px');
  }
  
  window.getDataForLocation = function(page_data) {
    $('.ui-li-static').unbind('click tap');
    $('.ui-li-static').bind('click tap', function() {
      document.activeElement.blur(); 
      i = $(this).data('index')
      $('#location_data').removeClass('hide')
      $.each(page_data, function(index, value) {
        if (index == i) {
          window.setupLocationContent(value)
          return false
        }
      })
    });
  }
  
  window.setupLocationContent = function(location) {
    $('#location_data').removeClass('hide')
    $('i.fa.fa-chevron-left').removeClass('hide')
    $('i.fa.fa-refresh').addClass('hide')
    $('i.fa.fa-chevron-left').bind('click tap', function() {
      if ($('#menu_list_btn a').hasClass('ui-btn-active')) {
        $('#location_data').addClass('hide');
        $('i.fa.fa-chevron-left').addClass('hide')
        $('#header .nav_title').html('LIST')
      }
      if ($('#menu_googlemaps_btn a').hasClass('ui-btn-active')) {
        $('#location_data').addClass('hide')
        $('i.fa.fa-chevron-left').addClass('hide')
        $('#header .nav_title').html('MAP')
        $('i.fa.fa-refresh').removeClass('hide')
        window.returnToLastLocation()
      }
      if ($('#menu_search_btn a').hasClass('ui-btn-active')) {
        $('#location_data').addClass('hide');
        $('i.fa.fa-chevron-left').addClass('hide')
        $('#header .nav_title').html('SEARCH')
      }
    })
    $('.view_on_map').on('click', function() {
      $('#location_data').addClass('hide')
      $('i.fa.fa-chevron-left').addClass('hide')
      $('#header .nav_title').html('MAP')
      $('i.fa.fa-refresh').removeClass('hide')  
      $('#menu_googlemaps_btn a').addClass('ui-btn-active');
      $('#menu_list_btn a').removeClass('ui-btn-active');
      $('#menu_search_btn a').removeClass('ui-btn-active');
      $('#list_page').addClass('hide');
      $('#googlemaps_page').removeClass('hide');
      $('#search_page').addClass('hide');
      window.returnToLastLocation()
    })
    $('.details_address').bind('click tap', function() {
      if (device.platform.toLowerCase() === "android") {
        navigator.app.loadUrl($(this).attr('href'), { openExternal: true })
      }
      if (device.platform.toLowerCase === "ios") {
        window.open($(this).attr('href'), '_system')
      }
    })
    
    window.rawData(location)
  }
  
  window.rawData = function(location) {
    $('#header .nav_title').html(location.properties.name)
    $('.title').html(location.properties.name)
    fullAddress = setFullAddress(location)
    if (fullAddress != null && fullAddress != "") {
      $('.subtitle').html(fullAddress)
    } else {
      $('.subtitle').html('No address')
    }
    if (location.properties.image != null && location.properties.image != "") {
      $('.location_image').attr('src', location.properties.image)
    }
    if (fullAddress != null && fullAddress != "") {
      if (fullAddress.length > 32) {
        $('.details_address').css('overflow', 'hidden')
        $('.details_address').css('white-space', 'nowrap')
        $('.details_address').css('text-overflow', 'ellipsis')
        $('.details_address').css('width', '270px')
      } else {
        $('.details_address').css('overflow', '')
        $('.details_address').css('white-space', '')
        $('.details_address').css('text-overflow', '')
        $('.details_address').css('width', '')
      }
      $('.details_address').html(fullAddress)
      addressLongLat = location.geometry.coordinates[1] + ',' + location.geometry.coordinates[0]
      add = "https://maps.google.com?q=" + addressLongLat
      $('.details_address').attr('href', add)
    } else {
      $('.details_address').html('No address')
    }
    if (location.properties.phone != null && location.properties.phone != "") {
      $('.details_phone').html(location.properties.phone)
      nr = location.properties.phone.replace(/-/g, '');
      $('.details_phone').on('click', function(e) {
        window.plugins.CallNumber.callNumber(onSuccess, onError, nr);
        e.preventDefault()
        e.stopImmediatePropagation()
      })
    } else {
      $('.details_phone').html('No phone')
    }
    if (location.properties.last_updated != null && location.properties.last_updated != "") {
      $('.last_updated').html('Last Updated ' + location.properties.last_updated)
    } else {
      $('.last_updated').html(' ')
    }
  }
  
  window.setFullAddress = function(location) {
    fullAddress = ""
    if (location.properties.address != null && location.properties.address != "") {
      fullAddress = location.properties.address
    }
    if (location.properties.city != null && location.properties.city != "") {
      fullAddress = fullAddress + ", " + location.properties.city
    }
    if (location.properties.state != null && location.properties.state != "") {
      fullAddress = fullAddress + ", " + location.properties.state
    }
    return fullAddress
  }
  
  function onSuccess(result) {
    console.log("Success: " + result);
  }

  function onError(result) {
    console.log("Error: " + result);
  }
  
}, true);
