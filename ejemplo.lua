-- PixelDev MX | Ejemplo básico de Luau
-- Coloca este Script dentro de una Part en Roblox Studio.

local pieza = script.Parent

pieza.Touched:Connect(function(hit)
    local personaje = hit.Parent
    local humanoid = personaje and personaje:FindFirstChildOfClass("Humanoid")

    if humanoid then
        pieza.Color = Color3.fromRGB(198, 242, 119)
    end
end)
