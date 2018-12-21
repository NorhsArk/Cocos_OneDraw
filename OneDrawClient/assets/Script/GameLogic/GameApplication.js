var Player = require("../GameLogic/Player");
var SoundManager = require("../GameLogic/SoundManager");
var ViewManager = require("../GameLogic/ViewManager");
var DataAnalytics = require("../SDK/DataAnalytics");
var MainView = require("../UI/MainView");
var LevelView = require("../UI/LevelView");

cc.Class({
    extends: cc.Component,

    properties: {
        viewManager: {
            default: null,
            type: ViewManager,
        },
        soundManager: {
            default: null,
            type: SoundManager,
        },
        missions: {
            default: []
        },
        missionsCB: {
            default: []
        },
        conf: {
            default: {},
        },
        confCB: {
            default: []
        },
        VideoView: {
            default: null,
            type: cc.Node,
            visible: false,
        },
        VideoView_prefab: {
            default: null,
            type: cc.Prefab,
        },
        fbView: {
            default: null,
            type: cc.Node,
            visible: false,
        },
        fbView_prefab: {
            default: null,
            type: cc.Prefab,
        },
        object_prefab: {
            default: null,
            type: cc.Prefab,
        },
        viewAtlas: {
            default: null,
            type: cc.SpriteAtlas,
        },
        curLang: {
            get: function () {
                return window.i18n.curLang;
            }
        },
        _playTimes: {
            default: 0,
            type: cc.Integer,
        },
        playTimes: {
            get: function () {
                return this._playTimes;
            },
            set: function (val) {
                this._playTimes = val;
                //播放插屏广告条件判断
                if ((this._playTimes > 1 && this._playTimes % SDK().getInterstitialCount() == 0 && this._playTimes >= SDK().getInterstitialCount()) || (SDK().getInterstitialCount() <= 1 && this._playTimes > 1)) {
                    console.log("播放插屏广告");
                    var delayTime = 0.2 + Math.random();
                    this.scheduleOnce(function () {
                        SDK().showInterstitialAd(function (isCompleted) {
                            console.log("播放Done");
                        }, false);
                    }, delayTime);

                    SDK().canCreateShortcutAsync();
                }

                if (this._playTimes == 5) {
                    SDK().shareBestScore("all", null);
                }
            },
        },
        popGameView:{
            default: null,
            type: cc.Node,
        },
    },

    start() {
        const i18n = require('LanguageData');
        i18n.init('cn');
        SDK().init(function () {
            DataAnalytics.login(SDK().getSelfInfo().id);
            var levelDetail = {};
            levelDetail.level = "gameStart"
            gameApplication.DataAnalytics.levelBegin(levelDetail);
        }.bind(this));

        //处理第一次进入游戏
        SDK().getItem("playingMid", function (mid) {
            if (mid == 0 || mid == undefined || mid == null) {
                mid = 1;
            }
            SDK().getItem("playingLid", function (lid) {
                if (lid == 0 || lid == undefined || lid == null) {
                    lid = 1;
                }
                window.bid = 1;
                window.mid = mid;
                window.lid = lid;
                cc.director.loadScene("game");
            }.bind(this));
        }.bind(this));
    },

    getConf(path, cb) {

        if (this.conf[path] != null) {
            if (cb) {
                // cc.log("从cache读取："+path)
                cb(this.conf[path]);
            }
        } else {
            // cc.log("从硬盘读取："+path)
            cc.loader.loadRes(path, function (err, results) {
                this.conf[path] = results;
                if (cb != null) {
                    cb(results)
                }
            }.bind(this));
        }
    },


    onLoad() {
        this.DataAnalytics = DataAnalytics;
        DataAnalytics.init();

        window.gameApplication = this;
        window.gameFirst = true;
        window.gameTimes = 1;
        cc.game.addPersistRootNode(this.node);
        // this.audioSource.play();
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = false;
        manager.enabledDrawBoundingBox = false;

        //Load Json
        cc.loader.loadRes("conf/missions", function (err, results) {
            this.missions = results;
            this.invokeMissionCB();
        }.bind(this));

        this.openBeginView();

        // window.bid = 1;
        // window.mid = 1;
        // window.lid = 8;
        // cc.director.loadScene("game");   
    },

    onDestroy() {
        cc.director.getCollisionManager().enabled = false;
        levelDetail.level = "gameStart";
        levelDetail.reason = ""
        gameApplication.DataAnalytics.levelResult(true, levelDetail);
        DataAnalytics.logout(SDK().getSelfInfo().id);
    },

    getMissions(cb) {

        if (this.missions != null && this.missions.length > 0) {
            cb(this.missions);
        } else {
            this.missionsCB.push(cb);
        }
    },

    
    //互推按钮时间
    popClick(event, type) {
        SDK().switchGameAsync(type);
    },

    invokeMissionCB() {
        var self = this;
        if (this.missionsCB.length > 0) {
            this.missionsCB.forEach(function (cb) {
                if (cb != null) {
                    cb(self.missions);
                }
            });
        }
    },

    setNodeActive(nodePath, active) {
        cc.find("Canvas/" + nodePath).active = active;
    },

    openBeginView: function () {
        this.setNodeActive("levelView", false);
        this.setNodeActive("mainView", false);
        this.setNodeActive("BeginView", true);
    },

    openMainView: function () {
        this.setNodeActive("levelView", false);
        this.setNodeActive("mainView", true);
        this.setNodeActive("BeginView", false);
    },

    openLevelView: function (bid, mid, mission) {
        this.setNodeActive("levelView", true);
        this.setNodeActive("mainView", false);
        this.setNodeActive("BeginView", false);
        cc.find("Canvas/levelView").getComponent("LevelView").init(bid, mid, mission);
    },

    //game场景回到level场景
    gamingBackToLevel(bid, mid) {
        cc.director.loadScene("main", function () {
            this.openLevelView(bid, mid, this.missions[mid - 1]);
        }.bind(this));
    },

    //game场景回到main场景
    gamingBackToMian(bid, mid) {
        cc.director.loadScene("main", function () {
            this.openMainView();
        }.bind(this));
    },

    //显示是否观看视频的提示框
    showVideoView(cb) {
        if (this.VideoView == null) {
            var view = cc.instantiate(this.VideoView_prefab);
            var Canvas = cc.find("Canvas");
            view.parent = Canvas;
            view.width = window.width;
            view.height = window.height;
            this.VideoView = view;
        }
        let sureBtn = this.VideoView.getChildByName("Bg").getChildByName("Sure");
        sureBtn.off(cc.Node.EventType.TOUCH_END);
        sureBtn.on(cc.Node.EventType.TOUCH_END, function (event) {

            this.onVideoBtnClick(cb);
            this.VideoView.active = false;
        }, this);

        var laterBtn = this.VideoView.getChildByName("Bg").getChildByName("Later");
        laterBtn.off(cc.Node.EventType.TOUCH_END);
        laterBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.VideoView.active = false;
        }, this);
    },

    onVideoBtnClick(cb) {
        SDK().showVideoAd(
            function (isCompleted) {
                if (null == isCompleted) {
                    console.log("没有观看成功")
                    this.fbFail(1);
                } else if (isCompleted) {
                    cb(true);
                } else {
                    console.log("没有观看成功")
                    this.fbFail(1);
                }
            }.bind(this)
        );
    },

    onGiftBtnClick(cb) {
        SDK().showInterstitialAd(
            function (isCompleted) {
                if (null == isCompleted) {
                    console.log("没有观看成功")
                    this.fbFail(1);
                } else if (isCompleted) {
                    cb(true);
                } else {
                    console.log("没有观看成功")
                    this.fbFail(1);
                }
            }.bind(this)
            , true);
    },


    fbFail(type) {
        var view = cc.instantiate(this.fbView_prefab);
        var Canvas = cc.find("Canvas");
        view.parent = Canvas;
        view.width = window.width;
        view.height = window.height;
        var btn = view.getChildByName("Okay");
        btn.off(cc.Node.EventType.TOUCH_END);
        btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.fbView.active = false;
            btn.parent.destroy();
        }, this);
        this.fbView = view;
        if (type == 1) {
            this.fbView.getChildByName("Bg").getChildByName("VideoText").active = true;
            this.fbView.getChildByName("Bg").getChildByName("ShareText").active = false;
        } else {
            this.fbView.getChildByName("Bg").getChildByName("VideoText").active = false;
            this.fbView.getChildByName("Bg").getChildByName("ShareText").active = true;
        }
        this.fbView.active = true;

    },

    onShareBtnClick(score) {
        SDK().share(score, function (isCompleted) {
            if (isCompleted) {//分享激励
                console.log("share:" + score);
            } else {
                this.fbFail(2);
            }
        }.bind(this));
    },

    flyTipAnim() {
        let reward = cc.instantiate(this.object_prefab);
        reward.color = cc.color(255, 121, 121, 255);
        reward.getComponent(cc.Sprite).spriteFrame = this.viewAtlas.getSpriteFrame("tipShape");
        reward.parent = cc.find("Canvas");
        reward.position = cc.v2(0, 0);
        reward.runAction(cc.sequence(
            cc.moveBy(1, cc.v2(0, 400)).easing(cc.easeIn(2)),
            cc.callFunc(function () {
                reward.destroy();
            }),
        ));
    },

    onQuitBtnClick: function () {
        // console.log("用户中途退出");
    },

    // update (dt) {},
});
