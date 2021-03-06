var h=994,w=1012; //predetermined canvas dimensions
var locs = []; //array where we will store all the wisp locations
var img; //placeholder variable to store map in
var popul = 500; //G.A. population of each generation
var genBest = 100; //number of best specimens chosen per generation
var population; //variable to later store the population in
var inputPop1,inputPop10,inputPop100,inputPop1000;
var inputBest1,inputBest10,inputBest100,inputBest1000;

function Wisp(x,y){ //constructor for a "wisp" object containing x and y coords
  this.x=x;
  this.y=y;
}

function preload(){ //preloading the image in p5.js context
  img = loadImage("Cetus_Wisp_Spawn_Map.png");
}

function setup() { //setting up canvas for p5.js to work on
  var c = createCanvas(w, h); //canvas dimensions
  c.mouseClicked(addWisp); //limits the event listeners to the canvas
  stroke(255); //line colour for drawing
  len = createDiv(''); //text element to display path length of displayed path
  popinf = createDiv(''); //controls for increasing population size (be cautious of RAM size)
  inputPop1 =  createButton('+0001');
  inputPop1.position(10, h+55);
  inputPop1.mousePressed(()=>popul+=1);
  inputPop10 =  createButton('+0010');
  inputPop10.position(60, h+55);
  inputPop10.mousePressed(()=>popul+=10);
  inputPop100 =  createButton('+0100');
  inputPop100.position(110, h+55);
  inputPop100.mousePressed(()=>popul+=100);
  inputPop1000 =  createButton('+1000');
  inputPop1000.position(160, h+55);
  inputPop1000.mousePressed(()=>popul+=1000);


  bestinf = createDiv(''); //controls for increasing generation best size (be cautious of RAM size)
  inputBest1 =  createButton('+0001');
  inputBest1.position(10, h+110);
  inputBest1.mousePressed(()=>genBest+=1);
  inputBest10 =  createButton('+0010');
  inputBest10.position(60, h+110);
  inputBest10.mousePressed(()=>genBest+=10);
  inputBest100 =  createButton('+0100');
  inputBest100.position(110, h+110);
  inputBest100.mousePressed(()=>genBest+=100);
  inputBest1000 =  createButton('+1000');
  inputBest1000.position(160, h+110);
  inputBest1000.mousePressed(()=>genBest+=1000);
}

function draw() { //p5.js draw function. This is called once per frame
  image(img,0,0); //drawing map in the background
  noFill(); //setting shape fill to none
  strokeWeight(3); //setting line and outline thickness
  for (var i=0;i<locs.length;i++){ //drawing all wisps in the "locs" array
    ellipse(locs[(i%locs.length)].x,locs[(i%locs.length)].y,10);
    //ellipse indicating wisp locations
    line(locs[(i%locs.length)].x,locs[(i%locs.length)].y,
         locs[((i+1)%locs.length)].x,locs[((i+1)%locs.length)].y);
    //lines to join each wisp to the next one according to their order in "locs"
  }

  len.html("s<sup>2</sup>: "+dPath(locs)); //setting up the text element
  popinf.html("Increase population by:");
  bestinf.html("<br><br>Increase generation best by:");

  if (locs.length > 3){
      population = fitnessEval(population,genBest);
      //if more than 3 wisps are defined it will start evolving the population
      //this is because there is only one way to connect 3 objects therefore
      //the algorithm is not needed
  }
}

function addWisp() { //telling p5.js what to do when mouse is clicked
  locs.push(new Wisp(mouseX,mouseY)); //pushing new wisps into the "locs" array
  if (locs.length>3){
    population = createPopulation(locs,popul);
    //same reason as before, population is created once there are more than 3
    //wisps located
  }
}

function d(x1,y1,x2,y2) { //semi-euclidian distance function
  return ((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
  //sqrt was omitted to improve performance since it preserves order
}

function dPath(arr){ //calculate the sq distance of an entire path
  var s = 0;
  for (i=0;i<arr.length;i++){
    s += d(arr[i].x,arr[i].y,arr[(i+1)%arr.length].x,arr[(i+1)%arr.length].y)
    //adding distances of a path in order using d() function
  }
  return s;
}

function argMin(arr){ //returns the index of the smallest element of an array
  var minval = Math.min(...arr);
  var i=0
  while (arr[i]!=minval){
    i++;
  }
  return i;
}

function mutate(arr1,i1,i2) { //function to mutate a specimen by a switch
  var arr2=[]; //new array to store output. Otherwise JS just creates a ref
  var max = arr1.length;
  for (var i=0;i<max;i++){ //constructing copy of input
    arr2.push(new Wisp(arr1[i].x,arr1[i].y));
  }
  x = arr1[i1].x + arr1[i2].x; //temporary variables to perform switch based on
  y = arr1[i1].y + arr1[i2].y; // indices given (i1 & i2)
  arr2[i1].x = x - arr1[i1].x; //switch being applied to the second array
  arr2[i1].y = y - arr1[i1].y;
  arr2[i2].x = x - arr1[i2].x;
  arr2[i2].y = y - arr1[i2].y;
  return arr2;
}

function createPopulation(arr, pop){ //setting up a first population for evolution
  var popu = []; //array to be returned with population
  var temp; //temporary variable to handle mutations
  for (i=0;i<pop;i++){
    popu.push([]); //necessarry to create an "array, of arrays, of objects"
    var i1 = floor(arr.length*Math.random()); //random indices
    var i2 = floor(arr.length*Math.random());
    temp=mutate(arr,i1%arr.length,i2%arr.length); //mutating
    for (j=0;j<arr.length;j++){
      popu[popu.length-1].push(temp[j]); //adding specimen to population
    }
  }
  return popu;
}

function fitnessEval(arr,surv){ //function to create a new population based on prev's best
  var scores = []; //array to hold fitness scores (in this case path lengths)
  var newPop = []; //array to store the newly constructed population
  var max = arr.length;
  for (var i=0;i<max;i++){
    scores.push(dPath(arr[i])); //evaluating all fitnesses
  }
  for (var i=0;i<surv;i++){ //finding a specified number of shortest paths
    var best = argMin(scores);
    if (i==0 && dPath(locs)>dPath(arr[best])){
      //setting "locs" to the very shortest path of each generation
      locs = arr[best];
    }
    newPop.push(arr[best]);
    //all best performing paths are kept for the new population
    scores[best]=Infinity

  }
  while(newPop.length<popul){
    //the rest of the population is generated by slightly mutating the previous best
    var ind = floor(newPop.length*Math.random());
    var i1 = floor(104729*Math.random()); //104729 is an arbitrary large prime num.
    var i2 = floor(104729*Math.random()); //this is to more evenly distribute the RNG
    newPop.push(mutate(newPop[ind],i1%locs.length,i2%locs.length));
  }
   return newPop;
}
