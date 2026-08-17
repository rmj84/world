extends Node

class DecorationDef:
	var id: String
	var display_name: String
	var scene_path: String
	var color: Color

	func _init(p_id: String, p_name: String, p_scene: String, p_color: Color) -> void:
		id = p_id
		display_name = p_name
		scene_path = p_scene
		color = p_color

var items: Array[DecorationDef] = []

func _ready() -> void:
	items = [
		DecorationDef.new("tree", "Tree", "res://scenes/decorations/tree.tscn", Color(0.29, 0.62, 0.29)),
		DecorationDef.new("flower", "Flower", "res://scenes/decorations/flower.tscn", Color(0.95, 0.45, 0.65)),
		DecorationDef.new("bench", "Bench", "res://scenes/decorations/bench.tscn", Color(0.55, 0.35, 0.2)),
		DecorationDef.new("fence", "Fence", "res://scenes/decorations/fence.tscn", Color(0.8, 0.75, 0.6)),
		DecorationDef.new("lamp", "Lamp", "res://scenes/decorations/lamp.tscn", Color(0.9, 0.8, 0.3)),
		DecorationDef.new("rock", "Rock", "res://scenes/decorations/rock.tscn", Color(0.6, 0.6, 0.62)),
	]

func get_item(id: String) -> DecorationDef:
	for item in items:
		if item.id == id:
			return item
	return null
