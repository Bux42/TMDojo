#name "TMDojo"
#author "TMDojo"
#category "Utilities"
#perms "full"

[Setting name="TMDojoEnabled" description="Enable / Disable plugin"]
bool Enabled = false;

[Setting name="TMDojoApiUrl" description="TMDojo Api Url"]
string ApiUrl = "http://localhost:3000";

class TMDojo
{
    CGameCtnApp@ app;
    CGamePlaygroundScript@ playgroundScript;
    CSmScriptPlayer@ sm_script;
    CGamePlaygroundUIConfig@ uiConfig;
    CTrackManiaNetwork@ network;

    string challengeId;
    string mapName;
    string authorName;

    string playerName;
    string playerLogin;
    string webId;

    string localApi = "http://localhost:3000";
    string remoteApi = "https://api.tmdojo.com";

    int prevRaceTime = -6666;

    bool showMenu = true;
    bool serverAvailable = false;
    bool canRecord = false;
    bool recording = false;

    TMDojo() {
        print("TMDojo: Init");
        @this.app = GetApp();
        @this.network = cast<CTrackManiaNetwork>(app.Network);
        this.challengeId = "";
        if (Enabled) {
            this.serverAvailable = this.checkServer();
        }
    }
    
    bool checkServer() {
        this.playerName = network.PlayerInfo.Name;
        this.playerLogin = network.PlayerInfo.Login;
        this.webId = network.PlayerInfo.WebServicesUserId;
        Net::HttpRequest@ auth = Net::HttpGet(ApiUrl + "/auth?name=" + network.PlayerInfo.Name + "&login=" + network.PlayerInfo.Login + "&webid=" + network.PlayerInfo.WebServicesUserId);
        if (auth.String().get_Length() > 0) {
            return (true);
        }
        return (false);
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

        Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, (this.playgroundScript == null ? "PlayGroundScript: null" : "PlayGroundScript: OK"));
        panelTopCp += topIncr;

        Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, (this.sm_script == null ? "SM_SCRIPT: null" : "SM_SCRIPT: OK"));
        panelTopCp += topIncr;

        Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, (this.uiConfig == null ? "UIConfig: null" : "UIConfig: OK"));
        panelTopCp += topIncr;

        Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, (this.canRecord  ? "CanRecord: true" : "CanRecord: false"));
        panelTopCp += topIncr;

        Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, (this.recording  ? "Recording: true" : "Recording: false"));
        panelTopCp += topIncr;

        Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, "Buffer Size: " + membuff.GetSize());
        panelTopCp += topIncr;

        if (this.sm_script != null) {
            Draw::DrawString(vec2(panelLeftCp, panelTopCp), colBorder, "CurrentRaceTime: " + sm_script.CurrentRaceTime);
            panelTopCp += topIncr;
        }
    }
}

TMDojo@ dojo;
auto membuff = MemoryBuffer(0);

vec3 getRealCoords(nat3 coords) 
{
    CGameCtnEditorFree@ editor = cast<CGameCtnEditorFree>(dojo.app.Editor);
    CGameEditorPluginMapMapType@ mapType = editor.PluginMapType;
    return (mapType.GetVec3FromCoord(coords));
}

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
		UI::EndMenu();
	}
}

