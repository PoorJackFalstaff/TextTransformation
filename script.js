/*

This is a basic utility for surrounding lines and items 
in a line with custom text. No QoL stuff in it yet.
ONLY ARABIC NUMERAL INCREMENTER CURRENTLY WORKS--1 each in before line and before item
//TODO: ADD OTHER INCREMENTERS, MAKE IT LOOK GOOD ON MOBILE
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
    let file = e.target.files[0];
    fileReader.readAsText(file);
    fileReader.onload = () => {
      console.log(fileReader.result)
      dataInputDiv.value = fileReader.result;
    }
    
  })
  dataInputDiv.addEventListener("change", setDataInput, {once: true});
  copyOutput.addEventListener("click", copyToClipboard)
  document.querySelectorAll(".update-on-change").forEach( x => x.addEventListener("input", wrapText));
  clearInputs.addEventListener("click", clearAllInputs)
  document.querySelectorAll(".sidebar-header").forEach(x => {
    x.addEventListener("click", setupSideBarHeaderToggle);
  })
})

function setDataInput(e) {
  inputText = e.target.value.trim();
  inputText = inputText.replaceAll(/\s+\n/g, "\n");//trim each line
  
  
  //get first x lines of text, assuming \n is delimiter. if sample < x lines, get all of input
  const lineCount = 5;
  const regex = new RegExp(".+\n".repeat(lineCount));
  let sample = inputText.match(regex);
  sample = sample ? sample[0] : inputText;
  // console.log(sample);
  vars.startingItemDelimiter = getStartingItemDelimiter(sample);
  itemDelimiterDiv.value = vars.startingItemDelimiter;
  console.log(vars.startingItemDelimiter);
  dataInputDiv.readOnly = true;
}

function wrapText(e) {
  if(inputText.length < 1) return;
  let [beforeLine, afterLine, beforeItem, afterItem, itemDelimiter] = [wrapLineLeft.value, wrapLineRight.value, wrapItemLeft.value, wrapItemRight.value, itemDelimiterDiv.value];
  //go through text. if delimiter or newline character not found, send character to newtext string. if found, so stuff to it, then send to new text
  let newText = "";
  let lineCount = 2;
  let itemCount = 2;
  const lineIncrementer = getIncrementer(beforeLine);
  const itemIncrementer = getIncrementer(afterLine);
  newText += beforeLine.replace(lineIncrementer, 1) + beforeItem.replace(itemIncrementer, 1);
  for(let i = 0; i < inputText.length; i++) {
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
  if(text.indexOf("~~1++~~") > -1) return "~~1++~~";
  if(text.indexOf("~~I++~~") > -1) return "~~I++~~";
  if(text.indexOf("~~i++~~") > -1) return "~~i++~~";
}

function incrementers(incrementer, count) {
  
  return count;
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

function clearAllInputs() {
  for(let elem of [wrapLineLeft, wrapLineRight, wrapItemLeft, wrapItemRight]) {
    elem.value = "";
  }
  
  // lineDelimiterDiv.value = "\n"
  itemDelimiterDiv.value = ""; 
  
  //TODO: capture initial value, so it can be defaulted back to that in some cases
  dataInputDiv.value = "";
  dataInputDiv.addEventListener("change", setDataInput, {once:true})
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