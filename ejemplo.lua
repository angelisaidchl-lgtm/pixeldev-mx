-- ejemplo.lua · PixelDev MX
-- Una pieza que cambia de color cada vez que alguien la toca.
--
-- Cómo usarlo en Roblox Studio Lite:
-- 1. Inserta una Part (pieza) en el espacio de trabajo.
-- 2. Dentro de la Part, agrega un Script.
-- 3. Pega este código y prueba el juego.

local pieza = script.Parent
local enfriamiento = false

pieza.Touched:Connect(function(otraParte)
	-- Solo reaccionamos si lo que tocó es parte de un personaje
	local personaje = otraParte.Parent
	local humanoide = personaje and personaje:FindFirstChildOfClass("Humanoid")
	if not humanoide or enfriamiento then
		return
	end

	enfriamiento = true
	pieza.Color = Color3.fromRGB(math.random(0, 255), math.random(0, 255), math.random(0, 255))
	task.wait(0.5)
	enfriamiento = false
end)
