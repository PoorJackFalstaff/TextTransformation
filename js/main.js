/*

This is a basic utility for surrounding lines and items 
in a line with custom text. No QoL stuff in it yet.
ONLY ARABIC NUMERAL INCREMENTER CURRENTLY WORKS--1 each in before line and before item
//TODO: ADD OTHER INCREMENTERS, MAKE IT LOOK GOOD ON MOBILE
//TODO: MAKE LETTER INCREMENTERS GO z, aa, ab.....
//TODO: Add proper delimiter check
//TODO: Need to support incoming delimiters that are multi-characters(outputing as such works fine)
//TODO: uploading file needs to trigger the change vent of the data div
*/

/*
Started with arrays, but they were slow. Went to replaceAll, but it wasn't the easiest to work with. Going through char by char seems to be roughly on par with replace all, and is a ton easier to work with
*/
// let dataInput = [];
let inputText = "";
const fileInput = document.getElementById("file-input");
const dataInputDiv = document.getElementById("data-input");
const copyOutput = document.getElementById("copy-output")
const wrapLineLeft = document.getElementById("wrap-line-left");
const wrapLineRight = document.getElementById("wrap-line-right");
const lineDelimiterDiv = document.getElementById("line-delimiter");
const wrapItemLeft = document.getElementById("wrap-item-left");
const wrapItemRight = document.getElementById("wrap-item-right");
const itemDelimiterDiv = document.getElementById("item-delimiter");
const clearInputs = document.getElementById("clear-inputs");
const textareaStatus = document.getElementById("textarea-status");
const saveOutput = document.getElementById("save-output");
let wasTruncated = false;

const specialCharacters = document.getElementById("special-characters");

let vars = {
  startingItemDelimiter: " ",
  startingLineDelimiter: "\n",
  lineCount: 0,
  itemCount: 0
}

document.addEventListener("DOMContentLoaded", function() {
  fileInput.addEventListener("change", (e) => {
    let fileReader = new FileReader();
    console.log(e.target);
    let file = e.target.files[0];
    fileReader.readAsText(file);
    fileReader.onload = () => {
      dataInputDiv.value = fileReader.result;
      setDataInput();
    }
    
  })
  dataInputDiv.addEventListener("change", setDataInput, {once: true});
  copyOutput.addEventListener("click", copyToClipboard)
  saveOutput.addEventListener("click", saveToComputer);
  document.querySelectorAll(".update-on-change").forEach( x => x.addEventListener("input", wrapText));
  clearInputs.addEventListener("click", clearAllInputs)
  document.querySelectorAll(".sidebar-header").forEach(x => {
    x.addEventListener("click", setupSideBarHeaderToggle);
  })
})

function setDataInput() {
  inputText = dataInputDiv.value.trim();
  inputText = inputText.replaceAll(/\s+\n/g, "\n");//trim each line
  
  //get first x lines of text, assuming \n is delimiter. if sample < x lines, get all of input
  const maxLines = 20;
  const regex = new RegExp(".+\n".repeat(maxLines));
  let sample = inputText.match(regex);
  if(sample) wasTruncated = true;
  sample = sample ? sample[0] : inputText;
  dataInputDiv.value = sample;
  
  vars.startingItemDelimiter = getStartingItemDelimiter(sample);
  itemDelimiterDiv.value = vars.startingItemDelimiter;
  dataInputDiv.readOnly = true;
  textareaStatus.innerText = 'Input Locked';
  copyOutput.style.display = "inline-block";
  saveOutput.style.display = "inline-block";
  clearInputs.style.display = "inline-block";
}

function wrapText(e) {
  if(inputText.length < 1) return;
  let [beforeLine, afterLine, beforeItem, afterItem, itemDelimiter] = [wrapLineLeft.value, wrapLineRight.value, wrapItemLeft.value, wrapItemRight.value, itemDelimiterDiv.value];
  
  let newText = "";
  let lineCount = 2;
  let itemCount = 2;
  
  const lineIncrementer = getIncrementer(beforeLine);
  const itemIncrementer = getIncrementer(beforeItem);
  newText += beforeLine.replace(lineIncrementer, incrementers(lineIncrementer, 1)) + beforeItem.replace(itemIncrementer, incrementers(itemIncrementer, 1));
  
  for(let i = 0; i < inputText.length; i++) {
    //go through text. if delimiter or newline character not found, send character to newtext string. if found, so stuff to it, then send to new text
    let char = inputText.charAt(i);
    if(char === vars.startingItemDelimiter || char === "\n") {
      //if newline found, symbol is replaced with 1 here, then itemCount actually changed to 1 later below
      let newBeforeItem = beforeItem.replace(itemIncrementer, char === "\n" ? 1 : incrementers(itemIncrementer, itemCount));
      let newBeforeLine = beforeLine.replace(lineIncrementer, incrementers(lineIncrementer, lineCount));
      if(char === vars.startingItemDelimiter) {
        itemCount++;
        char = afterItem + itemDelimiter + newBeforeItem;
      } else if(char === "\n") {
        lineCount++;
        itemCount = 2;//for next item, since for this go, this item has already been given "1"
        char = afterItem + afterLine + "\n" + newBeforeLine + newBeforeItem;
      }
    }
    newText += char;
  }
  newText += afterItem + afterLine;
  dataInputDiv.value = newText;
}

