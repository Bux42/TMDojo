#name "TMDojo"
#author "TMDojo"
#category "Utilities"
#perms "full"

#include "Icons.as"

[Setting name="TMDojoEnabled" description="Enable / Disable plugin"]
bool Enabled = true;

[Setting name="TMDojoDevMode" description="Enable / Disable DevMode"]
bool DevMode = false;

[Setting name="TMDojoOnlySaveFinished" description="Only save race data when race is finished"]
bool OnlySaveFinished = true;

[Setting name="TMDojoApiUrl" description="TMDojo API Url"]
string ApiUrl = REMOTE_API;

[Setting name="TMDojoUiUrl" description="TMDojo Ui Url"]
string UiUrl = REMOTE_UI;

[Setting name="TMDojoClientCode" description="TMDojo plugin Client Code"]
string ClientCode = "";

[Setting password name="TMDojoSessionId" description="TMDojo plugin SessionId"]
string SessionId = "";

[Setting name="TMDojoDebugOverlayEnabled" description="Enable / Disable debug overlay"]
bool DebugOverlayEnabled = false;

[Setting name="TMDojoOverlayEnabled" description="Enable / Disable overlay"]
bool OverlayEnabled = true;

const string LOCAL_API = "http://localhost";
const string REMOTE_API = "https://api.tmdojo.com";

const string LOCAL_UI = "http://localhost:4200";
const string REMOTE_UI = "https://tmdojo.com";

int RECORDING_FPS = 60;

int latestRecordedTime = -6666;

int checkSessionIdCount = 0;
int maxCheckSessionId = 60;

string pluginAuthUrl = "";

bool pluginAuthed = false;
bool isAuthenticating = false;
bool authWindowOpened = false;

string red = "\\$f33";
string green = "\\$9f3";
string orange = "\\$fb3";

MemoryBuffer membuff = MemoryBuffer(0);
bool recording = false;

TMDojo@ g_dojo;

// https://github.com/codecat/tm-dashboard special thanks to miss for getting vehicule informations

namespace Vehicle
{
	uint VehiclesManagerIndex = 4;
	uint VehiclesOffset = 0x1C8;

	bool CheckValidVehicles(CMwNod@ vehicleVisMgr)
	{
		auto ptr = Dev::GetOffsetUint64(vehicleVisMgr, VehiclesOffset);
		auto count = Dev::GetOffsetUint32(vehicleVisMgr, VehiclesOffset + 0x8);

		if ((ptr & 0xF) != 0) {
			return false;
		}

		if (count > 1000) {
			return false;
		}

		return true;
	}

	CSceneVehicleVis@ GetVis(ISceneVis@ sceneVis, CSmPlayer@ player)
	{
		uint vehicleEntityId = 0;
		if (player.ScriptAPI.Vehicle !is null) {
			vehicleEntityId = player.ScriptAPI.Vehicle.Id.Value;
		}

		auto vehicleVisMgr = SceneVis::GetMgr(sceneVis, VehiclesManagerIndex);
		if (vehicleVisMgr is null) {
			return null;
		}

		if (!CheckValidVehicles(vehicleVisMgr)) {
			return null;
		}

		auto vehicles = Dev::GetOffsetNod(vehicleVisMgr, VehiclesOffset);
		auto vehiclesCount = Dev::GetOffsetUint32(vehicleVisMgr, VehiclesOffset + 0x8);

		for (uint i = 0; i < vehiclesCount; i++) {
			auto nodVehicle = Dev::GetOffsetNod(vehicles, i * 0x8);
			auto nodVehicleEntityId = Dev::GetOffsetUint32(nodVehicle, 0);

			if (vehicleEntityId != 0 && nodVehicleEntityId != vehicleEntityId) {
				continue;
			} else if (vehicleEntityId == 0 && (nodVehicleEntityId & 0x02000000) == 0) {
				continue;
			}

			return Dev::ForceCast<CSceneVehicleVis@>(nodVehicle).Get();
		}

		return null;
	}

	float GetRPM(CSceneVehicleVisState@ vis)
	{
		if (g_offsetEngineRPM == 0) {
			auto type = Reflection::GetType("CSceneVehicleVisState");
			if (type is null) {
				error("Unable to find reflection info for CSceneVehicleVisState!");
				return 0.0f;
			}
			g_offsetEngineRPM = type.GetMember("EngineOn").Offset + 4;
		}

		return Dev::GetOffsetFloat(vis, g_offsetEngineRPM);
	}

