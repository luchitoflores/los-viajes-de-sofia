extends Node2D
## Same three-room comparison as GDevelop. Artwork/data are local copies, not Phaser code.
@export_enum("surface", "entrada", "prisioneros") var scene_id: String = "surface"
@export_group("Paso caminando")
@export var exit_target: String = ""
@export var exit_x: float = 1160.0
@export_enum("Izquierda:-1", "Derecha:1") var exit_direction: int = 1
@export var arrival_x: float = 120.0
@export var exit_needs_light: bool = false
var data: Dictionary
var angle := deg_to_rad(-42.0)
var destination := NAN
var pending := ""
var met := false
var owned := false
var light_on := false
var complete := false
var dialogue: Array = []
var turn := 0
var after_dialogue := ""
var selected_choice := -1
var enter_after_ms := 0
var blocked_passage := ""
var notice_until := 0.0
var elapsed := 0.0
var bubble: PanelContainer
var speaker_label: Label
var text_label: Label
var choices: VBoxContainer
var objective: Label
var light_button: Button
var title_label: Label
var confirm_restart: ConfirmationDialog
@onready var hero: CharacterBody2D = $Sofia
@onready var art: Sprite2D = $Sofia/Artwork
@onready var npc: Sprite2D = $NPC
@onready var lamp: Sprite2D = $Lamp
@onready var background: Sprite2D = $Background
@onready var planet: Sprite2D = $Planet
@onready var cave: Sprite2D = $Cave
@onready var portal: Sprite2D = $Portal
@onready var darkness: ColorRect = $Darkness
var frames: Array[Texture2D] = []
var prisoner_frames: Array[Texture2D] = []

func _ready() -> void:
	data = JSON.parse_string(FileAccess.get_file_as_string("res://assets/demo.json"))
	for i in range(6):
		frames.append(load("res://assets/sofia-%d.png" % i))
		prisoner_frames.append(load("res://assets/prisoner-%d.png" % i))
	_build_ui()
	load_room(scene_id)
	if "--self-test" in OS.get_cmdline_user_args(): call_deferred("_self_test")

func _build_ui() -> void:
	var canvas := CanvasLayer.new()
	add_child(canvas)
	for rect in [Rect2(0,0,1280,84),Rect2(0,670,1280,50)]:
		var bar := ColorRect.new(); bar.position=rect.position; bar.size=rect.size; bar.color=Color(0.025,0.035,0.08,0.78); bar.mouse_filter=Control.MOUSE_FILTER_IGNORE; canvas.add_child(bar)
	title_label = Label.new()
	title_label.position = Vector2(20, 12)
	title_label.add_theme_font_size_override("font_size", 24)
	canvas.add_child(title_label)
	objective = Label.new()
	objective.position = Vector2(20, 48)
	objective.add_theme_font_size_override("font_size", 19)
	canvas.add_child(objective)
	var help := Label.new()
	help.position = Vector2(20, 688)
	help.text = "Toca para caminar o investigar · A/D o ←/→ · Enter: diálogo · L: luz · Demo independiente"
	canvas.add_child(help)
	light_button = Button.new()
	light_button.position = Vector2(1020, 15)
	light_button.size = Vector2(235, 46)
	light_button.pressed.connect(toggle_light)
	canvas.add_child(light_button)
	var restart := Button.new()
	restart.text = "Reiniciar demo"
	restart.position = Vector2(1080, 670)
	restart.size = Vector2(175, 38)
	canvas.add_child(restart)
	confirm_restart = ConfirmationDialog.new()
	confirm_restart.dialog_text = "¿Reiniciar únicamente esta demo?"
	confirm_restart.confirmed.connect(func(): met = false; owned = false; light_on = false; complete = false; angle = deg_to_rad(-42); dialogue.clear(); bubble.hide(); load_room("surface"))
	canvas.add_child(confirm_restart)
	restart.pressed.connect(func(): confirm_restart.popup_centered())
	bubble = PanelContainer.new()
	bubble.size = Vector2(460, 165)
	var style := StyleBoxFlat.new()
	style.bg_color = Color("f5e8c9")
	style.border_color = Color("b78c52")
	style.set_border_width_all(3)
	style.set_corner_radius_all(15)
	style.content_margin_left = 18; style.content_margin_right = 18
	style.content_margin_top = 12; style.content_margin_bottom = 12
	bubble.add_theme_stylebox_override("panel", style)
	var box := VBoxContainer.new()
	bubble.add_child(box)
	speaker_label = Label.new()
	speaker_label.add_theme_color_override("font_color", Color("4e3944"))
	speaker_label.add_theme_font_size_override("font_size", 23)
	box.add_child(speaker_label)
	text_label = Label.new()
	text_label.custom_minimum_size = Vector2(420, 95)
	text_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	text_label.add_theme_color_override("font_color", Color("352c35"))
	text_label.add_theme_font_size_override("font_size", 21)
	box.add_child(text_label)
	choices = VBoxContainer.new()
	box.add_child(choices)
	bubble.gui_input.connect(func(event: InputEvent):
		if event is InputEventMouseButton and event.pressed and choices.get_child_count() == 0: advance()
		if event is InputEventScreenTouch and event.pressed and choices.get_child_count() == 0: advance())
	canvas.add_child(bubble)
	bubble.hide()