function getIncrementer(text) {
  //only one incrementer type is allowed per item/line 
  //indexof a lot faster than includes
  if(text.indexOf("~~1++~~") > -1) return "~~1++~~";
  if(text.indexOf("~~I++~~") > -1) return "~~I++~~";
  if(text.indexOf("~~i++~~") > -1) return "~~i++~~";
  if(text.indexOf("~~a++~~") > -1) return "~~a++~~";
  if(text.indexOf("~~A++~~") > -1) return "~~A++~~";
}

function incrementers(incrementer, count) {
  //basic counter starts at 1 and goes on indefinitely
  if(incrementer === "~~1++~~") return count;
  if(incrementer === "~~a++~~") return alphaIncrementer(count, false);
  if(incrementer === "~~A++~~") return alphaIncrementer(count, true);
  if(incrementer === "~~i++~~") return romanIncrementer(count, false);
  if(incrementer === "~~I++~~") return romanIncrementer(count, true);
}

function alphaIncrementer(count, isUpper) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let str = alphabet[(count - 1) % 26];
  let magnitude = parseInt( (count - 1) / 26);
  let modulo = (count-1) % 26;
  if(magnitude > 0) str = alphabet[magnitude-1] + str;
  return isUpper ? str.toUpperCase() : str;
}

function romanIncrementer(count, isUpper) {
  const ones = count % 10;
  let string = ["", "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix"][ones];
  if(count < 10) return isUpper ? string.toUpperCase() : string;
  
  const tens = Math.floor(count/10 % 10);
  string = ["", "x", "xx", "xxx", "xl", "l", "lx", "lxx", "lxxx", "xc"][tens] + string;
  if(count < 100) return isUpper ? string.toUpperCase() : string;

  const hundreds = Math.floor(count/100 % 10);
  string = ["", "c", "cc", "ccc", "cd", "d", "dc", "dcc", "dccc", "cm"][hundreds] + string;
  if(count < 1000) return isUpper ? string.toUpperCase() : string;

  const thousands = +count.toString().substring(0, count.toString().length -3);
  let Ms = "";
  for(let i = 0; i < thousands; i++) {
    Ms += "m";
  }
  string = Ms + string;
  return isUpper ? string.toUpperCase() : string;
}


function copyToClipboard() {
  dataInputDiv.select();
  dataInputDiv.setSelectionRange(0,99999)
  navigator.clipboard.writeText(dataInputDiv.value).then( () => {
    console.log("Successfully copied")
  }, () => {
    alert("UNABLE TO COPY TO CLIPBOARD");
  })
}
// function saveToComputer() { 
//   const data = dataInputDiv.value;
//   const blob = new Blob([data], {type: "text/plain;charset=utf-8"});
//   saveAs(blob, )
// }

function clearAllInputs() {
  for(let elem of [wrapLineLeft, wrapLineRight, wrapItemLeft, wrapItemRight]) {
    elem.value = "";
  }
  
  // lineDelimiterDiv.value = "\n"
  itemDelimiterDiv.value = ""; 
  
  //TODO: capture initial value, so it can be defaulted back to that in some cases
  dataInputDiv.value = "";
  dataInputDiv.addEventListener("change", setDataInput, {once:true})
  textareaStatus.innerText = 'Waiting for text'
  copyOutput.style.display = "none";
  saveOutput.style.display = "none";
  clearInputs.style.display = "none";
  dataInputDiv.readOnly = false;
}

function setupSideBarHeaderToggle() {
  //each header div is followed by the div that is "opened" by clicking on header
  let sibling = this.nextElementSibling;
  sibling.style.display = sibling.style.display != "block" ? "block" : "none";
}

function getStartingItemDelimiter(text) {
  //disregard ending delimiter candidates
  return " ";
}