
cc.Class({
    extends: cc.Component,

    properties: {
        title: {
            default: null,
            type: cc.RichText,
        },
        starts: {
            default: null,
            type: cc.Node,
        },
        content:{
            default: null,
            type: cc.Node,
        },
        itemList: {
            default: [],
            type: [cc.Node],
            visible:false,
        },
        levels: {
            default: {},
        },
        bid: {
            default: 0,
            type: cc.Integer,
        },
        mid: {
            default: 0,
            type: cc.Integer,
        },
        gameApplication: {
            default: null,
            type: Object
        },
        ui_viewAtlas:{
            default:null,
            type:cc.SpriteAtlas,
        },
        lastLid: {
            default: 0,
            type: cc.Integer,
        },
    },

    onLoad: function () {
        this.gameApplication = cc.find("GameApplication").getComponent("GameApplication");
    },

    start() {

    },

    init(bid, mid, mission) {
        this.hideAllItem();
        this.title.string = "";
        if ((this.levels == null || Object.keys(this.levels).length <= 0) || this.bid != bid || this.mid != mid) {
            this.bid = bid;
            this.mid = mid;
            this.levels = mission;
            this.initContents();
        } else {
            this.bid = bid;
            this.mid = mid;
            this.initContents();
        }

        var self = this;
        var tmp_path = "conf/level_detail/b_" + bid + "/" + mid + "/" + 1;
        window.gameApplication.getConf(tmp_path, null);

        SDK().getItem(bid + "_" + mid, function (score) {
            self.starts.getComponent(cc.Label).string = score.toString();

            /* //预加载上下两关
            var tmpId = score + 1;
            var arr = [];
            arr.push(tmpId);

            if (tmpId > 1) {
                arr.push(tmpId - 1);
            }
            arr.forEach(function (tmp_lid) {
                var tmp_path = "conf/level_detail/b_" + bid + "/" + mid + "/" + tmp_lid;
                // cc.log("------tmp_path:",tmp_path);
                self.gameApplication.getConf(tmp_path, null);
            });
 */
        }.bind(this));
    },

    initContents() {
        var self = this;
        this.title.string = "<b><color=#ffffff>"+self.levels["title_"+this.gameApplication.curLang]+"</c></b>";
        this.lastLid = 0;

        this.bid = self.levels.bid;
        this.mid = self.levels.mid;
        self.initLevels(self.levels);
    },

    initLevels(level) {
        this.content.active =false;
        var total_level = level['stars'];

        for (var i = 1; i <= 31; i = i + 1) {
            if(null == this.itemList[i-1]){
                this.itemList[i-1] = this.content.getChildByName(""+i);
            }
            var i_str = i.toString();

            var itemNode = this.itemList[i-1];
            if (i > total_level) {
                itemNode.active = false;
            } else {
                var lid = i;
                itemNode.tag = lid;

                //重置
                this.setItem(itemNode, 0, false, lid);
                this.checkUnLock(itemNode,lid);
            }
        }
        var tmp_path = "conf/level_detail/b_" + this.bid + "/" + this.mid + "/" + window.lastLid;
        window.gameApplication.getConf(tmp_path, null);
    },

    //判断是否解锁
    checkUnLock(itemNode,lid) {
        var self = this;
        SDK().getItem(self.bid + "_" + self.mid + "_" + lid, function (score) {

            var isOpen = false;
            if (lid <= self.lastLid + 1 || score > 0 || lid == 1) {
                isOpen = true;
                self.setItem(itemNode, score, isOpen, lid);
            } else if (openAllLevel) {
                self.setItem(itemNode, score, true, lid);
            }

            if (score > 0) {
                self.lastLid = lid;
                window.lastLid = lid;
            }
            if(self.levels['stars'] == lid){
                self.content.active = true;
            }
        });
    },

    setItem(node, score, isOpen, lid) {
        var unlockBg = cc.find("unlock", node);
        unlockBg.active = isOpen;
        unlockBg.getComponent(cc.Sprite).spriteFrame = this.ui_viewAtlas.getSpriteFrame("check"+ (((this.mid-1)%5 + 1)) +"Bg");
        unlockBg.width = 115;
        unlockBg.height = 115;
        var lockBg= cc.find("lock", node);
        lockBg.active = !isOpen;
        lockBg.width = 115;
        lockBg.height = 115;
        cc.find("unlock/text", node).getComponent(cc.RichText).string = "<b><color=#ffffff>"+lid+"</c></b>";
        cc.find("unlock/text", node).getComponent(cc.RichText).fontSize = 50;
        cc.find("unlock/text", node).position = cc.v2(0,12);
        cc.find("unlock/star", node).active = true;
        if(score<=0){
            cc.find("unlock/star", node).color = cc.color(255,255,255,255);
        }else{
            cc.find("unlock/star", node).color = cc.color(255,204,0,255);
        }
        //cc.find("lock/text", node).getComponent(cc.Label).string = lid;

        node.active = true;
        // cc.find("stars/1",node).active = score>=1;
        // cc.find("stars/2",node).active = score>=2;
        // cc.find("stars/3",node).active = score>=3;
    },

    onLevelItemClicked(event) {
        this.gameApplication.soundManager.playSound("btn_click");
        var target = event.target;
        var targetBtn = target.getComponent(cc.Button);
        targetBtn.interactable = false;

        var tag = parseInt(target.tag);
        //判断是否可以玩
        if (tag < 1 || tag > this.lastLid+1) {
            //不能玩
            targetBtn.interactable = true;
        } else {
            //cc.log(this.bid,this.mid,tag);
            window.bid = this.bid;
            window.mid = this.mid;
            window.lid = tag;
            cc.director.loadScene("game");
        }
    },

    hideAllItem(){
        this.content.active = false;
    },

    onBackBtnClicked() {
        this.hideAllItem();
        this.gameApplication.openMainView();
        this.gameApplication.soundManager.playSound("btn_click");
    },
    // update (dt) {},
});
