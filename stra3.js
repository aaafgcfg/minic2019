const readline = require('readline');
//let nn = require("./module.js");

const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});
let fs = require("fs");

//lr starts
//du ends


function log(a) {
	fs.appendFileSync('log.json', a);
}
fs.writeFileSync('log.json', '');

let commands = [ 'up', 'right', 'down','left'];
let up="up",
down='down'
left='left'
right='right'
let cmds = []
cmds[0] = 'right';
cmds[1] = 'up';
cmds[2] = 'left';
cmds[3] = 'down';
//let command = 'up';
let lastd = 'up';
let plan = [0]//[-1,0,0,0,0,1,0,0,0,0,1,0,0,0];
let lastscore=0;
let rmy=500;
let step = 2;
let myidx = [1,2,3,4,5,6];

function tabstr(arr){
	let out = '';
	for(let i=0;i<arr.length;i++){
		for(let j=0;j<arr[i].length;j++){
			switch(arr[i][j]){
			case 0:out+='+'   ; break;
			case -5:out+='🞎'  ;  break;
			case 5:out+='x'   ;   break;
			case 3:out+='🞓'   ;   break;
			case -1:out+=','   ;   break;
			case -4:out+='♠' ;  break;
			case -3:out+='N'  ;    break;
			default:out+=arr[i][j];
			}
		}
		out+='\n'
	}
	return out;
}


function rotarr(arr) {
	let arr2 = JSON.parse(JSON.stringify(arr));
	for (let i = 0; i < arr2.length; i++) {
		for (let j = 0; j < arr2.length; j++) {
			arr2[i][j] = arr[arr2.length - 1 - j][i];
		}
	}
	return arr2;
}

function maxi(arr) {
	let maxe = arr[0];
	let idx = 0;
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] > maxe) {
			maxe = arr[i];
			idx = i;
		}
	}
	return idx;
}

function getidx(arr, el) {
	let i = 0;
	for (i = 0; i < arr.length; i++) {
		if (arr[i] == el) {
			break;
		}
	}
	if (i == arr.length) i = undefined;
	return i;
}
function getMaxOfArray(numArray) {
	return Math.max.apply(null, numArray);
}
function getMinOfArray(numArray) {
	return Math.min.apply(null, numArray);
}

function maphave(map,el){
	let out = false;
	for(let i=0;i<map.length;i++){
		for(let j=0;j<map[i].length;j++){
			if(getidx(el,map[i][j])!=undefined){
				out=true;
				return out;
			}
		}
	}
	return out;
}

function objtor(obj){
	return Math.abs(obj.x-obj.dx)+Math.abs(obj.y-obj.dy);
}

function nearr(map,x,y,type,nstep){
	if(nstep==undefined)nstep=90
	let dx,dy;
	if(getidx(type,map[x][y+1])!=undefined){
		dy=y+1;
	}else{
		let map2 = new Array(map.length);//JSON.parse(JSON.stringify(map));
		for(let i=0;i<map2.length;i++){
			map2[i]=[];
			for(let j=0;j<map[0].length;j++){
				map2[i].push(-1);
			}
		}
		for(let i in map2)for(let j in map2[i])map2[i][j]=-1;
		map2[x][y]=0;//map2[x-1][y]=1;map2[x][y+1]=1;map2[x+1][y]=1;
		for(let n=0;n<nstep;n++){
			for(let i=1;i<map2.length-1;i++){
				for(let j=1;j<map2[i].length-1;j++){
					if((map2[i][j+1]==n)||(map2[i][j-1]==n)||(map2[i+1][j]==n)||(map2[i-1][j]==n)){
						if(map2[i][j]==-1&&map[i][j]!=6&&map[i][j]!=5){
							map2[i][j]=n+1;
							if(getidx(type,map[i][j])!=undefined){
								dx=i;dy=j;
								i=90;j=90;n=900;
								break;
							}
						}
					}
				}
			}
		}
	}
	let obj = [];
	obj.x = x;
	obj.y = y;
	obj.dx=dx;
	obj.dy=dy;
	obj.r = Math.abs(x-dx)+Math.abs(y-dy);
	return obj;
}

