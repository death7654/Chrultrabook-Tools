async fn new_window(
    handle: &tauri::AppHandle,
    label: &str,
    angular_path: &str,
    width: f64,
    height: f64,
) -> tauri::Window<tauri::Wry> {
    return tauri::WindowBuilder::new(
        handle,
        label, /* the unique window label */
        tauri::WindowUrl::App(angular_path.parse().unwrap()),
    )
    .inner_size(width, height)
    .resizable(false)
    .build()
    .unwrap();
}