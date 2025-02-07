const menu = document.querySelector(".select-menu");
const selectBtns = menu.querySelectorAll(".select-btn");

const len = selectBtns.length;
const keys = ["bridge", "part", "partunit", "project", "projectunit"];
const db = "demo";
const collect = "book";

function createOptions(OptionArray) {
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
    li.onclick = () => {
      let selectBtn = document.querySelector(".select-btn.selected");
      selectBtn.firstChild.innerText = OptionArray[j];
      menu.classList.remove("active");
      selectBtn.classList.remove("selected");
    }
  }
}

for (let j = 0; j < len; j++) {
  let sB = selectBtns[j];
  sB.onclick = async function () {
    menu.classList.toggle("active");
    if (!this.classList.contains('selected')) {
      let filter = {};
      for (let i = 0; i < j-1; i++) {
        filter[keys[i]] = selectBtns[i].innerText;
      }
      let OptionArray = await distinctDocx(keys[j], filter, 'distinct', 'db', db, "collect", collect);
      createOptions(OptionArray);
    }
    this.classList.toggle('selected');
  }
}