	uint16 g_offsetEngineRPM = 0;
	array<uint16> g_offsetWheelDirt;
	uint16 g_offsetSideSpeed = 0;
}


namespace SceneVis
{
	CMwNod@ GetMgr(ISceneVis@ sceneVis, uint index)
	{
		uint managerCount = Dev::GetOffsetUint32(sceneVis, 0x8);
		if (index > managerCount) {
			error("Index out of range: there are only " + managerCount + " managers");
			return null;
		}

		return Dev::GetOffsetNod(sceneVis, 0x10 + index * 0x8);
	}
}


class FinishHandle
{
    bool finished;
    CSmScriptPlayer@ sm_script;
    CGamePlaygroundUIConfig@ uiConfig;
    CGameCtnChallenge@ rootMap;
    CTrackManiaNetwork@ network;
    int endRaceTime;
}

class TMDojo
{
	CInputScriptPad::EPadType m_currentPadType = CInputScriptPad::EPadType(-1);

    CTrackManiaNetwork@ network;
    int prevRaceTime = -6666;
    int currentRaceTime = -6666;

    vec3 latestPlayerPosition;
    int numSamePositions = 0;

    // Player info
    string playerName;
    string playerLogin;
    string webId;

    // Server status
    bool serverAvailable = false;
    bool checkingServer = false;

	CSmPlayer@ GetViewingPlayer()
	{
		auto playground = GetApp().CurrentPlayground;
		if (playground is null || playground.GameTerminals.Length != 1) {
			return null;
		}
		return cast<CSmPlayer>(playground.GameTerminals[0].GUIPlayer);
	}

    void drawOverlay() {
        int panelLeft = 10;
        int panelTop = 40;

        int panelWidth = recording ? 125 : 160;
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
        nvg::FillColor(recording ? red : gray);
        nvg::Fill();
        nvg::StrokeColor(gray);
        nvg::StrokeWidth(3);
        nvg::Stroke();
        nvg::ClosePath();

        // Recording text
        int textLeft = panelLeft + 38;
        int textTop = panelTop + 23;
        nvg::FillColor(recording ? red : white);
        nvg::FillColor(white);
        nvg::Text(textLeft, textTop, (recording ? "Recording" : "Not Recording"));
    }

    void FillBuffer(CSceneVehicleVis@ vis, CSmScriptPlayer@ sm_script) {
        int gazAndBrake = 0;
        int gazPedal = vis.AsyncState.InputGasPedal > 0 ? 1 : 0;
        int isBraking = vis.AsyncState.InputBrakePedal > 0 ? 2 : 0;

        gazAndBrake |= gazPedal;
        gazAndBrake |= isBraking;

        membuff.Write(g_dojo.currentRaceTime);

        membuff.Write(vis.AsyncState.Position.x);
        membuff.Write(vis.AsyncState.Position.y);
        membuff.Write(vis.AsyncState.Position.z);

        membuff.Write(vis.AsyncState.WorldVel.x);
        membuff.Write(vis.AsyncState.WorldVel.y);
        membuff.Write(vis.AsyncState.WorldVel.z);

        membuff.Write(vis.AsyncState.FrontSpeed * 3.6f);

        membuff.Write(vis.AsyncState.InputSteer);
        membuff.Write(vis.AsyncState.FLSteerAngle);

        membuff.Write(gazAndBrake);

        membuff.Write(Vehicle::GetRPM(vis.AsyncState));
        membuff.Write(vis.AsyncState.CurGear);

        membuff.Write(vis.AsyncState.Up.x);
        membuff.Write(vis.AsyncState.Up.y);
        membuff.Write(vis.AsyncState.Up.z);

        membuff.Write(vis.AsyncState.Dir.x);
        membuff.Write(vis.AsyncState.Dir.y);
        membuff.Write(vis.AsyncState.Dir.z);

        uint8 fLGroundContactMaterial = vis.AsyncState.FLGroundContactMaterial;
        membuff.Write(fLGroundContactMaterial);
        membuff.Write(vis.AsyncState.FLSlipCoef);
        membuff.Write(vis.AsyncState.FLDamperLen);

        uint8 fRGroundContactMaterial = vis.AsyncState.FRGroundContactMaterial;
        membuff.Write(fRGroundContactMaterial);
        membuff.Write(vis.AsyncState.FRSlipCoef);
        membuff.Write(vis.AsyncState.FRDamperLen);

        uint8 rLGroundContactMaterial = vis.AsyncState.RLGroundContactMaterial;
        membuff.Write(rLGroundContactMaterial);
        membuff.Write(vis.AsyncState.RLSlipCoef);
        membuff.Write(vis.AsyncState.RLDamperLen);

        uint8 rRGroundContactMaterial = vis.AsyncState.RRGroundContactMaterial;
        membuff.Write(rRGroundContactMaterial);
        membuff.Write(vis.AsyncState.RRSlipCoef);
        membuff.Write(vis.AsyncState.RRDamperLen);
    }

