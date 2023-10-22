//reload page on back or forward action
if(performance.navigation.type == 2) {
    location.reload();
}

//get WAPITCH url
let WAPITCH_BASE_URL = document.querySelector('meta[name="WAPITCH_BASE_URL"]').content

//localization
let userLang = navigator.language || navigator.userLanguage;
let localization;

switch(true) {
  case userLang.includes("cs"):
    localization = JSON.parse(cs);
    break;
  case userLang.includes("en"):
    localization = JSON.parse(en);
    break;
  default:
    localization = JSON.parse(en);
}

let loc_elements = document.getElementsByClassName("localization");
for (let i = 0; i < loc_elements.length; i++) {
  loc_elements[i].textContent = localization[loc_elements[i].className.split(' '), loc_elements[i].className.split(' ')[loc_elements[i].className.split(' ').length - 1]];
}

//content data loading
let tmdb_id = document.getElementsByClassName('content-title')[0].attributes.tmdb_id.nodeValue;
let wapitch_id = document.getElementsByClassName('content-title')[0].attributes.wapitch_id.nodeValue;
let cast_box = document.getElementsByClassName('cast')[0];
let showrunner_counter = 0;

$.get({
  url: WAPITCH_BASE_URL+"/configuration/tmdb",
  headers: {"url": 'https://api.themoviedb.org/3/tv/' + tmdb_id + '?language=' + userLang}
}).done(function( data ) {
  if (data['name'] != null){
    document.getElementsByClassName('content-title')[0].textContent = data['name'];
  }
  else{
    document.getElementsByClassName('content-title')[0].textContent = data['original_name'];
  }

  if (data['first_air_date'] != null && data['first_air_date'] != ''){
      if ((data['episode_run_time'] != null && data['episode_run_time'] != '') || data['genres'].length > 0){
      document.getElementsByClassName('content-year')[0].textContent = data['first_air_date'].slice(0, 4) + ' • ';
    }
    else{
      document.getElementsByClassName('content-year')[0].textContent = data['first_air_date'].slice(0, 4);
    }
  }

  if (data['episode_run_time'] != null && data['episode_run_time'] != ''){
    if (data['genres'].length > 0){
      document.getElementsByClassName('content-runtime')[0].textContent = '~ ' + data['episode_run_time']+ ' min • ';
    }
    else{
      document.getElementsByClassName('content-runtime')[0].textContent = data['episode_run_time']+ ' min';
    }
  }

  if (data['overview'] != null && data['overview'] != ''){
    document.getElementsByClassName('content-description')[0].textContent = data['overview'];
  }
  else{
    $.get({
      url: WAPITCH_BASE_URL+"/configuration/tmdb",
      headers: {"url": 'https://api.themoviedb.org/3/tv/' + tmdb_id + '?language=en-US'}
    }).done(function( data ) {
      document.getElementsByClassName('content-description')[0].textContent = data['overview'];
    });
  }

  if (data['poster_path'] != null){
    var poster_url = 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2' + data['poster_path'];
    document.getElementsByClassName('content-poster')[0].src = poster_url;
  }
  else{
    var poster_url = "/static/images/missing_image.png";
    document.getElementsByClassName('content-poster')[0].src = poster_url;
  }

  for (let i = 0; i < data['genres'].length; i++) {
    if (i + 1 == data['genres'].length){
      document.getElementsByClassName('content-genres')[0].textContent += data['genres'][i]['name'];
    }
    else{
      document.getElementsByClassName('content-genres')[0].textContent += data['genres'][i]['name'] + ', ';
    }
  }

  for (let i = 0; i < data['created_by'].length; i++) {
    let showrunner_div = document.createElement("div");
    showrunner_div.className = "col-xs-4";
    showrunner_div.style = "display: inline-grid; padding-left: 15px;width: 115px;";

    if (showrunner_counter == 0) {
      showrunner_div.textContent = localization['showrunner'];
      document.getElementsByClassName('content-creator')[0].textContent = data['created_by'][i]['name'];
    } else {
      showrunner_div.textContent = '\xa0';
      document.getElementsByClassName('content-creator')[0].textContent += ', ' + data['created_by'][i]['name'];
    }

    let director_img = document.createElement("img");
    director_img.width = 100;
    director_img.height = 100;
    director_img.style = "border-radius: 50%!important;object-fit: cover;";

    if (data['created_by'][i]['profile_path'] != null) {
      director_img.src = 'https://www.themoviedb.org/t/p/w138_and_h175_face/' + data['created_by'][i]['profile_path'];
    } else {
      director_img.src = "/static/images/missing_profile.png";
    }

    showrunner_div.appendChild(director_img);

    let director_name = document.createElement("div");
    director_name.style = "display: block; word-wrap: break-word;width: inherit; white-space: normal; text-align: center;padding-right: 15px;";

    let name_parts = data['created_by'][i]['name'].split(' ');
    for (let e = 0; e < name_parts.length; e++) {
      let name_part = document.createElement("span");

      if ((e + 1) != name_parts.length) {
        name_part.textContent = name_parts[e] + ' ';
      } else {
        name_part.textContent = name_parts[e];
      }

      director_name.append(name_part);
    }
    showrunner_div.append(director_name);
    cast_box.appendChild(showrunner_div);

    showrunner_counter += 1;
  }

  //background gradient color loading
  fetch(`${window.origin}/bg-color/${wapitch_id}`, {
    headers: new Headers({
      "image-path": 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2' + data['poster_path']
    })
  })
    .then(function (response) {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem. Status code: ${response.status}`);
        return;
      }
      response.json().then(function (data) {
        let body = document.getElementsByTagName('body')[0];
        body.style.background = 'linear-gradient( 351deg, rgb(0, 0, 0) 42%, rgb(' + data['red'] + ',' + data['green'] + ',' + data['blue'] + ') 100%)';
      });
    })
    .catch(function (error) {
      console.log("Fetch error: " + error);
    });

  if (showrunner_counter == 0){
    document.getElementsByClassName('created-by')[0].style.display = 'none';
    document.getElementsByClassName('content-creator')[0].style.display = 'none';
  }

  //cast and crew data loading
  $.get({
    url: WAPITCH_BASE_URL+"/configuration/tmdb",
    headers: {"url": 'https://api.themoviedb.org/3/tv/' + tmdb_id + '/credits?language=' + userLang}
  }).done(function( data ) {
    for (let i = 0; i < Math.min(9-showrunner_counter, data['cast'].length); i++) {
      let actor_div = document.createElement("div");
      actor_div.style = '';
      actor_div.className = "col-xs-4";

      if (i == 0){
        actor_div.textContent = localization['cast'];
        if (showrunner_counter == 0){
          actor_div.style = 'display: inline-grid; margin-left:10px; padding-left: 10px; width: 115px;';
        }
        else{
          actor_div.style = 'display: inline-grid; margin-left:10px; padding-left: 10px; border-left: 2px solid darkgray;width: 115px;';
        }
      }
      else{
        actor_div.textContent = '\xa0';
        actor_div.style = "display: inline-grid; padding-left: 15px;width: 115px;";
      }

      let actor_img = document.createElement("img");
      actor_img.width = 100;
      actor_img.height = 100;
      actor_img.style = "border-radius: 50%!important;object-fit: cover;";

      if (data['cast'][i]['profile_path'] != null){
        actor_img.src = 'https://www.themoviedb.org/t/p/w138_and_h175_face/' + data['cast'][i]['profile_path'];
      }
      else{
        actor_img.src = "/static/images/missing_profile.png";
      }

      actor_div.appendChild(actor_img);

      let actor_name = document.createElement("div");
      actor_name.style = "display: block; word-wrap: break-word;width: inherit; white-space: normal;   text-align: center;padding-right: 15px;";

      let name_parts = data['cast'][i]['name'].split(' ')
      for (let e = 0; e < name_parts.length; e++) {
        let name_part = document.createElement("span");

        if ((e+1) != name_parts.length) {
          name_part.textContent = name_parts[e] + ' ';
        }
        else{
          name_part.textContent = name_parts[e];
        }

        actor_name.append(name_part);
      }
      actor_div.append(actor_name);
      cast_box.appendChild(actor_div);
    }
  });
});

//trailer loading
$.get({
  url: WAPITCH_BASE_URL+"/configuration/tmdb",
  headers: {"url": 'https://api.themoviedb.org/3/tv/' + tmdb_id + '/videos?language=' + userLang}
}).done(function( data ) {
  for (let i = 0; i < data['results'].length; i++) {
    if (data['results'][i]['type'] == 'Trailer'){
      document.getElementsByClassName('content-trailer')[0].href = 'https://www.youtube.com/watch?v=' + data['results'][i]['key'];
      break;
    }
  }
  if (document.getElementsByClassName('content-trailer')[0].href == ''){
    $.get({
      url: WAPITCH_BASE_URL+"/configuration/tmdb",
      headers: {"url": 'https://api.themoviedb.org/3/tv/' + tmdb_id + '/videos?language=en-US'}
    }).done(function( data ) {
      for (let i = 0; i < data['results'].length; i++) {
        if (data['results'][i]['type'] == 'Trailer'){
          document.getElementsByClassName('content-trailer')[0].href = 'https://www.youtube.com/watch?v=' + data['results'][i]['key'];
          break;
        }
      }

      if (document.getElementsByClassName('content-trailer')[0].href == ''){
        document.getElementsByClassName('content-trailer')[0].style.display = 'none';
      }
    });
  }
});

//similar content loading
let similar_content = document.getElementsByClassName('similar-content');
$.get({
  url: WAPITCH_BASE_URL+"/configuration/tmdb",
  headers: {"url": 'https://api.themoviedb.org/3/tv/' + tmdb_id + "/recommendations" + '?language=' + userLang}
}).done(function( data ) {
  if (data['results'].length > 0) {
    for (let i = 0; i < similar_content.length; i++) {
      similar_content[i].attributes.tmdb_id.nodeValue = data['results'][i]['id'];
      similar_content[i].src = 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2' + data['results'][i]['poster_path'];
      $.get({
        url: WAPITCH_BASE_URL+"/content/shows/tmdb/" + data['results'][i]['id'],
      }).done(function( data ) {
        similar_content[i].parentElement.href = "/show/" + data['id'];
      })
    }
  }
  else{
    for (let i = 0; i < similar_content.length; i++) {
      $.get({
        url: WAPITCH_BASE_URL+"/configuration/tmdb",
        headers: {"url": 'https://api.themoviedb.org/3/tv/' + similar_content[i].attributes.tmdb_id.nodeValue + '?language=' + userLang}
      }).done(function( data ) {
        if (data['poster_path'] != null){
          similar_content[i].src = 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2' + data['poster_path'];
        }
        else{
          similar_content[i].src = "/static/images/missing_image.png";
        }

        let splitted_path = window.location.href.split('/');
        if (splitted_path[splitted_path.length-1].length == 2){
          similar_content[i].parentElement.href += '/' + splitted_path[splitted_path.length-1];
        }
      });
    }
  }
});
