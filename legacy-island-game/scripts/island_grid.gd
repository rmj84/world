class_name IslandGrid
extends RefCounted

const CELL_SIZE := 1.0
const GRID_RADIUS := 10.0

static func world_to_cell(world_pos: Vector3) -> Vector2i:
	return Vector2i(int(round(world_pos.x / CELL_SIZE)), int(round(world_pos.z / CELL_SIZE)))

static func cell_to_world(cell: Vector2i) -> Vector3:
	return Vector3(cell.x * CELL_SIZE, 0.0, cell.y * CELL_SIZE)

static func is_within_island(cell: Vector2i) -> bool:
	return Vector2(cell.x, cell.y).length() <= GRID_RADIUS - 0.5
