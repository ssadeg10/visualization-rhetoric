var data;
var stateData;
var selectedState;
var avgList = [];
var avArr;

var noSvg;
var yesSvg;

var flag = false;

var width;
var height;
var innerHeight;
var innerWidth;
var margin = { top: 20, right: 60, bottom: 60, left: 100 };

var deathRate = "Age Adjusted Rate";

let startYear = new Date(1999, 0);
let endYear = new Date(2019, 0);

document.addEventListener('DOMContentLoaded', function() {
    noSvg = d3.select("#no-svg");
    width = +noSvg.style('width').replace('px','');
    height = +noSvg.style('height').replace('px','');;
    innerWidth = width - margin.left - margin.right;
    innerHeight = height - margin.top - margin.bottom;

    Promise.all([d3.csv("./us-suicide-mortality.csv")])
    .then(function(values){
        data = values;

        let stateSelect = document.querySelector('#state-select');
        stateSelect.value = "ca";
        stateData = getState(88);
        selectedState = stateSelect.value;

        avArr = getAverageYearlyArr();
        avgList.push({Year:"1999", Value: avArr[0]});
        for(q=0; q<20; q++){
            avgList.push({Year:`${2000+q}`, Value: avArr[q]});
        }

        drawNoSvg();
        drawYesSvg();

        stateSelect.addEventListener('change', () => {
            d3.selectAll("svg > *").remove();
            selectedState = stateSelect.value;
            drawNoSvg();
            drawYesSvg();
          });
    });
});

function getState(dataStartPos){
    var stateArr = [];
    for(i=dataStartPos; i<(dataStartPos+22); i++){
        stateArr.push(data[0][i]);
    }
    return stateArr;
}

function getMaxStateData(){
    var max = 0;
    for(i=0; i<stateData.length; i++){
      if(+stateData[i][deathRate] > max){     // important!! convert to num
        max = +stateData[i][deathRate];
      }
    }
    return max;
}

function getMaxAllData(){
    var max = 0;
    for(i=0; i<data[0].length; i++){
        if(data[0].Notes == null){
            if(+data[0][i][deathRate] > max){     // important!! convert to num
                max = +data[0][i][deathRate];
            }
        }
    }
    return max;
}

function getMinAllData(){
    var min = Number.MAX_SAFE_INTEGER;
    for(i=0; i<data[0].length; i++){
        if((data[0].Notes == null) && (+data[0][i][deathRate] != 0)){
            if(+data[0][i][deathRate] < min){     // important!! convert to num
                min = +data[0][i][deathRate];
            }
        }
    }
    return Math.floor(min);
}

function getAverageYearlyArr(){
    var total = 0;
    var avgYearArr = [];
    var avgFinalArr = [];
    for(i=0; i<21; i++){
        // push single year for all states to array
        for(j=0; j<51; j++){
            avgYearArr.push(+data[0][(22*j)+i][deathRate]);
        }
        // compute the average of the array
        for(k=0; k<avgYearArr.length; k++) {
            total += avgYearArr[k];
        }
        avgFinalArr.push(total / avgYearArr.length);
        total = 0;
        avgYearArr = [];
    }
    return avgFinalArr;
}

// function makeObj (year, value) {
//     var dataStructure = {};
//     dataStructure = `${year}`, value];
//     return dataStructure;
// }

function drawNoSvg(){
    noSvg = d3.select("#no-svg");

    switch(selectedState){
        case "ca":
            stateData = getState(88);
            break;
        case "de":
            stateData = getState(154);
            break;
        case "nv":
            stateData = getState(616);
            break;
        case "nj":
            stateData = getState(660);
            break;
        case "dc":
            stateData = getState(176);
            break;
    }

    var yAxisAdjust = 0;

    var x = d3.scaleTime()
        .domain([startYear, endYear])
        .range([0, innerWidth]);

    var y = d3.scaleLinear()
        .domain([0, getMaxStateData()+18])
        .range([innerHeight-yAxisAdjust, 0]);

    noSvg.append('g')
        .attr("id", "x-axis")
        .attr("transform", "translate("+ margin.left + "," + (innerHeight+20) + ")")
        .call(d3.axisBottom(x));
    
    noSvg.append('g')
      .attr("id", "y-axis")
      .attr("transform", "translate(" + (margin.left) + "," + (margin.top+yAxisAdjust) + ")")
      .call(d3.axisLeft(y));
    
    noSvg.append("path")
      .datum(stateData)
      .attr("class", "line")
      .attr("transform", "translate(" + (margin.left) + "," + (margin.top+yAxisAdjust) + ")")
      .attr("d", 
        d3.line()
          .x(d => x(Date.parse(d.Year)))
          .y(d => y(d[deathRate]))
      )
      .style("fill", "none")
      .style("stroke", "black")
      .style("stroke-width", "2px");
    
    noSvg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", innerWidth/2 + 2*margin.right)
      .attr("y", height-20)
      .style("font-size", "20px")
      .style("fill", "grey")
      .text("Year");
  
    noSvg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 35)
      .attr("x", -height/3 + (margin.top))
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .style("font-size", "20px")
      .style("fill", "grey")
      .text(`${selectedState.toUpperCase()} - ${deathRate}`);
}

function drawYesSvg(){
    yesSvg = d3.select("#yes-svg");

    var x = d3.scaleTime()
        .domain([startYear, endYear])
        .range([0, innerWidth]);

    var y = d3.scaleLinear()
        .domain([getMinAllData(), getMaxAllData()])
        .range([innerHeight, 0]);

    yesSvg.append('g')
        .attr("id", "x-axis")
        .attr("transform", "translate("+ margin.left + "," + (innerHeight+20) + ")")
        .call(d3.axisBottom(x));
    
    yesSvg.append('g')
      .attr("id", "y-axis")
      .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")")
      .call(d3.axisLeft(y));

    for(j=0; j<51; j++){
        thisState = getState(22*j);
        thisState.pop();

        yesSvg.append("path")
            .datum(thisState)
            .attr("class", "line")
            .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")")
            .attr("d", 
            d3.line()
                .x(d => x(Date.parse(d.Year)))
                .y(d => y(d[deathRate]))
            )
            .style("fill", "none")
            .style("stroke", "lightgrey")
            .style("stroke-width", "1px");
    }

    
    
    
    yesSvg.append("path")
        .datum(avgList)
        .attr("class", "line")
        .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")")
        .attr("d", 
        d3.line()
            .x((d) => x(Date.parse(d.Year)))
            .y((d) => y(d.Value))
        )
        .style("fill", "none")
        .style("stroke", "red")
        .style("stroke-width", "2px");

    yesSvg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", innerWidth/2 + 2*margin.right)
      .attr("y", height-20)
      .style("font-size", "20px")
      .style("fill", "grey")
      .text("Year");
  
    yesSvg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 35)
      .attr("x", -height/3 + (margin.top))
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .style("font-size", "20px")
      .style("fill", "grey")
      .text(`US - ${deathRate}`);
      
}