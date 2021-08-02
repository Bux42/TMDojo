#name "TMDojo"
#author "TMDojo"
#category "Utilities"
#perms "full"

#include "Icons.as"

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

int latestRecordedTime = -6666;

MemoryBuffer membuff = MemoryBuffer(0);
bool recording = false;

TMDojo@ g_dojo;

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

    void drawDebugBuffer(CSceneVehicleVis@ vis, CSmScriptPlayer@ sm_script, CGameCtnChallenge@ rootMap) {
        int panelLeft = 180;
        int panelTop = 50;

        int panelWidth = 300;
        int panelHeight = 540;

        int topIncr = 18;

        nvg::BeginPath();
        nvg::Rect(panelLeft, panelTop, panelWidth, panelHeight);
        nvg::FillColor(vec4(0,0,0,0.8));
        nvg::Fill();
        nvg::ClosePath();
        vec4 colBorder = vec4(1, 1, 1, 1);
        vec4 colBorderGreen = vec4(0.1, 1, 0.1, 1);
        vec4 colBorderRed = vec4(1, 0.1, 0.1, 1);

        int panelLeftCp = panelLeft + 8;
        int panelTopCp = panelTop + 16;

        nvg::BeginPath();
        nvg::FontSize(12);
        nvg::FillColor(vec4(1, 1, 1, 1));

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "CurrentRaceTime: " + sm_script.CurrentRaceTime);
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "Position.x: " + vis.AsyncState.Position.x);
        panelTopCp += topIncr;
        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "Position.y: " + vis.AsyncState.Position.y);
        panelTopCp += topIncr;
        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "Position.z: " + vis.AsyncState.Position.z);
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "WorldVel.x: " + vis.AsyncState.WorldVel.x);
        panelTopCp += topIncr;
        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "WorldVel.y: " + vis.AsyncState.WorldVel.y);
        panelTopCp += topIncr;
        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "WorldVel.z: " + vis.AsyncState.WorldVel.z);
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "Speed: " + (vis.AsyncState.FrontSpeed * 3.6f));
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "InputSteer: " + vis.AsyncState.InputSteer);
        panelTopCp += topIncr;
        
        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "InputGasPedal: " + vis.AsyncState.InputGasPedal); 
        panelTopCp += topIncr;
        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "InputBrakePedal: " + vis.AsyncState.InputBrakePedal);
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "EngineCurGear: " + vis.AsyncState.CurGear);
        panelTopCp += topIncr;
        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "EngineRpm: " + Vehicle::GetRPM(vis.AsyncState));
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "Up.x: " + vis.AsyncState.Up.x);
        panelTopCp += topIncr;
        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "Up.y: " + vis.AsyncState.Up.y);
        panelTopCp += topIncr;
        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "Up.z: " + vis.AsyncState.Up.z);
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "Dir.x: " + vis.AsyncState.Dir.x);
        panelTopCp += topIncr;
        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "Dir.y: " + vis.AsyncState.Dir.y);
        panelTopCp += topIncr;
        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "Dir.z: " + vis.AsyncState.Dir.z);
        panelTopCp += topIncr;

        // MISC
        panelTopCp += topIncr;

        //Draw::DrawString(vec2(panelLeftCp, panelTopCp), (g_dojo.serverAvailable ? colBorderGreen: colBorderRed) , "API: " + ApiUrl);
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "recording: " + recording);
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "playername: " + network.PlayerInfo.Name);
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "playerlogin: " + network.PlayerInfo.Login);
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "webid: " + network.PlayerInfo.WebServicesUserId);
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "mapName: " + rootMap.MapInfo.NameForUi);
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "mapUid: " + rootMap.MapInfo.MapUid);
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "latestRecordedTime: " + latestRecordedTime);
        panelTopCp += topIncr;

        nvg::TextBox(panelLeftCp, panelTopCp, panelWidth, "size: " + membuff.GetSize() / 1024 + " kB");
        panelTopCp += topIncr;
    }

    void FillBuffer(CSceneVehicleVis@ vis, CSmScriptPlayer@ sm_script) {
        int gazAndBrake = 0;
        int gazPedal = vis.AsyncState.InputGasPedal > 0 ? 1 : 0;
        int isBraking = vis.AsyncState.InputBrakePedal > 0 ? 2 : 0;

        gazAndBrake |= gazPedal;
        gazAndBrake |= isBraking;

        membuff.Write(sm_script.CurrentRaceTime);

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

		if (app.CurrentPlayground !is null && app.CurrentPlayground.Interface !is null) {
            if (Dev::GetOffsetUint32(app.CurrentPlayground.Interface, 0x1C) == 0) {
                return;
            }
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

        if (Enabled && OverlayEnabled) {
            this.drawOverlay();
        }

        if (!recording && sm_script.CurrentRaceTime > -50 && sm_script.CurrentRaceTime < 0) {
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
                startnew(PostRecordedData, fh);
            } else if (latestRecordedTime > sm_script.CurrentRaceTime) {
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
                int timeSinceLastRecord = sm_script.CurrentRaceTime - latestRecordedTime;
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
                        latestRecordedTime = sm_script.CurrentRaceTime;
                    }

                    latestPlayerPosition = sm_script.Position;
                }
            }
        }
        if (DebugOverlayEnabled) {
            drawDebugBuffer(vis, sm_script, rootMap);
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
        Net::HttpRequest@ req = Net::HttpPost(reqUrl, membuff.ReadToBase64(membuff.GetSize()), "application/octet-stream");
        if (!req.Finished()) {
            yield();
        }
        UI::ShowNotification("TMDojo", "Uploaded replay successfully!");
    }
    recording = false;
    latestRecordedTime = -6666;
    membuff.Resize(0);
}

void RenderMenu()
{
    string red = "\\$f33";
    string green = "\\$9f3";
    string orange = "\\$fb3";

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

        if (!g_dojo.serverAvailable && !g_dojo.checkingServer) {
            if (UI::MenuItem("Check server", "", false, true)) {
                startnew(checkServer);
            }
        }

		UI::EndMenu();
	}
}

void checkServer() {
    g_dojo.checkingServer = true;
    g_dojo.playerName = g_dojo.network.PlayerInfo.Name;
    g_dojo.playerLogin = g_dojo.network.PlayerInfo.Login;
    g_dojo.webId = g_dojo.network.PlayerInfo.WebServicesUserId;
    Net::HttpRequest@ auth = Net::HttpGet(ApiUrl + "/auth?name=" + g_dojo.playerName + "&login=" + g_dojo.playerLogin + "&webid=" + g_dojo.webId);
    while (!auth.Finished()) {
        yield();
        sleep(50);
    }
    if (auth.String().get_Length() > 0) {
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