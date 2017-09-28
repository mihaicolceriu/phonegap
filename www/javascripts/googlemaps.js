document.addEventListener("deviceready", function(){
  //container for clustering
  markerList = []
  MARKER_LIMIT = 50
  height = null
  LOCATION_POPUP_HEIGHT = 110
  //get DOM element for map
  div = document.getElementById('googlemaps_page')
  
  window.initMap = function() {
    $('i.fa.fa-refresh').click(function() {
      map = plugin.google.maps.Map.getMap(div)
      setTimeout(function(){
        map.setAllGesturesEnabled(false);
        $.mobile.loading('show')
      }, 1);  
      refreshMap()
      return false
    })
    //Fit map correctly on the screen
    height = $(window).height() - $('#header').height() - $('#footer').height();
    width = $(window).width();
    $('#googlemaps_page').css('height', height + 'px')
    $('#googlemaps_page').css('width', width + 'px')
    //Initiate map
    showMap()
  }
  
  function showMap() {
    map = plugin.google.maps.Map.getMap(div)
    map.one(plugin.google.maps.event.MAP_READY, function() {
      //Show my location on the map
      map.setMyLocationEnabled(true);
      //Fly map to my location
      fly_map_to_current_location();
    });
  }
  
  function fly_map_to_current_location() {
    //browser not supported (cross-origin request conflict)
    navigator.geolocation.getCurrentPosition(onMapReady, getCoordsError);
  }
  
  //fly_map_to_current_location error
  function getCoordsError(e) {
    console.log(e.message)
    alert(e.message)
  }
  
  function onMapReady(position) {
    // Move map to my position with animation
    map.animateCamera({
      target: {
        lat: position.coords.latitude, 
        lng: position.coords.longitude
      },
      zoom: 17,
      duration: 3000
    }, function() {
      //gather data for the map
      map = plugin.google.maps.Map.getMap(div)
      map.setAllGesturesEnabled(false);
      addGeoJSON();
    });
  }
  
  //get data for markers
  function addGeoJSON() {
    $.ajax({
      url: "https://potdrive.herokuapp.com/api/map_mobile_data",
      type: "GET",
      success: function(data) {
        window.locations_data = data
        console.log(data)
          //create markers from data
          addMarkers();
          //redraw markers whenever map moves
          map.on(plugin.google.maps.event.MAP_DRAG_END, addMarkers);
          setTimeout(function(){
            map.setAllGesturesEnabled(true);
            $.mobile.loading('hide');
          }, 300);
      },
      error: function(e) {
        console.log(e)
        alert('Request for locations failed.')
      }
    }) 
  }
  
  //Create markers on maps view-point
  //Gets called every time the map moves
  function addMarkers() {
    map = plugin.google.maps.Map.getMap(div)
    $.when(map.clear()).done(function() {
      map.clear()
      //get map bounds
      latLngBounds = map.getVisibleRegion()
      //container for list page
      window.list_page_data = []
      markerList = []
      markerCount = 0
      zoom = map.getCameraZoom()
      if (zoom > 7) {
        $.each(window.locations_data.features, function(index, value) {
          if (value.geometry.coordinates[0] != null && value.geometry.coordinates[1] != null) {
            if (value.geometry.coordinates[0] > latLngBounds.southwest.lng && value.geometry.coordinates[0] < latLngBounds.northeast.lng && value.geometry.coordinates[1] < latLngBounds.northeast.lat && value.geometry.coordinates[1] > latLngBounds.southwest.lat) {
              markerCount += 1
              if (markerCount < MARKER_LIMIT) {
                window.list_page_data.push(value)
                addMarkerToList(value);  
              } else {
                return false
              }
            }
          }
        })
        createMarkers()
      }  
    })
  }
  
  //create marker list for clustering
  function addMarkerToList(location) {
    fullAddress = window.setFullAddress(location)
    loc = {
      position: {
        lat: location.geometry.coordinates[1], 
        lng: location.geometry.coordinates[0]
      },
      icon: {
        url: 'www/images/markers/pot_locationpoint.png',
        size: {
          width: 25,
          height: 25
        }
      },
      title: location.properties.name,
      image: location.properties.image,
      phone: location.properties.phone,
      fullAddress: fullAddress,
      location: location
    }
    markerList.push(loc)
  }
  
  //Create clusters for map
  function createMarkers() {
    map = plugin.google.maps.Map.getMap(div)
    map.addMarkerCluster({
      boundsDraw: false,
      markers: markerList,
      icons: [
        {min: 5, max: 100, url: "www/images/circle.png", anchor: {x: 30, y: 30}}
      ]
    }, function(markerCluster) {
      markerCluster.on(plugin.google.maps.event.MARKER_CLICK, function (position, marker) {
        marker_title = marker.get("title")
        marker_image = marker.get("image")
        marker_address = marker.get("fullAddress")
        marker_phone = marker.get("phone")
        $('.location_popup .popup_title').html(marker_title)
        if (marker_image != null) {
          $('.location_popup .popup_image').attr('src', marker_image)  
        }
        $('.location_popup .popup_address').html(marker_address)
        if (marker_phone != null) {
          $('.location_popup .phone').html(marker_phone)  
        } else {
          $('.location_popup .phone').html('No phone')
        }
        $('.location_popup').removeClass('hide')
        $('.location_popup').hide()
        $('.location_popup').slideToggle(250)
        $('#googlemaps_page').css('height', height - LOCATION_POPUP_HEIGHT + 'px')
        enableMap()
        $('.location_popup').unbind('click tap');
        $('.location_popup').bind('click tap', function() {
          marker_location = marker.get("location")
          map.setDiv(null)
          window.setupLocationContent(marker_location)
        })
        $('.location_popup i.fa.fa-times').unbind('click tap');
        $('.location_popup i.fa.fa-times').bind('click tap', function() {
          $('.location_popup').unbind('click tap');
          $('.location_popup').show()
          $('.location_popup').slideToggle(250)
          $('.location_popup').addClass('hide')
          $('#googlemaps_page').css('height', height + 'px')
          enableMap()
        })
      })
    })
  }
  
  function refreshMap() {
    map = plugin.google.maps.Map.getMap(div)
    $.when(map.clear()).done(function() {
      addGeoJSON()
    })
  }
  
  window.returnToLastLocation = function() {
    enableMap()
  }
  
  function enableMap() {
    setTimeout(function() {
      map.setDiv(div)
      map = plugin.google.maps.Map.getMap(div)
      map.one(plugin.google.maps.event.MAP_READY, function() {
        //Show my location on the map
        map.setMyLocationEnabled(true);
        map.on(plugin.google.maps.event.MAP_DRAG_END, addMarkers);
      }, 1000);  
    })
  }
     
  
}, true);
