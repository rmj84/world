extends Node3D

@export var target_path: NodePath
@export var follow_speed := 5.0

var target: Node3D

func _ready() -> void:
	if target_path != NodePath():
		target = get_node(target_path)
	if target:
		global_position = Vector3(target.global_position.x, 0.0, target.global_position.z)

func _process(delta: float) -> void:
	if target == null:
		return
	var target_pos := Vector3(target.global_position.x, 0.0, target.global_position.z)
	global_position = global_position.lerp(target_pos, clamp(follow_speed * delta, 0.0, 1.0))