function x2steps(plan){
	let out = [];
	for(let i=0;i<plan.length;i++){
		if(plan[i]==0)out.push(plan[i]);
		out.push(plan[i]);
	}
	return out;
}

function avoid(map,x,y,type,nstep){
	if(nstep==undefined)nstep=30;
	let dx,dy;
	let plan=new Array();
	for(let j=1;j<nstep;j++){
		for(let i=-j;i<=j;i++){
			if(map[x+i]!=undefined){
				if(map[x+i][y+j-Math.abs(i)]!=undefined){
					if(getidx(type,map[x+i][y+j-Math.abs(i)])!=undefined){
						dx=x+i
						dy=y+j-Math.abs(i)
						j=500;i=500;break;
					}
				}
				if(map[x+i][y+Math.abs(i)-j]!=undefined){
					if(getidx(type,map[x+i][y+Math.abs(i)-j])!=undefined){
						dx=x+i
						dy=y+Math.abs(i)-j
						j=500;i=500;break;
					}
				}
			}
		}
	}
	plan.push(-Math.sign(dx-x));
	if(plan[0]==0&&dy>y){
		if(map[x+1][y]!=5&&map[x+1][y]!=6)plan[0]=1;
		else if(map[x-1][y]!=5&&map[x-1][y]!=6)plan[0]=-1;
		else plan=[0];
		//plan[0]=1;
	}
	if(plan[0]==0)plan.push(0);
	
	//log(Math.abs(dx-x)+' '+JSON.stringify(plan)+'\n');
	return plan;
}


