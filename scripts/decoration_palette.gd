extends Control

signal item_selected(id: String)

@onready var grid: GridContainer = $Panel/GridContainer

func _ready() -> void:
	for def in Catalog.items:
		var btn := Button.new()
		btn.text = def.display_name
		btn.custom_minimum_size = Vector2(100, 44)
		var normal_style := StyleBoxFlat.new()
		normal_style.bg_color = def.color
		normal_style.corner_radius_top_left = 6
		normal_style.corner_radius_top_right = 6
		normal_style.corner_radius_bottom_left = 6
		normal_style.corner_radius_bottom_right = 6
		btn.add_theme_stylebox_override("normal", normal_style)
		btn.pressed.connect(_on_pressed.bind(def.id))
		grid.add_child(btn)

func _on_pressed(id: String) -> void:
	item_selected.emit(id)
