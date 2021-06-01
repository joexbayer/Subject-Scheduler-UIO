var events1 = [];
      var calendar;

      document.addEventListener('DOMContentLoaded', function() {
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
      function removeGroups(title){
        var allevents = calendar.getEvents();
        document.getElementById(title).remove();


        for (var i = allevents.length - 1; i >= 0; i--) {
          if(allevents[i]._def.extendedProps["department"] == title){
            allevents[i].remove();
          }
        }
      }

      // Execute a function when the user releases a key on the keyboard
      document.getElementById("name-input").addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
          addEvents()
        }
      });

      function addEvents(){
        document.getElementById("loader").hidden = false;
        document.getElementById("button").hidden = true;
        setTimeout(function(){
            addEvents2();
        }, 10);
      }

      function showToast(msg){
          // Get the snackbar DIV
          var x = document.getElementById("snackbar");

          // Add the "show" class to DIV
          x.className = "show";
          x.innerHTML = msg

          // After 3 seconds, remove the show class from DIV
          setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);

      }

      function addEvents2(){
        var searchurl = 'https://data.uio.no/studies/v1/course/'+document.getElementById("name-input").value+'/semester/'+document.getElementById("semester").value+'/schedule';
          console.log("Fetching");
          const test = fetch(searchurl)
                .then(res => res.json())
                .then((out) => {
                  if (out["events"].length == 0){
                    document.getElementById("name-input").value = "";
                    //document.getElementById("loader").style.width= "50px";
                    document.getElementById("loader").hidden = true;
                    document.getElementById("button").hidden = false;

                    showToast("Could not be able to add course!");

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
                    li.appendChild(document.createTextNode(document.getElementById("name-input").value + " - " + document.getElementById("semester").value));

                    for (var i = groups.length - 1; i >= 0; i--) {
                      button = document.createElement("button");
                      button.style.color = "white";
                      button.classList.add("btn-sm");
                      button.style.marginLeft = "1%";
                      button.id = groups[i];
                      button.appendChild(document.createTextNode(groups[i]))
                      button.setAttribute("onclick", "removeGroups('"+groups[i]+"')");
                      li.appendChild(button);
                      button.style.backgroundColor = "#"+randomColor;
                    }
                    li.classList.add("list-group-item");
                    li.classList.add("d-flex");
                    li.classList.add("align-items-center");
                    ul.appendChild(li);
                    document.getElementById("name-input").value = "";
                    //document.getElementById("loader").style.width= "50px";
                    document.getElementById("loader").hidden = true;
                    document.getElementById("button").hidden = false;

                    showToast("Course has been added to the calender!");

            }).catch(err => function(){
              loader.classList.add("hide");
              console.log(err)
            });
      }