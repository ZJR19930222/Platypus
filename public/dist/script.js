const menu = document.querySelector(".select-menu");
const selectBtns = menu.querySelectorAll(".select-btn");
const spanSelects = menu.querySelectorAll(".sBtn-text");

const values = ["温瑞快速路1号桥左线", "左幅", "3#墩", "墩柱", "3-2#墩柱"]
let ispointer = true;

spanSelects.forEach((x, num) => {
  x.innerText = values[num];
})

const len = selectBtns.length;
const keys = ["bridge", "part", "partunit", "projection", "projectionunit"];
const db = "demo";
const collect = "book";

function createOptions(OptionArray, num) {
  let ul = document.querySelector(".options");
  ul.innerHTML = "";
  for (let j = 0; j < OptionArray.length; j++) {
    let li = document.createElement('li');
    let span = document.createElement('span');
    li.classList.add('option');
    span.classList.add('option-text');
    span.textContent = OptionArray[j];
    li.appendChild(span);
    ul.appendChild(li);
    li.onclick = async () => {
      let selectBtn = document.querySelector(".select-btn.selected");
      selectBtn.childNodes[1].innerText = OptionArray[j];
      menu.classList.remove("active");
      selectBtn.classList.remove("selected");
      let filter = {};
      for (let i = 0; i <= num - 1; i++) {
        filter[keys[i]] = selectBtns[i].innerText;
      }
      filter[keys[num]] = OptionArray[j];
      let docx = await findDocx(filter, { "projection": { "_id": 0 } }, "find", 'db', db, "collect", collect);
      for (let k = num + 1; k < len; k++) {
        selectBtns[k].childNodes[1].innerText = docx[1][0][keys[k]];
      }
      for (let k = 0; k < len; k++) {
        if (selectBtns[k].style.hasOwnProperty("pointer-events")) {
          selectBtns[k].style.removeProperty("pointer-events");
        }
      }
    }
  }
}





for (let j = 0; j < len; j++) {
  let sB = selectBtns[j];
  sB.onclick = async function () {
    menu.classList.toggle("active");
    if (!this.classList.contains('selected')) {
      let filter = {};
      for (let i = 0; i <= j - 1; i++) {
        filter[keys[i]] = selectBtns[i].innerText;
      }
      console.log(filter);
      let OptionArray = await distinctDocx(keys[j], filter, 'distinct', 'db', db, "collect", collect);
      createOptions(OptionArray[1], j);
    }
    this.classList.toggle('selected');
    for (let k = 0; k < len; k++) {
      if (selectBtns[k].style["pointer-events"]) {
        selectBtns[k].style.removeProperty("pointer-events");
      }
      else {
        selectBtns[k].style["pointer-events"] = "none";
      }
    }
  }
}