extends Node3D

@export var camera_path: NodePath
@export var ground_path: NodePath
@export var decorations_container_path: NodePath
@export var palette_path: NodePath
@export var hint_label_path: NodePath

const GROUND_MASK := 1
const DECOR_MASK := 2

var camera: Camera3D
var ground: StaticBody3D
var decorations_container: Node3D
var palette: Control
var hint_label: Label

var build_active := false
var selected_id := ""
var rotation_steps := 0
var current_cell := Vector2i.ZERO
var cell_is_valid := false
var placed := {}

var ghost: MeshInstance3D

func _ready() -> void:
	camera = get_node(camera_path)
	ground = get_node(ground_path)
	decorations_container = get_node(decorations_container_path)
	palette = get_node(palette_path)
	hint_label = get_node(hint_label_path)

	_create_ghost()
	palette.visible = false
	palette.connect("item_selected", Callable(self, "_on_item_selected"))

	_load_saved()
	_update_hint()

func _create_ghost() -> void:
	ghost = MeshInstance3D.new()
	var quad := QuadMesh.new()
	quad.size = Vector2(0.9, 0.9)
	ghost.mesh = quad
	ghost.rotation_degrees = Vector3(-90, 0, 0)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(1, 1, 1, 0.5)
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	ghost.material_override = mat
	ghost.visible = false
	add_child(ghost)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.physical_keycode == KEY_B:
			_toggle_build_mode()
		elif build_active and event.physical_keycode == KEY_ESCAPE:
			_toggle_build_mode()
		elif build_active and event.physical_keycode == KEY_Q:
			rotation_steps = (rotation_steps + 3) % 4
			_update_ghost_transform()
		elif build_active and event.physical_keycode == KEY_E:
			rotation_steps = (rotation_steps + 1) % 4
			_update_ghost_transform()

	if build_active and event is InputEventMouseMotion:
		_update_hover(event.position)

	if build_active and event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_LEFT:
			_try_place()
		elif event.button_index == MOUSE_BUTTON_RIGHT:
			_try_remove(event.position)

func _toggle_build_mode() -> void:
	build_active = not build_active
	palette.visible = build_active
	ghost.visible = false
	if not build_active:
		selected_id = ""
	_update_hint()

func _on_item_selected(id: String) -> void:
	selected_id = id
	_update_ghost_transform()

func _update_hover(mouse_pos: Vector2) -> void:
	if selected_id == "":
		ghost.visible = false
		return
	var from := camera.project_ray_origin(mouse_pos)
	var to := from + camera.project_ray_normal(mouse_pos) * 100.0
	var space_state := get_world_3d().direct_space_state
	var query := PhysicsRayQueryParameters3D.create(from, to, GROUND_MASK)
	var result := space_state.intersect_ray(query)
	if result.is_empty():
		ghost.visible = false
		cell_is_valid = false
		return
	var cell := IslandGrid.world_to_cell(result.position)
	cell_is_valid = IslandGrid.is_within_island(cell) and not placed.has(cell)
	current_cell = cell
	ghost.visible = cell_is_valid
	if cell_is_valid:
		var world_pos := IslandGrid.cell_to_world(cell)
		ghost.global_position = Vector3(world_pos.x, 0.02, world_pos.z)
		var def = Catalog.get_item(selected_id)
		if def != null:
			(ghost.material_override as StandardMaterial3D).albedo_color = Color(def.color.r, def.color.g, def.color.b, 0.55)

func _update_ghost_transform() -> void:
	ghost.rotation_degrees = Vector3(-90, 0, rotation_steps * 90)

func _try_place() -> void:
	if selected_id == "" or not cell_is_valid:
		return
	_place_decoration(selected_id, current_cell, rotation_steps)
	_save()

func _try_remove(mouse_pos: Vector2) -> void:
	var from := camera.project_ray_origin(mouse_pos)
	var to := from + camera.project_ray_normal(mouse_pos) * 100.0
	var space_state := get_world_3d().direct_space_state
	var query := PhysicsRayQueryParameters3D.create(from, to, DECOR_MASK)
	var result := space_state.intersect_ray(query)
	if result.is_empty():
		return
	var collider = result.collider
	if collider.has_meta("grid_cell"):
		var cell = collider.get_meta("grid_cell")
		_remove_decoration(cell)
		_save()

func _place_decoration(id: String, cell: Vector2i, rot_steps: int) -> void:
	var def = Catalog.get_item(id)
	if def == null:
		return
	var scene: PackedScene = load(def.scene_path)
	var inst: Node3D = scene.instantiate()
	decorations_container.add_child(inst)
	inst.position = IslandGrid.cell_to_world(cell)
	inst.rotation_degrees.y = rot_steps * 90
	inst.set_meta("decoration_id", id)
	inst.set_meta("grid_cell", cell)
	placed[cell] = inst

func _remove_decoration(cell: Vector2i) -> void:
	if placed.has(cell):
		var inst = placed[cell]
		inst.queue_free()
		placed.erase(cell)

func _save() -> void:
	var entries := []
	for cell in placed.keys():
		var inst = placed[cell]
		entries.append({
			"id": inst.get_meta("decoration_id"),
			"x": cell.x,
			"z": cell.y,
			"rot": int(inst.rotation_degrees.y / 90.0) % 4,
		})
	SaveSystem.save_layout(entries)

func _load_saved() -> void:
	var entries := SaveSystem.load_layout()
	for entry in entries:
		var cell := Vector2i(int(entry.get("x", 0)), int(entry.get("z", 0)))
		var id: String = entry.get("id", "")
		var rot: int = int(entry.get("rot", 0))
		if id != "" and not placed.has(cell):
			_place_decoration(id, cell, rot)

func _update_hint() -> void:
	if build_active:
		hint_label.text = "Build Mode: Left-click place | Right-click remove | Q/E rotate | Esc exit"
	else:
		hint_label.text = "WASD / Arrows: move | B: decorate island"