	void Render()
	{
		auto app = GetApp();

		auto sceneVis = app.GameScene;
		if (sceneVis is null || app.Editor != null) {
			return;
		}

        if (app.CurrentPlayground == null || app.CurrentPlayground.GameTerminals.get_Length() == 0 || app.CurrentPlayground.GameTerminals[0].GUIPlayer == null) {
            return;
        }

        CSmScriptPlayer@ sm_script = cast<CSmPlayer>(app.CurrentPlayground.GameTerminals[0].GUIPlayer).ScriptAPI;
        CGamePlaygroundUIConfig@ uiConfig = app.CurrentPlayground.UIConfigs[0];
        CGameCtnChallenge@ rootMap = app.RootMap;

        if (sm_script == null) {
            return;
        }

        CSceneVehicleVis@ vis = null;

		auto player = GetViewingPlayer();
		if (player !is null && player.User.Name.Contains(network.PlayerInfo.Name)) {
			@vis = Vehicle::GetVis(sceneVis, player);
		}

		if (vis is null) {
			return;
		}

		uint entityId = Dev::GetOffsetUint32(vis, 0);
		if ((entityId & 0xFF000000) == 0x04000000) {
			return;
		}

        if (this.checkingServer || !this.serverAvailable) {
            return;
        }

        auto playgroundScript = cast<CSmArenaRulesMode>(app.PlaygroundScript);

        bool hudOff = false;

        if (app.CurrentPlayground !is null && app.CurrentPlayground.Interface !is null) {
            if (Dev::GetOffsetUint32(app.CurrentPlayground.Interface, 0x1C) == 0) {
                hudOff = true;
                if (playgroundScript == null) {
                    if (app.Network.PlaygroundClientScriptAPI != null) {
                        auto playgroundClientScriptAPI = cast<CGamePlaygroundClientScriptAPI>(app.Network.PlaygroundClientScriptAPI);
                        if (playgroundClientScriptAPI != null) {
                            g_dojo.currentRaceTime = playgroundClientScriptAPI.GameTime - player.ScriptAPI.StartTime;
                        }
                    }
                } else {
                    g_dojo.currentRaceTime = playgroundScript.Now - player.ScriptAPI.StartTime;
                }
            } else {
                g_dojo.currentRaceTime = sm_script.CurrentRaceTime;
            }
        }

        if (Enabled && OverlayEnabled && !hudOff) {     
            this.drawOverlay();
        }

        if (!recording && g_dojo.currentRaceTime > -50 && g_dojo.currentRaceTime < 0) {
            recording = true;
        }

        if (recording) {
            
            if (uiConfig.UISequence == 11) {
                // Finished track
                print("[TMDojo]: Finished");

                ref @fh = FinishHandle();
                cast<FinishHandle>(fh).finished = true;
                @cast<FinishHandle>(fh).rootMap = rootMap;
                @cast<FinishHandle>(fh).uiConfig = uiConfig;
                @cast<FinishHandle>(fh).sm_script = sm_script;
                @cast<FinishHandle>(fh).network = network;
                cast<FinishHandle>(fh).endRaceTime = latestRecordedTime;

                // https://github.com/GreepTheSheep/openplanet-mx-random special thanks to greep for getting accurate endRaceTime

                int endRaceTimeAccurate = -1;

                CSmArenaRulesMode@ PlaygroundScript = cast<CSmArenaRulesMode>(app.PlaygroundScript);

                CGamePlayground@ GamePlayground = cast<CGamePlayground>(app.CurrentPlayground);
                if (PlaygroundScript !is null && GamePlayground.GameTerminals.get_Length() > 0) {
                    CSmPlayer@ player = cast<CSmPlayer>(GamePlayground.GameTerminals[0].ControlledPlayer);
                    if (GamePlayground.GameTerminals[0].UISequence_Current == CGameTerminal::ESGamePlaygroundUIConfig__EUISequence::Finish && player !is null) {
                        auto ghost = PlaygroundScript.Ghost_RetrieveFromPlayer(player.ScriptAPI);
                        if (ghost !is null) {
                            if (ghost.Result.Time > 0 && ghost.Result.Time < 4294967295) endRaceTimeAccurate = ghost.Result.Time;
                            PlaygroundScript.DataFileMgr.Ghost_Release(ghost.Id);
                        } else endRaceTimeAccurate = -1;
                    } else endRaceTimeAccurate = -1;
                } else endRaceTimeAccurate = -1;

                if (endRaceTimeAccurate > 0) {
                    cast<FinishHandle>(fh).endRaceTime = endRaceTimeAccurate;
                }

                startnew(PostRecordedData, fh);
            } else if (latestRecordedTime > 0 && g_dojo.currentRaceTime < 0) {
                // Give up
                print("[TMDojo]: Give up");

                ref @fh = FinishHandle();
                cast<FinishHandle>(fh).finished = false;
                @cast<FinishHandle>(fh).rootMap = rootMap;
                @cast<FinishHandle>(fh).uiConfig = uiConfig;
                @cast<FinishHandle>(fh).sm_script = sm_script;
                @cast<FinishHandle>(fh).network = network;
                cast<FinishHandle>(fh).endRaceTime = latestRecordedTime;
                startnew(PostRecordedData, fh);
            } else {
                 // Record current data
                int timeSinceLastRecord = g_dojo.currentRaceTime - latestRecordedTime;
                if (timeSinceLastRecord > (1.0 / RECORDING_FPS) * 1000) {
                    // Keep track of the amount of samples for which the position did not changed, used to pause recording
                    if (Math::Abs(latestPlayerPosition.x - sm_script.Position.x) < 0.001 &&
                        Math::Abs(latestPlayerPosition.y - sm_script.Position.y) < 0.001 && 
                        Math::Abs(latestPlayerPosition.z - sm_script.Position.z) < 0.001 ) {
                        numSamePositions += 1;
                    } else {
                        numSamePositions = 0;
                    }
                    // Fill buffer if player has moved recently
                    if (numSamePositions < RECORDING_FPS) {
                        FillBuffer(vis, sm_script);
                        latestRecordedTime = g_dojo.currentRaceTime;
                    }

                    latestPlayerPosition = sm_script.Position;
                }
            }
        }
	}
}