function safe(map,x,y,type,nstep){
	let map2=JSON.parse(JSON.stringify(map));
	for(let i=0;i<map.length;i++)for(let j=0;j<map[i].length;j++)map2[i][j]=-1;
	map2[x][y]=0;
	if(nstep==undefined)nstep=30;
	let dx,dy;
	let plan=new Array();
	for(let k=0;k<nstep;k++){
		for(let i=1;i<map2.length-1;i++){
			for(let j=1;j<map2[i].length-1;j++){
				if(map2[i][j]==k){
					if(map[i][j]==-5){
						dx=i;dy=j;
						nstep=k;
						break;
					}
					if(map2[i][j+1]==-1&&map[i][j+1]!=5&&map[i][j+1]!=6){
						map2[i][j+1]=k+1;
					}
					if(map2[i][j-1]==-1&&map[i][j-1]!=5&&map[i][j-1]!=6){
						map2[i][j-1]=k+1;
					}
					if(map2[i+1][j]==-1&&map[i+1][j]!=5&&map[i+1][j]!=6){
						map2[i+1][j]=k+1;
					}
					if(map2[i-1][j]==-1&&map[i-1][j]!=5&&map[i-1][j]!=6){
						map2[i-1][j]=k+1;
					}
					//log( map2[i-1][j]+' '+map2[i+1][j]+' '+map2[i][j+1]+' '+map2[i][j-1]+'\n');
				}
			}
		}
	}
	//log(tabstr(rotarr(rotarr(rotarr(map2))))+'\n');
	rmy = nstep+1;
	log(rmy+'\n');
	for(let i=nstep;i>=0;i--){
		//log(dx+' '+dy+'\n')
		//log(map2[dx][dy+1]+' '+map2[Math.round(dx+1)][dy]+'\n');
		if(map2[dx][dy+1]==nstep-1)plan=[(0)];else
		if(map2[dx+1][dy]==nstep-1)plan=[(1)];else
		plan=[(-1)];
		log('i'+i+'\n')
	}
	log(JSON.stringify(plan))
	//plan.push(Math.sign(dx-x));
	//if(plan[0]==0&&dy<y)plan[0]=1;
	//for(let i=0;i<Math.abs(dx-x);i++)plan.push(0);
	return plan;
}
function slowget(map,x,y,type,nstep){
	if(nstep==undefined)nstep=30;
	let dx=x,dy=y;
	let plan=new Array();
	for(let j=1;j<nstep;j++){
		for(let i=-j;i<=j;i++){
			if(map[x+i]!=undefined){
				if(map[x+i][y+j-Math.abs(i)]!=undefined){
					if(map[x+i][y+j-Math.abs(i)]==type){
						dx=x+i
						dy=y+j-Math.abs(i)
						j=500;i=500;break;
					}
				}
				if(map[x+i][y+Math.abs(i)-j]!=undefined){
					if(map[x+i][y+Math.abs(i)-j]==type){
						dx=x+i
						dy=y+Math.abs(i)-j
						j=500;i=500;break;
					}
				}
			}
		}
	}
	
	for(let i=0;i<Math.abs(dx-x);i++)plan=plan.concat([0,1,1,1,1]);
	
	plan.push(Math.sign(dx-x));
	if(plan[0]==0&&dy<y)plan[0]=1;
	//log(Math.abs(dx-x)+' '+JSON.stringify(plan)+'\n');
	return plan;
}
function fastget(map,x,y,type,nstep){
	if(nstep==undefined)nstep=60;
	let dx=x,dy=y;
	let plan=new Array();
	if(getidx(type,map[x][y+1])!=undefined){
		dy=y+1;
	}else{
		let map2 = new Array(map.length);//JSON.parse(JSON.stringify(map));
		for(let i=0;i<map2.length;i++){
			map2[i]=[];
			for(let j=0;j<map[0].length;j++){
				map2[i].push(-1);
			}
		}
		for(let i in map2)for(let j in map2[i])map2[i][j]=-1;
		map2[x][y]=0;//map2[x-1][y]=1;map2[x][y+1]=1;map2[x+1][y]=1;
		for(let n=0;n<nstep;n++){
			for(let i=1;i<map2.length-1;i++){
				for(let j=1;j<map2[i].length-1;j++){
					if((map2[i][j+1]==n)||(map2[i][j-1]==n)||(map2[i+1][j]==n)||(map2[i-1][j]==n)){
						if(map2[i][j]==-1&&map[i][j]!=6&&map[i][j]!=5){
							map2[i][j]=n+1;
							if(getidx(type,map[i][j])!=undefined){
								dx=i;dy=j;
								i=90;j=90;n=900;
								break;
							}
						}
					}
				}
			}
		}
		while(map2[dx][dy]>1){
			if(map2[dx+1][dy]==map2[dx][dy]-1)dx++;else
			if(map2[dx-1][dy]==map2[dx][dy]-1)dx--;else
			if(map2[dx][dy+1]==map2[dx][dy]-1)dy++;else
			if(map2[dx][dy-1]==map2[dx][dy]-1)dy--;
		}
	}
	//for(let i=0;i<Math.abs(dx-x);i++)plan=plan.concat([0]);
	plan.push(Math.sign(dx-x));
	if(plan[0]==0&&dy<y){
		if(map[x+1][y]!=5&&map[x+1][y]!=6)plan[0]=1;
		else if(map[x-1][y]!=5&&map[x-1][y]!=6)plan[0]=-1;
		else plan=[0];
	}
	//log(Math.abs(dx-x)+' '+JSON.stringify(plan)+'\n');
	return plan;
}

function can(map,x,y,to){
	for(let i=0;i<(to+8)%4;i++)
	{
		map=rotarr(map);
		let xx=x,yy=y;
		x=yy;
		y=30-xx;
	}
	for(let i=x;i<33;i++){
		if(map[i][y+1]==-5)return true
		else if((map[i][y+1]==5)||(map[i][y+1]==6))break;
	}
	for(let i=x;i>=0;i--){
		if(map[i][y+1]==-5)return true
		else if((map[i][y+1]==5)||(map[i][y+1]==6))break;
	}
	for(let i=y;i<=33;i--){
		if(map[x][i]==-5)return true
		else if((map[x][i]==5)||(map[x][i]==6))break;
	}
	return false;
}

