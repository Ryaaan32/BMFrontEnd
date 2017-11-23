var bkstorList = [];

function bindEnter() {
  var bookName = document.getElementById("bookName");
  bookName.addEventListener('keypress', function (event) {
    if (event.keyCode == "13") {
      getBooks();
    }
  });
}

//获取书籍信息并展示
function getBooks() {
  //如果有之前展示的书籍数据，则先清空
  if ($('#root').children() !== null) {
    $('#root').html('');
  }
  var bookName = document.getElementById('bookName').value;
  //fetch书籍信息
  fetch('http://localhost:3000/book?name=' + bookName)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      //如果没有查询到相关书籍，则显示错误信息
      if (response.count === 0) {
        $('#root').append("<p class=\'error\'>Can't find a book named <em>" + bookName + "</em></p>");
      }
      //查询到相关书籍时，在HTML中展示
      else {
        $('#root').append("<h1>BookInformation</h1>");
        for (let i = 0; i < response.count; i++) {
          $('#root').append('<div class=\"container\" id=\"container' + i + '\"></div>');
          $('#container' + i).append('<p class=\'title\'>' + response.books[i].title + '</p>');
          $('#container' + i).append('<img class=\'photo\' src=\'' + response.books[i].image + '\'></img>');
          $('#container' + i).append('<p class=\'author\'>Author:' + response.books[i].author + '</p>');
          $('#container' + i).append('<p class=\'price\'>Price:' + response.books[i].price + '</p>');
          $('#container' + i).append('<p class=\'summary\'>Summary:' + response.books[i].summary + '</p>');
        }
      }
    });
  console.log(bookName);

  //从Wikipedia上获取该关键词的相关Wiki
  fetch('http://localhost:3000/getwiki?name=' + bookName)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      if ($('#wiki').children !== null) {
        $('#wiki').html('');
      }
      $('#wiki').append("<h1>Wiki</h1>");
      for (let i = 0; i < response.length; i++) {
        $('#wiki').append('<div class=\"link\"><a class=\"linkTitle\" href=\"https://en.wikipedia.org/wiki/' + response[i].title + '\">' + response[i].title + '</a><p class="linkSummary">' + response[i].summary + '</p></div>')
      }
      $('.link').click(function () {
        var link = this.childNodes["0"].attributes[1].value;
        window.open(link);
      })
    })
}

//获取书店信息，点击后展示前往的路线
function getBkstre() {
  if ($('#location').children() !== null) {
    $('#location').html('');
  }
  navigator.geolocation.getCurrentPosition(function (position) {
    //当前维度
    var lat = position.coords.latitude.toFixed(6);
    //当前经度
    var lgt = position.coords.longitude.toFixed(6);

    //fetch书店信息
    fetch('http://localhost:3000/gtbkstor?lat=' + lat + '&lgt=' + lgt)
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        console.log(response);
        bkstorList = response;
        //若附近没能找到书店则显示错误信息
        if (response.count === 0) {
          $('#location').append('<p class=\"error\">Can not find any bookstore around you</p>');
        }
        //找到书店则进行相应操作
        else {
          //在HTML中展示书店信息
          $('#location').append("<h1>BookstoresNearby</h1>");
          for (let i = 0; i < response.count; i++) {
            $('#location').append('<div class=\"holder\" id=\"holder' + i + '\"><div>');
            $('#holder' + i).append('<p class=\'name\'>Name:' + response.pstion[i].name + '</p>');
            $('#holder' + i).append('<p class=\'address\'>Address:' + response.pstion[i].adname + response.pstion[i].address + '</p>')
          }

          //点击holder会显示该书店的路径信息
          $('.holder').click(function () {
            //获取当前holder的编号，从bkstorList中选用相应的位置信息
            var num = this.getAttribute("id").toString()[6];
            //目标书店坐标
            //百度地图和高德地图的数据中，经纬度是相反的，此处先交换数据中','左右的经纬度数据
            var dstntnLctn = bkstorList.pstion[num].location;
            var temp1 = dstntnLctn.slice(0, 10);
            var temp2 = dstntnLctn.slice(11, 20);
            dstntnLctn = temp2 + ',' + temp1;
            //当前位置坐标
            var orgnLctn = lat + ',' + lgt;
            console.log(dstntnLctn + '\n' + orgnLctn);

            //fetch请求路线
            fetch('http://localhost:3000/getrt?origin=' + orgnLctn + '&destination=' + dstntnLctn)
              .then((response) => {
                return response.json();
              })
              .then((response) => {
                console.log(response)
                var route = response;
                console.log(route);
                //如果有之前的公交信息则先清空
                if ($('#transit').children !== null) {
                  $('#transit').html('');
                  $('#delete').remove();
                }
                //添加公交信息
                $('#route').prepend("<h1 id=\"delete\">Route</h1>");
                for (let i = 0; i < route.routes.length; i++) {
                  $('#transit').append('<div id=\"route' + i + '\">Transit' + (i + 1) + ':</div>');
                  for (let j = 0; j < route.routes[i].instructions.length; j++) {
                    $('#route' + i).append('<p class="route">' + (j + 1) + '.' + route.routes[i].instructions[j]._text + '</p>');
                  }
                }
                //添加出租车信息
                if ($('taxi').children !== null) {
                  $('#taxi').html('');
                }
                $('#taxi').append('<div class=\"taxi\">Taxi:' + route.taxi + '</div>');
              })
          });
        }
      })

  });
}

window.onload = bindEnter();