--[[ VOXEL DRAGON - VERSION C (Advanced Evolution) - 1 script
Sintaxis Lua 5.1 (compatible con Roblox Luau). Poner en ServerScriptService.
Frente = -Z. Estados: Idle, Roar, Walk, Fly.
Cambiar estado: model:SetAttribute("State", "Walk") (poner CONFIG.Demo = false).
Para moverse necesita AnchorBody = true. Escala minima recomendada: 0.5 ]]
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
local Debris = game:GetService("Debris")

local CONFIG = {
	Scale = 0.5, Origin = Vector3.new(0, 0, 0), AnchorBody = true,
	AnimSpeed = 1, WalkSpeed = 9, FlySpeed = 32, FlyHeight = 30,
	Demo = true, -- ciclo automatico Idle > Roar > Walk > Fly > Idle
	AutoFire = false, FireInterval = 8, Parent = workspace,
}
local S = CONFIG.Scale
local B, P, W = 1.1, 1.2, 1.3 -- bulk, pauldron, wing (Version C)
local C3 = Color3.fromRGB
local COL = {
	red = C3(163, 32, 26), dark = C3(90, 15, 15), org = C3(224, 102, 26), gold = C3(217, 168, 42),
	sil = C3(154, 160, 168), bro = C3(156, 107, 42), mem = C3(107, 18, 18), mar = C3(122, 21, 21),
	eye = C3(255, 226, 74), glow = C3(255, 138, 26),
}
local MAT = {
	sil = Enum.Material.Metal, bro = Enum.Material.Metal, gold = Enum.Material.Metal,
	glow = Enum.Material.Neon, eye = Enum.Material.Neon,
}
local rng = Random.new(7)
local SIDES = { -1, 1 }

local function colorOf(key)
	local c = COL[key]
	if key == "red" then
		local f = 1 + (rng:NextNumber() - 0.5) * 0.25
		return Color3.new(math.min(1, c.R * f), math.min(1, c.G * f), math.min(1, c.B * f))
	end
	return c
end

local model = Instance.new("Model")
model.Name = "VoxelDragon_C"
model.Parent = CONFIG.Parent
local mods, eyes = {}, {}

local function newPart(name, w, h, d, cf, key)
	local p = Instance.new("Part")
	p.Name = name
	p.Size = Vector3.new(math.max(w * S, 0.05), math.max(h * S, 0.05), math.max(d * S, 0.05))
	p.CFrame = cf
	p.Color = colorOf(key)
	p.Material = MAT[key] or Enum.Material.SmoothPlastic
	p.Anchored, p.CanCollide, p.Massless = false, false, true
	p.TopSurface, p.BottomSurface = Enum.SurfaceType.Smooth, Enum.SurfaceType.Smooth
	p.Parent = model
	return p
end

-- Diseno: x derecha, y arriba, z frente (se invierte a -Z de Roblox). rot = {rx, ry, rz}
local function newModule(name, parent, pivot, rot, main)
	local parentCF = parent and parent.rest or CFrame.new(CONFIG.Origin)
	local rest = parentCF * CFrame.new(pivot[1] * S, pivot[2] * S, -pivot[3] * S)
	if rot then rest = rest * CFrame.Angles(-rot[1], -rot[2], rot[3]) end
	local root = newPart(name, main[1], main[2], main[3], rest * CFrame.new(main[4] * S, main[5] * S, -main[6] * S), main[7])
	local m = { name = name, rest = rest, root = root }
	if parent then
		local mo = Instance.new("Motor6D")
		mo.Name, mo.Part0, mo.Part1 = name, parent.root, root
		mo.C0 = parent.root.CFrame:Inverse() * rest
		mo.C1 = root.CFrame:Inverse() * rest
		mo.Parent = parent.root
		m.motor, m.c0 = mo, mo.C0
	end
	mods[name] = m
	return m
end

local function add(m, w, h, d, x, y, z, key, rz)
	local cf = m.rest * CFrame.new(x * S, y * S, -z * S)
	if rz then cf = cf * CFrame.Angles(0, 0, rz) end
	local p = newPart(m.name .. "_" .. key, w, h, d, cf, key)
	local wc = Instance.new("WeldConstraint")
	wc.Part0, wc.Part1, wc.Parent = m.root, p, p
	return p
end

