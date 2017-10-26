var prime = Array();
var powers = Array();
var g = Array();
var vis = Array();
var possibleStructures = Array();
var gnOrder = Array();
var max_m = 100000;
var groupNameString = "";
var isomorphism = -1;

//generating string for MathJax
function makeZ(n){return "\\mathbb{Z}_{"+n.toString()+"}"}
function makeZs(n){return "\\mathbb{Z}^{\\times}_{"+n.toString()+"}"}
function makeGn(m,n){return "{" + m + "}^{(" + (typeof n == "string" ? n : n.toString() ) + ")}"}
function makeOrd(s){return "\\mid " + s + "\\mid"}
function makeGroup(k){
    var res="";
    for(var i=0; i<possibleStructures[k].length; i++){
        if(i>0)res+="\\times";
        res+=makeZ(possibleStructures[k][i]);
    }
    return res;
}

//generating primes
prime.push(2);
for(var i=3; i<=max_m; i+=2){
    var t=true;
    for(j=0; j<prime.length&&prime[j]*prime[j]<=i; j++){
        if(i%prime[j]==0)t=false;
    }
    if(t)prime.push(i);
}

function gcd(a,b){
    return b==0 ? a : gcd(b,a%b);
}
function pow(n,p,m){
    var res=1;
    var b=n;
    while(p>0){
        if(p&1)res*=b;
        res%=m;
        p>>=1;b=(b*b)%m;
    }
    return res;
}

//factorize the orger of the multiplicative group
function factorize(m){
    powers=[];
    for(var i=0; i<prime.length&&prime[i]*prime[i]<=m; i++){
        while(m%prime[i]==0){
            m/=prime[i];
            if(isNaN(powers[prime[i]]))powers[prime[i]]=0;
            powers[prime[i]]++;
        }
    }
    if(m!=1){
        if(isNaN(powers[m]))powers[m]=0;
        powers[m]++;
    }
    var factorizationString = "\\( " + makeOrd(groupNameString) + " = " + g.length.toString() + "=";
    var first = 1;
    for(var i=0;i<powers.length;i++){
        if(!isNaN(powers[i])){
            if(first==0){factorizationString += "\\times";}
            else first=0;
            factorizationString += i.toString() + "^{" + powers[i] + "}";
        }
    }
    factorizationString += "\\)";
    document.getElementById("factorization").innerHTML = factorizationString;
}

//find Gn from G itself to {e}
function calcGn(m){
    vis = [];
    var d = 1;
    var res = "";
    gnOrder = [];
    for(var j=0; j<powers.length; j++){
        if(isNaN(powers[j]))continue;
        for(var k=0; k<powers[j]; k++){
            var ord=0;
            d *= j;
            for(var i=0; i<g.length; i++){
                vis[g[i]]=0;
            }
            for(var i=0; i<g.length; i++){
                var t = pow(g[i],d,m);
                if(vis[t]==0){vis[t]=1;ord++;}
            }
            gnOrder.push(ord);
            res += makeOrd(makeGn(groupNameString,d)) + "=" + ord.toString() + "\\\\ ";
            if(ord==1)break;
        }
    }
    document.getElementById("group_power").innerHTML = "\\(" + res + "\\)";
}

//find all possible structures by brute force
var stk = Array();
function dfs(p,s,n){
    if(s>n&&n>0)return ;
    if(n==0){
        if(p==powers.length-1){
            possibleStructures.push(Array());
            var len = possibleStructures.length;
            for(var i=0; i<stk.length; i++){
                possibleStructures[len-1].push(stk[i]);
            }
            return ;
        }
        else{
            for(var i=p+1; i<powers.length; i++){
                if(!isNaN(powers[i])){dfs(i,1,powers[i]);break;}
            }
            return ;
        }
    }
    for(var i=s; i<=n; i++){
        stk.push(Math.pow(p,i));
        dfs(p,i,n-i);
        stk.pop();
    }
}

//find the smallest prime factor, then start!
function findPossibleStructure(){
    possibleStructures = [];
    for(var i=2; i<powers.length; i++){
        if(!isNaN(powers[i])){dfs(i,1,powers[i]);break;}
    }
}

function verify(x){
    var d=1;
    var res = "";
    var t = 0, suc=true;
    for(var j=0; j<powers.length; j++){
        if(isNaN(powers[j]))continue;
        //d=1;
        for(var k=0; k<powers[j]; k++){
            var ord=1;
            d *= j;
            for(var i=0; i<possibleStructures[x].length; i++){
                if(d%possibleStructures[x][i]!=0){
                    var dd=gcd(d,possibleStructures[x][i]);
                    if(dd==1){
                        ord*=possibleStructures[x][i];
                    }
                    else{
                        ord*=(possibleStructures[x][i]/dd);
                    }
                }
            }
            res += (t==0 ? "" : "\\\\") + makeOrd(makeGn("G_{"+(x+1).toString()+"}",d)) + "=" + ord.toString();
            if(ord!=gnOrder[t++]){suc=false;res+="\\neq"+makeOrd(makeGn(groupNameString,d)); break;}
            else {res+="="+makeOrd(makeGn(groupNameString,d))}
            if(ord==1)break;
        }
        if(suc==false)break;
    }
    if(suc){
        isomorphism = x;
    }
    return res;
}

function solve(){
    var m = document.getElementById("m").value;
    if(m==""){alert("Please enter a number!");return ;}
    if(m>max_m||m<=1){alert("Number out of range, please calculate it yourself!");}
    groupNameString = makeZs(m);
    var groupName = document.getElementsByClassName("group_name");
    for(var i=0; i<groupName.length; i++)groupName[i].innerHTML = "$" + groupNameString + "$";
    document.getElementById("group_power_n").innerHTML = "$" + makeGn(groupNameString,"n") + "$";
    g = [];
    for(var i=1;i<=m;i++)if(gcd(i,m)==1)g.push(i);
    document.getElementById("group_order").innerHTML = "$" + g.length.toString() + "$";
    factorize(g.length);
    calcGn(m);
    findPossibleStructure();
    var possibleStructuresString = "";
    for(var i=0; i<possibleStructures.length; i++){
        possibleStructuresString += "G_{" + (i+1).toString() + "}=" + makeGroup(i) + "\\\\";
    }
    document.getElementById("possible_structures").innerHTML = "\\(" + possibleStructuresString + "\\)";

    var verificationString = "<p>For $G_{1}$:</p>\\(";
    for(var i=0; i<possibleStructures.length; i++){
        verificationString += verify(i) + "\\)";
        if(i<possibleStructures.length-1) verificationString += "<p>For $G_{" + (i+2).toString() + "}$:</p>" + "\\(";
    }
    document.getElementById("verification").innerHTML = verificationString;

    document.getElementById("isomorphism").innerHTML = "\\(G_{" + isomorphism.toString() + "}=" + makeGroup(isomorphism) + "\\)";

    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    document.getElementById("solution").style = "display:none";
}

if(document.getElementById("m")){
    document.getElementById("m").addEventListener("keypress",function(e){if(e.keyCode==13)solve();});
}
