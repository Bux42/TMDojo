#name "BlockExtractor"
#author "TMDojo"
#category "Utilities"
#perms "full"

bool g_inCustomMenu = false;

class Block {
    string blockName;
    int blockId;
    int count;
}

vec3 getRealCoords(nat3 coords) 
{
    auto app = GetApp();
    CGameCtnEditorFree@ editor = cast<CGameCtnEditorFree>(app.Editor);
    CGameEditorPluginMapMapType@ mapType = editor.PluginMapType;
    return (mapType.GetVec3FromCoord(coords));
}

void ExtractBlocks()
{
    dictionary blocksDict;
    array<string> blockNames;
    int outStr;
    
    uint8 blockIndex = 0;
    auto app = GetApp();
    if (app.PlaygroundScript != null) {
        if (app.PlaygroundScript.Map != null) {
            for (int i = 0; i < app.PlaygroundScript.Map.Blocks.Length; i++) {
                if (!blocksDict.Exists(app.PlaygroundScript.Map.Blocks[i].BlockModel.Name)) {
                    blockNames.InsertLast(app.PlaygroundScript.Map.Blocks[i].BlockModel.Name);
                    blocksDict.Set(app.PlaygroundScript.Map.Blocks[i].BlockModel.Name, blockIndex);
                    blockIndex++;
                } 
                if (app.PlaygroundScript.Map.Blocks[i].BlockModel.Name.Contains("OpenTechRoadCheckpoint")) {
                    vec3 coord = getRealCoords(app.PlaygroundScript.Map.Blocks[i].Coord);
                }
            }
            auto membuff = MemoryBuffer(0);
            membuff.Write(blockNames.get_Length());
            print(app.PlaygroundScript.Map.Blocks.Length + " Blocks analysed");
            for (int i = 0; i < blockNames.get_Length(); i++) {
                uint8 id;
                blocksDict.Get(blockNames[i], id);

                uint8 blockNameLen = blockNames[i].get_Length();

                print("Id: " + id + "\t" + blockNames[i]);
                membuff.Write(id);
                membuff.Write(blockNameLen);
                membuff.Write(blockNames[i]);
            }
            for (int i = 0; i < app.PlaygroundScript.Map.Blocks.Length; i++) {
                uint8 id;
                uint8 dir = app.PlaygroundScript.Map.Blocks[i].BlockModel.Dir;
                vec3 coord = getRealCoords(app.PlaygroundScript.Map.Blocks[i].Coord);
                blocksDict.Get(app.PlaygroundScript.Map.Blocks[i].BlockModel.Name, id);

                membuff.Write(id);
                membuff.Write(dir);

                membuff.Write(coord.x);
                membuff.Write(coord.y);
                membuff.Write(coord.z);
            }
            print("Membuff: " + membuff.GetSize());
            membuff.Seek(0);
            Net::HttpPost("http://localhost/maps/" + app.PlaygroundScript.Map.EdChallengeId, membuff.ReadToBase64(membuff.GetSize()), "application/octet-stream");
            membuff.Resize(0);

        } else {
            print("app.PlaygroundScript.Map == null");
        }
    } else {
        print("app.PlaygroundScript == null");
    }
}

void RenderMenu()
{
	auto app = cast<CGameManiaPlanet>(GetApp());
	auto menus = cast<CTrackManiaMenus>(app.MenuManager);

	if (UI::BeginMenu("Block Extractor")) {
		if (UI::MenuItem("Extract Blocks", "", false, true)) {
            ExtractBlocks();
		}
		UI::EndMenu();
	}
}

void Main()
{
    print("BlockExtractor: Init");
}
