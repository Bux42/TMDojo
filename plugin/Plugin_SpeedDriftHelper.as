#name "SDH"
#author "TMDojo"
#category "Utilities"
#perms "full"

CGameCtnApp@ app;

void Main()
{
    @app = GetApp();
}

void Render()
{
    if (app != null &&
        app.CurrentPlayground != null &&
        app.CurrentPlayground.GameTerminals[0] != null &&
        app.CurrentPlayground.GameTerminals[0].GUIPlayer != null) {
            CSmScriptPlayer@ sm_script = cast<CSmPlayer>(app.CurrentPlayground.GameTerminals[0].GUIPlayer).ScriptAPI;
        if (sm_script.WheelsSkiddingCount == 4 && sm_script.DisplaySpeed > 400) {
            float driftAngle = Math::Angle(sm_script.AimDirection.Normalized(), sm_script.Velocity.Normalized() ) - 1.45946f;
            float driftAngleDeg = Math::ToDeg(driftAngle);
            Draw::DrawString(vec2(900, 900), vec4(1, 0.2, 0.2, 1), "" + driftAngleDeg, null, 30.0f, 0.0f);
        }
    }
}
