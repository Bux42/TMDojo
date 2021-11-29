#name "SocketLiveViewer"
#author "SocketDojo"
#category "Utilities"
#perms "full"

#include "Icons.as"

[Setting name="SocketDojoEnabled" description="Enable / Disable plugin"]
bool Enabled = true;

[Setting name="SocketDojoOnlySaveFinished" description="Only save race data when race is finished"]
bool OnlySaveFinished = true;

[Setting name="SocketDojoApiUrl" description="SocketDojo API Url"]
string ApiUrl = LOCAL_API;

[Setting name="SocketDojoDebugOverlayEnabled" description="Enable / Disable debug overlay"]
bool DebugOverlayEnabled = false;

[Setting name="SocketDojoOverlayEnabled" description="Enable / Disable overlay"]
bool OverlayEnabled = true;

const string LOCAL_API = "http://localhost";
const string REMOTE_API = "https://api.tmdojo.com";

int RECORDING_FPS = 200;

int latestRecordedTime = -6666;

MemoryBuffer membuff = MemoryBuffer(0);
bool recording = false;
int sentPackets = 0;

bool socketConnected = false;
bool socketInit = false;

TMDojo@ g_dojo;
Net::Socket@ sock = null;
bool stopAll = false;

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
        nvg::Text(textLeft, textTop, (recording ? "Sending Data" : "Idle"));
    }

    void FillBuffer(CSceneVehicleVis@ vis, CSmScriptPlayer@ sm_script) {
        int gazAndBrake = 0;
        int gazPedal = vis.AsyncState.InputGasPedal > 0 ? 1 : 0;
        int isBraking = vis.AsyncState.InputBrakePedal > 0 ? 2 : 0;

        gazAndBrake |= gazPedal;
        gazAndBrake |= isBraking;

        int packetStart = -666;

        sock.Write(packetStart);

        sock.Write(sm_script.CurrentRaceTime); // i

        sock.Write(vis.AsyncState.Position.x); // f
        sock.Write(vis.AsyncState.Position.y); // f
        sock.Write(vis.AsyncState.Position.z); // f

        // sock.Write(vis.AsyncState.WorldVel.x); // f
        // sock.Write(vis.AsyncState.WorldVel.y); // f
        // sock.Write(vis.AsyncState.WorldVel.z); // f

        // sock.Write(vis.AsyncState.FrontSpeed * 3.6f); // f

        // sock.Write(vis.AsyncState.InputSteer);  // f
        // sock.Write(vis.AsyncState.FLSteerAngle);  // f

        // sock.Write(gazAndBrake);  // i

        // sock.Write(Vehicle::GetRPM(vis.AsyncState)); // f
        // sock.Write(vis.AsyncState.CurGear); // i

        // sock.Write(vis.AsyncState.Up.x); // f
        // sock.Write(vis.AsyncState.Up.y); // f
        // sock.Write(vis.AsyncState.Up.z); // f

        // sock.Write(vis.AsyncState.Dir.x); // f
        // sock.Write(vis.AsyncState.Dir.y); // f
        // sock.Write(vis.AsyncState.Dir.z); // f


        // uint8 fLGroundContactMaterial = vis.AsyncState.FLGroundContactMaterial;
        // sock.Write(fLGroundContactMaterial); // B
        // sock.Write(vis.AsyncState.FLSlipCoef); // f
        // sock.Write(vis.AsyncState.FLDamperLen); // f

        // uint8 fRGroundContactMaterial = vis.AsyncState.FRGroundContactMaterial;
        // sock.Write(fRGroundContactMaterial); // B
        // sock.Write(vis.AsyncState.FRSlipCoef); // f
        // sock.Write(vis.AsyncState.FRDamperLen); // f

        // uint8 rLGroundContactMaterial = vis.AsyncState.RLGroundContactMaterial;
        // sock.Write(rLGroundContactMaterial); // B
        // sock.Write(vis.AsyncState.RLSlipCoef); // f
        // sock.Write(vis.AsyncState.RLDamperLen); // f

        // uint8 rRGroundContactMaterial = vis.AsyncState.RRGroundContactMaterial;
        // sock.Write(rRGroundContactMaterial); // B
        // sock.Write(vis.AsyncState.RRSlipCoef); // f
        // sock.Write(vis.AsyncState.RRDamperLen); // f
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

        if (!socketConnected) {
            return;
        }

        if (!recording && sm_script.CurrentRaceTime > -100 && sm_script.CurrentRaceTime < 0) {
            recording = true;
            sentPackets = 0;
        }
        if (recording) {
            if (uiConfig.UISequence == 11) {
                // Finished track
                print("[SocketDojo]: Finished");

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
                print("[SocketDojo]: Give up");

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
	}
}

void PostRecordedData(ref @handle) {
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
    string pluginName = "SocketLiveViewer " + (sock == null);
    if (sock != null) {
        pluginName += " " + sock.Available();
    }
    if (g_dojo.checkingServer) {
        menuTitle = orange + Icons::Wifi + "\\$z " + pluginName;
    } else {
        menuTitle = (g_dojo.serverAvailable ? green : red) + Icons::Wifi + "\\$z " + pluginName;
    }

    if (UI::BeginMenu(menuTitle)) {
		if (UI::MenuItem(Enabled ? "Turn OFF" : "Turn ON", "", false, true)) {
            Enabled = !Enabled;
            if (Enabled) {
                startnew(checkSocket);
            } else if (socketConnected) {
                sock.Close();
                @sock = null;
            }
		}

        if (UI::MenuItem(OverlayEnabled ? "[X]  Overlay" : "[  ]  Overlay", "", false, true)) {
            OverlayEnabled = !OverlayEnabled;
		}

        if (sock != null) {
            if (UI::MenuItem("Close Socket", "", false, true)) {
                sock.Close();
            }
        }
        if (sock == null || sock.Available() == 0) {
            if (UI::MenuItem("Connect Socket", "", false, true)) {
                startnew(checkSocket);
            }
        }
        if (UI::MenuItem("Stop All " + stopAll, "", false, true)) {
            stopAll = true;
        }
		UI::EndMenu();
	}
}

void checkSocket() {
    print("SocketDojo: CheckSocket");
    ConnectSocket();
}

void ConnectSocket() {
    socketConnected = false;
    @sock = Net::Socket();

    while (!sock.Connect("localhost", 1337) && !stopAll) {
        yield();
    }
    
    print("Connected to localhost");
    while (!sock.CanWrite() && !stopAll) {
        yield();
    }

    print("Can Write");
    if (stopAll) {
        print("Stopped All!");
        stopAll = false;
    } else {
        print("Connected to websocket!");
        socketConnected = true;
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

    startnew(checkSocket);
}

void Render() {
    if (g_dojo !is null && Enabled) {
		g_dojo.Render();
	}
}