function bigget(map,x,y,enemyes,rdanger,rreturn,linelength){
	let minu=90,minl=90,minr=90;
	let plan=[0];
	for(let i in enemyes){
		if(i!='i'){
			let locu = Math.abs(enemyes[i].position[0]/30-(x))  +Math.abs(enemyes[i].position[1]/30-(y+1));
			let locl = Math.abs(enemyes[i].position[0]/30-(x-1))+Math.abs(enemyes[i].position[1]/30-(y));
			let locr = Math.abs(enemyes[i].position[0]/30-(x+1))+Math.abs(enemyes[i].position[1]/30-(y));
			if(locu<minu)minu=locu;
			if(locl<minl)minl=locl;
			if(locr<minr)minr=locr;
			
		}
	}
	if(Math.max(rreturn)>rdanger-5&&map[x][y]!=-5){
		plan=fastget(map,x,y,[-5]);
		//log(myidx+' fastget: '+minl+' '+minu+' '+minr+' ;'+rdanger+' '+rreturn+' '+plan[0]+'\n');
	}
	else{
		if(linelength==0){
			if(rdanger<6)plan=fastget(map,x,y,[0,3,-1,-4,-3]);
			else plan=fastget(map,x,y,[-1,3,-4,-3]);
			//log(myidx+' fast: '+minl+' '+minu+' '+minr+' ;'+rdanger+' '+rreturn+' '+plan[0]+'\n');
		}else if(minu<rreturn/2&&minu>minr&&minu>minl){
			plan=[0];
			//log(myidx+' up: '+minl+' '+minu+' '+minr+' ;'+rdanger+' '+rreturn+' '+plan[0]+' did '+map[x][y]+'\n');
		}else
		if(minr<rreturn/2&&minr>minl&&minr>minu){
			plan=[1];
			//log(myidx+' left: '+minl+' '+minu+' '+minr+' ;'+rdanger+' '+rreturn+' '+plan[0]+'\n');
		}
		else
		if(minl<rreturn/2&&minl>minu&&minl>minr){
			plan=[-1];
			//log(myidx+' right: '+minl+' '+minu+' '+minr+' ;'+rdanger+' '+rreturn+' '+plan[0]+'\n');
		}else{
			if(minu>minr&&minu>minl&&minu<rreturn-4)plan=[0];else
			if(minl>minr&&minl<rreturn-4)plan=[1];else
			plan=[-1];
			
		}
	}
	
	
	//if(minl==rdanger*2)plan=[-1];else
	//if(minr==rdanger*2)plan=[1];else
	//if(minu==rdanger+2||minu==rdanger+1)
	//plan=[0];
	return plan;
}
let take=0;

