--print("Hello, world")

local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer

local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")
local StudioGui = PlayerGui:WaitForChild("StudioGui")

local panels = {
    "TopBar",
    "MainBar",
    "ExplorerPanel",
    "PropertiesPanel"
}

for _, name in ipairs(panels) do
    local panel = StudioGui:FindFirstChild(name, true)

    if panel and panel:IsA("GuiObject") then
        panel.Visible = true
    end
end
