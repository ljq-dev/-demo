//构造函数
function Mine(tr, td, mineNum){
    this.tr = tr;
    this.td = td; 
    this.mineNum = mineNum;
    this.squares = [];   //存储每一个方块的信息，以二维数组的形式调用存储
    this.tds = [];     //里边放所有td-》dom
    this.allRight = false;    //如果所有的标记红旗都对了，为true
    this.surplusMine = mineNum;   //剩余雷数
    this.parent = document.querySelector('.game');   //父级 
}

//创建格子
Mine.prototype.createDom = function(){
    let This = this;  //This 是调用实例对象的方法（防止作用域不同）
    let table = document.createElement('table');
    for(let i = 0; i < this.tr; i++){
        let domTr = document.createElement('tr');
        this.tds[i] = [];
        for(let j = 0; j < this.td; j++){
            let domTd = document.createElement('td');

            domTd.pos = [i,j]  //存储自己的坐标，方便点击时找到该dom
            domTd.onmousedown = function (e){
                This.play(e,this);    //调用玩游戏的事件
            }

            this.tds[i][j] = domTd;
            domTr.appendChild(domTd);
            // if(this.squares[i][j].type === 'mine'){     //不能被玩家看到！
            //     domTd.className = 'addMine'
            // }else{
            //     domTd.innerHTML = this.squares[i][j].value;
            // }

        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = '';
    this.parent.appendChild(table);
}

//产生不重复的雷，坐标
Mine.prototype.randomMine = function (){
    let square = new Array(this.tr*this.td)
    for(let i = 0; i < this.tr*this.td; i++){
        square[i] = i;
    }
    square.sort(function (){
        return 0.5 - Math.random();
    })
    // console.log(square);
    return square.slice(0, this.mineNum);
}

//找格子周围的八个格子
Mine.prototype.getAround = function (square){
    let x = square.x;
    let y = square.y;
    let result = [];  //存储该格子周围不是雷，是数字的坐标
    /*
        x-1,y-1  x,y-1   x+1,y-1
        x-1,y    x,y     x+1,y
        x-1,y+1  x,y+1   x+1,y+1
    */
    for(let i = x-1; i <= x+1; i++){
        for(let j = y-1; j <= y+1; j++){
            if(
                i<0 ||  //格子超出左边的坐标
                j<0 ||  //格子超出上边的坐标
                i>this.td-1 ||  //格子超出右边的坐标
                j>this.tr-1 ||  //格子超出下边的坐标
                (i == x && j == y) ||   //找到的是自己本身
                this.squares[j][i].type === 'mine'     //找到的是个雷
            ){
                continue;
            }
                result.push([j,i])
        }
    }
    return result;
}
//更新squares里的value值（getAround方法一起相辅相成）
Mine.prototype.upDataValue = function (){
    for(let i = 0; i < this.tr; i++){
        for(let j = 0; j < this.td; j++){
            //需要先判断是否是雷
            if(this.squares[i][j].type === 'number'){
                continue;   //不是雷，继续遍历（找）
            }
            //是雷，获取它旁边的数字格子，是个二维数组（需遍历）
            let num = this.getAround(this.squares[i][j])

            for(let k = 0; k < num.length; k++){
                //num[k][0]
                //num[k][1]
                this.squares[num[k][0]][num[k][1]].value += 1;
            }
        }
    }
    // console.log(this.squares);  查看是否更新了
}

//用户点击事件play
Mine.prototype.play = function (ev, obj){
    //ev,事件 ；；obj调用该方法的对象

    let This = this;
    let cl = ['addZero','addOne','addTwe','addThree','addFour','addFive','addSix','addSeven'];
    let curSquare = this.squares[obj.pos[0]][obj.pos[1]];
    if(ev.which === 1&&obj.className!='addFlag'){
        //左击事件
        if(curSquare.type === 'mine'){
            //点到的是雷
            This.gameOver(obj);

        }else{
            //点到的是数字
            obj.innerText = curSquare.value;
            obj.className = cl[curSquare.value]
            if(curSquare.value === 0){

                //使用递归
                function getZeroAround(square){
                    let res = This.getAround(square);   //找到了周围的n个格子
                    for(let i = 0; i < res.length; i++){
                        let x = res[i][0];
                        let y = res[i][1];
                        This.tds[x][y].innerText = This.squares[x][y].value;
                        This.tds[x][y].className = cl[This.squares[x][y].value]

                        //如果以某个格子找到的格子为0，那么以这个格子为中心继续找周围格子
                        if(This.squares[x][y].value === 0){
                            This.tds[x][y].innerText = '';  //如果数字为0，就不显示

                            //给对应的td添加一个属性，这条属性用于决定改对象有没有被找过，找过就为true;下一次就不会再找了
                            if(!This.tds[x][y].check){
                                This.tds[x][y].check = true;
                                getZeroAround(This.squares[x][y]);
                            }
                        }
                    }
                }
                getZeroAround(curSquare);
            }
        }
    }else if(ev.which === 3){
        /** */

        if(obj.className && obj.className!='addFlag'){  //如果是已经点开过的数字，结束
            return;
        }
        obj.className = obj.className==='addFlag'?'':'addFlag';

        if(curSquare.type === 'mine'){
            this.allRight = true;      //如果右击标记的是雷，allRight为true
        }else{
            this.allRight = false;      //有一个标记的不是雷，为false
        }

        if(obj.className === 'addFlag'){     //标记小红旗，雷数量减一
            this.plusNum.innerHTML = --this.surplusMine;
        }else{                              //取消小红旗，雷数量加一
            this.plusNum.innerHTML = ++this.surplusMine;
        }

        if(this.surplusMine == 0){      //当剩余雷的数目为0时
            if(this.allRight){          //需再作判断，标记的是否全对
                
                setTimeout(function (){alert('恭喜你，游戏成功！')},500);
            }else{
                this.gameOver();
            }
        }
    }
}
//游戏结束函数
Mine.prototype.gameOver = function (clickTd){
    /**
     * 标记出所有的雷
     * 取消所有格子的点击事件
     * 标记点中的雷，如边框为红色
     */
    for(let i = 0; i < this.tr; i++){
        for(let j = 0; j < this.td; j++){
            if(this.squares[i][j].type=='mine'){
                this.tds[i][j].className = 'addMine';
            }
            this.tds[i][j].onmousedown = null; 
        }
    }
    if(clickTd){
        clickTd.style.border = '1px solid red';
    }
    setTimeout(function (){alert('游戏失败')},200);
}
//初始化
Mine.prototype.init = function (){
    //存储this.squares里的内容
    let rn = this.randomMine();
    let n = 0;
    for(let i = 0; i < this.tr; i++){
        this.squares[i] = [];
        for(let j = 0; j < this.td; j++){
            if(rn.indexOf(n++)!==-1){
                //说明对应的这个td位置上是个雷
                this.squares[i][j] = {
                    type: 'mine',
                    x: j,
                    y: i
                }
            }else{
                this.squares[i][j] = {
                    type: 'number',
                    x: j,
                    y: i,
                    value: 0
                }
            }
        }

    }

    this.upDataValue();  //调用更新value值的方法

    this.createDom();   //调用创建格子函数方法

    this.parent.oncontextmenu = function (){   //取消game-div上的右击菜单事件（最好在父级上给，而不用去每个td上取消右击菜单事件）
        return false;
    }

    this.plusNum = document.querySelector('.mineNum span')
    this.plusNum.innerHTML = this.surplusMine;

}

// let mine = new Mine(28, 28, 99);
// mine.init();

var btns = document.querySelectorAll('.leve1 button');
var mine = null;
var arr = [[9,9,10],[16,16,40],[28,28,99]];  //行数，列数，雷数
var ln = 0;         //记录第几个被选中
for(let i = 0; i < btns.length-1; i++){
    btns[i].onclick = function (){
        btns[ln].className = '';  //让前一个被点击的按钮取消选中状态
        this.className = 'active';

        mine = new Mine(...arr[i])
        mine.init();

        ln = i;         //ln记录当前按钮
    }
}
//界面一开始状态，让初级显示
btns[0].onclick();
//重新开始按钮事件
btns[3].onclick = function (){
    btns[ln].onclick();
    // mine.init();
}