func _clear_scene_owners(node: Node) -> void:
	node.owner = null
	for child in node.get_children(): _clear_scene_owners(child)

func load_room(id: String, spawn_x := NAN) -> void:
	# Load the actual authored scene nodes, preserving this session/controller and UI.
	# This makes edits to scenes/entrada.tscn and scenes/prisioneros.tscn visible in play.
	if id != scene_id:
		var path := "res://room.tscn" if id == "surface" else "res://scenes/" + id + ".tscn"
		var template: Node2D = load(path).instantiate()
		for property in ["exit_target","exit_x","exit_direction","arrival_x","exit_needs_light"]: set(property,template.get(property))
		for child in get_children():
			if not child is CanvasLayer: remove_child(child); child.queue_free()
		for child in template.get_children():
			_clear_scene_owners(child); template.remove_child(child); add_child(child)
		template.free()
		hero = $Sofia; art = $Sofia/Artwork; npc = $NPC; lamp = $Lamp
		background = $Background; planet = $Planet; cave = $Cave; darkness = $Darkness
		portal = $Portal
	scene_id = id; destination = NAN; pending = ""; hero.velocity = Vector2.ZERO
	blocked_passage = ""
	if id != "surface" and not is_nan(spawn_x): hero.position.x = spawn_x; art.flip_h = spawn_x > 640
	$Floor/CollisionShape2D.set_deferred("disabled", id == "surface")
	if id == "surface": place_radial()
	update_ui()

func radial(a: float) -> Vector2:
	return Vector2(640, 360) + Vector2(sin(a), -cos(a)) * 220

func place_radial() -> void:
	hero.position = radial(angle); hero.rotation = angle

func update_ui() -> void:
	title_label.text = "GODOT · " + ("Planeta de Platón · vista general" if scene_id == "surface" else ("A · Entrada de la caverna" if scene_id == "entrada" else "B · Sala de las sombras"))
	objective.text = "✓ " + data.goals.done if complete else data.goals.meet if not met else data.goals.find if not owned else data.goals.light if scene_id != "prisioneros" else data.goals.talk
	light_button.visible = owned and scene_id != "surface"
	light_button.text = "Linterna encendida · L" if light_on else "Encender linterna · L"
	darkness.visible = scene_id != "surface"
	pass # Ambient darkness is authored in the native scene material.
	darkness.material.set_shader_parameter("enabled", light_on)
	lamp.visible = scene_id == "entrada" and not owned
	portal.visible = scene_id == str(data.portal.scene)

