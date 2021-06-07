var courses = [];
var calendar;


document.addEventListener('DOMContentLoaded', function() {
  getCourses();

  document.getElementById("warning").hidden = true;

  // check if UIO api is working on test course
  const coursefetch = fetch("https://data.uio.no/studies/v1/course/IN3230/semester/21h/schedule")
  .then((res) => {
    if(!res.ok){
      document.getElementById("warning").hidden = false;
    }
  }).catch(err => function(){
    console.log(err)
  });

  document.getElementById("autocomplete").hidden = true;
  var loader = document.getElementById("loader");
  document.getElementById("loader").hidden = true;
  var calendarEl = document.getElementById('calendar');
            calendar = new FullCalendar.Calendar(calendarEl, {
              events: [],
              timeZone: 'local',
              initialDate: '2019-01-12',
              height: 650,
              initialView: 'timeGridWeek',
              timeFormat: 'h:mm',
              firstDay: 1,
              weekends: false,
              slotMinTime: "08:15:00",
              slotMaxTime: "18:00:00",
              nowIndicator: true
            });
            calendar.render();
});


window.addEventListener('click', function(e){   
  if (!document.getElementById('name-input').contains(e.target) && !document.getElementById('autocomplete').contains(e.target)){
    document.getElementById("autocomplete").hidden = true;
  }
});


function filterAutocomplete() {
  document.getElementById("autocomplete").innerHTML = '';
  for (var i = courses.length - 1; i >= 0; i--) {

    if(courses[i]["code"] != undefined && courses[i]["name"] != undefined){
      if(courses[i]["code"].toLowerCase().includes(document.getElementById("name-input").value.toLowerCase()) || courses[i]["name"].toLowerCase().includes(document.getElementById("name-input").value.toLowerCase()) || document.getElementById("name-input").value == ""){
        var newbutton = document.createElement("button");
        newbutton.innerHTML = courses[i]["code"] + " - " + courses[i]["name"];
        newbutton.classList.add("btn");
        newbutton.classList.add("btn-course");
        newbutton.classList.add("btn-info");
        newbutton.onclick = function(e){
          document.getElementById("name-input").value = e.target.innerHTML.split("-")[0].trim();
          addEvents();
          document.getElementById("autocomplete").hidden = true;
          return false;
        };
        document.getElementById("autocomplete").appendChild(newbutton);
      }
    }
   
  }
}

function showAutocomplete() {
  document.getElementById("autocomplete").hidden = false;
}

function getCourses(){
  var semester = document.getElementById("semester").value;

  var searchurl = "https://data.uio.no/studies/v1/semester/"+semester+"/courses"

  const coursefetch = fetch(searchurl)
      .then(res => res.json())
      .then((out) => {
        for (var i = out["courses"].length - 1; i >= 0; i--) {
          //courses.push(out["courses"][i]["code"] + " - " + out["courses"][i]["name"]);
          courses.push(out["courses"][i]);
          var newbutton = document.createElement("button");
          newbutton.innerHTML = out["courses"][i]["code"] + " - " + out["courses"][i]["name"];
          newbutton.classList.add("btn");
           newbutton.classList.add("btn-course");
          newbutton.classList.add("btn-info");
          document.getElementById("autocomplete").appendChild(newbutton);

        }
      filterAutocomplete()
  }).catch(err => function(){
    console.log(err)
  });
}

function removeGroups(title){
  var allevents = calendar.getEvents();
  document.getElementById(title).remove();


  for (var i = allevents.length - 1; i >= 0; i--) {
    if(allevents[i]._def.extendedProps["department"] == title){
      allevents[i].remove();
    }
  }
}

// on enter search for course
document.getElementById("name-input").addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    addEvents()
  }
});

function addEvents(){
  document.getElementById("loader").hidden = false;
  document.getElementById("button").hidden = true;
  setTimeout(function(){
      getEvents();
  }, 10);
}

function showToast(msg){
    var x = document.getElementById("snackbar");

    x.className = "show";
    x.innerHTML = msg

    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function handleErrors(response) {
  console.log(response);
  if(response.status == 500){
    showToast("Could not add course: UiO API error");
    document.getElementById("name-input").value = "";
    document.getElementById("loader").hidden = true;
    document.getElementById("button").hidden = false;
    return;
  }

  return response;

}

function getEvents(){
  var searchurl = 'https://data.uio.no/studies/v1/course/'+document.getElementById("name-input").value+'/semester/'+document.getElementById("semester").value+'/schedule';
    console.log("Fetching");
    const test = fetch(searchurl)
          .then(handleErrors)
          .then(res => res.json())
          .then((out) => {
            console.log(out);
            if(out["metadata"]["status"] != "OK"){
              showToast("Could not add course: UiO API error");
              return;
            }

            if (out["events"].length == 0){
              console.log(out);
              console.log(document.getElementById("name-input").value);
              document.getElementById("name-input").value = "";
              //document.getElementById("loader").style.width= "50px";
              document.getElementById("loader").hidden = true;
              document.getElementById("button").hidden = false;

              showToast("Could not add course: invalid course");

              return;
            }

              var randomColor = Math.floor(Math.random()*16777215).toString(16);
              var firstdate = "NOT";
              var groups = [];
              for (var i = 0; i < out["events"].length - 1; i++) {
                
                if(firstdate == "NOT"){
                  firstdate = out["events"][i]["dtStart"].substring(0, 19);
                }
                var event =  {
                      title: out["events"][i]["courseId"] + " - " + out["events"][i]["activityTitle"],
                      start: out["events"][i]["dtStart"].substring(0, 19),
                      end: out["events"][i]["dtEnd"].substring(0, 19),
                      backgroundColor: "#"+randomColor,
                      borderColor: "#"+randomColor,
                      extendedProps: {
                        department: out["events"][i]["activityTitle"] + " " + out["events"][i]["courseId"]
                      },
                      description: out["events"][i]["activityBlockType"]
                    };
                if(out["events"][i]["activityBlockType"] == "group"){
                  if(!groups.includes(out["events"][i]["activityTitle"] + " " + out["events"][i]["courseId"])){
                    groups.push(out["events"][i]["activityTitle"] + " " + out["events"][i]["courseId"]);
                  }
                }
                calendar.addEvent(event);
              }
              calendar.gotoDate(firstdate);
              var ul = document.getElementById("list");
              var li = document.createElement("li");
              var button;
              li.appendChild(document.createTextNode(document.getElementById("name-input").value));
              li.appendChild(document.createElement("br"));

              for (var i = groups.length - 1; i >= 0; i--) {
                button = document.createElement("button");
                button.style.color = "black";
                button.classList.add("btn-");
                button.style.marginLeft = "1%";
                button.id = groups[i];
                button.title = "Trykk for å fjern gruppe!";
                button.innerHTML = groups[i].split(" ")[0] + " "+ groups[i].split(" ")[1];
                button.setAttribute("onclick", "removeGroups('"+groups[i]+"')");
                li.appendChild(button);
                button.style.borderColor = "#"+randomColor;
              }
              li.classList.add("list-group-item");
              li.classList.add("d-flex");
              li.classList.add("align-items-center");
              li.style = "overflow-x:scroll";
              ul.appendChild(li);
              document.getElementById("name-input").value = "";
              //document.getElementById("loader").style.width= "50px";
              document.getElementById("loader").hidden = true;
              document.getElementById("button").hidden = false;
              document.getElementById("autocomplete").hidden = true;

              showToast("Course has been added to the calender!");

      }).catch(err => function(){
        loader.classList.add("hide");
        console.log(err)
      });
}