void PostRecordedData(ref @handle) {
    recording = false;

    if (!g_dojo.serverAvailable || !Enabled) {
        latestRecordedTime = -6666;
        membuff.Resize(0);
        return;
    }

    FinishHandle @fh = cast<FinishHandle>(handle);
    bool finished = fh.finished;
    CSmScriptPlayer@ sm_script = fh.sm_script;
    CGamePlaygroundUIConfig@ uiConfig = fh.uiConfig;
    CGameCtnChallenge@ rootMap = fh.rootMap;
    CTrackManiaNetwork@ network = fh.network;
    int endRaceTime = fh.endRaceTime;

    if (membuff.GetSize() < 10000) {
        print("[TMDojo]: Not saving file, too little data");
        membuff.Resize(0);
        latestRecordedTime = -6666;
        g_dojo.currentRaceTime = -6666;
        recording = false;
        return;
    }
    if (!OnlySaveFinished || finished) {
        print("[TMDojo]: Saving game data (size: " + membuff.GetSize() / 1024 + " kB)");
        membuff.Seek(0);
        string mapNameClean = Regex::Replace(rootMap.MapInfo.NameForUi, "\\$([0-9a-fA-F]{1,3}|[iIoOnNmMwWsSzZtTgG<>]|[lLhHpP](\\[[^\\]]+\\])?)", "").Replace(" ", "%20");
        string reqUrl = ApiUrl + "/replays" +
                            "?mapName=" + Net::UrlEncode(mapNameClean) +
                            "&mapUId=" + rootMap.MapInfo.MapUid +
                            "&authorName=" + rootMap.MapInfo.AuthorNickName +
                            "&playerName=" + network.PlayerInfo.Name +
                            "&playerLogin=" + network.PlayerInfo.Login +
                            "&webId=" + network.PlayerInfo.WebServicesUserId +
                            "&endRaceTime=" + endRaceTime +
                            "&raceFinished=" + (finished ? "1" : "0");
        // build up request instance
        Net::HttpRequest req;
        req.Method = Net::HttpMethod::Post;
        req.Url = reqUrl;
        req.Body = membuff.ReadToBase64(membuff.GetSize());
        dictionary@ Headers = dictionary();
        Headers["Authorization"] = "dojo " + SessionId;
        Headers["Content-Type"] = "application/octet-stream";
        @req.Headers = Headers;
        req.Start();
        while (!req.Finished()) {
            yield();
        }
        // TODO: handle upload errors
        UI::ShowNotification("TMDojo", "Uploaded replay successfully!");
    }
    recording = false;
    latestRecordedTime = -6666;
    g_dojo.currentRaceTime = -6666;
    membuff.Resize(0);
}

