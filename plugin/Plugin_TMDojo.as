#name "TMDojo"
#author "TMDojo"
#category "Utilities"
#perms "full"

[Setting name="TMDojoEnabled" description="Enable / Disable plugin"]
bool Enabled = false;

[Setting name="TMDojoOnlySaveFinished" description="Only save race data when race is finished"]
bool OnlySaveFinished = true;

[Setting name="TMDojoApiUrl" description="TMDojo Api Url"]
string ApiUrl = "http://localhost";

int RECORDING_FPS = 60;

class TMDojo
{
    CGameCtnApp@ app;
    CGameCtnChallenge@ rootMap;
    CSmScriptPlayer@ sm_script;
    CGamePlaygroundUIConfig@ uiConfig;
    CTrackManiaNetwork@ network;

    string challengeId;
    string mapName;
    string authorName;

    string playerName;
    string playerLogin;
    string webId;

    string localApi = "http://localhost";
    string remoteApi = "https://api.tmdojo.com";

    int prevRaceTime = -6666;

    bool showMenu = true;
    bool serverAvailable = false;

    bool recording = false;
    int latestRecordedTime = -6666;

    TMDojo() {
        print("TMDojo: Init");
        @this.app = GetApp();
        @this.network = cast<CTrackManiaNetwork>(app.Network);
        this.challengeId = "";
    }
    
    bool checkServer() {
        this.playerName = network.PlayerInfo.Name;
        this.playerLogin = network.PlayerInfo.Login;
        this.webId = network.PlayerInfo.WebServicesUserId;
        Net::HttpRequest@ auth = Net::HttpGet(ApiUrl + "/auth?name=" + this.playerName + "&login=" + this.playerLogin + "&webid=" + this.webId);
        if (auth.String().get_Length() > 0) {
            return true;
        }
        return false;
    }

    void drawMenu() {
        int panelLeft = 10;
        int panelTop = 120;

        int panelWidth = 200;
        int panelHeight = 200;

        int topIncr = 18;

        nvg::BeginPath();
        nvg::Rect(panelLeft, panelTop, panelWidth, panelHeight);
        nvg::FillColor(vec4(0,0,0,0.5));
        nvg::Fill();
        nvg::ClosePath();
        vec4 colBorder = vec4(1, 1, 1, 1);
        int panelLeftCp = panelLeft + 8;
        int panelTopCp = panelTop + 8;
        
        Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, "API: " + ApiUrl);
        panelTopCp += topIncr;

        Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, this.serverAvailable ? "Node server: ON" : "Node server: OFF");
        panelTopCp += topIncr;

        Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, (@this.rootMap == null ? "RootMap: null" : "RootMap: OK"));
        panelTopCp += topIncr;

        Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, (@this.sm_script == null ? "SM_SCRIPT: null" : "SM_SCRIPT: OK"));
        panelTopCp += topIncr;

        Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, (@this.uiConfig == null ? "UIConfig: null" : "UIConfig: OK"));
        panelTopCp += topIncr;

        Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, (this.canRecord()  ? "CanRecord: true" : "CanRecord: false"));
        panelTopCp += topIncr;

        Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, (this.recording  ? "Recording: true" : "Recording: false"));
        panelTopCp += topIncr;

        Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, "Buffer Size: " + membuff.GetSize());
        panelTopCp += topIncr;

        if (@this.sm_script != null) {
            Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, "CurrentRaceTime: " + sm_script.CurrentRaceTime);
            panelTopCp += topIncr;
        }
    }

    bool canRecord() {
        return @dojo.sm_script != null && @dojo.rootMap != null && @dojo.uiConfig != null;
    }

    bool shouldStartRecording() {
        if (canRecord()) {     
            int curRaceTime = dojo.sm_script.CurrentRaceTime;
            return curRaceTime > -300 && curRaceTime < 0;
        }
        return false;
    }

    void resetRecording() {
        this.recording = false;
        this.latestRecordedTime = -6666;
        membuff.Resize(0);
    }
}

TMDojo@ dojo;
auto membuff = MemoryBuffer(0);

void Main()
{
    @dojo = TMDojo();
    startnew(ContextChecker);
}

void RenderMenu()
{
	auto app = cast<CGameManiaPlanet>(GetApp());
	auto menus = cast<CTrackManiaMenus>(app.MenuManager);

	if (UI::BeginMenu("TMDojo")) {
		if (UI::MenuItem(Enabled ? "Turn OFF" : "Turn ON", "", false, true)) {
            Enabled = !Enabled;
            if (Enabled) {
                dojo.checkServer();
            }
		}
        if (UI::MenuItem("Switch to " + dojo.localApi, "", false, true)) {
            ApiUrl = dojo.localApi;
            dojo.checkServer();
		}
        if (UI::MenuItem("Switch to " + dojo.remoteApi, "", false, true)) {
            ApiUrl = dojo.remoteApi;
            dojo.checkServer();
		}
        if (UI::MenuItem(OnlySaveFinished ? "Save all" : "Only save finished", "", false, true)) {
            OnlySaveFinished = !OnlySaveFinished;
		}
		UI::EndMenu();
	}
}

