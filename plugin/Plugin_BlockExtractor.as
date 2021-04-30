#name "BlockExtractor"
#author "TMDojo"
#category "Utilities"
#perms "full"

bool g_inCustomMenu = false;
MemoryBuffer membuff = MemoryBuffer(0);

class Block {
    string blockName;
    int blockId;
    int count;
}

class UploadHandle
{
    string challengeId;
}

vec3 getRealCoords(nat3 coords)
{

    int realX = 32 * coords.x + 16;
    int realY = 8 * coords.y - 60;
    int realZ = 32 * coords.z + 16;

    vec3 coord(realX, realY, realZ);

    return coord;
}

void ExtractBlocks()
{
    dictionary blocksDict;
    array<string> blockNames;
    int outStr;
    
    uint8 blockIndex = 0;
    auto app = GetApp();

    for (int i = 0; i < app.RootMap.Blocks.Length; i++) {
        auto block = app.RootMap.Blocks[i];

        string name = block.BlockModel.Name;
        uint8 blockNameLen = name.get_Length();
        uint8 dir = block.Direction;
        vec3 coord = getRealCoords(block.Coord);

        membuff.Write(blockNameLen);
        membuff.Write(name);
        membuff.Write(dir);

        membuff.Write(coord.x);
        membuff.Write(coord.y);
        membuff.Write(coord.z);

        auto blockUnits = block.BlockUnits;
        uint8 blockUnitsLen = blockUnits.get_Length();

        membuff.Write(blockUnitsLen);
        for (int i = 0; i < blockUnits.get_Length(); i++) {
            auto unit = blockUnits[i];
            membuff.Write(unit.Offset.x);
            membuff.Write(unit.Offset.y);
            membuff.Write(unit.Offset.z);
        }
    }

    print("Starting Upload");
    ref @uploadHandle = UploadHandle();

    cast<UploadHandle>(uploadHandle).challengeId = app.PlaygroundScript.Map.EdChallengeId;

    startnew(UploadMapData, uploadHandle);
}

void UploadMapData(ref @uploadHandle)
{
    UploadHandle @uh = cast<UploadHandle>(uploadHandle);
    print("Membuff: " + membuff.GetSize());
    membuff.Seek(0);
    Net::HttpRequest req;
    req.Method = Net::HttpMethod::Post;
    req.Url = "http://localhost/save-map-blocks?challengeId=" + uh.challengeId;
    req.Body = membuff.ReadToBase64(membuff.GetSize());
    dictionary@ Headers = dictionary();
    Headers["Content-Type"] = "application/octet-stream";
    
    req.Start();
    while (!req.Finished()) {
        yield();
    }

    membuff.Resize(0);
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