func _input(event: InputEvent) -> void:
	if not event is InputEventKey or confirm_restart.visible: return
	var key := event as InputEventKey
	if key.keycode not in [KEY_ENTER, KEY_KP_ENTER, KEY_TAB]: return
	if key.keycode == KEY_TAB and (not bubble.visible or choices.get_child_count() == 0): return
	get_viewport().set_input_as_handled()
	if not key.pressed or key.echo: return
	if key.keycode == KEY_TAB:
		selected_choice = (selected_choice + 1) % choices.get_child_count()
		(choices.get_child(selected_choice) as Button).grab_focus()
	elif bubble.visible:
		if choices.get_child_count() == 0: advance()
		elif selected_choice >= 0: answer(selected_choice)
	elif Time.get_ticks_msec() >= enter_after_ms:
		if scene_id in ["surface", "prisioneros"] and hero.position.distance_to(npc.position) < 145:
			interact("plato" if scene_id == "surface" else "prisoner")
		elif scene_id == "entrada" and not owned and absf(hero.position.x-lamp.position.x) < 100: interact("lamp")
		elif scene_id == str(data.portal.scene) and absf(hero.position.x-float(data.portal.x)) < 100: interact("portal")

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_L and not bubble.visible: toggle_light()
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed: click_world(event.position)
	if event is InputEventScreenTouch and event.pressed: click_world(event.position)

func click_world(point: Vector2) -> void:
	if bubble.visible:
		if choices.get_child_count() == 0: advance()
		return
	if scene_id == "surface":
		var a := atan2(point.x - 640, 360 - point.y)
		pending = "plato" if point.distance_to(npc.position + Vector2(0, -45)) < 85 else "cave" if point.distance_to(cave.position) < 90 else ""
		destination = atan2((npc.position.x if pending == "plato" else cave.position.x)-640,360-(npc.position.y if pending == "plato" else cave.position.y)) if pending != "" else a
	else:
		pending = "portal" if portal.visible and point.distance_to(portal.position + Vector2(0,-65)) < 85 else "lamp" if scene_id == "entrada" and lamp.visible and point.distance_to(lamp.position) < 85 else "prisoner" if scene_id == "prisioneros" and point.distance_to(npc.position + Vector2(0,-70)) < 100 else ""
		destination = portal.position.x if pending == "portal" else lamp.position.x if pending == "lamp" else npc.position.x if pending == "prisoner" else clampf(point.x, 40, 1240)

func _physics_process(delta: float) -> void:
	elapsed += delta
	var axis := float(Input.is_physical_key_pressed(KEY_D) or Input.is_physical_key_pressed(KEY_RIGHT)) - float(Input.is_physical_key_pressed(KEY_A) or Input.is_physical_key_pressed(KEY_LEFT))
	var moving := false
	if not bubble or bubble.visible or confirm_restart.visible: axis = 0
	else:
		if axis != 0: destination = NAN; pending = ""
		if scene_id == "surface":
			var difference := wrapf(destination - angle, -PI, PI) if not is_nan(destination) else 0.0
			if axis == 0 and not is_nan(destination): axis = signf(difference) if absf(difference) > (0.22 if pending != "" else 0.025) else 0
			angle += axis * delta * 0.9; moving = axis != 0; place_radial()
		else:
			if axis == 0 and not is_nan(destination): axis = signf(destination - hero.position.x) if absf(destination - hero.position.x) > (80 if pending != "" else 6) else 0
			hero.velocity = Vector2(axis * float(data.speed), 320)
			hero.move_and_slide(); hero.position.x = clampf(hero.position.x, 40, 1240)
			var exits := [] if exit_target.is_empty() else [{"id":scene_id+"-exit","scene":scene_id,"direction":exit_direction,"at":exit_x,"target":exit_target,"spawn":arrival_x,"requires":["owned","on"] if exit_needs_light else [],"blockedText":"Recoge y enciende la linterna para continuar."}]
			for passage in exits:
				if str(passage.scene) != scene_id: continue
				if blocked_passage == str(passage.id) and absf(hero.position.x-float(passage.at)) > 100: blocked_passage = ""
				if axis*float(passage.direction) <= 0 or (hero.position.x-float(passage.at))*float(passage.direction) < 0: continue
				var allowed := true
				for flag in passage.requires:
					if not (light_on if str(flag) == "on" else bool(get(str(flag)))): allowed = false
				if allowed: load_room(str(passage.target),float(passage.spawn)); return
				hero.position.x = float(passage.at)-float(passage.direction); hero.velocity = Vector2.ZERO; destination = NAN; pending = ""; axis = 0
				if blocked_passage != str(passage.id): blocked_passage = str(passage.id); notice_until = elapsed+2.8; objective.text = str(passage.blockedText)
			moving = axis != 0
		if not moving and not is_nan(destination):
			destination = NAN
			var action := pending; pending = ""
			if action != "": interact(action)
	if axis != 0: art.flip_h = axis < 0
	art.texture = frames[[2,3,4,5][int(elapsed * 7) % 4] if moving else 0] if not frames.is_empty() else null
	if scene_id == "prisioneros" and not prisoner_frames.is_empty(): npc.texture = prisoner_frames[int(elapsed * 3) % 6]
	if darkness and darkness.material: darkness.material.set_shader_parameter("light_pos", hero.position + Vector2(0, -65))
	if notice_until > 0 and elapsed > notice_until: notice_until = 0; update_ui()

