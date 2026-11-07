-- PixelDev MX | Script de ejemplo para Roblox Studio / Studio Lite
-- Este script crea una pieza sencilla en Workspace.

local part = Instance.new("Part")
part.Name = "PixelDev_Ejemplo"
part.Size = Vector3.new(8, 1, 8)
part.Position = Vector3.new(0, 5, 0)
part.Anchored = true
part.Material = Enum.Material.Neon
part.Color = Color3.fromRGB(155, 89, 255)
part.Parent = workspace

print("¡Tu primer script de PixelDev MX funciona!")
