use tauri_plugin_clipboard_manager::ClipboardExt;

pub fn copy(app: &tauri::AppHandle, text: String)
{
    let clipboard_content = tauri_plugin_clipboard_manager::ClipKind::PlainText {
        label: Some("copy".to_string()),
        text: text,
    };
    app.clipboard().write(clipboard_content).unwrap();
}