func interact(action: String) -> void:
	match action:
		"plato": met = true; show_dialogue(data.dialogues.plato)
		"cave":
			if met: load_room("entrada")
			else: show_dialogue([["Sofía", "Primero quiero conocer a Platón."]])
		"portal":
			if scene_id == str(data.portal.scene): load_room(str(data.portal.target))
		"lamp": owned = true; update_ui(); show_dialogue(data.dialogues.lamp)
		"prisoner": show_dialogue(data.dialogues.complete if complete else data.dialogues.prisoner, "" if complete else "question")
	update_ui()

func toggle_light() -> void:
	if owned and scene_id != "surface": light_on = not light_on; update_ui()

func show_dialogue(lines: Array, follow := "") -> void:
	selected_choice = -1
	destination = NAN; pending = ""; hero.velocity = Vector2.ZERO
	if scene_id == "surface": npc.flip_h = wrapf(angle-npc.rotation,-PI,PI) < 0
	art.flip_h = (wrapf(npc.rotation-angle,-PI,PI) < 0) if scene_id == "surface" else npc.position.x < hero.position.x
	dialogue = lines.duplicate(true); turn = 0; after_dialogue = follow
	bubble.show(); render_turn()

func render_turn() -> void:
	for child in choices.get_children(): choices.remove_child(child); child.queue_free()
	speaker_label.text = str(dialogue[turn][0]); text_label.text = str(dialogue[turn][1])
	var anchor := hero.position if speaker_label.text == "Sofía" else npc.position
	bubble.size = Vector2(460,165)
	bubble.position = Vector2(clampf(anchor.x - 230,16,804), clampf(anchor.y - (110 if scene_id == "surface" else 157) - 185,80,470))

func advance() -> void:
	turn += 1
	if turn < dialogue.size(): render_turn()
	elif after_dialogue == "question": show_question()
	else: bubble.hide(); dialogue.clear(); enter_after_ms = Time.get_ticks_msec() + 180

func show_question() -> void:
	selected_choice = -1
	speaker_label.text = "Una pregunta"; text_label.text = data.question.text
	text_label.custom_minimum_size.y = 45
	for i in range(data.question.options.size()):
		var button := Button.new()
		button.text = data.question.options[i]
		button.pressed.connect(answer.bind(i)); choices.add_child(button)
	bubble.position = Vector2(220, 100); bubble.size.y = 225

func answer(index: int) -> void:
	for child in choices.get_children(): choices.remove_child(child); child.queue_free()
	text_label.custom_minimum_size.y = 95
	if index == int(data.question.correct): complete = true; update_ui(); show_dialogue(data.dialogues.complete)
	else: show_dialogue([["Sofía", "La sombra necesita algo que la proyecte. Pensemos también en la luz."]], "question")