void RenderMenu()
{
    string menuTitle = "";
    if (g_dojo.checkingServer) {
        menuTitle = orange + Icons::Wifi + "\\$z TMDojo";
    } else {
        menuTitle = (g_dojo.serverAvailable ? green : red) + Icons::Wifi + "\\$z TMDojo";
    }

    if (UI::BeginMenu(menuTitle)) {
		if (UI::MenuItem(Enabled ? "Turn OFF" : "Turn ON", "", false, true)) {
            Enabled = !Enabled;
            if (Enabled) {
                startnew(checkServer);
            }
		}

        string otherApi = ApiUrl == LOCAL_API ? REMOTE_API : LOCAL_API;
        string otherUi = ApiUrl == LOCAL_API ? REMOTE_UI : LOCAL_UI;
        if (DevMode && UI::MenuItem("Switch to " + otherApi + " " + otherUi , "", false, true)) {
            ApiUrl = otherApi;
            UiUrl = otherUi;
            startnew(checkServer);
		}

        if (UI::MenuItem(OverlayEnabled ? "[X]  Overlay" : "[  ]  Overlay", "", false, true)) {
            OverlayEnabled = !OverlayEnabled;
		}

        if (DevMode && UI::MenuItem(DebugOverlayEnabled ? "[X]  Debug Overlay" : "[  ]  Debug Overlay", "", false, true)) {
            DebugOverlayEnabled = !DebugOverlayEnabled;
		}

        if (UI::MenuItem(OnlySaveFinished ? "[X]  Save finished runs only" : "[  ]  Save finished runs only", "", false, true)) {
            OnlySaveFinished = !OnlySaveFinished;
		}

        if (!g_dojo.serverAvailable && !g_dojo.checkingServer) {
            if (UI::MenuItem("Check server", "", false, true)) {
                startnew(checkServer);
            }
        }

        if (pluginAuthed) {
            if (UI::MenuItem(green + Icons::Plug + " Plugin Authenticated")) {
                authWindowOpened = true;
            }
            if (UI::MenuItem(orange + Icons::SignOut + " Logout")) {
               startnew(logout);
            }
        } else {
            if (UI::MenuItem(orange + Icons::Plug + " Authenticate Plugin")) {
                authWindowOpened = true;
            }
        }

		UI::EndMenu();
	}
}

void logout() {
    string logoutBody = "{\"sessionId\":\"" + SessionId + "\"}";
    Net::HttpRequest@ req = Net::HttpPost(ApiUrl + "/logout", logoutBody, "application/json");
    while (!req.Finished()) {
        yield();
        sleep(50);
    }
    UI::ShowNotification("TMDojo", "Plugin logged out!", vec4(0, 0.4, 0, 1));
    SessionId = "";
    pluginAuthed = false;
    checkServer();  
}

