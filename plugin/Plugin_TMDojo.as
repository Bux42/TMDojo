#name "TMDojo"
#author "TMDojo"
#category "Utilities"
#perms "full"

[Setting name="TMDojoEnabled" description="Enable / Disable plugin"]
bool Enabled = false;

[Setting name="TMDojoOverlayEnabled" description="Enable / Disable menu"]
bool OverlayEnabled = false;

[Setting name="TMDojoOnlySaveFinished" description="Only save race data when race is finished"]
bool OnlySaveFinished = true;

[Setting name="TMDojoApiUrl" description="TMDojo API Url"]
string ApiUrl = LOCAL_API;

const string LOCAL_API = "http://localhost";
const string REMOTE_API = "https://api.tmdojo.com";

int RECORDING_FPS = 60;

class TMDojo
{
    // NOD references
    CGameCtnApp@ app;
    CGameCtnChallenge@ rootMap;
    CSmScriptPlayer@ sm_script;
    CGamePlaygroundUIConfig@ uiConfig;
    CTrackManiaNetwork@ network;

    // Map info
    string mapUId;
    string mapName;
    string authorName;

    // Player info
    string playerName;
    string playerLogin;
    string webId;


    // Server status
    bool serverAvailable = false;

    // Record info
    bool recording = false;
    int latestRecordedTime = -6666;
    int prevRaceTime = -6666;

    // AFK checks
    vec3 latestPlayerPosition;
    int numSamePositions = 0;

    TMDojo() {
        print("[TMDojo]: Init");
        @this.app = GetApp();
        @this.network = cast<CTrackManiaNetwork>(app.Network);
        this.mapUId = "";
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

    void drawOverlay() {
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
            return curRaceTime > -100 && curRaceTime < 0;
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

        string otherApi = ApiUrl == LOCAL_API ? REMOTE_API : LOCAL_API;
        if (UI::MenuItem("Switch to " + otherApi , "", false, true)) {
            ApiUrl = otherApi;
            dojo.checkServer();
		}

        if (UI::MenuItem(OverlayEnabled ? "[X]  Overlay" : "[  ]  Overlay", "", false, true)) {
            OverlayEnabled = !OverlayEnabled;
		}

        if (UI::MenuItem(OnlySaveFinished ? "[X]  Save finished runs only" : "[  ]  Save finished runs only", "", false, true)) {
            OnlySaveFinished = !OnlySaveFinished;
		}

		UI::EndMenu();
	}
}

void Render()
{
    if (@dojo != null && Enabled) {
        if (OverlayEnabled) {
            dojo.drawOverlay();
        }

        if (!dojo.recording && dojo.shouldStartRecording()) {
            dojo.recording = true;
            dojo.prevRaceTime = dojo.sm_script.CurrentRaceTime;
        }

        if (dojo.recording) {
            if (dojo.uiConfig.UISequence == 11) {
                // Finished track
                print("[TMDojo]: Finished");
                PostRecordedData(true);
            } else if (dojo.latestRecordedTime > dojo.sm_script.CurrentRaceTime) {
                // Give up
                print("[TMDojo]: Give up");
                PostRecordedData(false);
            } else {
                // Record current data
                int timeSinceLastRecord = dojo.sm_script.CurrentRaceTime - dojo.latestRecordedTime;
                if (timeSinceLastRecord > (1.0 / RECORDING_FPS) * 1000) {
                    // Keep track of the amount of samples for which the position did not changed, used to pause recording
                    if (@dojo.sm_script != null &&
                        Math::Abs(dojo.latestPlayerPosition.x - dojo.sm_script.Position.x) < 0.001 &&
                        Math::Abs(dojo.latestPlayerPosition.y - dojo.sm_script.Position.y) < 0.001 && 
                        Math::Abs(dojo.latestPlayerPosition.z - dojo.sm_script.Position.z) < 0.001 ) {
                        dojo.numSamePositions += 1;
                    } else {
                        dojo.numSamePositions = 0;
                    }

                    // Fill buffer if player has moved recently
                    if (dojo.numSamePositions < RECORDING_FPS) {
                        FillBuffer();
                        dojo.latestRecordedTime = dojo.sm_script.CurrentRaceTime;
                    }

                    dojo.latestPlayerPosition = dojo.sm_script.Position;
                }
            }
            dojo.prevRaceTime = dojo.sm_script.CurrentRaceTime;
        }
    }
}

void PostRecordedData(bool finished) 
{
    if (membuff.GetSize() < 100) {
        print("[TMDojo]: Not saving file, too little data");
        membuff.Resize(0);
        return;
    }
    if (!OnlySaveFinished || finished) {
        print("[TMDojo]: Saving game data (size: " + membuff.GetSize() / 1024 + " kB)");
        membuff.Seek(0);
        string reqUrl = ApiUrl + "/replays" +    
                            "?mapName=" + dojo.mapName +
                            "&mapUId=" + dojo.mapUId +
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
                @dojo.sm_script = null;

                @dojo.rootMap = null;
                dojo.mapUId = "";
                dojo.authorName = "";
                dojo.mapName = "";

                @dojo.uiConfig = null;
                
                dojo.resetRecording();
            } 

            // SM_SCRIPT (used to get player inputs)
            if (@dojo.sm_script == null) {
                if (@dojo.app.CurrentPlayground !is null &&
                    dojo.app.CurrentPlayground.GameTerminals[0] !is null &&
                    dojo.app.CurrentPlayground.GameTerminals[0].GUIPlayer !is null) {                        
                    @dojo.sm_script = cast<CSmPlayer>(dojo.app.CurrentPlayground.GameTerminals[0].GUIPlayer).ScriptAPI;                    
                }
            }

            // RootMap + map info
            if (@dojo.rootMap == null) {
                if (@dojo.app.RootMap != null) {
                    @dojo.rootMap = dojo.app.RootMap;                    
                    dojo.mapUId = dojo.rootMap.EdChallengeId;
                    dojo.authorName = dojo.rootMap.AuthorNickName;
                    dojo.mapName = Regex::Replace(dojo.rootMap.MapInfo.NameForUi, "\\$([0-9a-fA-F]{1,3}|[iIoOnNmMwWsSzZtTgG<>]|[lLhHpP](\\[[^\\]]+\\])?)", "").Replace(" ", "%20");
                }
            }

            // UI Config (used for finish screen)
            if (@dojo.uiConfig == null) {
                if (@dojo.app.CurrentPlayground != null &&
                    @dojo.app.CurrentPlayground.UIConfigs[0] != null) {
                    @dojo.uiConfig = @dojo.app.CurrentPlayground.UIConfigs[0];
                }
            }
        }

        sleep(250);
    }
}
