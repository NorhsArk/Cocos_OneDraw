// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        viewList: {
            default: [],
            visible: false,
        },
        viewBtns: {
            default: [],
            visible: false,
        },
        curView:{
            default: null,
            type:cc.Node,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.viewList = [];
    },

    showView(view, during, inOut, isCloseAll = true , delayTrue = 0, cb) {
        var isSave = true;
        var idx;
        for (var i = 0; i < this.viewList.length; i = i + 1) {
            if (view == this.viewList[i]) {
                isSave = false;
                idx = i;
            } else {
                if (this.viewList[i].active && inOut && isCloseAll) {
                    this.viewList[i].stopAllActions();
                    this.showAnim(this.viewList[i], 0.1, i, false);
                }
            }
        }
        if (isSave) {
            idx = this.viewList.length;
            this.viewList[idx] = view;
            this.viewBtns[idx] = [];
            var childs = [];
            childs = view.getChildren();
            for (var i = 0; i < childs.length; i = i + 1) {
                var temp = childs[i].getComponent(cc.Button);
                if (null != temp) {
                    this.viewBtns[idx][this.viewBtns[idx].length] = temp;
                }else{
                    var sChilds = [];
                    sChilds = childs[i].getChildren();
                    for (var j = 0; j < sChilds.length; j = j + 1) {
                        var sTemp = sChilds[j].getComponent(cc.Button);
                        if (null != sTemp) {
                            this.viewBtns[idx][this.viewBtns[idx].length] = sTemp;
                        }else{
                            var tChilds = [];
                            tChilds = sChilds[j].getChildren();
                            for (var k = 0; k < tChilds.length; k = k + 1) {
                                var tTemp = tChilds[k].getComponent(cc.Button);
                                if (null != tTemp) {
                                    this.viewBtns[idx][this.viewBtns[idx].length] = tTemp;
                                }
                            }
                        }
                    }
                }
            }
        }
        this.showAnim(this.viewList[idx], during, idx, inOut, delayTrue , cb);
    },

    showAnim(view, during, idx, inOut , delayTrue, cb) {
        //渐现
        if (inOut && view.active == false) {
            view.active = true;
            this.curView = view;
            view.runAction(cc.sequence(cc.fadeIn(during), cc.callFunc(function () {
                if(delayTrue > 0){
                    this.scheduleOnce(function(){
                        if(view.active){
                            for (var i = 0; i < this.viewBtns[idx].length; i = i + 1) {
                                if(this.viewBtns[idx][i] != null ){
                                    this.viewBtns[idx][i].interactable = true;
                                }
                            }
                        }
                    }.bind(this),delayTrue)
                }else{
                    for (var i = 0; i < this.viewBtns[idx].length; i = i + 1) {
                        if(this.viewBtns[idx][i] != null ){
                            this.viewBtns[idx][i].interactable = true;
                        }
                    }
                }
                if (null != cb) {
                    cb();
                }
            }.bind(this), this)));

            //渐隐
        } else if (!inOut && view.active == true) {
            for (var i = 0; i < this.viewBtns[idx].length; i = i + 1) {
                this.viewBtns[idx][i].interactable = false;
            }
            var seq = cc.sequence(cc.fadeOut(during),
                cc.callFunc(function () {
                    view.active = false;
                    if (null != cb) {
                        cb();
                    }
                }.bind(this)));
            view.runAction(seq);
        }
    },

    CloseCurView(){
        if(this.curView.active){
            this.showView(this.curView, 0.3, false);
        }
    },

    GetUIPosition(myNode,parentNode,UINode){
        var temp1 = parentNode.convertToWorldSpaceAR(myNode.getPosition());
        var temp2 = UINode.convertToNodeSpaceAR(temp1);
        myNode.parent = UINode;
        myNode.position = temp2;
    },

    removeView(view){
        for (var i = 0; i < this.viewList.length; i = i + 1) {
            if (view == this.viewList[i]) {
                this.viewList.splice(i, 1);
            }
        }
    },

    //start() {},

    // update (dt) {},
});
