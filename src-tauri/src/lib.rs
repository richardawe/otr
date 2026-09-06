// No custom commands are registered: the app is entirely static, offline
// content served from the bundled webview. There is nothing here for the
// Rust side to do beyond opening the window — no filesystem, network, or
// shell access is granted (see capabilities/default.json).
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running the On the record application");
}