void Render()
{
    if (@dojo != null && Enabled) {
        if (dojo.showMenu) {
            dojo.drawMenu();
        }

        if (!dojo.recording && dojo.shouldStartRecording()) {
            dojo.recording = true;
            dojo.prevRaceTime = dojo.sm_script.CurrentRaceTime;
        }

        if (dojo.recording) {
            if (dojo.uiConfig.UISequence == 11) {
                // Finished track
                print("Finish " + dojo.sm_script.CurrentRaceTime + ", " + dojo.prevRaceTime);
                PostRecordedData(true);
            } else if (dojo.latestRecordedTime > dojo.sm_script.CurrentRaceTime) {
                // Give up
                print("Give up " + dojo.sm_script.CurrentRaceTime + ", " + dojo.prevRaceTime);
                PostRecordedData(false);
            } else {
                // Record current data
                int timeSinceLastRecord = dojo.sm_script.CurrentRaceTime - dojo.latestRecordedTime;
                if (timeSinceLastRecord > (1.0 / RECORDING_FPS) * 1000) {
                    FillBuffer();
                    dojo.latestRecordedTime = dojo.sm_script.CurrentRaceTime;
                }
            }
            dojo.prevRaceTime = dojo.sm_script.CurrentRaceTime;
        }
    }
}

void PostRecordedData(bool finished) 
{
    if (membuff.GetSize() < 100) {
        print("Not saving file, too little data");
        membuff.Resize(0);
        return;
    }
    if (!OnlySaveFinished || finished) {
        print("Save game data size: " + membuff.GetSize());
        membuff.Seek(0);
        string reqUrl = ApiUrl + "/save-game-data" +    
                            "?mapName=" + dojo.mapName +
                            "&challengeId=" + dojo.challengeId +
                            "&authorName=" + dojo.authorName +
                            "&playerName=" + dojo.playerName +
                            "&playerLogin=" + dojo.playerLogin +
                            "&webId=" + dojo.webId +
                            "&endRaceTime=" + dojo.prevRaceTime +
                            "&raceFinished=" + (finished ? "1" : "0");
        Net::HttpPost(reqUrl, membuff.ReadToBase64(membuff.GetSize()), "application/octet-stream");
    }
    membuff.Resize(0);
    dojo.resetRecording();
}

void FillBuffer()
{
    int gazAndBrake = 0;
    int gazPedal = dojo.sm_script.InputGasPedal > 0 ? 1 : 0;
    int isBraking = dojo.sm_script.InputIsBraking ? 2 : 0;

    gazAndBrake |= gazPedal;
    gazAndBrake |= isBraking;

    membuff.Write(dojo.sm_script.CurrentRaceTime);
    
    membuff.Write(dojo.sm_script.Position.x);
    membuff.Write(dojo.sm_script.Position.y);
    membuff.Write(dojo.sm_script.Position.z);

    membuff.Write(dojo.sm_script.AimYaw);
    membuff.Write(dojo.sm_script.AimPitch);

    membuff.Write(dojo.sm_script.AimDirection.x);
    membuff.Write(dojo.sm_script.AimDirection.y);
    membuff.Write(dojo.sm_script.AimDirection.z);

    membuff.Write(dojo.sm_script.Velocity.x);
    membuff.Write(dojo.sm_script.Velocity.y);
    membuff.Write(dojo.sm_script.Velocity.z);

    membuff.Write(dojo.sm_script.Speed);

    membuff.Write(dojo.sm_script.InputSteer);

    membuff.Write(gazAndBrake);

    membuff.Write(dojo.sm_script.EngineRpm);
    membuff.Write(dojo.sm_script.EngineCurGear);

    membuff.Write(dojo.sm_script.WheelsContactCount);
    membuff.Write(dojo.sm_script.WheelsSkiddingCount);
}

void ContextChecker()
{
    while (true) {
        if (Enabled) {
            if (!dojo.serverAvailable) {
                dojo.serverAvailable = dojo.checkServer();
            }

            if (@dojo.app.CurrentPlayground == null) {
                @dojo.rootMap = null;
                @dojo.sm_script = null;
                @dojo.uiConfig = null;
                dojo.challengeId = "";
                dojo.resetRecording();
            } 

            // SM_SCRIPT (used to get player inputs)
            if (@dojo.sm_script == null) {
                print("sm_script == null");
                if (@dojo.app.CurrentPlayground !is null &&
                    dojo.app.CurrentPlayground.GameTerminals[0] !is null &&
                    dojo.app.CurrentPlayground.GameTerminals[0].GUIPlayer !is null) {
                    @dojo.sm_script = cast<CSmPlayer>(dojo.app.CurrentPlayground.GameTerminals[0].GUIPlayer).ScriptAPI;                    
                }
            }

            // RootMap
            if (@dojo.rootMap == null) {
                print("rootMap == null");
                if (@dojo.app.RootMap != null) {
                    @dojo.rootMap = dojo.app.RootMap;
                }
            }

            // Challenge ID (used to set current map)
            if (dojo.challengeId.get_Length() == 0) {
                print("dojo.challengeId.length == 0");
                if (@dojo.rootMap != null) {
                    string edChallengeId = dojo.rootMap.EdChallengeId;
                    string authorName = dojo.rootMap.AuthorNickName;
                    string mapName = Regex::Replace(dojo.rootMap.MapInfo.NameForUi, "\\$([0-9a-fA-F]{1,3}|[iIoOnNmMwWsSzZtTgG<>]|[lLhHpP](\\[[^\\]]+\\])?)", "").Replace(" ", "%20");
                    
                    dojo.challengeId = edChallengeId;
                    dojo.authorName = authorName;
                    dojo.mapName = mapName;
                    string url = ApiUrl + "/set-current-map?id=" + edChallengeId + "&author=" + authorName + "&name=" + mapName;
                    Net::HttpRequest@ mapReq = Net::HttpGet(url);
                }
            }

            // UI Config (used for finish screen)
            if (@dojo.uiConfig == null) {
                if (@dojo.app.CurrentPlayground != null) {
                    @dojo.uiConfig = @dojo.app.CurrentPlayground.UIConfigs[0];
                }
            }
        }

        sleep(250);
    }
}