local function spike(m, x, y, z, key, k)
	add(m, 2.4 * k, 2.4 * k, 2.4 * k, x, y, z, key)
	add(m, 1.3 * k, 2 * k, 1.3 * k, x, y + 1.8 * k, z - 0.4 * k, key)
end

local function line(m, x0, y0, x1, y1, th, dp, key, z)
	local len = math.sqrt((x1 - x0) ^ 2 + (y1 - y0) ^ 2)
	add(m, len, th, dp, (x0 + x1) / 2, (y0 + y1) / 2, z, key, math.atan2(y1 - y0, x1 - x0))
end

-- ================= BODY (PrimaryPart) =================
local body = newModule("Body", nil, { 0, 20, 0 }, nil, { 13 * B, 16, 9.5, 0, 12, 0, "red" })
model.PrimaryPart = body.root
add(body, 11 * B, 6, 9, 0, 2, 0, "red")
for i = 0, 5 do add(body, 8 * B, 2.4, 1.5, 0, 5.5 + i * 2.5, 5, "org") end
add(body, 14.5 * B, 7, 2, 0, 16.5, 4.5, "mar")
add(body, 15 * B, 1, 2.2, 0, 20.3, 4.5, "gold")
for i = 0, 3 do
	for _, s in ipairs(SIDES) do add(body, 1.5, 1.5, 2.4, s * (3 - i) * 1.3, 19 - i * 1.3, 4.7, "gold") end
end
add(body, 2, 2, 1, 0, 17.2, 5.6, "glow")
add(body, 10 * B, 2, 8, 0, 19.4, 0, "sil")
add(body, 10.4 * B, 0.8, 8.4, 0, 20.2, 0, "bro")
for i = 0, 4 do spike(body, 0, 19 - i * 3.2, -5.4, "sil", 1 - i * 0.05) end
for _, s in ipairs(SIDES) do add(body, 1.5, 8, 6, s * 7 * B, 13, 0, "sil") end

-- ================= LEGS =================
for _, s in ipairs(SIDES) do
	local L = newModule(s < 0 and "LegL" or "LegR", body, { s * 5.5 * B, 0, 0 }, nil, { 5.5 * B, 9, 6.5, 0, -4.5, 0, "red" })
	add(L, 4.5 * B, 9, 5, 0, -13, -0.5, "red")
	add(L, 5.5 * B, 4, 6, 0, -12.5, -0.3, "sil")
	add(L, 5.7 * B, 1, 6.2, 0, -10.6, -0.3, "bro")
	add(L, 6 * B, 2, 7, 0, -1, 0, "sil")
	add(L, 0.8, 6, 0.8, 0, -4.5, 3.4, "glow")
	add(L, 5.5 * B, 3, 9, 0, -18.5, 2, "red").CanCollide = true
	for _, cx in ipairs({ -1.8, 0, 1.8 }) do add(L, 1.2, 1.2, 2.5, cx * B, -19, 7, "dark") end
end