void getPluginAuth() {
    isAuthenticating = true;
    while (checkSessionIdCount < maxCheckSessionId) {
        sleep(1000);
        checkSessionIdCount++;
        Net::HttpRequest@ auth = Net::HttpGet(ApiUrl + "/auth/pluginSecret?clientCode=" + ClientCode);
        while (!auth.Finished()) {
            yield();
            sleep(50);
        }
        try {
            Json::Value json = Json::Parse(auth.String());
            SessionId = json["sessionId"];
            UI::ShowNotification("TMDojo", "Plugin is authenticated!", vec4(0, 0.4, 0, 1), 10000);
            pluginAuthed = true;
            ClientCode = "";
            break;
        } catch {
            
        }
    }
    isAuthenticating = false;
    if (checkSessionIdCount >= maxCheckSessionId) {
        UI::ShowNotification("TMDojo", "Plugin authentication took too long, please try again", vec4(0.4, 0, 0, 1), 10000);
    }
}

void authenticatePlugin() {
    OpenBrowserURL(pluginAuthUrl);
    startnew(getPluginAuth);
}

void checkServer() {
    g_dojo.checkingServer = true;
    g_dojo.playerName = g_dojo.network.PlayerInfo.Name;
    g_dojo.playerLogin = g_dojo.network.PlayerInfo.Login;
    g_dojo.webId = g_dojo.network.PlayerInfo.WebServicesUserId;
    Net::HttpRequest@ auth = Net::HttpGet(ApiUrl + "/auth?name=" + g_dojo.playerName + "&login=" + g_dojo.playerLogin + "&webid=" + g_dojo.webId + "&sessionId=" + SessionId);
    while (!auth.Finished()) {
        yield();
        sleep(50);
    }
    if (auth.String().get_Length() > 0) {
        Json::Value json = Json::Parse(auth.String());

        if (json.GetType() != Json::Type::Null) {
            print("HasKey authUrl: " + json.HasKey("authURL"));
            print("HasKey authSuccess: " + json.HasKey("authSuccess"));

            if (json.HasKey("authURL")) {
                try {
                    pluginAuthUrl = json["authURL"];
                    ClientCode = json["clientCode"];
                    SessionId = "";
                    UI::ShowNotification("TMDojo", "Plugin needs authentication!");
                } catch {
                    error("checkServer json error");
                }
            }
            if (json.HasKey("authSuccess")) {
                pluginAuthed = true;
                UI::ShowNotification("TMDojo", "Plugin is authenticated!", vec4(0, 0.4, 0, 1));
            }
        } else {
            UI::ShowNotification("TMDojo", "checkServer() Error: Json response is null", vec4(0.4, 0, 0, 1));
            error("checkServer server response is not json");
        }
        
        g_dojo.serverAvailable = true;
    } else {
        g_dojo.serverAvailable = false;
    }
    g_dojo.checkingServer = false;
}

void Main()
{
    auto app = GetApp();
    @g_dojo = TMDojo();
    @g_dojo.network = cast<CTrackManiaNetwork>(app.Network);

    startnew(checkServer);
}

void Render() {
    if (g_dojo !is null && Enabled) {
		g_dojo.Render();
	}
}

void renderAuthWindow() {
    UI::SetNextWindowContentSize(780, 230);
    UI::Begin("TMDojo Plugin Authentication", authWindowOpened);
    if (!pluginAuthed) {
        UI::Text(orange + "Not authenticated");
        UI::Text("");
        UI::Text("In order to upload your replays to TMDojo, you need to tell us who you are.");
        UI::Text("Please click the \"Authenticate Plugin\" button below - it will open a browser window for you to log into your Ubisoft account.");
        UI::Text("Don't worry: This only gives us access to your accountID and your name!");
        UI::Text("");
        UI::Text("Once you've clicked the button, you have one minute to log in.");
        UI::Text("If it takes a bit longer, you can just press the button again (if you're already logged in, it's just gonna take a second).");
        UI::Text("");
        if (!isAuthenticating && UI::Button("Authenticate Plugin")) {
            authenticatePlugin();
        }
        if (isAuthenticating) {
            UI::Text("Awaiting authentication, " + (maxCheckSessionId - checkSessionIdCount) + " seconds remaining");
        }
    } else {
        UI::Text(green + "Plugin authed!");
        UI::Text("");
        UI::Text("Welcome " + g_dojo.playerName + ", you can now upload replays to the TMDojo!");
        UI::Text("");

        if (UI::Button("My profile")) {
            OpenBrowserURL(UiUrl + "/users/" + g_dojo.webId);
        }
    }
    UI::End();
}

