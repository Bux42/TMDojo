#name "TMDojo"
#author "TMDojo"
#category "Utilities"
#perms "full"

class TMDojo
{
    CGameCtnApp@ app;
    CGamePlaygroundScript@ playgroundScript;
    CSmScriptPlayer@ sm_script;
    CGamePlaygroundUIConfig@ uiConfig;

    string challengeId;

    bool showMenu = true;
    bool serverAvailable = false;

    TMDojo() {
        print("TMDojo: Init");
        this.challengeId = "";
        this.serverAvailable = this.checkServer();
        @this.app = GetApp();
    }
    bool checkServer() {
        Net::HttpRequest@ ping = Net::HttpGet("http://localhost:3000/ping");
        if (ping.String().get_Length() > 0) {
            return (true);
        }
        return (false);
    }
}

TMDojo@ dojo;

void Main()
{
    @dojo = TMDojo();
    startnew(ContextChecker);
}

void Render()
{
    if (dojo != null) {
        if (dojo.showMenu) {
            
        }
    }
}

void ContextChecker()
{
    while (true) {
        if (dojo.app.CurrentPlayground == null) {
            @dojo.playgroundScript = null;
            @dojo.sm_script = null;
            @dojo.uiConfig = null;
            dojo.challengeId = "";
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
                        string url = "http://localhost:3000/set-current-map?id=" + edChallengeId + "&author=" + authorName + "&name=" + mapName;
                        Net::HttpRequest@ mapReq = Net::HttpGet(url);
                }
            }
        }
    }
}