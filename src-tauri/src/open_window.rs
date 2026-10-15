use tauri::Manager;

pub async fn new_window(
    handle: &tauri::AppHandle,
    label: &str,
    angular_path: &str, //same as routing path in app.routes.ts
    width: f64,
    height: f64,
    resizeable: bool,
) -> Result<tauri::WebviewWindow<tauri::Wry>, String> {
    let windows = Manager::webview_windows(handle);
    let window_exists = windows.get(label);
    match window_exists {
        None => {
            tauri::WebviewWindowBuilder::new(
                handle,
                label, //the unique window label
                tauri::WebviewUrl::App(angular_path.parse().unwrap()),
            )
            .inner_size(width, height)
            .title(label)
            .resizable(resizeable)
            .maximizable(resizeable)
            .min_inner_size(320.0, 240.0)
            .build()
            .map_err(|error| error.to_string())
        }
        Some(x) => Ok(x.clone()),
    }
}