let handler = (e) => {
	
	try
	{
		let str = '';
		e = JSON.parse(e);
		if (e.type == "tick" ) {
			if(typeof(myidx)=='object'){
				myidx=myidx.slice(0,e.params.players.length);
				for(let i in e.params.players){
					if(i!='i'){
						myidx[getidx(myidx,i)]=9;
					}
				}
				myidx = getMinOfArray(myidx);
				let b = 9000;
				for(let i in e.params.players){
					if(i!='i'){
						if((Math.abs(e.params.players[i].position[0]-e.params.players.i.position[0])
									+Math.abs(e.params.players[i].position[1]-e.params.players.i.position[1]))/30<b){
							take=i;
							b=(Math.abs(e.params.players[i].position[0]-e.params.players.i.position[0])
							+Math.abs(e.params.players[i].position[1]-e.params.players.i.position[1]))/30;
						}
					}
					//log(b+' '+take+'\n');
				}
			}
			let command;
			lastd = e.params.players.i.direction;
			let map = new Array(31);
			var x = Math.round((e.params.players.i.position[0] - 15) / 30),
			y = Math.round((e.params.players.i.position[1] - 15) / 30);
			
			if(lastd==undefined){
				//lastd=down
				if(x<y&&x<30-y&&x<30-x)lastd='left';else
				if(y<30-y&&y<30-x)lastd="up";else
				if(30-y<30-x)lastd='down';else
				lastd='right';
			}
			for (let i = 0; i < 31; i++) {
				map[i] = new Array(31);
				for (let j = 0; j < 31; j++) {
					map[i][j] = 0; //dangerous level
				}
			}
			
			for(let j in e.params.players){
				for (let i = 0; i < e.params.players[j].territory.length; i++) {
					map[(e.params.players[j].territory[i][0] - 15) / 30]
					[(e.params.players[j].territory[i][1] - 15) / 30] = 3;
				}
			}
			for(let j in e.params.players){
				for (let i = 0; i < e.params.players[j].lines.length; i++) {
					map[(e.params.players[j].lines[i][0] - 15) / 30]
					[(e.params.players[j].lines[i][1] - 15) / 30] = -1;
				}
			}
			for (let i = 0; i < e.params.players.i.territory.length; i++) {
				map[(e.params.players.i.territory[i][0] - 15) / 30]
				[(e.params.players.i.territory[i][1] - 15) / 30] = -5;
			}
			for (let i = 0; i < e.params.players.i.lines.length; i++) {
				map[(e.params.players.i.lines[i][0] - 15) / 30]
				[(e.params.players.i.lines[i][1] - 15) / 30] = 5;
			}
			for(let j in e.params.players){
				if(j!='i')
				map[Math.round((e.params.players[j].position[0] - 15) / 30)]
				[Math.round((e.params.players[j].position[1] - 15) / 30)] = 6;
			}
			for (let j = 0; j < e.params.bonuses.length; j++) {
				switch (e.params.bonuses[j].type) {
				case 'saw':
					map[(e.params.bonuses[j].position[0] - 15) / 30][(e.params.bonuses[j].position[1] - 15) / 30] = -4;
					break;
				case 'n':
					map[(e.params.bonuses[j].position[0] - 15) / 30][(e.params.bonuses[j].position[1] - 15) / 30] = -3;
					break;
				default:
					map[(e.params.bonuses[j].position[0] - 15) / 30][(e.params.bonuses[j].position[1] - 15) / 30] = 4;
					break; //'s'
				}
			}
			let sh = getidx(commands,lastd);		
			for(let i=0;i<(4-sh)%4;i++){
				map=rotarr(map);
				let xx=x,yy=y;
				x=yy;
				y=30-xx;
				//log(xx+' '+yy+' '+x+' '+y+'\n');
			}
			map.push([5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]);
			map.unshift([5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]);
			for(let i=0;i<map.length;i++){
				map[i].push(5);
				map[i].unshift(5);
			}x++;y++;
			
			
			// '-1'-left    '1'-right
			//if(e.params.players.i.lines.length==0)plan=[1,0]
			
			let minr = nearr(map,x,y,[6]).r;
			
			let rr = 50;
			for(let i in e.params.players){
				if(i!='i'){
					for(let j in e.params.players.i.lines){
						let b = Math.round((Math.abs(e.params.players[i].position[0]-e.params.players.i.lines[j][0])+
						Math.abs(e.params.players[i].position[1]-e.params.players.i.lines[j][1]))/30)
						if(b<rr)
						rr = b;
					}
					let b = Math.round((Math.abs(e.params.players[i].position[0]-e.params.players.i.position[0])+
					Math.abs(e.params.players[i].position[1]-e.params.players.i.position[1]))/30)
					if(b<rr)
					rr = b;
					
					
					b = Math.round((Math.abs(e.params.players[i].position[0]-
					(e.params.players.i.position[0]+nearr(map,x,y,[-5]).x)/2)   +
					Math.abs(e.params.players[i].position[1]-
					(e.params.players.i.position[1]+nearr(map,x,y,[-5]).y)/2)   )/30)
					if(b<rr)
					rr = b;
				}
			}
			let rmy; 
			if(map[x][y]==-5)rmy=0;
			else rmy=nearr(map,x,y,[-5]).r;
			
			//if(rr<rmy+1)plan = safe(map,x,y,-5);
			//else fastget(map,x,y,3);
			
			//minr - paccTo9Hue do npoTuBHuka
			//rr - paccTo9Hue do moux Luhui oT npoTuBHukoB
			//rmy - paccTo9Hue do cBoux
			/*
			for 'function list' 
			function select(){}
			*/
			{
				if(((map[x][y+1]==-5||map[x+1][y]==-5||map[x-1][y]==-5)&&map[x][y]!=-5)||(1490-e.params.tick_num)/5<rmy){plan=fastget(map,x,y,[-5]);               log(myidx+' '+1+'\n')  }
				else if(rr-4>rmy&&maphave(map,x,y,[-3,-4],6)&&e.params.bonuses.length!=0)				{plan=fastget(map,x,y,[-3,-4]);            log(myidx+' '+2+'\n')  }
				else if(rr-4>rmy&&maphave(map,x,y,[-1],1)&&e.params.tick_num>1200)					{plan=fastget(map,x,y,[-1]);               log(myidx+' '+3+'\n')  }
				else if(rr-4>rmy&&maphave(map,x,y,[3],5))								{plan=fastget(map,x,y,[-1]);               log(myidx+' '+3.5+'\n')  }
				else if(rr-4>rmy)											{plan=fastget(map,x,y,[0,3,-3,-4,-1]);     log(myidx+' '+4+'\n')  }
				else if(map[x][y]!=-5)											{plan=fastget(map,x,y,[-5]);               log(myidx+' '+5+'\n')  }
				else		 											{plan=fastget(map,x,y,[3]);                log(myidx+' '+6+'\n')  }
			}//*/                                                                                                                                                        
			//log(JSON.stringify(plan)+'\n');
			//plan=bigget(map,x,y,e.params.players,Math.max(rr,minr),rmy,e.params.players.i.lines.length);
			//if(e.params.players.i.lines.length>9)plan=fastget(map,x,y,[-5]);//*/
			
			
			if(map[x][y+1]==-1||map[x][y+1]==-4||map[x][y+1]==-3)plan=[0];
			if(map[x+1]!=undefined)if(map[x+1][y]==-1||map[x+1][y]==-4||map[x+1][y]==-3)plan=[1];
			if(map[x-1]!=undefined)if(map[x-1][y]==-1||map[x-1][y]==-4||map[x-1][y]==-3)plan=[-1];
			
			
			
			if(plan[0]==1&& (map[x+1][y]==5||map[x+1][y]==6))plan=[0];
			if(plan[0]==0&& (map[x][y+1]==5||map[x][y+1]==6))plan=[-1];
			if(plan[0]==-1&&(map[x-1][y]==5||map[x-1][y]==6))plan=[0];
			if(plan[0]==0&& (map[x][y+1]==5||map[x][y+1]==6))plan=[1];
			if(plan[0]==1&& (map[x+1][y]==5||map[x+1][y]==6))plan=[0];
			if(plan[0]==0&& (map[x][y+1]==5||map[x][y+1]==6))plan=[-1];
			
			/*if(plan[0]==1&& (map[x+1][y]==5||map[x+1][y]==6))plan=[-1];
			if(plan[0]==-1&&(map[x-1][y]==5||map[x-1][y]==6))plan=[0];*/
			//log(' '+plan.length+' '+sh+'\n')
			map[x][y]='▲';
			//log(tabstr(rotarr(rotarr(rotarr(map))))+JSON.stringify(plan)+'\n');
			//log(JSON.stringify(plan)+'\n');
			
			command = commands[(plan.shift()+sh+8)%4];
			
			
			

			lastscore = e.params.players.i.score;
			//log((e.tick%50==0)+' '+(e.params.players.i.lines.length==0)+' '+(e.tick>=150)+'\n');
			console.log(JSON.stringify({
				command,
				debug: ''
			}));
		} else if (e.type == 'end_game') {
			plan=[0]
		} else {
			plan=[0]
			//command = 'up';
		}
		
	}
	catch(e)
	{
		log(e.name+'\n'+e.message+'\n'+e.stack+'\n'+x+' '+y+'\n')
	}finally{
		
		rl.question('', handler);
	}
	
	//plan=[];
	//rl.question('', handler);
};

rl.question('', handler);






//








//
