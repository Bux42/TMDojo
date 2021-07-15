#name "TMDojo"
#author "TMDojo"
#category "Utilities"
#perms "full"

[Setting name="TMDojoEnabled" description="Enable / Disable plugin"]
bool Enabled = true;

[Setting name="TMDojoOnlySaveFinished" description="Only save race data when race is finished"]
bool OnlySaveFinished = true;

[Setting name="TMDojoApiUrl" description="TMDojo API Url"]
string ApiUrl = REMOTE_API;

[Setting name="TMDojoDebugOverlayEnabled" description="Enable / Disable debug overlay"]
bool DebugOverlayEnabled = false;

[Setting name="TMDojoOverlayEnabled" description="Enable / Disable overlay"]
bool OverlayEnabled = true;

const string LOCAL_API = "http://localhost";
const string REMOTE_API = "https://api.tmdojo.com";

int RECORDING_FPS = 60;

class FinishHandle
{
    bool finished;
}

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

    void drawDebugOverlay() {
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

    void drawOverlay() {
        int panelLeft = 10;
        int panelTop = 40;

        int panelWidth = this.recording ? 125 : 160;
        int panelHeight = 36;

        int topIncr = 18;

        // Rectangle
        nvg::BeginPath();
        nvg::RoundedRect(panelLeft, panelTop, panelWidth, panelHeight, 5);
        nvg::FillColor(vec4(0,0,0,0.5));
        nvg::Fill();
        nvg::ClosePath();

        // Define colors
        vec4 white = vec4(1, 1, 1, 1);
        vec4 gray = vec4(0.1, 0.1, 0.1, 1);
        vec4 red = vec4(0.95, 0.05, 0.05, 1);

        // Recording circle        
        int circleLeft = panelLeft + 18;
        int circleTop = panelTop + 18;
        nvg::BeginPath();        
        nvg::Circle(vec2(circleLeft, circleTop), 10);
        nvg::FillColor(this.recording ? red : gray);
        nvg::Fill();
        nvg::StrokeColor(gray);
        nvg::StrokeWidth(3);
        nvg::Stroke();
        nvg::ClosePath();

        // Recording text
        int textLeft = panelLeft + 38;
        int textTop = panelTop + 23;
        nvg::FillColor(this.recording ? red : white);
        nvg::FillColor(white);
        nvg::Text(textLeft, textTop, (this.recording ? "Recording" : "Not Recording"));
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

void checkServer() {
    dojo.playerName = dojo.network.PlayerInfo.Name;
    dojo.playerLogin = dojo.network.PlayerInfo.Login;
    dojo.webId = dojo.network.PlayerInfo.WebServicesUserId;
    Net::HttpRequest@ auth = Net::HttpGet(ApiUrl + "/auth?name=" + dojo.playerName + "&login=" + dojo.playerLogin + "&webid=" + dojo.webId);
    while (!auth.Finished()) {
        yield();
        sleep(50);
    }
    if (auth.String().get_Length() > 0) {
        dojo.serverAvailable = true;
    } else {
        dojo.serverAvailable = false;
    }
}

void Main()
{
    @dojo = TMDojo();
    startnew(ContextChecker);
    startnew(ServerChecker);
}

void RenderMenu()
{
	auto app = cast<CGameManiaPlanet>(GetApp());
	auto menus = cast<CTrackManiaMenus>(app.MenuManager);

	if (UI::BeginMenu("TMDojo")) {
		if (UI::MenuItem(Enabled ? "Turn OFF" : "Turn ON", "", false, true)) {
            Enabled = !Enabled;
            if (Enabled) {
                startnew(checkServer);
            }
		}

        string otherApi = ApiUrl == LOCAL_API ? REMOTE_API : LOCAL_API;
        if (UI::MenuItem("Switch to " + otherApi , "", false, true)) {
            ApiUrl = otherApi;
            startnew(checkServer);
		}

        if (UI::MenuItem(OverlayEnabled ? "[X]  Overlay" : "[  ]  Overlay", "", false, true)) {
            OverlayEnabled = !OverlayEnabled;
		}

        if (UI::MenuItem(DebugOverlayEnabled ? "[X]  Debug Overlay" : "[  ]  Debug Overlay", "", false, true)) {
            DebugOverlayEnabled = !DebugOverlayEnabled;
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
            if (dojo.canRecord()) {
                dojo.drawOverlay();
            }
        } 
        if (DebugOverlayEnabled) {
            dojo.drawDebugOverlay();
        }

        if (!dojo.recording && dojo.shouldStartRecording()) {
            dojo.recording = true;
            dojo.prevRaceTime = dojo.sm_script.CurrentRaceTime;
        }

        if (dojo.recording) {
            if (dojo.uiConfig.UISequence == 11) {
                // Finished track
                print("[TMDojo]: Finished");

                ref @fh = FinishHandle();
                cast<FinishHandle>(fh).finished = true;
                startnew(PostRecordedData, fh);
            } else if (dojo.latestRecordedTime > dojo.sm_script.CurrentRaceTime) {
                // Give up
                print("[TMDojo]: Give up");

                ref @fh = FinishHandle();
                cast<FinishHandle>(fh).finished = false;
                startnew(PostRecordedData, fh);
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

void PostRecordedData(ref @handle) {
    dojo.recording = false;

    FinishHandle @fh = cast<FinishHandle>(handle);
    bool finished = fh.finished;

    if (membuff.GetSize() < 100) {
        print("[TMDojo]: Not saving file, too little data");
        membuff.Resize(0);
        return;
    }
    if (!OnlySaveFinished || finished) {
        print("[TMDojo]: Saving game data (size: " + membuff.GetSize() / 1024 + " kB)");
        membuff.Seek(0);
        string reqUrl = ApiUrl + "/replays" +    
                            "?mapName=" + Net::UrlEncode(dojo.mapName) +
                            "&mapUId=" + dojo.mapUId +
                            "&authorName=" + dojo.authorName +
                            "&playerName=" + dojo.playerName +
                            "&playerLogin=" + dojo.playerLogin +
                            "&webId=" + dojo.webId +
                            "&endRaceTime=" + dojo.latestRecordedTime +
                            "&raceFinished=" + (finished ? "1" : "0");
        Net::HttpRequest@ req = Net::HttpPost(reqUrl, membuff.ReadToBase64(membuff.GetSize()), "application/octet-stream");
        if (!req.Finished()) {
            yield();
        }
        UI::ShowNotification("TMDojo", "Uploaded replay successfully!");
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
            if (!dojo.canRecord()) {                
                dojo.resetRecording();
            } 

            // SM_SCRIPT (used to get player inputs)
            if (@dojo.app.CurrentPlayground !is null &&
                dojo.app.CurrentPlayground.GameTerminals[0] !is null &&
                dojo.app.CurrentPlayground.GameTerminals[0].GUIPlayer !is null) {
                if (@dojo.sm_script == null) {
                    @dojo.sm_script = cast<CSmPlayer>(dojo.app.CurrentPlayground.GameTerminals[0].GUIPlayer).ScriptAPI;    
                }
            } else {
                @dojo.sm_script = null;
            }

            // RootMap + map info
            if (@dojo.app.RootMap != null) {
                if (@dojo.rootMap == null) {
                    @dojo.rootMap = dojo.app.RootMap;
                    dojo.mapUId = dojo.rootMap.EdChallengeId;
                    dojo.authorName = dojo.rootMap.AuthorNickName;
                    dojo.mapName = Regex::Replace(dojo.rootMap.MapInfo.NameForUi, "\\$([0-9a-fA-F]{1,3}|[iIoOnNmMwWsSzZtTgG<>]|[lLhHpP](\\[[^\\]]+\\])?)", "").Replace(" ", "%20");
                }
            } else {
                @dojo.rootMap = null;
                dojo.mapUId = "";
                dojo.authorName = "";
                dojo.mapName = "";
            }

            // UI Config (used for finish screen)
            if (@dojo.app.CurrentPlayground != null &&
                @dojo.app.CurrentPlayground.UIConfigs[0] != null) {
                if (@dojo.uiConfig == null) {
                    @dojo.uiConfig = @dojo.app.CurrentPlayground.UIConfigs[0];
                }
            } else {
                @dojo.uiConfig = null;
            }
        }

        sleep(250);
    }
}

void ServerChecker()
{
    while (true) {
        if (Enabled) {
            // Periodically check server if it is not available or when you are using a local dev API
            if (!dojo.serverAvailable || ApiUrl == LOCAL_API) {
                startnew(checkServer);
            }
        }

        sleep(10000);
    }
}
