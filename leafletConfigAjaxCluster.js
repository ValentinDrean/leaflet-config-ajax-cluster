function init()
{
  if (idUser != null)
  {
    getDataFrom(idUser);
  }
  else
  {
    getCommunityData();
  }
}

var osmURL = 'INSERT URL HERE';
var tiles = L.tileLayer(osmURL,
  {
    maxZoom: 20,
    attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a>' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/"> CC-BY-SA</a>',
    id: 'mapbox.streets'
  }
);

var latLng = L.latLng(48.856614, 2.352222);
var osMap = L.map('mapid',
{
  center: latLng,
  zoom: 12,
  layers: [tiles]
});

function getAverageCluster(allChildrenMarkers)
{
  var numberPattern = /\d+/g;
  // need to parse _popup._content to get content
  var totalDataOne = 0;
  var totalDataTwo = 0;
  var avgProbDataOne = 0;
  var avgProbDataTwo = 0;
  var stringInput;
  for (var i = 0; i < allChildrenMarkers.length; i++)
  {
    stringInput = allChildrenMarkers[i]._popup._content;
    totalDataTwo += parseInt(stringInput.match(numberPattern)[0]);
    totalDataOne += parseInt(stringInput.match(numberPattern)[1]);

  }
  avgProbDataOne = totalDataOne / allChildrenMarkers.length;
  avgProbDataTwo = totalDataTwo / allChildrenMarkers.length;
  return avgProbDataOne.toFixed(2);
}

// cluster settings + style and average data recover
var markers = L.markerClusterGroup(
  {
    zoomToBoundsOnClick: true,
    spiderfyOnMaxZoom: false,
    disableClusteringAtZoom: 18,
    spiderLegPolylineOptions: {
      weight: 0,
      color: '#ffffff',
      opacity: 0
    },
    iconCreateFunction: function(cluster)
    {
      // colorize clusters with average data of group
      // It was by default configured with number of markers in a cluster
      // I changed that.
      var allChildrenMarkers = cluster.getAllChildMarkers();
      var averageCluster = getAverageCluster(allChildrenMarkers);
      var c = ' marker-cluster-';
      if (averageCluster < 10)
      {
        c += 'color-0';
      }
      else if (averageCluster < 25)
      {
        c += 'color-1';
      }
      else if (averageCluster < 50)
      {
        c += 'color-2';
      }
      else if (averageCluster < 80)
      {
        c += 'color-3';
      }
      else if (averageCluster < 100)
      {
        c += 'color-4';
      }
      else
      {
        c += 'color-5';
      }
      return L.divIcon({
        html: '<div><span>' + averageCluster + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
      }
    });

    function getColor(d)
    {
      // Colors of simple circle markers
      return d < 10 ? '#f2f0f7' :
      d < 25   ? '#cbc9e2' :
      d < 50   ? '#9e9ac8' :
      d < 80   ? '#756bb1' :
      d < 100   ? '#54278f' :
      '#2c1549';
    }

    // Color legend in bottom right
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map)
    {
      var div = L.DomUtil.create('div', 'info legend'),
      datas = [0, 10, 25, 50, 80, 100],
      labels = ['<strong> Legend </strong><br>'],
      fromThisData, toThisData;

      for (var i = 0; i < datas.length; i++)
      {
        fromThisData = datas[i];
        toThisData = datas[i+1]-1;

        labels.push
        (
          '<i style="background:' + getColor(fromThisData + 1) + '"></i> ' +
          fromThisData + (toThisData ? '&ndash;' + toThisData : '+')
        );
      }

      div.innerHTML = labels.join('<br>');
      return div;
    };

    function getDataFrom(idUser)
    {
      markers.clearLayers();
      var getData = $.ajax({
        type: 'GET',
        url: 'WEB SERVICE URL',
        async: true,
        timeout:3000,
        contentType: 'application/json; charset=utf-8',
        data: {userrequest: idUser},
        dataType: 'json'});
        getData.done(function(data)
        {
          for (var i = 0; i < data.records.length; i++)
          {
            circle = L.circle(new L.latLng([data.records[i].lat, data.records[i].long]), {
              color: 'grey',
              weight: 1,
              fillColor: getColor(data.records[i].data_type),
              fillOpacity: 0.5,
              radius: 5
            });
            circle.bindPopup( 'data_name : '
            + data.records[i].data_name
            + ' data_type : '
            + data.records[i].data_type);
            // Let's parse this !
            //markersLayer.addLayer(marker);
            markers.addLayer(circle);
            // console.log(idUser);
          }
        });
        osMap.addLayer(markers);
      }

      function getCommunityData()
      {
        markers.clearLayers();
        var getData = $.ajax({
          type: 'GET',
          url: 'WEB SERVICE URL',
          async: true,
          timeout:3000,
          contentType: 'application/json; charset=utf-8',
          dataType: 'json'});
          // console.log(getData);
          getData.done(function(data)
          {
            for(var i = 0; i < data.records.length; i++)
            {
              circle = L.circle(new L.latLng([data.records[i].lat, data.records[i].long]),
              {
                color: 'grey',
                weight: 1,
                fillColor: getColor(data.records[i].data_type),
                fillOpacity: 0.5,
                radius: 5
              });
              circle.bindPopup( 'data_name : '
              + data.records[i].data_name
              + ' data_type : '
              + data.records[i].data_type)
              markers.addLayer(circle);
            }
          });
          osMap.addLayer(markers);
        }
        legend.addTo(osMap);
        osMap.invalidateSize();
