extends CharacterBody3D

const SPEED := 4.0
const GRAVITY := 20.0
const ROTATE_SPEED := 10.0

func _physics_process(delta: float) -> void:
	var input_dir := Vector2.ZERO
	if Input.is_physical_key_pressed(KEY_W) or Input.is_physical_key_pressed(KEY_UP):
		input_dir.y -= 1
	if Input.is_physical_key_pressed(KEY_S) or Input.is_physical_key_pressed(KEY_DOWN):
		input_dir.y += 1
	if Input.is_physical_key_pressed(KEY_A) or Input.is_physical_key_pressed(KEY_LEFT):
		input_dir.x -= 1
	if Input.is_physical_key_pressed(KEY_D) or Input.is_physical_key_pressed(KEY_RIGHT):
		input_dir.x += 1

	input_dir = input_dir.normalized()

	if not is_on_floor():
		velocity.y -= GRAVITY * delta
	else:
		velocity.y = 0.0

	if input_dir.length() > 0.0:
		var move_dir := Vector3(input_dir.x, 0.0, input_dir.y)
		velocity.x = move_dir.x * SPEED
		velocity.z = move_dir.z * SPEED
		var target_angle := atan2(move_dir.x, move_dir.z)
		rotation.y = lerp_angle(rotation.y, target_angle, ROTATE_SPEED * delta)
	else:
		velocity.x = 0.0
		velocity.z = 0.0

	move_and_slide()