void Render()
{
    if (dojo != null && Enabled) {
        if (dojo.showMenu) {
            dojo.drawMenu();
        }
        if (dojo.recording) {
            if (dojo.uiConfig.UISequence == 11) {
                print("Finish " + dojo.sm_script.CurrentRaceTime + ", " + dojo.prevRaceTime);
                dojo.recording = false;
                print("Save game data size: " + membuff.GetSize());
                membuff.Seek(0);
                Net::HttpPost(ApiUrl + "/save-game-data?mapName=" + dojo.mapName +
                                                                    "&challengeId=" + dojo.challengeId +
                                                                    "&authorName=" + dojo.authorName +
                                                                    "&playerName=" + dojo.playerName +
                                                                    "&playerLogin=" + dojo.playerLogin +
                                                                    "&webId=" + dojo.webId +
                                                                    "&endRaceTime=" + dojo.prevRaceTime +
                                                                    "&raceFinished=1", membuff.ReadToBase64(membuff.GetSize()), "application/octet-stream");
                membuff.Resize(0);
            } else if (dojo.prevRaceTime > dojo.sm_script.CurrentRaceTime) {
                print("Respawn " + dojo.sm_script.CurrentRaceTime + ", " + dojo.prevRaceTime);
                dojo.recording = false;
                print("Save game data size: " + membuff.GetSize());
                membuff.Seek(0);
                Net::HttpPost(ApiUrl + "/save-game-data?mapName=" + dojo.mapName +
                                                                    "&challengeId=" + dojo.challengeId +
                                                                    "&authorName=" + dojo.authorName +
                                                                    "&playerName=" + dojo.playerName +
                                                                    "&playerLogin=" + dojo.playerLogin +
                                                                    "&webId=" + dojo.webId +
                                                                    "&endRaceTime=" + dojo.prevRaceTime +
                                                                    "&raceFinished=0", membuff.ReadToBase64(membuff.GetSize()), "application/octet-stream");
                membuff.Resize(0);
            } else {
                FillBuffer();
            }
            dojo.prevRaceTime = dojo.sm_script.CurrentRaceTime;
        }
    }
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
    while (true && Enabled) {
        if (dojo.app.CurrentPlayground == null) {
            @dojo.playgroundScript = null;
            @dojo.sm_script = null;
            @dojo.uiConfig = null;
            dojo.challengeId = "";
            dojo.canRecord = false;
            dojo.recording = false; 
        } else {
            if (dojo.sm_script == null) {
                print("sm_script == null");
                if (dojo.app.CurrentPlayground != null &&
                    dojo.app.CurrentPlayground.GameTerminals[0] != null &&
                    dojo.app.CurrentPlayground.GameTerminals[0].GUIPlayer != null) {
                    @dojo.sm_script = cast<CSmPlayer>(dojo.app.CurrentPlayground.GameTerminals[0].GUIPlayer).ScriptAPI;
                    
                }
            }
            if (dojo.playgroundScript == null) {
                print("playgroundScript == null");
                if (dojo.app.PlaygroundScript != null) {
                    @dojo.playgroundScript = dojo.app.PlaygroundScript;
                }
            }
            if (dojo.challengeId.get_Length() == 0) {
                print("dojo.challengeId.length == 0");
                if (dojo.app.PlaygroundScript != null &&
                    dojo.app.PlaygroundScript.Map != null) {
                    string edChallengeId = dojo.app.PlaygroundScript.Map.EdChallengeId;
                    string authorName = dojo.app.PlaygroundScript.Map.AuthorNickName;
                    string mapName = Regex::Replace(dojo.app.PlaygroundScript.Map.MapInfo.NameForUi, "\\$([0-9a-fA-F]{1,3}|[iIoOnNmMwWsSzZtTgG<>]|[lLhHpP](\\[[^\\]]+\\])?)", "").Replace(" ", "%20");
                    
                    dojo.challengeId = edChallengeId;
                    dojo.authorName = authorName;
                    dojo.mapName = mapName;
                    string url = ApiUrl + "/set-current-map?id=" + edChallengeId + "&author=" + authorName + "&name=" + mapName;
                    Net::HttpRequest@ mapReq = Net::HttpGet(url);
                }
            }
            if (dojo.uiConfig == null) {
                if (dojo.app.CurrentPlayground != null) {
                    @dojo.uiConfig = dojo.app.CurrentPlayground.UIConfigs[0];
                }
            }
            if (dojo.sm_script != null &&
                dojo.playgroundScript != null &&
                dojo.uiConfig != null) {
                dojo.canRecord = true;
                if (dojo.sm_script.CurrentRaceTime > -300 && dojo.sm_script.CurrentRaceTime < 0) {
                    dojo.recording = true;
                    dojo.prevRaceTime = dojo.sm_script.CurrentRaceTime;
                }
            }
        }
        sleep(250);
    }
}