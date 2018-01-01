
//CALCULATE THE QUARTERBACK PASSER RATING (QBR)
function calcQBR(comp,att,yds,td,int)
{
  //CALCS USED FOR LIMIT COMPARISONS
  var a=eval(((comp/att) * 100) - 30) / 20
  var b=eval((td/att) * 100) / 5
  var c=eval(9.5 - ((int/att) * 100)) / 4
  var d=eval((yds/att) - 3) / 4

  //LIMIT COMPARISONS
  if ( a > 2.375) { a = 2.375; }
  if ( b > 2.375) { b=2.375; }
  if ( c > 2.375) { c=2.375; }
  if ( d > 2.375) { d=2.375; }
  if ( a < 0) { a = 0; }
  if ( b < 0) { b=0; }
  if ( c < 0) { c=0; }
  if ( d < 0) { d=0; }

  //CALC FINAL QBR
  var FinalResult = eval((a+b+c+d)/.06)

  //ROUND TO ONE DECIMAL PLACE AND RETURN
  var n = Math.round(FinalResult * 10) / 10;
  return n;
}

//CALCULATE AND FORMAT DATE OF BIRTH
function calcDOB(dob)
{
  //GET THE DATE FROM THE DATASET
  var mydate = new Date(dob);
  var month = mydate.getMonth();
  var year = mydate.getFullYear();
  var day = mydate.getDate() + 1;

  //DATE MONTH IS NUMERIC SO USE A LOOKUP ARRAY TO GET THE FULL NAME
  var monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  //RETURN DATE FORMATED AS MDYYYY
  return monthNames[month] + ' ' + day + ' ' + year;
}