-- ================= NECK / HEAD / JAW =================
local neck = newModule("Neck", body, { 0, 18, 1 }, { 0.3, 0, 0 }, { 6 * B, 8, 6, 0, 3, 0, "red" })
add(neck, 5 * B, 7, 1.4, 0, 3, 3.4, "org")
local head = newModule("Head", neck, { 0, 8.53, 0.5 }, { -0.3, 0, 0 }, { 8 * B, 7, 9, 0, 0, 0, "red" })
add(head, 6 * B, 4, 6, 0, -1.2, 6.5, "red")
add(head, 9 * B, 2, 10, 0, 3.6, 0.5, "sil")
add(head, 9 * B, 1.5, 2, 0, 2.6, 5.2, "sil")
add(head, 2, 1, 10.4, 0, 4.6, 0.5, "bro")
for _, s in ipairs(SIDES) do
	add(head, 1.2, 1, 1, s * 1.5, -0.2, 9.6, "dark")
	add(head, 1, 4.5, 6, s * 4.2 * B, 0.5, -0.5, "sil")
	add(head, 1.6, 2, 1.6, s * 3, 5.4, 2, "gold")
	add(head, 1, 2, 1, s * 3, 7.2, 1.4, "gold")
	eyes[#eyes + 1] = add(head, 1, 1.4, 1.6, s * 4.2 * B, 1.2, 4, "eye")
	add(head, 1.5, 1.5, 6, s * 3, 2, -6, "dark")
end
for i = 0, 2 do spike(head, 0, 3.2 - i * 2.2, -4.6, "dark", 0.8) end
for i = 0, 3 do add(head, 0.8, 1, 0.8, (i - 1.5) * 1.4, -3.5, 9.2, "gold") end
local jaw = newModule("Jaw", head, { 0, -1.5, 0.5 }, { 0.35, 0, 0 }, { 5.4 * B, 1.6, 8, 0, -0.8, 4, "red" })
add(jaw, 3, 0.6, 5, 0, 0, 4, "org")
for i = 0, 3 do add(jaw, 0.8, 1, 0.8, (i - 1.5) * 1.3, 0.2, 7.4, "gold") end

-- ================= ARMS =================
for _, s in ipairs(SIDES) do
	local n = s < 0 and "L" or "R"
	local A = newModule("Arm" .. n, body, { s * (9.5 * B + 1), 18, 0 }, nil, { 4.5 * B, 7, 5, 0, -3.5, 0, "red" })
	add(A, 7 * P, 4, 8, s * 0.5, 1, 0, "mar")
	add(A, 7.2 * P, 1, 8.2, s * 0.5, -0.8, 0, "gold")
	spike(A, s * 1.2, 3.2, -2, "sil", 0.9)
	spike(A, s * 1.2, 3.2, 2, "sil", 0.9)
	add(A, 0.8, 5, 0.8, 0, -3.5, 2.3, "glow")
	local F = newModule("Forearm" .. n, A, { 0, -7, 0 }, { -0.8, 0, 0 }, { 4 * B, 7.5, 4.5, 0, -3.25, 0, "red" })
	add(F, 5.4 * B, 4.5, 5.6, 0, -4.5, 0, "sil")
	add(F, 5.7 * B, 0.9, 5.9, 0, -2.9, 0, "bro")
	add(F, 5.7 * B, 0.9, 5.9, 0, -6.2, 0, "bro")
	add(F, 2.2, 0.9, 0.9, s * 3.4, -3, -1.2, "sil")
	add(F, 2.2, 0.9, 0.9, s * 3.4, -4.6, -1.2, "sil")
	add(F, 4 * B, 3, 4, 0, -8, 0.5, "red")
	for _, fx in ipairs({ -1.3, 0, 1.3 }) do add(F, 1, 1, 2.4, fx, -9.6, 3, "dark") end
end

-- ================= WINGS =================
local function ty(t) return 4 + t * 1.5 * W end
local function hh(t) return (16 - t * 1.2) * W end
for _, s in ipairs(SIDES) do
	local wg = newModule(s < 0 and "WingL" or "WingR", body, { s * 5, 15, -5 }, { 0, s * 0.5, 0 }, { 2, 2, 2, 0, 4, 0, "bro" })
	line(wg, 0, 4, s * 20 * W, ty(10), 2, 2, "sil", 0)
	for _, t in ipairs({ 3, 6, 9 }) do add(wg, 2.6, 2.6, 2.6, s * t * 2 * W, ty(t), 0, "bro") end
	for t = 1, 10 do add(wg, 2 * W, hh(t) + 1, 0.8, s * t * 2 * W, ty(t) - hh(t) / 2 - 0.5, 0, "mem") end
	for _, f in ipairs({ 2, 4, 6, 8, 10 }) do line(wg, 0, 3.5, s * f * 2 * W, ty(f) - hh(f) - 1, 1.4, 1.2, "red", 0.3) end
	add(wg, 2.4, 2.4, 2.4, s * 20 * W, ty(10), 0, "sil")
	add(wg, 1.3, 2, 1.3, s * 20 * W, ty(10) + 1.8, 0, "sil")
end

-- ================= TAIL =================
local prev = body
for i = 1, 7 do
	local z = 1 - (i - 1) * 0.1
	local pivot, rot = { 0, 0, -7 }, { ((i - 2) < 2) and -0.1 or 0.26, 0, 0 }
	if i == 1 then pivot, rot = { 0, 3, -5 }, { -0.1, 0, 0 } end
	local m = newModule("Tail" .. i, prev, pivot, rot, { 8 * B * z, 7 * z, 8, 0, 0, -3, "red" })
	add(m, 6 * B * z, 2.5 * z, 8, 0, -3.2 * z, -3, "org")
	spike(m, 0, 3.6 * z, -3, (i % 2 == 0) and "sil" or "dark", 0.8 * z)
	for _, s in ipairs(SIDES) do add(m, 0.8, 0.8, 4, s * 4 * B * z, 0.5, -3, "glow") end
	prev = m
end
local mace = newModule("TailMace", prev, { 0, 0, -7 }, nil, { 7, 7, 8, 0, 0, -3, "sil" })
add(mace, 7.4, 1, 7.4, 0, 0, -1.5, "bro")
add(mace, 7.4, 1, 7.4, 0, 0, -4.5, "bro")
for _, p in ipairs({ { 4.2, 0, -3 }, { -4.2, 0, -3 }, { 0, 4.2, -3 }, { 0, -4.2, -3 }, { 0, 0, -7.6 } }) do
	add(mace, 2, 2, 2, p[1], p[2], p[3], "sil")
end
for _, p in ipairs({ { 3.4, 3.4 }, { -3.4, 3.4 }, { 3.4, -3.4 }, { -3.4, -3.4 } }) do
	add(mace, 1.6, 1.6, 3.5, p[1], p[2], -3, "dark")
end
body.root.Anchored = CONFIG.AnchorBody
body.root.CanCollide = true

-- ================= FIRE BREATH =================
local fireColors = { COL.eye, COL.glow, C3(224, 42, 26) }
local function fireBreath()
	local hcf = head.root.CFrame * CFrame.new(0, -3 * S, -14 * S)
	local look = head.root.CFrame.LookVector
	for i = 1, 24 do
		task.delay(i * 0.03, function()
			local sz = (1.2 + rng:NextNumber() * 1.6) * S
			local c = Instance.new("Part")
			c.Name, c.Size, c.Anchored, c.CanCollide = "FX_FireVoxel", Vector3.new(sz, sz, sz), true, false
			c.Material, c.Color, c.Transparency, c.CFrame = Enum.Material.Neon, fireColors[(i % 3) + 1], 0.1, hcf
			c.Parent = workspace
			local sp = Vector3.new((rng:NextNumber() - 0.5) * 8, (rng:NextNumber() - 0.3) * 6, 0) * S
			local target = hcf * CFrame.new(sp.X, sp.Y, 0) + look * (22 + rng:NextNumber() * 10) * S
			target = target * CFrame.Angles(rng:NextNumber() * 6, rng:NextNumber() * 6, 0)
			local ti = TweenInfo.new(0.7 + rng:NextNumber() * 0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
			TweenService:Create(c, ti, { CFrame = target, Transparency = 1, Size = c.Size * 0.4 }):Play()
			Debris:AddItem(c, 1.5)
		end)
	end
end
local fireEvent = Instance.new("BindableEvent")
fireEvent.Name = "FireBreath" -- model.FireBreath:Fire()
fireEvent.Event:Connect(fireBreath)
fireEvent.Parent = model
local cd = Instance.new("ClickDetector")
cd.MaxActivationDistance = 80
cd.MouseClick:Connect(fireBreath)
cd.Parent = head.root

-- ================= ESTADOS Y ANIMACION (Motor6D) =================
local st = { name = "Idle", spd = 0, h = 0, yaw = 0, ph = 0, fp = 0, ww = 0, wf = 0, wr = 0 }
model:SetAttribute("State", "Idle")
model:GetAttributeChangedSignal("State"):Connect(function()
	st.name = model:GetAttribute("State")
	if st.name == "Roar" then fireBreath() end
end)
if CONFIG.Demo then
	task.spawn(function()
		local seq = { { "Idle", 3 }, { "Roar", 3 }, { "Walk", 10 }, { "Idle", 2 }, { "Fly", 16 }, { "Idle", 5 } }
		while model.Parent do
			for _, e in ipairs(seq) do
				model:SetAttribute("State", e[1])
				task.wait(e[2])
			end
		end
	end)
end

local function rot(name, x, y, z) mods[name].motor.C0 = mods[name].c0 * CFrame.Angles(x, y, z) end
local function sat(v) return math.max(0, math.min(1, v)) end

local origin = body.root.Position
local px, pz = 0, 0
local eyeSize = eyes[1].Size
local nextBlink, nextFire = os.clock() + 3, os.clock() + CONFIG.FireInterval
local conn
conn = RunService.Heartbeat:Connect(function(dt)
	local now = os.clock()
	local t = now * CONFIG.AnimSpeed
	local walking, flying = st.name == "Walk", st.name == "Fly"
	local k = math.min(1, dt * 2)
	st.spd = st.spd + ((flying and CONFIG.FlySpeed or (walking and CONFIG.WalkSpeed or 0)) - st.spd) * k
	local tgtH = flying and CONFIG.FlyHeight or 0
	st.h = st.h + (tgtH - st.h) * math.min(1, dt * 1.2)
	local air = st.h > 0.8
	local function ease(v, g) return v + (g - v) * math.min(1, dt * 4) end
	st.wf = ease(st.wf, (flying or air) and 1 or 0)
	st.ww = ease(st.ww, (walking and not air) and 1 or 0)
	st.wr = ease(st.wr, st.name == "Roar" and 1 or 0)
	local ww, wf, wr = st.ww, st.wf, st.wr
	local spr = sat(st.spd / CONFIG.FlySpeed)
	st.ph = st.ph + dt * st.spd * 0.5 * CONFIG.AnimSpeed
	st.fp = st.fp + dt * (3 + wf * 3) * CONFIG.AnimSpeed
	local swing = math.sin(st.ph) * 0.45 * ww

	rot("Neck", math.sin(t * 1.2) * 0.03 - 0.2 * wf + 0.25 * wr, math.sin(t * 0.6) * 0.05, 0)
	rot("Head", math.sin(t * 1.2 + 1) * 0.04 + math.sin(st.ph * 2) * 0.05 * ww + 0.3 * wr + 0.2 * wf,
		math.sin(t * 0.7) * 0.08 * (1 - wr), 0)
	rot("Jaw", math.sin(t * 1.1) * 0.05 - 0.55 * wr, 0, 0)
	for _, n in ipairs({ "L", "R" }) do
		local s = (n == "L") and -1 or 1
		local g = (n == "L") and 1 or -1 -- fase opuesta entre lados
		rot("Leg" .. n, swing * g - 0.6 * wf + math.sin(t * 1.2) * 0.01, 0, 0)
		rot("Arm" .. n, math.sin(t * 1.2 + s) * 0.08 - swing * 0.7 * g - 0.7 * wf + 0.3 * wr, 0,
			s * math.sin(t * 1.2) * 0.03)
		rot("Forearm" .. n, math.sin(t * 1.2 + 1.5) * 0.06 - 0.4 * wf, 0, 0)
		rot("Wing" .. n, 0, 0, s * (math.sin(t * 0.9) * 0.08 * (1 - wf) + (0.3 + math.sin(st.fp * 2) * 0.65) * wf
			- 0.25 * ww + 0.2 * wr))
	end
	for i = 1, 7 do
		rot("Tail" .. i, math.sin(st.fp * 0.8 - i * 0.6) * 0.05 * wf, math.sin(t * 1.5 - i * 0.5) * (0.06 + 0.07 * ww + 0.04 * wf), 0)
	end
	rot("TailMace", 0, math.sin(t * 1.5 - 4) * 0.08, 0)

	-- movimiento del cuerpo (PivotTo del modelo)
	local turn = (air and 0.5 or 0.35) * sat(st.spd / 6)
	st.yaw = st.yaw + turn * dt
	local look = CFrame.Angles(0, st.yaw, 0).LookVector
	px, pz = px + look.X * st.spd * dt, pz + look.Z * st.spd * dt
	local bob = math.abs(math.sin(st.ph)) * 0.3 * ww
	local pitch = -0.12 * wf * spr + (flying and sat((tgtH - st.h) / CONFIG.FlyHeight) * 0.4 or 0) + (air and not flying and -0.1 or 0)
	local roll = math.sin(st.ph) * 0.03 * ww + 0.3 * wf * spr
	model:PivotTo(CFrame.new(origin.X + px, origin.Y + st.h + bob, origin.Z + pz)
		* CFrame.Angles(0, st.yaw, 0) * CFrame.Angles(pitch, 0, roll))

	if now >= nextBlink then
		nextBlink = now + 3 + rng:NextNumber() * 3
		for _, e in ipairs(eyes) do e.Size = Vector3.new(eyeSize.X, 0.1, eyeSize.Z) end
		task.delay(0.12, function() for _, e in ipairs(eyes) do e.Size = eyeSize end end)
	end
	if CONFIG.AutoFire and now >= nextFire then
		nextFire = now + CONFIG.FireInterval
		fireBreath()
	end
end)
model.Destroying:Connect(function() conn:Disconnect() end)
