import { isContext } from "vm";

// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var colors = [cc.color(255, 138, 138, 255), cc.color(255, 240, 138, 255), cc.color(183, 255, 138, 255), cc.color(138, 228, 255, 255), cc.color(192, 138, 255, 255)];
var lColors = [cc.color(204, 71, 71, 255), cc.color(236, 214, 66, 255), cc.color(115, 216, 52, 255), cc.color(70, 183, 218, 255), cc.color(133, 63, 214, 255)];
var HelpScript = require("HelpTip");
cc.Class({
    extends: cc.Component,

    properties: {
        clickPoint: null,
        helpNode: HelpScript,
        guideMask: {
            default: null,
            type: cc.Node,
        },
        guideHand: {
            default: null,
            type: cc.Node,
        },
        gameApplication: {
            default: null,
            visible: false,
        },
        btns: {
            default: null,
            type: cc.Node,
        },
        endView: {
            default: null,
            type: cc.Node,
        },
        giftBtn: {
            default: null,
            type: cc.Node,
        },
        levelText: {
            default: null,
            type: cc.RichText,
        },
        stageText: {
            default: null,
            type: cc.RichText,
        },
        tipText: {
            default: null,
            type: cc.RichText,
        },
        curColorIdx: {
            default: 0,
            visible: false,
        },
        curMap: {
            default: null,
            visible: false,
        },
        winCount: {
            default: 0,
            visible: false,
        },
        curPoint: {
            default: null,
            type: cc.Node,
            visible: false,
        },
        nextPoint: {
            default: null,
            type: cc.Node,
            visible: false,
        },
        drawView: {
            default: null,
            type: cc.Node,
        },
        firstPoint: {
            default: null,
            visible: false,
        },
        curPoints: {
            default: null,
            visible: false,
        },
        curLines: {
            default: null,
            visible: false,
        },
        lineList: {
            default: null,
            visible: false,
        },
        helpList: {
            default: [],
            visible: false,
        },
        backList: {
            default: [],
            visible: false,
        },
        curHelpIdx: {
            default: 0,
            visible: false,
        },
        musicFix: {
            default: 1,
            visible: false,
        },
        curMusicIdx: {
            default: 0,
            visible: false,
        },
        isHelping: {
            default: false,
            visible: false,
        },
        curDrawLine: {
            default: null,
            type: cc.Node,
        },
        adSprite: {
            default: null,
            type: cc.Sprite,
        },
        adSaver: {
            default: null,
            visible: false,
        },
        //榜单界面
        worldBtn: {
            default: null,
            type: cc.Node,
        },
        friendBtn: {
            default: null,
            type: cc.Node,
        },
        worldList: {
            default: null,
            type: cc.Node,
        },
        friendList: {
            default: null,
            type: cc.Node,
        },
        worldContent: {
            default: null,
            type: cc.Node,
        },
        friendContent: {
            default: null,
            type: cc.Node,
        },
        //头像储存
        headSpriteList: {
            default: {},
            visible: false,
        },
        //储存用户信息列表
        worldPlayer: {
            default: [],
            visible: false,
        },
        friendPlayer: {
            default: [],
            visible: false,
        },
        //储存用户UI列表
        worldUIPlayer: {
            default: [],
            visible: false,
        },
        friendUIPlayer: {
            default: [],
            visible: false,
        },
        prefab_player: {
            default: null,
            type: cc.Prefab,
        },
        point_prefab: {
            default: null,
            type: cc.Prefab,
        },
        line_prefab: {
            default: null,
            type: cc.Prefab,
        },
        goShareView: {
            default: null,
            type: cc.Node,
        },
    },

    onDisable(){
        gameApplication.popGameView.active = false;
    },

    onLoad() {
        SDK().initOP();
        var self = this;
        this.clickPoint = this.drawView.getChildByName("ClickPoint").getComponent("ClickPoint");
        if (window.gameApplication != null) {
            //预加载上下两关
            var tmpId = window.lid;
            var arr = [];
            arr.push(tmpId);
            if (tmpId > 1) {
                arr.push(tmpId - 1);
            }
            arr.push(tmpId + 1);
            arr.forEach(function (tmp_lid) {
                var tmp_path = "conf/level_detail/b_" + bid + "/" + mid + "/" + tmp_lid;
                window.gameApplication.getConf(tmp_path, function (map) {
                    if (tmp_lid == tmpId) {
                        //加载关卡
                        if (map.isReversal == null || map.isReversal == false) {
                            self.reversal(map);
                            map.isReversal = true;
                        }
                        self.curMap = map;
                        self.drawMap(map);
                    }
                });
            });
        }
        //获取提示数量
        SDK().getItem("tips", function (tip) {
            this.tipText.string = "<b><color=#ffffff>" + tip + "</c></b>";
        }.bind(this));
    },

    guideAnim() {
        this.guideHand.setLocalZOrder(1);
        this.guideHand.active = true;
        this.guideHand.position = this.helpList[0].node.position;
        this.scheduleOnce(function () {
            this.guideHand.active = false;
        }.bind(this), 8.5)
        for (var i = 1; i < 5; i = i + 1) {
            if (i == 4) {
                i = 0;
                this.guideHand.runAction(cc.sequence(cc.delayTime(6), cc.moveTo(2, this.helpList[i].node.position).easing(cc.easeIn(2))));
                i = 5;
            } else {
                this.guideHand.runAction(cc.sequence(cc.delayTime(2 * (i - 1)), cc.moveTo(2, this.helpList[i].node.position).easing(cc.easeIn(2))));
            }
        }
    },

    start() {
        //console.log(window.bid,window.mid,window.lid,window.gameApplication);
        //this.clickPoint.node.off('down', this._onVsPoleDown, this);
        //触摸移动事件处理
        this.clickPoint.node.on('moveClick', this.onClickMove, this);
        //触摸结束事件处理
        this.clickPoint.node.on('clickEnd', this.onClickEnd, this);
        //碰撞事件处理
        this.clickPoint.node.on('collision', this.onClickCollision, this);

        SDK().getItem("isFirst", function (val) {
            if (val == 0 || val == null || val == undefined) {
                SDK().setItem({ isFirst: 1 })
            } else {
                if(window.gameFirst){
                    this.goShareView.active = true;
                    window.gameFirst = false;
                }
            }
        }.bind(this))
    },

    //处理点击点的移动
    onClickMove(evt) {
        var data = evt.detail;
        var pos = data.pos;
        if (null != this.curPoint) {
            this.curDrawLine.color = this.curPoint.color;
            var length = cc.pDistance(this.curPoint.position, pos);
            var disVec = cc.v2(this.curPoint.position.x - pos.x, this.curPoint.position.y - pos.y);
            disVec = Math.atan2(disVec.x, disVec.y);
            disVec = 180 * disVec / Math.PI;
            this.curDrawLine.height = length;
            this.curDrawLine.rotation = disVec;
            this.curDrawLine.active = true;
        } else {
            this.curDrawLine.active = false;
        }
    },

    //处理点击点的移动
    onClickEnd(evt) {
        /* if (this.winCount == this.curLines.length) {
            this.curPoint = null;
        } */
    },

    //处理点击点的碰撞
    onClickCollision(evt) {
        var data = evt.detail;
        if (null == this.curPoint) {
            if (this.curPoints[data.other.node.tag].isCanUse > 0) {
                this.curPoint = data.other.node;
                if (!this.isHelping) {
                    this.pointAnim(data.other, 5, 1, true);
                } else {
                    this.pointAnim(data.other, 5, 1, false);
                }
                //开始点处理
                this.firstPoint = this.curPoint;

                //音乐处理
                if (this.curMusicIdx >= 8) {
                    if (this.musicFix == 1) {
                        this.curMusicIdx = this.curMusicIdx + 1;
                    }
                    this.musicFix = -1;
                } else if (this.curMusicIdx <= 1) {
                    if (this.musicFix == -1) {
                        this.curMusicIdx = this.curMusicIdx - 1;
                    }
                    this.musicFix = 1;
                }
                this.curMusicIdx = this.curMusicIdx + this.musicFix;
                window.gameApplication.soundManager.playSound("" + this.curMusicIdx);
                this.showTip(false);
            }
        } else {
            //判断是否有线连接两点
            if (this.lineList[this.curPoint.tag][data.other.node.tag] != null) {
                //判断是否还有连接次数
                if (this.lineList[this.curPoint.tag][data.other.node.tag].repeat > 0) {
                    this.lineList[this.curPoint.tag][data.other.node.tag].repeat--;
                    //重复的线数量处理
                    if (this.lineList[this.curPoint.tag][data.other.node.tag].Num != null) {
                        console.log(this.curPoint.tag, data.other.node.tag);
                        this.lineList[this.curPoint.tag][data.other.node.tag].Num.string = this.lineList[this.curPoint.tag][data.other.node.tag].repeat;
                        if (this.lineList[this.curPoint.tag][data.other.node.tag].repeat == 0) {
                            this.lineList[this.curPoint.tag][data.other.node.tag].Num.node.parent.active = false;
                        }
                    }
                    //下一个点
                    this.curPoints[this.curPoint.tag].isCanUse = this.curPoints[this.curPoint.tag].isCanUse - 1;
                    this.lineList[this.curPoint.tag][data.other.node.tag].color = lColors[this.curColorIdx];
                    this.winCount = this.winCount - 1;
                    //点的使用次数判断
                    if (this.curPoints[data.other.node.tag].isCanUse > 0) {
                        this.backList[this.backList.length] = {};
                        this.backList[this.backList.length - 1].line = this.lineList[this.curPoint.tag][data.other.node.tag];
                        this.backList[this.backList.length - 1].point = data.other.node;
                        var s = this.curPoint.getChildByName("Shadow");
                        s.stopAllActions();
                        s.scale = 1;
                        this.curPoint = data.other.node;
                        if (!this.isHelping) {
                            this.pointAnim(data.other, 5, 1, true);
                        } else {
                            this.pointAnim(data.other, 5, 1, false);
                        }
                        //音乐处理
                        if (this.curMusicIdx >= 8) {
                            if (this.musicFix == 1) {
                                this.curMusicIdx = this.curMusicIdx + 1;
                            }
                            this.musicFix = -1;
                        } else if (this.curMusicIdx <= 1) {
                            if (this.musicFix == -1) {
                                this.curMusicIdx = this.curMusicIdx - 1;
                            }
                            this.musicFix = 1;
                        }
                        this.curMusicIdx = this.curMusicIdx + this.musicFix;
                        window.gameApplication.soundManager.playSound("" + this.curMusicIdx);
                        this.showTip(false);
                    } else {
                        this.curPoint = null;
                    }

                    //胜利判断
                    if (this.winCount == 0) {

                        var levelDetail = {};
                        levelDetail.level = mid + "0" + (lid > 99 ? lid : (lid > 9 ? "0" + lid : "00" + lid));
                        gameApplication.DataAnalytics.levelResult(true, levelDetail);

                        SDK().getItem(bid + "_" + mid + "_" + lid, function (score) {
                            if (score <= 0) {
                                //保存自身所有星星
                                SDK().getItem("all", function (score) {
                                    score += 1;
                                    SDK().setItem({ all: score }, null);

                                    //储存到世界榜单
                                    SDK().setRankScore(2, score, "{}", null);
                                }.bind(this));

                                //保存mid关卡的星星
                                SDK().getItem(bid + "_" + mid, function (score) {
                                    score += 1;
                                    var param = {};
                                    param[bid + "_" + mid] = score;
                                    SDK().setItem(param, null);
                                }.bind(this));

                                //保存该关星星
                                var param = {};
                                param[bid + "_" + mid + "_" + lid] = 1;
                                SDK().setItem(param, null);
                            }
                        }.bind(this));
                        if (this.isHelping) {
                            this.isHelping = false;
                        }
                        this.btns.active = false;
                        this.winAnim();
                        this.scheduleOnce(function () {
                            SDK().getRecommendGames(1, function (isOK, res) {
                                if (null != res.data.rows[0].pic5 && "" != res.data.rows[0].pic5) {
                                    this.LoadSprite(res.data.rows[0].pic5, this.adSprite, this.adSaver, cc.v2(this.adSprite.node.width, this.adSprite.node.height));
                                    this.adSprite.node.off(cc.Node.EventType.TOUCH_END);
                                    this.adSprite.node.on(cc.Node.EventType.TOUCH_END, function (event) {
                                        SDK().switchGameAsync(res.data.rows[0].game_id);
                                    }, this);
                                }
                            }.bind(this))
                            window.gameApplication.viewManager.showView(this.endView, 0.3, true, true);
                            gameApplication.popGameView.active = true;
                            window.gameApplication.soundManager.playSound("winGame");
                            this.LoadRank();
                            //this.giftBtn.active = true;
                            this.giftBtn.runAction(cc.repeatForever(cc.sequence(
                                cc.rotateTo(0.1, 6).easing(cc.easeIn(2)),
                                cc.rotateTo(0.2, -6).easing(cc.easeIn(2)),
                                cc.rotateTo(0.2, 6).easing(cc.easeIn(2)),
                                cc.rotateTo(0.1, 0).easing(cc.easeIn(2)),
                                cc.delayTime(0.5))));
                            window.gameApplication.playTimes++;
                        }.bind(this), 1.7);
                    }
                }
            }
        }
    },


    pointAnim(point, scal, during, isRepeat) {
        point.node.stopAllActions();
        let shadow = point.node.getChildByName("Shadow");
        shadow.active = true;
        shadow.scale = 1;
        shadow.opacity = 255;
        if (isRepeat) {
            shadow.runAction(cc.repeatForever(cc.sequence(cc.spawn(
                cc.scaleTo(during, scal),
                cc.fadeOut(during).easing(cc.easeIn(2))
            ), cc.callFunc(function () {
                shadow.scale = 1;
                shadow.opacity = 255;
                shadow.active = true;
            }, this))));
        } else {
            shadow.runAction(cc.spawn(cc.scaleTo(during, scal), cc.fadeOut(during).easing(cc.easeIn(2))));
        }

    },

    winAnim() {
        window.gameApplication.soundManager.playSound("tip");
        this.helpList.forEach(element => {
            this.pointAnim(element, 10, 1.5);
        });
    },


    menuClick(event, type) {
        window.gameApplication.soundManager.playSound("btn_click");
        //回到选择关卡按钮
        if ("Back" == type) {
            this.backClick();

            var levelDetail = {};
            levelDetail.level = mid + "0" + (lid > 99 ? lid : (lid > 9 ? "0" + lid : "00" + lid));
            levelDetail.reason = "回到主界面"
            gameApplication.DataAnalytics.levelResult(false, levelDetail);

            //重置按钮
        } else if ("Reset" == type) {
            this.resetMap();
            if (this.isHelping) {
                this.showTip(false);
            }
            //提示按钮
        } else if ("Tip" == type) {
            if (this.isHelping) {
                return;
            }
            this.isHelping = true;
            //获取提示数量
            SDK().getItem("tips", function (tip) {
                if (tip > 0) {
                    tip = tip - 1;
                    SDK().setItem({ tips: tip }, null);
                    this.tipText.string = "<b><color=#ffffff>" + tip + "</c></b>";
                    this.resetMap();
                    this.showTip(false);
                } else {
                    window.gameApplication.showVideoView(function (isCompleted) {
                        if (isCompleted) {
                            window.gameApplication.soundManager.playSound("reward");
                            tip = 4;
                            SDK().setItem({ tips: tip }, null);
                            this.getTipsAnim(tip);
                            this.resetMap();
                            this.showTip(false);
                        }
                    }.bind(this))
                }
            }.bind(this));
            //回退按钮
        } else if ("ReGresses" == type) {
            if (this.curPoint != null) {
                var s = this.curPoint.getChildByName("Shadow");
                s.stopAllActions();
                s.scale = 1;
            }
            //提示回退处理
            if (this.isHelping) {
                if (this.curHelpIdx > 0) {
                    this.showTip(true);
                }
            }
            if (this.backList.length < 1) {
                this.curPoint = null;
                return;
            }
            if (this.backList[this.backList.length - 2] == null) {
                this.lineList[this.firstPoint.tag][this.curPoint.tag].repeat++;
                if (this.lineList[this.firstPoint.tag][this.curPoint.tag].Num != null) {
                    this.lineList[this.firstPoint.tag][this.curPoint.tag].Num.node.parent.active = true;
                    this.lineList[this.firstPoint.tag][this.curPoint.tag].Num.string = this.lineList[this.firstPoint.tag][this.curPoint.tag].repeat;
                }
                this.curPoint = this.firstPoint;
            } else {
                this.lineList[this.backList[this.backList.length - 2].point.tag][this.curPoint.tag].repeat++;
                if (this.lineList[this.backList[this.backList.length - 2].point.tag][this.curPoint.tag].Num != null) {
                    this.lineList[this.backList[this.backList.length - 2].point.tag][this.curPoint.tag].Num.node.parent.active = true;
                    this.lineList[this.backList[this.backList.length - 2].point.tag][this.curPoint.tag].Num.string = this.lineList[this.backList[this.backList.length - 2].point.tag][this.curPoint.tag].repeat;
                }
                this.curPoint = this.backList[this.backList.length - 2].point;
            }

            this.backList[this.backList.length - 1].line.color = cc.color(255, 255, 255, 255);

            if (this.backList[this.backList.length - 1].line.Num != null) {
                if (this.backList[this.backList.length - 1].line.repeat == 1) {
                    this.backList[this.backList.length - 1].line.color = lColors[this.curColorIdx];
                }
            }

            if (this.curPoint != null) {
                if (!this.isHelping) {
                    this.pointAnim({ node: this.curPoint }, 5, 1, true);
                }
            }
            this.backList.splice(this.backList.length - 1, 1);
            this.winCount = this.winCount + 1;
        }
        //结束界面 
        //看视频获得提示
        else if ("Gift" == type) {
            window.gameApplication.onGiftBtnClick(function (isCompleted) {
                if (isCompleted) {
                    SDK().getItem("tips", function (tip) {
                        window.gameApplication.soundManager.playSound("reward");
                        tip = tip + 1;
                        SDK().setItem({ tips: tip }, null);
                        this.getTipsAnim(tip);
                        this.tipText.string = "<color=#ffffff>" + tip + "</c>"
                    }.bind(this));
                }
            }.bind(this));
        }
        //重玩
        else if ("Replay" == type) {
            this.resetMap();
            window.gameApplication.viewManager.showView(this.endView, 0.3, false, true);
            gameApplication.popGameView.active = false;
        }
        //下一关按钮
        else if ("Next" == type) {
            var tmp_path = "conf/level_detail/b_" + bid + "/" + mid + "/" + (lid + 1);
            window.gameApplication.getConf(tmp_path, function (map) {
                if (null != map && map.length != 0) {
                    //加载关卡
                    if (map.isReversal == null || map.isReversal == false) {
                        this.reversal(map);
                        map.isReversal = true;
                    }
                    this.curMap = map;
                    lid = lid + 1;
                    this.resetMap();
                    window.gameApplication.viewManager.showView(this.endView, 0.3, false, true);
                    gameApplication.popGameView.active = false;
                    window.gameApplication.getConf("conf/level_detail/b_" + bid + "/" + mid + "/" + (lid + 1), null);
                } else {
                    window.gameApplication.viewManager.removeView(this.endView);
                    gameApplication.popGameView.active = false;
                    window.gameApplication.gamingBackToMian(window.bid, window.mid);
                }
            }.bind(this));
        }
        //榜单界面
        else if ("WorldRank" == type) {
            this.GetWorldRank(this.worldPlayer);
            this.worldList.active = true;
            this.worldBtn.active = true;
            this.friendList.active = false;
            this.friendBtn.active = false;
        } else if ("FriendRank" == type) {
            SDK().shareBestScore3Times("all");
            this.GetFriendRank(this.friendPlayer);
            this.worldList.active = false;
            this.worldBtn.active = false;
            this.friendList.active = true;
            this.friendBtn.active = true;
        } else if ("goShare" == type) {
            this.goShareView.active = false;
            window.gameApplication.onShareBtnClick(lid);
        }
    },

    //返回按钮
    backClick() {
        window.gameApplication.gamingBackToLevel(window.bid, window.mid);
    },

    //重新绘制地图
    resetMap() {
        this.backList = [];
        this.curHelpIdx = 0;
        this.curPoint = null;
        this.drawView.getChildByName("Points").removeAllChildren();
        this.drawView.getChildByName("Lines").removeAllChildren();
        this.drawMap(this.curMap);
    },

    getTipsAnim(tip) {
        let reward = cc.instantiate(window.gameApplication.object_prefab);
        reward.color = colors[0];
        reward.getComponent(cc.Sprite).spriteFrame = window.gameApplication.viewAtlas.getSpriteFrame("tipShape");
        reward.parent = cc.find("Canvas");
        reward.position = reward.parent.convertToNodeSpaceAR(this.giftBtn.parent.convertToWorldSpaceAR(this.giftBtn.position));
        reward.runAction(cc.spawn(cc.scaleTo(1, 1.2), cc.sequence(
            cc.moveBy(1, cc.v2(0, 100)).easing(cc.easeOut(2)),
            cc.callFunc(function () {
                reward.destroy();
            }),
        )));
    },


    //显示提示
    showTip(isBack) {
        if (!this.isHelping) {
            return;
        }
        //提示回退s
        if (isBack && this.helpList[this.curHelpIdx - 1].node == this.curPoint && ((this.curLines.length - this.winCount) == this.curHelpIdx - 1)) {
            //重置当前的提示
            var lastShadow = this.helpList[this.curHelpIdx].node.getChildByName("Tip");
            lastShadow.stopAllActions();
            lastShadow.active = false;

            //显示上一个提示
            this.curHelpIdx = this.curHelpIdx - 1;
            var shadow = this.helpList[this.curHelpIdx].node.getChildByName("Tip");
            shadow.active = true;
            shadow.scale = 1;
            shadow.runAction(cc.repeatForever(cc.sequence(
                cc.callFunc(function () {
                    if (this.isHelping) {
                        window.gameApplication.soundManager.playSound("tip");
                    }
                }.bind(this), this),
                cc.scaleTo(0.8, 2.5),
                cc.callFunc(function () {
                    shadow.scale = 1;
                }.bind(this), this)
            )));
            shadow.runAction(cc.repeatForever(cc.sequence(
                cc.fadeOut(0.8).easing(cc.easeIn(2)),
                cc.callFunc(function () {
                    shadow.opacity = 255;
                }.bind(this), this)
            )));
        } else {
            var isNext = false;
            //第一次显示
            if (this.curPoint == null) {
                this.curHelpIdx = 0;
                isNext = true;
            } else {//后面如果正确的点并且线数一致则提示下一个
                if (this.helpList[this.curHelpIdx].node == this.curPoint && ((this.curLines.length - this.winCount) == this.curHelpIdx)) {
                    this.curHelpIdx = this.curHelpIdx + 1;
                    isNext = true;
                }
            }
            if (this.curHelpIdx < this.helpList.length && isNext) {
                if (this.curHelpIdx > 0) {
                    var lastShadow = this.helpList[this.curHelpIdx - 1].node.getChildByName("Tip");
                    lastShadow.stopAllActions();
                    lastShadow.active = false;
                }
                var shadow = this.helpList[this.curHelpIdx].node.getChildByName("Tip");
                shadow.active = true;
                shadow.scale = 1;
                shadow.runAction(cc.repeatForever(cc.sequence(
                    cc.callFunc(function () {
                        if (this.isHelping) {
                            window.gameApplication.soundManager.playSound("tip");
                        }
                    }.bind(this), this),
                    cc.scaleTo(0.8, 2.5),
                    cc.callFunc(function () {
                        shadow.scale = 1;
                    }.bind(this), this)
                )));
                shadow.runAction(cc.repeatForever(cc.sequence(
                    cc.fadeOut(0.8).easing(cc.easeIn(2)),
                    cc.callFunc(function () {
                        shadow.opacity = 255;
                    }.bind(this), this)
                )));
            }
        }

    },

    //反转地图
    reversal(map) {
        var points = map.v2;
        for (var i = 0; i < points.length; i = i + 1) {
            points[i].y = map.canvas.height - points[i].y;
            points[i].x = map.canvas.width - points[i].x;
        }
    },

    shake() {
        this.tipText.node.parent.parent.runAction(cc.repeatForever(cc.sequence(
            cc.rotateTo(0.1, 5).easing(cc.easeIn(2)),
            cc.rotateTo(0.2, -5).easing(cc.easeIn(2)),
            cc.rotateTo(0.2, 5).easing(cc.easeIn(2)),
            cc.rotateTo(0.1, 0).easing(cc.easeIn(2)),
            cc.delayTime(0.5)
        )));
    },

    //绘制地图
    drawMap(map) {
        this.tipText.node.parent.parent.stopAllActions();
        this.tipText.node.parent.parent.rotation = 0;
        this.unschedule(this.shake);
        this.scheduleOnce(this.shake, 15);
        this.giftBtn.stopAllActions();
        if (this.playShort == null) {
            this.playShort = 1;
        } else {
            this.playShort = this.playShort + 1;
            if (this.playShort >= 2) {
                this.playShort = 0
                SDK().canCreateShortcutAsync(null);
            }
        }

        //处理第一次进游戏
        //保存当前关
        var param = {};
        param["playingMid"] = window.mid;
        param["playingLid"] = window.lid;
        SDK().setItem(param, null);

        //开始关卡
        var levelDetail = {};
        levelDetail.level = mid + "0" + (lid > 99 ? lid : (lid > 9 ? "0" + lid : "00" + lid));
        gameApplication.DataAnalytics.levelBegin(levelDetail);

        this.btns.active = true;
        this.musicFix = 1;
        this.curMusicIdx = 0;
        this.curPoints = {};//本关的点
        this.curLines = {};//本关的线
        this.lineList = {};//两点连接指向线
        this.levelText.string = "<b><color=#ffffff>" + mid + "</c></b>";
        this.stageText.string = "<b><color=#ffffff>" + lid + "</c></b>";
        this.curColorIdx = Math.ceil(Math.random() * 5) - 1;
        var curColor = colors[this.curColorIdx];
        var points = map.v2;
        var lines = map.lines;
        this.drawView.width = map.canvas.width;
        this.drawView.height = map.canvas.height;
        for (var i = 0; i < points.length; i = i + 1) {
            var point = cc.instantiate(this.point_prefab);
            point.color = curColor;
            point.parent = this.drawView.getChildByName("Points");
            point.tag = points[i].id;
            point.x = points[i].x;
            point.y = points[i].y;
            point.height = 40;
            point.width = 40;
            var box = point.addComponent(cc.CircleCollider);
            box.tag = 1;
            box.radius = 20;
            this.curPoints[point.tag] = points[i];
            this.curPoints[point.tag].node = point;
            var shadow = point.getChildByName("Shadow");
            shadow.color = point.color;
            var tip = point.getChildByName("Tip");
            tip.color = lColors[this.curColorIdx];
            /* var ID = point.getChildByName("ID").getComponent(cc.Label);
            ID.string = point.tag + ""; */
        }
        this.helpList[0] = this.curPoints[lines[0].start];
        for (var i = 0; i < lines.length; i = i + 1) {
            //var line = lines[i];
            var end = this.curPoints[lines[i].end];
            var start = this.curPoints[lines[i].start];
            this.helpList[i + 1] = end;
            var length = cc.pDistance(end, start);
            var disVec = cc.v2(end.x - start.x, end.y - start.y);
            disVec = Math.atan2(disVec.x, disVec.y);
            disVec = 180 * disVec / Math.PI
            var line = cc.instantiate(this.line_prefab);
            line.tag = lines[i].id;
            line.parent = this.drawView.getChildByName("Lines");
            line.x = start.x;
            line.y = start.y;
            line.height = length;
            line.width = 15;
            line.rotation = disVec;
            this.curLines[line.tag] = line;
            if (lines[i].repeat == null) {
                lines[i].repeat = 1;
            }
            this.curLines[line.tag].repeat = lines[i].repeat;



            //检查点的可连接数
            if (this.lineList[lines[i].start] == null) {
                this.lineList[lines[i].start] = {};
                this.curPoints[lines[i].start].isCanUse = 1;
            }
            this.curPoints[lines[i].start].isCanUse = this.curPoints[lines[i].start].isCanUse + 1;//增加起点的可用数
            //重复处理
            if (this.lineList[lines[i].start][lines[i].end] == null) {
                this.lineList[lines[i].start][lines[i].end] = this.curLines[line.tag];//可以连接的两点指向它们组成的线
            }


            //是否锁定方向
            if (lines[i].lock) {
                line.getChildByName("Arrow").active = true;
                line.setLocalZOrder(1);
            } else {
                //检查该线的反向是否可连接
                line.getChildByName("Arrow").active = false;
                if (this.lineList[lines[i].end] == null) {
                    this.lineList[lines[i].end] = {};
                    this.curPoints[lines[i].end].isCanUse = 1;
                }
                this.curPoints[lines[i].end].isCanUse = this.curPoints[lines[i].end].isCanUse + 1;//增加终点的可用数
                //重复处理
                if (this.lineList[lines[i].end][lines[i].start] == null) {
                    this.lineList[lines[i].end][lines[i].start] = this.curLines[line.tag];//可以连接的两点指向它们组成的线
                }

            }
            //是否重复
            if (this.curLines[line.tag].repeat == 2) {
                var re = line.getChildByName("Repeat");
                re.active = true;
                this.curLines[line.tag].Num = re.getChildByName("Num").getComponent(cc.Label);
                this.curLines[line.tag].setLocalZOrder(1);
                /* this.curPoints[lines[i].start].isCanUse = this.curPoints[lines[i].start].isCanUse + 1;//增加起点的可用数
                this.curPoints[lines[i].end].isCanUse = this.curPoints[lines[i].end].isCanUse + 1;//增加终点的可用数 */
            }
        }
        this.winCount = lines.length;
        this.curLines.length = this.winCount;
        if (mid == 1 && lid == 1) {
            this.guideMask.active = true;
            this.guideAnim();
        } else {
            this.guideMask.active = false;
        }

        if (mid == 2) {
            if (lid == 1) {
                this.helpNode.node.active = true;
                this.helpNode.init(lid, curColor, lColors[this.curColorIdx]);
            } else if (lid == 6) {
                this.helpNode.node.active = true;
                this.helpNode.init(lid, curColor, lColors[this.curColorIdx]);
            }
        } else {
            this.helpNode.node.active = false;
        }


        window.gameTimes = window.gameTimes + 1;
        if (window.gameTimes == 10) {
            window.gameTimes = 0;
            this.goShareView.active = true;
        }
    },


    //加载榜单
    LoadRank() {
        SDK().getFriendsInfo(function (list) {
            this.GetFriendRank(list);
        }.bind(this));
        SDK().getRank(2, 20, 0, function (list) {
            this.GetWorldRank(list);
        }.bind(this));
    },

    //好友邀请列表
    GetFriendRank(list) {
        this.friendPlayer = list;
        for (var i = 0; i < this.friendPlayer.length; i = i + 1) {
            var playerBar;
            var Head;
            //var Name;
            if (i >= this.friendUIPlayer.length) {
                playerBar = cc.instantiate(this.prefab_player);
                this.friendUIPlayer[i] = {};
                this.friendUIPlayer[i].playerBar = playerBar;

                Head = playerBar.getChildByName("Head").getComponent(cc.Sprite);
                this.friendUIPlayer[i].Head = Head;

                //Name = playerBar.getChildByName("Name").getComponent(cc.RichText);
                //this.friendUIPlayer[i].Name = Name;

                var No = playerBar.getChildByName("No");
                var Score = playerBar.getChildByName("Score");
                No.active = false;
                Score.active = false;
            } else {
                playerBar = this.friendUIPlayer[i].playerBar;
                Head = this.friendUIPlayer[i].Head;
                //Name = this.friendUIPlayer[i].Name;
            }
            var playBtn = playerBar.getChildByName("Play");
            //Name.node.active = true;
            playerBar.name = this.friendPlayer[i].id;
            var self = this;
            let id = this.friendPlayer[i].id
            playBtn.off(cc.Node.EventType.TOUCH_END);
            playBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
                SDK().playWith(id, self.highestScore, function (isCompleted) {

                }.bind(this));

            }, this);
            //Name.string = "<b><color=#696969>" + this.friendPlayer[i].name + "</color></b>";
            playerBar.parent = this.friendContent;
            //加载头像
            this.LoadSprite(this.friendPlayer[i].headUrl, Head, this.headSpriteList[this.friendPlayer[i].id]);
        }
        if (this.friendPlayer.length < this.friendUIPlayer.length) {
            for (var i = this.friendPlayer.length; i < this.friendUIPlayer.length; i = i + 1) {
                this.friendUIPlayer[i].playerBar.active = false;
            }
        }
    },

    //世界排行榜
    GetWorldRank(list) {
        this.worldPlayer = list;
        var isOnRank = false;
        for (var i = 0; i < this.worldPlayer.length; i = i + 1) {
            if (this.LoadRankData(i, this.worldPlayer[i])) {
                isOnRank = true;
            }
        }
        //如果自己不在榜单上就将自己加载最后
        var listLength = this.worldPlayer.length;
        if (!isOnRank) {
            listLength = listLength + 1;
            SDK().getRankScore(2, function (info) {
                this.LoadRankData(listLength - 1, info);
            }.bind(this))
        }
        //隐藏多余的榜单
        if (listLength < this.worldUIPlayer.length) {
            for (var i = this.worldPlayer.length; i < this.worldUIPlayer.length; i = i + 1) {
                this.worldUIPlayer[i].playerBar.active = false;
            }
        }
    },

    //将玩家信息加载到第I排
    LoadRankData(i, playerData) {
        var isOnRank = false;
        var playerBar;
        var mainBg;
        var No;
        var Score;
        var Head;
        if (i >= this.worldUIPlayer.length) {
            playerBar = cc.instantiate(this.prefab_player);
            mainBg = playerBar.getComponent(cc.Sprite);
            No = playerBar.getChildByName("No").getComponent(cc.RichText);
            Score = playerBar.getChildByName("Score").getChildByName("Num").getComponent(cc.RichText);
            Head = playerBar.getChildByName("Head").getComponent(cc.Sprite);
            this.worldUIPlayer[i] = {};
            this.worldUIPlayer[i].playerBar = playerBar;
            this.worldUIPlayer[i].mainBg = mainBg;
            this.worldUIPlayer[i].No = No;
            this.worldUIPlayer[i].Score = Score;
            this.worldUIPlayer[i].Head = Head;
        } else {
            playerBar = this.worldUIPlayer[i].playerBar;
            mainBg = this.worldUIPlayer[i].mainBg;
            No = this.worldUIPlayer[i].No;
            Score = this.worldUIPlayer[i].Score;
            Head = this.worldUIPlayer[i].Head;
        }
        No.node.active = true;
        Score.node.active = true;
        playerBar.name = playerData.id;
        playerBar.parent = this.worldContent;
        //是否为自己
        if (playerData.id == SDK().getSelfInfo().id) {
            //mainBg.spriteFrame = this.rankAtlas.getSpriteFrame("bg1");
            isOnRank = true;
        } else {
            //this.worldUIPlayer[i].mainBg = playerBar.getComponent(cc.Sprite);
            //this.worldUIPlayer[i].mainBg.spriteFrame = this.rankAtlas.getSpriteFrame("barBg");
        };
        //隐藏play按钮
        var playBtn = playerBar.getChildByName("Play");
        playBtn.active = false;
        //加载名次
        No.string = "<b><color=#f8b551>" + playerData.no + "</color></b>";
        //加载分数
        Score.string = "<b><color=#f8b551>" + playerData.score + "</c></b>";
        //加载头像
        this.LoadSprite(playerData.headUrl, Head, this.headSpriteList[playerData.id]);
        return isOnRank;
    },

    //根据URL加载头像并到对应的sprite上
    LoadSprite(url, sprite, saver, size) {
        if (saver == null) {
            cc.loader.load(url, function (err, texture) {
                saver = new cc.SpriteFrame(texture);
                sprite.spriteFrame = saver;
                if (size != null) {
                    sprite.node.width = size.x;
                    sprite.node.height = size.y;
                }
            });
        } else {
            sprite.spriteFrame = saver;
            if (size != null) {
                sprite.node.width = size.x;
                sprite.node.height = size.y;
            }
        }
    },

    update(dt) { },
});
