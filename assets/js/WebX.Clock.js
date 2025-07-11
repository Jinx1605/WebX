WebX.Clock = {
  create: function (ele_id, target) {
    var clock_div = document.createElement('div');
    clock_div.id = ele_id;
    target.appendChild(clock_div);
    WebX.Clock.update(ele_id);
  },
  update: function (ele_id) {
    var time_ele = document.getElementById(ele_id);
    var now = new Date();
    var hours = now.getHours();
    var mins = now.getMinutes().toString().padStart(2, '0');
    var day = now.getDay();
    var theDay = now.getDate();
    var month = now.getMonth();
    var year = now.getFullYear();
    var dayList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var AorP = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    time_ele.innerHTML = `${dayList[day]},&nbsp;${monthList[month]}&nbsp;${theDay},&nbsp;${year}&nbsp;&nbsp;|&nbsp;&nbsp;${hours}:${mins}&nbsp;${AorP}`;
    setTimeout(function () {
      WebX.Clock.update(ele_id);
    }, 1000);
  }
};