void renderDebugOverlay() {
    UI::SetNextWindowContentSize(780, 230);
    UI::Begin("TMDojo Debug", DebugOverlayEnabled);


    UI::Columns(2);

    UI::Text("Recording: " + recording);
    UI::Text("CurrentRaceTime: " + g_dojo.currentRaceTime);
    UI::Text("LatestRecordedTime: " + latestRecordedTime);
    UI::Text("Buffer Size (bytes): " + membuff.GetSize());

    CSceneVehicleVis@ vis = null;

    auto app = GetApp();

    auto sceneVis = app.GameScene;
    if (sceneVis != null && app.Editor == null) {
        if (app.CurrentPlayground != null && app.CurrentPlayground.GameTerminals.get_Length() > 0 && app.CurrentPlayground.GameTerminals[0].GUIPlayer != null) {
            auto player = g_dojo.GetViewingPlayer();
            if (player !is null && player.User.Name.Contains(g_dojo.network.PlayerInfo.Name)) {
                @vis = Vehicle::GetVis(sceneVis, player);
            }
        }
    }

    if (vis != null) {
        UI::NextColumn();

        UI::Text("Position.x: " + vis.AsyncState.Position.x);
        UI::Text("Position.y: " + vis.AsyncState.Position.y);
        UI::Text("Position.z: " + vis.AsyncState.Position.z);

        UI::Text("WorldVel.x: " + vis.AsyncState.WorldVel.x);
        UI::Text("WorldVel.y: " + vis.AsyncState.WorldVel.y);
        UI::Text("WorldVel.z: " + vis.AsyncState.WorldVel.z);

        UI::Text("Speed: " + (vis.AsyncState.FrontSpeed * 3.6f));

        UI::Text("InputSteer: " + vis.AsyncState.InputSteer);

        UI::Text("WheelAngle: " + vis.AsyncState.FLSteerAngle);
        
        UI::Text("InputGasPedal: " + vis.AsyncState.InputGasPedal); 
        UI::Text("InputBrakePedal: " + vis.AsyncState.InputBrakePedal);

        UI::Text("EngineCurGear: " + vis.AsyncState.CurGear);
        UI::Text("EngineRpm: " + Vehicle::GetRPM(vis.AsyncState));

        UI::Text("Up.x: " + vis.AsyncState.Up.x);
        UI::Text("Up.y: " + vis.AsyncState.Up.y);
        UI::Text("Up.z: " + vis.AsyncState.Up.z);

        UI::Text("Dir.x: " + vis.AsyncState.Dir.x);
        UI::Text("Dir.y: " + vis.AsyncState.Dir.y);
        UI::Text("Dir.z: " + vis.AsyncState.Dir.z);

        UI::Text("FLGroundContactMaterial: " + vis.AsyncState.FLGroundContactMaterial);
        UI::Text("FRGroundContactMaterial: " + vis.AsyncState.FRGroundContactMaterial);
        UI::Text("RLGroundContactMaterial: " + vis.AsyncState.RLGroundContactMaterial);
        UI::Text("RRGroundContactMaterial: " + vis.AsyncState.RRGroundContactMaterial);
        
        UI::Text("FLSlipCoef: " + vis.AsyncState.FLSlipCoef);
        UI::Text("FRSlipCoef: " + vis.AsyncState.FRSlipCoef);
        UI::Text("RLSlipCoef: " + vis.AsyncState.RLSlipCoef);
        UI::Text("RRSlipCoef: " + vis.AsyncState.RRSlipCoef);

        UI::Text("FLDamperLen: " + vis.AsyncState.FLDamperLen);
        UI::Text("FRDamperLen: " + vis.AsyncState.FRDamperLen);
        UI::Text("RLDamperLen: " + vis.AsyncState.RLDamperLen);
        UI::Text("RRDamperLen: " + vis.AsyncState.RRDamperLen);
    }

    UI::End();
}

void RenderInterface() {
    if (authWindowOpened) {
        renderAuthWindow();
    }
    if (DebugOverlayEnabled) {
        renderDebugOverlay();
    }
}
