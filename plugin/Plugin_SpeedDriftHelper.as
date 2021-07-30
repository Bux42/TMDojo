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
            float driftAngleDeg = Math::ToDeg(driftAngle) * 100;

            float diff = Math::Abs(driftAngleDeg - 0.5);
            if (diff > 0.5) {
                diff = 0.5;
            }
            vec4 color = vec4(0.5 + diff, 1 - diff, 0, 1);
            
            Draw::DrawString(vec2(900, 900), color, Text::Format("%.2f", driftAngleDeg), null, 30.0f, 0.0f);
        }
    }
}