func _test_click(point: Vector2) -> void:
	var event := InputEventMouseButton.new()
	event.button_index = MOUSE_BUTTON_LEFT; event.position = get_viewport().get_final_transform() * point; event.pressed = true
	Input.parse_input_event(event)
	await get_tree().process_frame
	event = InputEventMouseButton.new(); event.button_index = MOUSE_BUTTON_LEFT; event.position = get_viewport().get_final_transform() * point
	Input.parse_input_event(event)
	await get_tree().process_frame

func _test_enter() -> void:
	await _test_key(KEY_ENTER)

func _test_key(code: Key) -> void:
	var event := InputEventKey.new(); event.keycode = code; event.pressed = true
	Input.parse_input_event(event); await get_tree().process_frame
	event = InputEventKey.new(); event.keycode = code
	Input.parse_input_event(event); await get_tree().process_frame

func _wait_test(check: Callable, label: String) -> bool:
	for i in range(600):
		if check.call(): return true
		await get_tree().physics_frame
	push_error("TEST FAILED: " + label + " room=" + scene_id + " pending=" + pending + " bubble=" + str(bubble.visible)); get_tree().quit(2); return false

func _capture(name: String) -> void:
	await RenderingServer.frame_post_draw
	var folder := ProjectSettings.globalize_path("res://../engine-comparison/captures")
	DirAccess.make_dir_recursive_absolute(folder)
	get_viewport().get_texture().get_image().save_png(folder + "/godot-" + name + ".png")

func _self_test() -> void:
	await get_tree().create_timer(0.3).timeout
	await _capture("surface")
	await _test_click(npc.position + Vector2(0,-45))
	if not await _wait_test(func(): return bubble.visible,"Plato conversation"): return
	var echo_key := InputEventKey.new(); echo_key.keycode = KEY_ENTER; echo_key.pressed = true; echo_key.echo = true
	Input.parse_input_event(echo_key); await get_tree().process_frame
	assert(turn == 0)
	for i in range(3): await _test_enter()
	await _test_click(cave.position)
	if not await _wait_test(func(): return scene_id == "entrada","Entrance"): return
	await _test_click(Vector2(743,530))
	if not await _wait_test(func(): return owned and bubble.visible,"Lamp pickup"): return
	await _test_enter()
	await _test_click(Vector2(1240,620))
	if not await _wait_test(func(): return blocked_passage != "","Passage blocked without light"): return
	assert(scene_id == "entrada" and not bubble.visible and hero.position.x <= 1160)
	toggle_light(); assert(light_on)
	await _capture("entrance-light")
	await _test_click(Vector2(1240,620))
	if not await _wait_test(func(): return scene_id == "prisioneros","Prisoners"): return
	assert(background.texture.resource_path.ends_with("prisioneros.png"))
	await _capture("prisoners")
	await _test_click(Vector2(440,490))
	if not await _wait_test(func(): return bubble.visible,"Prisoner conversation"): return
	await _test_enter(); await _test_enter()
	assert(choices.get_child_count() == 2)
	await _test_enter(); assert(choices.get_child_count() == 2 and not complete)
	await _test_key(KEY_TAB); await _test_key(KEY_TAB); await _test_enter()
	assert(not complete)
	await _test_enter()
	assert(choices.get_child_count() == 2)
	await _test_key(KEY_TAB); await _test_enter()
	assert(complete)
	await _test_enter(); await _test_enter()
	await get_tree().create_timer(0.2).timeout
	await _test_enter(); assert(bubble.visible) # contextual Enter near the prisoner
	await _test_enter(); await _test_enter()
	await _test_click(Vector2(40,650))
	if not await _wait_test(func(): return scene_id == "entrada","Return to A"): return
	assert(light_on and owned and hero.position.x > 1000)
	await _test_click(Vector2(40,650))
	if not await _wait_test(func(): return hero.position.x < 60,"Walk beside portal"): return
	assert(scene_id == "entrada")
	await _test_click(Vector2(90,495))
	if not await _wait_test(func(): return scene_id == "surface","Return to planet"): return
	await _capture("complete")
	print("SOFIA_GODOT_TEST_PASS: click movement, conversation, lamp, door gate, question, room continuity, return")
	get_tree().quit()
